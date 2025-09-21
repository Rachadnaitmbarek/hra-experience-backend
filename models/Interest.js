const { default: mongoose } = require("mongoose");
const { User } = require("./User");


const InterestSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true,
    },
    imageUrl: {
        type: String,
    },
    name: {
        type: String,
        required: true
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

const Interest = mongoose.model("Interest", InterestSchema);

module.exports = {
    Interest
}