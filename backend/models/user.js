const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name'],
        maxLength: [30, 'Your name cannot exceed 30 characters']
    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        validate: [validator.isEmail, 'Please enter valid email address']
    },
    // Password is optional when using Firebase auth
    password: {
        type: String,
        minlength: [6, 'Your password must be longer than 6 characters'],
        select: false,
        required: function () {
            // Require password only if not linked to Firebase
            return !this.firebaseUid;
        }
    },
    // Link to Firebase Authentication UID
    firebaseUid: {
        type: String,
        index: true,
        sparse: true
    },
    avatar: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    role: {
        type: String,
        enum: {
            values: ['user', 'admin'],
            message: 'Please select correct role'
        },
        default: 'user'
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    emailVerificationToken: String,
    emailVerificationExpire: Date
})
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10)
    next();
});

userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    });
}

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash and set to resetPasswordToken
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    // Set token expire time
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000

    return resetToken

}

userSchema.methods.getEmailVerificationToken = function () {
    // Generate token
    const verificationToken = crypto.randomBytes(20).toString('hex');

    // Hash and set to emailVerificationToken
    this.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex')

    // Set token expire time (24 hours)
    this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000

    return verificationToken
}

module.exports = mongoose.model('User', userSchema);