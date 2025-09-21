const { default: mongoose } = require("mongoose");
const { User } = require("./User");


const UserInterestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    interestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Interest',
        required: true,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

const UserInterest = mongoose.model("UserInterest", UserInterestSchema);

module.exports = {
    UserInterest
}