const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1)MIDDLEWARES
//middleware 1:
app.use(morgan('dev'));

//middleware 2:
app.use(express.json()); //middleware

//middleware 3:
app.use((req, res, next) => {
    console.log('Hello from the middleware 🙋‍♀️');
    next();
});

//middleware 4:
app.use((req,res,next)=>{
    req.requestTime = new Date().toISOString();
    next();
});

// 4) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;




