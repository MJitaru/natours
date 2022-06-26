const express = require('express');
const fs = require('fs');
const tourController = require('./../controllers/tourController')

const router = express.Router(); // It is a real middleware which must be used for '/api/v1/tours' route
//ROUTES

router.param('id', tourController.checkID)

//Create a checkBody middleware
//Check if body contains name and price property
//If not send 400 status code

    
        .route('/')
        .get(tourController.getAllTours)
        .post(tourController.checkBody , tourController.createTour);

    router
        .route('/:id')
        .get(tourController.getTour)
        .patch(tourController.updateTour)
        .delete(tourController.deleteTour);

module.exports = router;