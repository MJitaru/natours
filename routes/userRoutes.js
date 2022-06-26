const express = require('express');
const userController = require('./../controllers/userController')

const router = express.Router(); // It is a real middleware which must be used for '/api/v1/users' route

//ROUTES
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