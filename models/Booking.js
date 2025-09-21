const { default: mongoose } = require("mongoose");


const BookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ["hotel", "flight"],
        default: "hotel",
        required: true
    },
    productId: {
        type: String,
        required: true
    },
    referenceNum: {
        type: String,
        required: true
    },
    supplierConfirmationNum: {
        type: String,
        required: true
    },
    checkin: {
        type: Date,
        default: Date.now       
    },
    checkout: {
        type: Date,
        default: Date.now      
    },
    amount: {
        type: Number,
        default: 0
    },
    isRefundable: {
        type: Boolean,
        default: false
    },
    state: {
        type: String,
        enum: ["canceled", "confirmed"],
        default: "confirmed"
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

const Booking = mongoose.model("Booking", BookingSchema);

module.exports = {
    Booking
}