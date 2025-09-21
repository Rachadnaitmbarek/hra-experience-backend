const { default: mongoose } = require("mongoose");
const { Transaction } = require("./Transaction");
const { Booking } = require("./Booking");


const TransactionDetailsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        required: true,
        index: true
    },
    source: {
        type: String,
        enum: ["wallet", "loan"],
        default: "wallet",
        required: true
    },
    direction: {
        type: String,
        enum: ["credit","debit"],
        required: true,
        default: "credit"
    },
    amount: {
        type: Number,
        default: 0,
        required: true
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

const TransactionDetails = mongoose.model("TransactionDetails", TransactionDetailsSchema);

module.exports = {
    TransactionDetails
}