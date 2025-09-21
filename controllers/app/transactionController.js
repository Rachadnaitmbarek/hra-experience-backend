const asyncHandler = require("express-async-handler");
const { Transaction } = require("../../models/Transaction");


module.exports.getPaymentTransactionsByUserId = asyncHandler(async (req, res) => {
        const transactions = await Transaction.find({ userId: req.user._id }).sort({ updatedAt: -1 })
        const transactionData = await Promise.all(transactions.map(async (transaction) => {
                return {
                        amount: transaction.amount,
                        bookingId: transaction.bookingId,
                        createDate: transaction.createdAt,
                        paymentDate: transaction.paymentDate,
                        invoiceId: transaction.invoiceId,
                        transactionType: transaction.type,
                        direction: transaction.direction, 
                        includedLoan: (await transaction.getIncludedLoan())
                }
        }))
        return res.status(200).json({
                data: transactionData,
                success: true
        })
})