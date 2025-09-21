const { default: mongoose } = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    unique: true,
    sparse: true,
    index: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    unique: true,
    sparse: true,
    index: true
  },
  stripeInvoiceId: {
    type: String,
    // We will add a partial index below
  },
  type: {
    type: String,
    enum: ["subscription", "booking", "adjustment"],
    default: "subscription",
    required: true
  },
  amount: {
    type: Number,
    required: true,
    default: 0
  },
  direction: {
    type: String,
    enum: ["credit", "debit"],
    required: true,
    default: "credit"
  },
  balanceFrom: {
    type: Number,
    default: 0
  },
  balanceTo: {
    type: Number,
    default: 0
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "completed"
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * Ensure stripeInvoiceId is unique ONLY when it exists and is not null
 */
TransactionSchema.index(
  { stripeInvoiceId: 1 },
  { unique: true, partialFilterExpression: { stripeInvoiceId: { $exists: true, $ne: null } } }
);


TransactionSchema.methods.getIncludedLoan = async function() {
  const Details = mongoose.model('TransactionDetails');
  const detailsList = await Details.find({
    transactionId: this._id,
    source: "loan"
  }) 

  const total = detailsList.reduce((currentVal, item) => {
    return currentVal + item.amount
  }, 0)
  return total
}

const Transaction = mongoose.model("Transaction", TransactionSchema);

module.exports = { Transaction };
