const router = require("express").Router();
const { registerUserCtrl, loginUserCtrl, verifyUserAccountCtrl, getUser } = require("../controllers/authController")

// /api/auth/register
router.post("/register", registerUserCtrl);

// /api/auth/login
router.post("/login", loginUserCtrl);
router.get("/getUser", getUser);

// /api/auth/:userId/verify/:token
router.get("/:userId/verify/:token", verifyUserAccountCtrl);

module.exports = router;