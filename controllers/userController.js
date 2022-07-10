const User = require ('../models/userModel');
const catchAsync = require ('../utils/catchAsync');
const AppError = require ('../utils/appError');
const factory = require('./handlerFactory');


//loop through all the fields that are in the obj, and for each field we check if it's one of the allowed fields.
// If yes, we create a new field in the newObj, with the exact same value as it has in the original obj.
const filterObj = (obj, ...allowedFields) => {
    const newObj ={};
    Object.keys(obj).forEach(el=>{
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    })
    return newObj;
}


//ROUTE HANDLERS


exports.updateMe = catchAsync(async (req,res,next) => {
    // 1) Create error if user POSTs password data
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('This route is not for password updates. Please use /updateMyPassword.', 400));
    }


    // 2) Update user document
    const filteredBody = filterObj(req.body, 'name', 'email') //we want to keep only name and email and filter all the rest
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new:true,
        runValidators: true
    });

    res.status(200).json ({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

exports.getMe = (req,res,next)=>{
    req.params.id = req.user.id;
    next();
};

exports.deleteMe = catchAsync(async(req,res,next)=>{
    await User.findByIdAndUpdate(req.user.id, {active:false})

    res.status(204).json({
        status: 'success',
        data: null
    })
})



exports.createUser = (req, res)=>{
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined! Please use /signup instead',
    });
}

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);

//Do NOT update passwords with this!!!
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);


