const crypto = require ('crypto');
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
    role: {
        type: String,
        enum:['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
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
    passwordChangedAt: Date,
    passwordResetToken: String, 
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }

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

userSchema.pre('save', function(next){
    if(!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000; //Will put passwordChangedAt 1 second in the past (small hack for guaranteeing that the token is always created after the pass has been changed)
    next();
});

userSchema.pre(/^find/, function(next) {
    this.find({active: {$ne: false}});
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
    }

    return false;
};

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex'); //this will be a token sent to the user

    this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

    console.log({resetToken}, this.passwordResetToken);
    this.passwordResetExpires = Date.now() + 10 * 60 *1000; //Expires in 10 seconds from that moment

    return resetToken;
}

const User = mongoose.model('User', userSchema);

module.exports = User;