const asyncHandler = require("express-async-handler");
const { Subscription } = require("../../models/Subscription");
const { default: StripeService } = require("../../utils/stripeService");
const { default: mongoose } = require("mongoose");
const { Transaction } = require("../../models/Transaction");
const { User } = require("../../models/User");
const { TransactionDetails } = require("../../models/TransactionDetails");



module.exports.subscriptionCreate = asyncHandler(async (req, res) => {
        try {
                const eventData = req.stripeEvent.data.object;
                const subscriptionData = eventData.items.data[0];
                const priceData = subscriptionData.price;
                const customer = await User.findOne({
                        stripeCustomerID: eventData.customer
                })

                if (!customer) {
                        return res.status(400).json({
                                error: "Customer not found",
                                success: false
                        });
                }

                const wallet = await customer.getWallet();

                // change it from cent to usd
                const price = priceData.unit_amount / 100;
                const subscription = await Subscription.create({
                        userId: customer._id,
                        stripeSubscriptionId: subscriptionData.subscription,
                        status: eventData.status,
                        startDate: new Date(subscriptionData.current_period_start * 1000),
                        endDate: new Date(subscriptionData.current_period_end * 1000),
                        amount: price,
                        active: false
                })

                const transaction = await Transaction.create({
                        userId: customer._id,
                        subscriptionId: subscription._id,
                        stripeInvoiceId: eventData.latest_invoice,
                        type: "subscription",
                        amount: price,
                        direction: "credit",
                        balanceFrom: wallet.balance,
                        balanceTo: wallet.balance + price,
                        paymentDate: new Date(subscriptionData.created * 1000),
                        status: "pending" 
                })

                await TransactionDetails.create({
                        userId: customer._id,
                        transactionId: transaction._id,
                        source: "wallet",
                        direction: "credit",
                        amount: price,
                })

                return res.status(200).json({
                        success: true,
                        message: "Subscription created ",
                        subscription: subscription._id,
                });
        } catch (error) {
                res.status(400).json({
                        error: error.message,
                        stack: error.stack,
                        lineNumber: error.lineNumber,
                        success: false
                })                
        }

})

// module.exports.subscriptionCreate = asyncHandler(async (req, res) => {
//   let session = null;
//   const canTransact =
//     !!mongoose?.connection?.client?.topology?.s?.options?.replicaSet ||
//     !!mongoose?.connection?.client?.s?.options?.replicaSet; // Atlas/local RS

//   try {
//     if (canTransact) {
//       session = await mongoose.startSession();
//       session.startTransaction();
//     }

//     const eventData = req.stripeEvent?.data?.object; // subscription object
//     if (!eventData) throw new Error("Stripe event payload missing.");

//     const customer = await User.findOne(
//       { stripeCustomerID: eventData.customer },
//       null,
//       session ? { session } : {}
//     );
//     if (!customer) throw new Error("Customer not found");

//     const wallet = await customer.getWallet();
//     if (!wallet) throw new Error("Wallet not found");

//     const firstItem = eventData.items?.data?.[0];
//     const unitAmount = firstItem?.price?.unit_amount; // cents
//     const price = typeof unitAmount === "number" ? unitAmount / 100 : 0;

//     const subscription = await Subscription.create(
//       [{
//         userId: customer._id,
//         stripeSubscriptionId: eventData.id,
//         status: eventData.status,
//         startDate: eventData.current_period_start
//           ? new Date(eventData.current_period_start * 1000)
//           : undefined,
//         endDate: eventData.current_period_end
//           ? new Date(eventData.current_period_end * 1000)
//           : undefined,
//         amount: price,
//         active: false,
//       }],
//       session ? { session } : {}
//     ).then(([doc]) => doc);

//     const transaction = await Transaction.create(
//       [{
//         userId: customer._id,
//         subscriptionId: subscription._id,
//         stripeInvoiceId: eventData.latest_invoice,
//         type: "subscription",
//         amount: price,
//         direction: "credit",
//         balanceFrom: wallet.balance,
//         balanceTo: wallet.balance + price,
//         paymentDate: eventData.created ? new Date(eventData.created * 1000) : new Date(),
//         status: "pending",
//       }],
//       session ? { session } : {}
//     ).then(([doc]) => doc);

//     await TransactionDetails.create(
//       [{
//         userId: customer._id,
//         transactionId: transaction._id,
//         source: "wallet",
//         direction: "credit",
//         amount: price,
//       }],
//       session ? { session } : {}
//     );

//     if (session) {
//       await session.commitTransaction();
//       session.endSession();
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Subscription created",
//       subscription: subscription._id,
//     });

//   } catch (error) {
//     if (session) {
//       await session.abortTransaction();
//       session.endSession();
//     }
//     return res.status(400).json({
//       error: error.message,
//       stack: error.stack,
//       success: false,
//     });
//   }
// });