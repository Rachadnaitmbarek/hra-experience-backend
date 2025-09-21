const router = require("express").Router();
const { getAll, getBooking } = require("../../controllers/app/bookingController");
const { verifyToken } = require("../../middlewares/verifyToken");



router.route("/getAll/:pageNumber/:pageSize").get(verifyToken, getAll)
router.route("/get/:booking").get(verifyToken, getBooking)

module.exports = router;