const router = require("express").Router();
const { registerUserCtrl, loginUserCtrl, verifyUserAccountCtrl, getUser, refreshToken } = require("../../controllers/app/authController");
const { verifyToken } = require("../../middlewares/verifyToken");

// /api/auth/register
router.post("/register", registerUserCtrl);

// /api/auth/login
router.post("/login", loginUserCtrl);
router.route("/refreshToken").post(verifyToken, refreshToken);
//       await this.ionicStorageService.setToken(httpResult.data.token);
//       await this.ionicStorageService.setItem('refreshToken', httpResult.data.refreshToken);

// /api/auth/:userId/verify/:token
// router.get("/:userId/verify/:token", verifyUserAccountCtrl);
router.route("/verifyRegisterOtp").post(verifyToken, verifyUserAccountCtrl);



module.exports = router;