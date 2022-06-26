const express = require('express');

//ROUTE HANDLERS
const getAllUsers = (req, res)=>{
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    });
}

const getUser = (req, res)=>{
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    });
}

const createUser = (req, res)=>{
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    });
}
const updateUser = (req, res)=>{
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    });
}

const deleteUser = (req, res)=>{
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    });
}

const router = express.Router(); // It is a real middleware which must be used for '/api/v1/users' route

//ROUTES
    router
        .route('/')
        .get(getAllUsers)
        .post(createUser);

    router
        .route('/:id')
        .get(getUser)
        .patch(updateUser)
        .delete(deleteUser);

module.exports = router;