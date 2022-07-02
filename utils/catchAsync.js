// eslint-disable-next-line arrow-body-style
module.exports = fn =>{
    return (req,res,next) => {
        fn(req,res,next).catch(err => next(err))
    };
};

// In order to get rid of our try-catch blocks, the async function was wrapped inside catchAsync
//catchAsync will return a new anonimous function, which will then be assign to createTour.