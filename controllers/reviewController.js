const Review = require ('../models/reviewModel');
const catchAsync = require ('../utils/catchAsync');
const AppError = require ('../utils/appError');

//Controller for getting all reviews from the users
exports.getAllReviews = catchAsync(async (req,res,next) => {
    const reviews = await Review.find();

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews
        }
    });
});

//Controller for creating a review
exports.createReview = catchAsync(async(req,res,next)=>{
    const newReview = await Review.create(req.body)  //If there are any fields in the body that are not in the schema, they will simply be ignored.

    res.status(201).json({
        status: 'success',
        data:{
            review: newReview
        }
    });
});