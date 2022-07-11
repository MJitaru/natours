const path = require('path') //core module used to manipulate path names.
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');


const AppError = require ('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');


const app = express();

//Below two lines settles up the pug engine.
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'))

// 1) GLOBAL MIDDLEWARES

//Serving static files
app.use(express.static(path.join(__dirname, 'public')));

//Set Security HTTP headers
app.use(helmet());

//Deve;lopment logging
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

//Limit requests from same API
//how many requests/ip we can allow on a certain amount of time (100 req in 1 hour)
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000, //WindowMiliseconds: 60 minutes
    message: 'Too many requests from this IP , please try again in an hour!'
});
app.use('/api', limiter); //will affect all the routes that starts with /api

//Body parser, reading data from the body into req.body
app.use(express.json({ limit: '10kb'})); //middleware - Bodies bigger than 10 kb will NOT be accepted.

//Data sanitization against NoSQL query injection 
app.use(mongoSanitize()); // removes all $ signs from ex: "email" : {"$gt" : ""}

//Data sanitization against XSS attacks
app.use(xss()); //Clean any user input from malicious html code with js code attached to it.

//Prevent parameter pollution - Clear up the query string
app.use(hpp({
    whitelist: [
        'duration',
        'ratingsQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'difficulty',
        'price'
    ]
}));



//Test middleware
app.use((req,res,next)=>{
    req.requestTime = new Date().toISOString();
    //console.log(req.headers);
    next();
})

// 4) ROUTES app.use (URL, ROUTER)
app.get('/', (req,res) => {
    res.status(200).render('base', {
        tour: 'The Forest Hiker',
        user: 'Jonas'
    });
});


app.use('/api/v1/tours', tourRouter);       //This router is a middleware that we mount upon the path ('/api/v1/tours')
app.use('/api/v1/users', userRouter);       //This router is a middleware that we mount upon the path ('/api/v1/users')
app.use('/api/v1/reviews', reviewRouter);   //This router is a middleware that we mount upon the path ('/api/v1/reviews')

app.all('*', (req,res,next) => {
   next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;


