// review / rating / createdAt / reference to tour / ref to user.
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: ['Review can not be empty']
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

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
