const asyncHandler = require("express-async-handler");
const { Subscription } = require("../../models/Subscription");
const { default: StripeService } = require("../../utils/stripeService");
const { default: mongoose } = require("mongoose");
const { Transaction } = require("../../models/Transaction");



module.exports.startSubscription = asyncHandler(async (req, res) => {
        const user = req.user;
        
        const activeSubscription = await user.getActiveSubscription();

        if(activeSubscription) {
                return res.status(200).json({
                        subscription: activeSubscription
                });
        }

        // const subscribe =  await Subscription.subscribeUser(user)
        const subscribe = await StripeService.subscribe(user.stripeCustomerID)

        return res.status(200).json({
                subscription: subscribe
        });
        
})