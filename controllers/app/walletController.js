const asyncHandler = require("express-async-handler");
const { default: StripeService } = require("../../utils/stripeService");


module.exports.createSetupIntent = asyncHandler(async (req, res) => {
        try {
                const user = req.user;
                const data = await StripeService.createSetupIntent(user.stripeCustomerID);
                return res.status(200).json({
                        ...data,
                        success: true,
                })
        } catch (error) {
                return res.status(200).json({
                        error,
                        success: false,
                })  
        }
});

module.exports.getAllCards = asyncHandler(async (req, res) => {
        try {
                const user = req.user;
                const data = await StripeService.getUserCards(user.stripeCustomerID);
                return res.status(200).json({
                        data: data,
                        success: true,
                })
        } catch (error) {
                return res.status(200).json({
                        error,
                        success: false,
                })  
        }
});

module.exports.getDefaultPaymentMethod = asyncHandler(async (req, res) => {
        try {
                const user = req.user;
                const data = await StripeService.getDefaultCard(user.stripeCustomerID);
                return res.status(200).json({
                        data: data,
                        defaultPaymentMethodId: data.id,
                        success: true,
                })
        } catch (error) {
                return res.status(200).json({
                        error,
                        success: false,
                })  
        }
});

module.exports.setDefaultPaymentMethod = asyncHandler(async (req, res) => {
        try {
                const user = req.user;
                const data = await StripeService.setDefaultCard(user.stripeCustomerID, req.params.paymentMethod);
                return res.status(200).json({
                        data: data,
                        success: true,
                })
        } catch (error) {
                return res.status(400).json({
                        error: error.message,
                        success: false,
                })  
        }
});


module.exports.deleteCard = asyncHandler(async (req, res) => {
        try {
                const user = req.user;
                console.log(req.params.paymentMethod);
                const data = await StripeService.deleteCard(req.params.paymentMethod);
                return res.status(200).json({
                        data: data,
                        success: true,
                })
        } catch (error) {
                return res.status(400).json({
                        error: error.message,
                        success: false,
                })  
        }
});