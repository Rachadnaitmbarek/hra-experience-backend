const { default: mongoose } = require("mongoose");
const { User } = require("./User");


const VerifiedOTPSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    email: {
        type: String, 
        required: true,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    expiresAt: {
        type: Date,
        // epired in 2 minute
        default: () => new Date(+new Date() + 2 * 60 * 1000)
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

const UserVerifiedOTP = mongoose.model("VerifiedOTP", VerifiedOTPSchema);

module.exports = {
    UserVerifiedOTP
}