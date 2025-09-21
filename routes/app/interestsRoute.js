const router = require("express").Router();
const { getAll, addInterest } = require("../../controllers/app/interestsController");
const { verifyToken } = require("../../middlewares/verifyToken");

router.route('/getAll').get(verifyToken, getAll);


module.exports = router;