// review / rating / createdAt / reference to tour / ref to user.
const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review can not be empty']
    },
    rating:{
        type: Number,
        maxlength: [5, 'Maximum rating value is 5 stars'],
        minlength: [0, 'Minimum rating value is 0 stars']
    },
    createdAt: {
        type: Date,
        default: Date.now,
        select: false
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour.']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user.']
    }
},
{
    toJSON: { virtuals: true}, // When we have a field that is not stored in DB (a virtual property), but calculated using some other value, we want to also show up when it's an output.
    toObject: { virtuals: true}
});

// /^find/ = regular expression to match strings which starts with find (find, findOne, findById etc...)
reviewSchema.pre(/^find/, function(next){
    /*this.populate({  // the tour from the schema will be the one populated, based on the Tour model
      path : 'tour', 
     select: 'name' 
   }).populate({     // the user from the schema will be the one populated, based on the User model
    path: 'user',
    select:'name photo'
   });*/
   
   this.populate({
    path:'user',
    select: 'name photo'
   })
 
   next();
});
//The below function is creating the statistics of the average nr of ratings for the tourId for which the current review was created.
reviewSchema.statics.calcAverageRatings = async function(tourId) {
    const stats = await this.aggregate([
        //First stage => match (importing tour Id's)
        {
            $match: {tour: tourId}
        },
        //Second stage => group (calculate statistics)
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);
    //console.log(stats);

    if(stats.length > 0){
        await Tour.findByIdAndUpdate(tourId, { 
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, { 
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        }); 
    };

};

reviewSchema.post('save', function(){
    //this points to the current document that is being saved => review
    this.constructor.calcAverageRatings(this.tour);
});

//The regular expression /^findOneAnd/ will work only for findByIdAndUpdate and findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function(next){
    this.r = await this.findOne();
   // console.log(this.r);
    next();
});

reviewSchema.post(/^findOneAnd/, async function(){
//await this.findOne(); does NOT work here, query has already executed.
   await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;


