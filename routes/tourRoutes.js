const express = require('express');
const tourController = require('../controllers/tourController')

const router = express.Router(); // It is a real middleware which must be used for '/api/v1/tours' route
//ROUTES

//router.param('id', tourController.checkID)

//Create a checkBody middleware
//Check if body contains name and price property
//If not send 400 status code

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