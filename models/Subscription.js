const { default: mongoose } = require("mongoose");
const { User } = require("./User");
const { Transaction } = require("./Transaction");
const { default: StripeService } = require("../utils/stripeService");
const { TransactionDetails } = require("./TransactionDetails");
const { Wallet } = require("./Wallet");


const SubscriptionSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true, 
        index: true 
    },
    stripeSubscriptionId: { 
        type: String, 
        uniqe: true,
        required: true, 
        index: true 
    },
    status: { 
        type: String, 
        enum: ['incomplete','active','past_due','canceled'], 
        default: 'incomplete', 
        index: true 
    },
    startDate: { 
        type: Date, 
        default: Date.now 
    },
    endDate: { 
        type: Date, 
        default: () => { 
            const now = new Date(); 
            now.setDate(now.getDate()+30); 
            return now; 
        } 
    },
    amount: { 
        type: Number 
    },
    active: { 
        type: Boolean, 
        default: true 
    },
    cancelAtPeriodEnd: { 
        type: Boolean, 
        default: false 
    },
    deletedAt: { type: Date, default: null }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});


const Subscription = mongoose.model("Subscription", SubscriptionSchema);

module.exports = {
    Subscription
}