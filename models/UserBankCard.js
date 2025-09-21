const { default: mongoose } = require("mongoose");
const { User } = require("./User");


const UserBankCardSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    // Stripe References
    stripeCustomerId: {
        type: String,
        required: true
    },
    stripePaymentMethodId: {
        type: String,
        required: true,
        unique: true
    },
    setupIntentId: {
        type: String,
        required: true
    },

        cardBrand: {
        type: String,
        required: true,
        enum: ['visa', 'mastercard', 'amex', 'discover', 'diners', 'jcb', 'unionpay', 'unknown']
    },
    cardLast4: {
        type: String,
        required: true,
        length: 4
    },
    cardExpMonth: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    cardExpYear: {
        type: Number,
        required: true,
        min: new Date().getFullYear()
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    lastUsedAt: {
        type: Date,
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

UserBankCardSchema.virtual('expiryDisplay').get(function() {
    const month = this.cardExpMonth.toString().padStart(2, '0');
    const year = this.cardExpYear.toString().slice(-2);
    return `${month}/${year}`;
});

UserBankCardSchema.virtual('isExpired').get(function() {
    const now = new Date();
    const expiry = new Date(this.cardExpYear, this.cardExpMonth - 1);
    return now > expiry;
});

UserBankCardSchema.virtual('maskedNumber').get(function() {
    return `•••• •••• •••• ${this.cardLast4}`;
});

UserBankCardSchema.methods.setDefaultCard = async function() {
    await this.updateMany(
        { methods: this.userId },
        { isDefault: false }
    );
    
    return this.findByIdAndUpdate(
        this.cardId,
        { isDefault: true },
        { new: true }
    );
};


UserBankCardSchema.methods.softDelete = function() {
    this.isDeleted = true;
    this.isActive = false;
    this.deletedAt = new Date();
    return this.save();
};

const UserBankCard = mongoose.model("UserBankCard", UserBankCardSchema);

module.exports = {
    UserBankCard
}