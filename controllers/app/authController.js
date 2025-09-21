const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const {
  User,
  validateRegisterUser,
  validateLoginUser,
} = require("../../models/User");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const sendEmail = require("../../utils/sendEmail");
const { default: StripeService } = require("../../utils/stripeService");
const { UserDevice } = require("../../models/UserDevices");
const { UserVerifiedOTP } = require("../../models/VerifiedOTP");
const { Wallet } = require("../../models/Wallet");

/**-----------------------------------------------
 * @desc    Register New User
 * @route   /api/auth/register
 * @method  POST
 * @access  public
 ------------------------------------------------*/
module.exports.registerUserCtrl = asyncHandler(async (req, res) => {
  let newUser = null
  try {
    const { error, value } = validateRegisterUser(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
  
    let user = await User.existsByEmailOrPhone(value.email, value.phoneNumber);
    if (user) {
      return res.status(400).json({ message: "user already exist" });
    }
  
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const fullname = `${value.firstName} ${value.lastName}`
    const stripeCustomerID = await StripeService.createCustomer(fullname, value.email);

    newUser = await User.create({
      firstName: value.firstName,
      lastName: value.lastName,
      phone: value.phoneNumber,
      email: value.email,
      password: hashedPassword,
      stripeCustomerID: stripeCustomerID
    });

    const wallet = await Wallet.create({
      userId: newUser._id,
      balance: 0,
      loanUsed: 0,
      lastUsed: Date()
    })

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpVerify = await UserVerifiedOTP.create({
      userId: newUser._id,
      email: newUser.email,
      otp,
      verified: false,
      expiresAt: new Date(Date.now() + 2 * 60 * 1000)
    });

    // sendEmail(newUser.email);
    
    res.status(201).json({
      otp: otp,
      token: newUser.generateAuthToken(),
      refreshToken: newUser.generateAuthToken(),
      message: "done",
      success: true,
    });
  } catch (error) {
    if(newUser) {
      User.findByIdAndDelete(newUser._id)
    }
    res.status(400).json({
      message: error.message,
    });
  }
});

/**-----------------------------------------------
 * @desc    Login User
 * @route   /api/auth/login
 * @method  POST
 * @access  public
 ------------------------------------------------*/
module.exports.loginUserCtrl = asyncHandler(async (req, res) => {
  const { error } = validateLoginUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).json({ message: "invalid email or password" });
  }

  const isPasswordMatch = await bcrypt.compare(
    req.body.password,
    user.password
  );

  if (!isPasswordMatch) {
    return res.status(400).json({ message: "invalid email or password !!" });
  }

  const token = user.generateAuthToken();
  res.status(200).json({
    data: {
      token,
      refreshToken: user.generateAuthToken(), 
    },
    success: true
  });
});

module.exports.refreshToken = asyncHandler(async (req, res) => {
  const user = req.user

  const token = user.generateAuthToken();
  res.status(200).json({
    data: {
      token,
      refreshToken: user.generateAuthToken(), 
    },
    success: true
  });
});

/**-----------------------------------------------
 * @desc    Verify User Account
 * @route   /api/auth/:userId/verify/:token
 * @method  GET
 * @access  public
 ------------------------------------------------*/
module.exports.verifyUserAccountCtrl = asyncHandler(async (req, res) => {
  const otp = await UserVerifiedOTP.findOne({
    email: req.body.email,
    otp: req.body.otpCode,
  })
  if(!otp) {
    return res.status(400).json({
      message: "otp uncorrect"
    });
  }

  // if (otp.expiresAt < new Date()) {
  //   return res.status(400).json({
  //     message: "OTP has expired",
  //   });
  // }

  otp.verified = true;
  await otp.save();
  const user = req.user;
  user.isAccountVerified = true;
  await user.save();
  return res.status(200).json({
    message: "OTP verified successfully",
    success: true
  });
});




/**-----------------------------------------------
 * @desc    get Loggedin user
 * @route   /api/getUser
 * @method  GET
 * @access  public
 ------------------------------------------------*/
module.exports.getUser = asyncHandler(async (req, res) => {
  const token = req.query.token; 
  const payload = jwt.verify(token, process.env.JWT_SECRET)
  
  if(!payload) return res.status(400).json({ message: "invalid link" });

  const user = await User.findOne({
    _id: payload.id
  });

  res.status(200).json({
    _id: user._id,
    isAdmin: user.isAdmin,
    profilePhoto: user.profilePhoto,
    token,
    username: user.username,
  });
});