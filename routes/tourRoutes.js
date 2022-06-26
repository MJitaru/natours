const express = require('express');
const tourController = require('./../controllers/tourController');

const router = express.Router(); // It is a real middleware which must be used for '/api/v1/tours' route

//ROUTES

    router
        .route('/')
        .get(tourController.getAllTours)
        .post(tourController.createTour);

    router
        .route('/:id')
        .get(tourController.getTour)
        .patch(tourController.updateTour)
        .delete(tourController.deleteTour);

module.exports = router;