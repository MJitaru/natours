const express = require('express');
const reviewController = require('../controllers/reviewController');

const router = express.Router()

router
        .route('/')
        .get(reviewController.getAllReviews);

router
        .route('/reviews')
        .get(reviewController.createReview);

module.exports = router;