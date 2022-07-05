const mongoose = require ('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema ({

    name: {
        type: String,
        required: [true, 'Please tell us your name!']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,   //Transforms the email into lowercase
        validate: [validator.isEmail, 'Please provide a valid email']

    },
    photo: String,
    password: {
        type:String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false

    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
        //This only works on CREATE and SAVE!!!
            validator: function(el){
                return el === this.password; //Ex: abc === abc => true
            },
            message: 'Passwords are not the same!'
        }
    },
    passwordChangedAt: Date

});

//The below middleware encryption will happen between the moment we receive the data, and the moment where it's saved to the DB.
userSchema.pre('save', async function (next){
//Only run this function if password was actually modified 
    if(!this.isModified('password')) return next();

//Encrypt or hashing password - using bcrypt js. Hashing password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    //Delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();

});
//candidatePassword = password that user passes in the body
//.correctPassword is an Instance method => Method that is going to be available on all documents of a certain collection.
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword) // compare will return true if the left two passwords are the same.
};


//If below is true, user have not changed the password after the JWTTimestamp
userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
    if(this.passwordChangedAt) {
        const changedTimestamp = parseInt (this.passwordChangedAt.getTime() / 1000, 10); //transformed msec into sec, and specified the base 10

        console.log(changedTimestamp, JWTTimestamp);
        return JWTTimestamp < changedTimestamp 
    }

    //False means NOT changed
    return false;
}

const User = mongoose.model('User', userSchema);

module.exports = User;