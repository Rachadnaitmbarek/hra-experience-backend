const router = require("express").Router();
const { startSubscription } = require("../../controllers/app/subscriptionController");
const { getPaymentTransactionsByUserId } = require("../../controllers/app/transactionController");
const { createSetupIntent, getAllCards, getDefaultPaymentMethod, setDefaultPaymentMethod, deleteCard } = require("../../controllers/app/walletController");
const { verifyToken } = require("../../middlewares/verifyToken");

router.route('/getAllCards').get(verifyToken, getAllCards);
router.route('/getDefaultPaymentMethod').get(verifyToken, getDefaultPaymentMethod);
router.route('/createSetupIntent').post(verifyToken, createSetupIntent);
router.route('/setDefaultPaymentMethod/:paymentMethod').post(verifyToken, setDefaultPaymentMethod);
router.route('/deleteCard/:paymentMethod').delete(verifyToken, deleteCard);
router.route('/getPaymentTransactionsByUserId/:userId/:pageNumber/:pageSize').get(verifyToken, getPaymentTransactionsByUserId);
router.route('/startSubscription').post(verifyToken, startSubscription);

module.exports = router;