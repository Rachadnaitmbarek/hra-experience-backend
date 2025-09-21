const { default: mongoose } = require("mongoose");


const WishlistSchema = new mongoose.Schema({
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
    referenceId: {
        type: String,
        required: true
    },
    productId: {
        type: String,
        required: true
    }, 
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

const Wishlist = mongoose.model("Wishlist", WishlistSchema);

module.exports = {
    Wishlist
}