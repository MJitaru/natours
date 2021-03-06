const Tour = require ('../models/tourModel');
const catchAsync = require ('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

//Middleware
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

//ROUTE HANDLERS
exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

//Aggregation pipeline => Function that calculates couple of statistics about our tours:

exports.getTourStats = catchAsync(async (req,res,next) => {
        const stats = await Tour.aggregate([
          {
            $match: { ratingsAverage: { $gte: 4.5 } }
          },
          {
            $group: {
              _id: { $toUpper: '$difficulty' },
              numTours: { $sum: 1 },
              numRatings: { $sum: '$ratingsQuantity' },
              avgRating: { $avg: '$ratingsAverage' },
              avgPrice: { $avg: '$price' },
              minPrice: { $min: '$price' },
              maxPrice: { $max: '$price' }
            }
          },
          {
            $sort: { avgPrice: 1 }
          }
          // {
          //   $match: { _id: { $ne: 'EASY' } }
          // }
        ]);
    
        res.status(200).json({
          status: 'success',
          data: {
            stats
          }
    });
     
});

  exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
        const year = req.params.year * 1; // 2021
    
        const plan = await Tour.aggregate([
          {
            $unwind: '$startDates'
          },
          {
            $match: {
              startDates: {
                $gte: new Date(`${year}-01-01`),
                $lte: new Date(`${year}-12-31`)
              }
            }
          },
          {
            $group: {
              _id: { $month: '$startDates' },
              numTourStarts: { $sum: 1 },
              tours: { $push: '$name' }
            }
          },
          {
            $addFields: { month: '$_id' }
          },
          {
            $project: {
              _id: 0
            }
          },
          {
            $sort: { numTourStarts: -1 }
          },
          {
            $limit: 12
          }
        ]);
    
        res.status(200).json({
          status: 'success',
          data: {
            plan
          }
    });
});
/*
    '/tours-within/:distance/center/:latlng/unit/:unit'     
//  /tours-within/233/center/34.111745,-118.113491/unit/mi -> Standard of specifying URLs
*/

exports.getToursWithin = catchAsync(async (req,res,next) => {
  const { distance, latlng, unit } = req.params;
  const[lat,lng] = latlng.split(',');

  const radius = unit ==='mi' ? distance / 3963.2 : distance / 6378.1;               // distance / 3963.2 (radius of the Earth) => radius (in radians) of the Earth (mi)

  if(!lat || !lng) {
    next(new AppError('Please provide latitude and longitude in the format lat,lng.',  400));
  };

//Adding geospatial operator($geoWithin) => Finds documents within a certain geometry(sphere): 250 km around my current location
//$centerSphere operator takes in an array of the coordinates(always first the lng and afterwards the lat) and of the radius(in radians)
  const tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[lng,lat], radius] }} });

  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      data: tours
    }
  })
});


exports.getDistances = catchAsync(async (req,res,next) => {
  const { latlng, unit } = req.params;
  const[lat,lng] = latlng.split(',');   

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001; // 1 meter = 0.000621371 miles       

  if(!lat || !lng) {
    next(new AppError('Please provide latitude and longitude in the format lat,lng.',  400));
  };

  //$geoNear: This is the only geospatial aggregation pipeline stage that exists. This stage must be always the first one in the pipeline.
  //near: The point from which to calculate the distances(all distanced will be calculated btw near point and all the start locations)

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier  //this multiplies the distances with 0.001 to transform from m into km.
      }
    },
    {
      $project: {
        distance: 1,  //in $project => 1 means I want to keep the specified values from the output (in this case tour distance and name)
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });
});

