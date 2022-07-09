const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require ('../controllers/authController');
const reviewRouter = require ('./reviewRoutes');


const router = express.Router(); // It is a real middleware which must be used for '/api/v1/tours' route

//POST  /tour/234fasd4/reviews - Nested route
//GET /tour/234fasd4/reviews - Nested route


router.use('/:tourId/reviews', reviewRouter); //Mounting a router : On the router middleware we add the use method, where we specify that on that route we want to use reviewRouter instead.

//ROUTES

//router.param('id', tourController.checkID)

//Create a checkBody middleware
//Check if body contains name and price property
//If not send 400 status code

    router
        .route('/top-5-cheap')
        .get(tourController.aliasTopTours, tourController.getAllTours);

    router
        .route('/tour-stats')
        .get(tourController.getTourStats);

    router
        .route('/monthly-plan/:year')
        .get(tourController.getMonthlyPlan);

    router
        .route('/')
        .get(authController.protect, tourController.getAllTours)
        .post(tourController.createTour);

    router
        .route('/:id')
        .get(tourController.getTour)
        .patch(tourController.updateTour)
        .delete(
            authController.protect,
            authController.restrictTo('admin', 'lead-guide'), //action => delete id is restricted only to admin and lead-guide users.
            tourController.deleteTour);


module.exports = router;