const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router(); // It is a real middleware which must be used for '/api/v1/users' route

//ROUTES
    router.post('/signup', authController.signup);
    router.post('/login', authController.login);

    router.post('/forgotPassword', authController.forgotPassword); //will only receive the email adress
    router.post('/resetPassword', authController.resetPassword); // will receive the token as well as the new password


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