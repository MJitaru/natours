const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require ('../controllers/authController');

const router = express.Router({ mergeParams: true }); //by default each router only has access to the params of their specific routes

router.use(authController.protect); //From this point, no one can access all this points without being authenticated.(logged in)

router
        .route('/')
        .get(reviewController.getAllReviews)
        .post(
                authController.restrictTo('user'),//2. After login, the review can only be added by the users (not possible for admin or tour-guides)
                reviewController.setTourUserIds,
                reviewController.createReview)    //3. After 1 and 2 are fulfilled, middleware with review creation is runned.

router
        .route('/:id')
        .get(reviewController.getReview)
        .patch(authController.restrictTo('user', 'admin'), reviewController.updateReview)
        .delete(authController.restrictTo('user', 'admin'), reviewController.deleteReview);

module.exports = router;