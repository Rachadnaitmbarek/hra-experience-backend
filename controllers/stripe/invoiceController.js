const asyncHandler = require("express-async-handler");
const { Subscription } = require("../../models/Subscription");
const { default: StripeService } = require("../../utils/stripeService");
const { default: mongoose } = require("mongoose");
const { Transaction } = require("../../models/Transaction");
const { User } = require("../../models/User");
const { Wallet } = require("../../models/Wallet");



module.exports.invoicePaid = asyncHandler(async (req, res) => {
        // const session = await mongoose.startSession();
        // session.startTransaction();
        try {
                const eventData = req.stripeEvent.data.object;
                const customer = await User.findOne({
                        stripeCustomerID: eventData.customer
                })

                if (!customer) {
                        // await session.abortTransaction();
                        // session.endSession();
                        return res.status(400).json({
                                error: "Customer not found",
                                success: false
                        });
                }

                const wallet = await customer.getWallet();

                const transaction = await Transaction.findOne({
                        userId: customer._id,
                        stripeInvoiceId: eventData.id
                })
                // .session(session);

                if (!transaction) {
                        // await session.abortTransaction();
                        // session.endSession();
                        return res.status(400).json({
                                error: "Pending transaction not found",
                                success: false
                        });
                }
                
                const subscription = await Subscription.findOne({
                        userId: customer._id,
                        _id: transaction.subscriptionId
                })
                // .session(session);

                if (!subscription) {
                        // await session.abortTransaction();
                        // session.endSession();
                        return res.status(400).json({
                                error: "Subscription not found for this invoice",
                                success: false
                        });
                }

                const creditAmount = transaction.amount;
                const balanceFrom = wallet.balance;
                const balanceTo = balanceFrom + creditAmount;

                
                await Subscription.updateMany(
                        { userId: customer._id },
                        { $set: { active: false } },
                        // { session }
                );

                await Subscription.findByIdAndUpdate(
                        subscription._id,
                        { 
                                active: true,
                                status: "active"
                        },
                        // { session }
                );

                await Transaction.findByIdAndUpdate(
                        transaction._id,
                        { 
                                status: "completed",
                                balanceFrom: balanceFrom,
                                balanceTo: balanceTo,
                        },
                        // { session }
                );

                await Wallet.findByIdAndUpdate(
                        wallet._id,
                        { balance: balanceTo },
                        // { session }
                );

                // await session.commitTransaction();
                // session.endSession();

                return res.status(200).json({
                        success: true,
                        message: "Subscription activated and wallet updated",
                        subscription: subscription._id,
                        newBalance: balanceTo
                });

        } catch (error) {
                // await session.abortTransaction();
                // session.endSession();
                res.status(400).json({
                        error: error.message,
                        success: false
                })                
        }

})