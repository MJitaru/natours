const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require ('../controllers/authController');

const router = express.Router({ mergeParams: true }); //by default each router only has access to the params of their specific routes

// POST  /tour/234fasd4/reviews 
// GET  /tour/234fasd4/reviews 
// POST /reviews

router
        .route('/')
        .get(reviewController.getAllReviews)
        .post(
                authController.protect,           //1. Before posting review, the user must be authenticated (logged in)
                authController.restrictTo('user'),//2. After login, the review can only be added by the users (not possible for admin or tour-guides)
                reviewController.setTourUserIds,
                reviewController.createReview)    //3. After 1 and 2 are fulfilled, middleware with review creation is runned.

router
        .route('/:id')
        .get(reviewController.getReview)
        .patch(reviewController.updateReview)
        .delete(reviewController.deleteReview);

module.exports = router;