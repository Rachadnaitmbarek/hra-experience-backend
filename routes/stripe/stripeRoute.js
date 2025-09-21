const { Transaction } = require("../../models/Transaction");
const { verifyStripeToken, verifyStripeTokenInvoice } = require("../../middlewares/verifyToken");
const { subscriptionCreate } = require("../../controllers/stripe/subscriptionController");
const { invoicePaid } = require("../../controllers/stripe/invoiceController");
const router = require("express").Router();


router.route("/subscription").post(verifyStripeToken, function (req, res) {
        switch (req.stripeEvent.type) {
                case "customer.subscription.created":
                        subscriptionCreate(req, res);
                        break;
                default:
                        break;
        }
})

router.route("/invoices").post(verifyStripeTokenInvoice, function (req, res) {
        switch (req.stripeEvent.type) {
                case "invoice.paid":
                        invoicePaid(req, res);
                        break;
                default:
                        break;
        }
})

module.exports = router;
// const endpointSecret = "whsec_JKTVXVvfepCM9wgr3V38DkvDQRZuukCE";