const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');


const router = express.Router(); // It is a real middleware which must be used for '/api/v1/users' route

//ROUTES
    router.post('/signup', authController.signup);
    router.post('/login', authController.login)
    router.post('/forgotPassword', authController.forgotPassword); //will only receive the email adress
    router.patch('/resetPassword/:token', authController.resetPassword); // will receive the token as well as the new password

    router.use(authController.protect); //Protect all routes after this middleware (all below)

    router.patch('/updateMyPassword',authController.updatePassword);
    router.get('/me', userController.getMe, userController.getUser);
    router.patch('/updateMe', userController.updateMe);
    router.delete('/deleteMe', userController.deleteMe);

    router.use(authController.restrictTo('admin')); //Only admins will be able o get all users, to create users for the below routes (all below)

    router
        .route('/')
        .get(userController.getAllUsers)
        .post(userController.createUser);

    router
        .route('/:id')
        .get(userController.getUser)
        .patch(userController.updateUser)
        .delete(userController.deleteUser);

   

module.exports = router;