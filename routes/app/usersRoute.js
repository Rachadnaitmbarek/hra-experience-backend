const router = require("express").Router();
const {
  getAllUsersCtrl,
  getUserProfileCtrl,
  updateUserProfileCtrl,
  getUsersCountCtrl,
  profilePhotoUploadCtrl,
  deleteUserProfileCtrl,
  getUser,
  updateUser,
  changeProfileImage
} = require("../../controllers/app/usersController");
const {
  verifyTokenAndAdmin,
  verifyTokenAndOnlyUser,
  verifyToken,
  verifyTokenAndAuthorization,
} = require("../../middlewares/verifyToken");
const validateObjectId = require("../../middlewares/validateObjectId");
const photoUpload = require("../../middlewares/photoUpload");
const { addInterest } = require("../../controllers/app/interestsController");

// hra-experience route
router.route("/get").get(verifyToken, getUser);
router.route('/addInterests').post(verifyToken, addInterest);



// /api/users/profile
router.route("/profile").get(verifyTokenAndAdmin, getAllUsersCtrl);

// /api/users/profile/profile-photo-upload
// router
//   .route("/profile/profile-photo-upload")
//   .post(verifyToken, photoUpload.single("image"), profilePhotoUploadCtrl);

// /api/users/profile/:id
router
  .route("/profile/:id")
  .get(validateObjectId, getUserProfileCtrl)
  .put(validateObjectId, verifyTokenAndOnlyUser, updateUserProfileCtrl)
  .delete(validateObjectId, verifyTokenAndAuthorization,deleteUserProfileCtrl);

// /api/users/count
router.route("/count").get(verifyTokenAndAdmin, getUsersCountCtrl);

router.route("/update").post(verifyToken, updateUser);
router.route("/changeProfileImage").post(verifyToken, photoUpload.single("image"), changeProfileImage);


module.exports = router;
