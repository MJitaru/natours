//The functions written here will return controllers (delete tours, delete users and delete reviews)
//This function will not really know if there is a tour or review or user (tour changed with=>doc, user=> doc, review =>doc)

const catchAsync = require ('../utils/catchAsync');
const AppError = require ('../utils/appError');

exports.deleteOne = Model => catchAsync(async (req,res,next) => {
    
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
        return next(new AppError('No document found with that ID', 404));
      }

    res.status(204).json({
      status: 'success',
      data: null
    });
});
