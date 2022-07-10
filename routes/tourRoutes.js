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
        .get(tourController.aliasTopTours, tourController.getAllTours); //Getting top 5 tours is free for everyone ( no authentication needed)

    router
        .route('/tour-stats')
        .get(tourController.getTourStats); //Getting statistics for tours is free for everyone ( no authentication needed)

    router
        .route('/monthly-plan/:year')  //Users must login to see content. Getting monthly plan is restricted to everyone except normal users.
        .get(
            authController.protect,  
            authController.restrictTo('admin', 'lead-guide', 'guide'),
            tourController.getMonthlyPlan); 

    //In the below variable we want to pass in the coordinates of the place where I am located. unit/:unit is the distance in km or miles(user preference)         
    router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin);
    //  /tours-distance?distance=233&center=-40,45&unit=km       
    //  /tours-distance/233/center/-40,45/unit/mi -> Standard of specifying URLs

    router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

    router
        .route('/')
        .get(tourController.getAllTours) //To get data for all tours, Users must login to see content.
        .post(
            authController.protect,
            authController.restrictTo('admin', 'lead-guide'), //Guides and normal users can't post data about the tours.
            tourController.createTour);

    router
        .route('/:id')
        .get(tourController.getTour)
        .patch(
            authController.protect,
            authController.restrictTo('admin', 'lead-guide'), //Guides and normal users can't update data about the tours.
            tourController.updateTour)

        .delete(
            authController.protect,
            authController.restrictTo('admin', 'lead-guide'), //action => delete id is restricted only to admin and lead-guide users.
            tourController.deleteTour);


module.exports = router;