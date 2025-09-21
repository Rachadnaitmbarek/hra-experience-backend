const { default: mongoose } = require("mongoose");
const { User } = require("./User");


const WalletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    balance: {
        type: Number,
        default: 0
    },
    loanLimit: {
        type: Number,
        default: 1800
    },
    loanUsed: {
        type: Number,
        default: 0
    },
    lastUsed: {
        type: Date,
        default: Date(),
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});


WalletSchema.methods.getLoan = function() {
    return this.loanLimit - this.loanUsed;
}


WalletSchema.methods.getLoanBalance = function() {
    return (this.balance > 0 ? this.balance : 0) + this.getLoan()
}

const Wallet = mongoose.model("Wallet", WalletSchema);
      

module.exports = {
    Wallet
}