const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require ('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require ('../utils/appError');

// eslint-disable-next-line arrow-body-style
const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { 
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

exports.signup = catchAsync(async (req,res,next) => {
//We allow only the data that we need to be added in the new user.
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role
    });

    const token = signToken(newUser._id);

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    });
});

exports.login = catchAsync(async (req,res,next)=>{
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if(!email || !password) {
       return next(new AppError('Please provide email and password!', 400));
    }

    // 2) Check if user exist && password is correct

    const user = await User.findOne({email: email}).select('+password'); // When we want to use a field that is not selected by default, use '+' and then the name of the field 'password'.
    //const correct = await user.correctPassword(password, user.password); => await promise moved down into if statement.

    if(!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401))
    }

    // 3) If everything ok, send token to client
    const token = signToken(user._id);
    
    res.status(200).json({
        status: 'success',
        token
    });
});

exports.protect = catchAsync(async(req,res,next)=>{
    // 1) Getting token and check if exist
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt && req.cookies.jwt !== 'loggedout') {
        token = req.cookies.jwt;
    }

    if(!token) {
        return next(
            new AppError ('You are not logged in! Please login to get access.', 401)
            );
    }


    // 2) Verification token (JWT)
    const decoded = await promisify (jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id); // Not a new user, but just the user based on the decoded id.
    if(!currentUser) {
        return next(
            new AppError('The user belonging to this token does no longer exist ', 401)
        );
    }

    // 4) Check if user changed password after the token (JWT) was issued
    //iat = issued at.
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password! Please log in again', 401));
    }
    
    //GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
});

// eslint-disable-next-line arrow-body-style
exports.restrictTo = (...roles) =>{
    return (req, res, next) => {
        // roles is an array => ['admin', 'lead-guide']. role is now just 'user'.
        if(!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }

        next();
    };
};

exports.forgotPassword = catchAsync( async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({email: req.body.email})
    if(!user) {
        return next(new AppError('There is no user with that email adress', 404));
    }
    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false});


    // 3) Send it back as an email


});
exports.resetPassword = (req, res, next) => {}