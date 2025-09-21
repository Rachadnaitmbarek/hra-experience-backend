const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { User } = require("../models/User");
const { default: StripeService } = require("../utils/stripeService");

const verifyToken = asyncHandler(async (req, res, next) => {
  const authToken = req.headers.authorization;
  if (!authToken) {
    return res.status(401).json({ message: "no token provided, access denied" });
  }

  const token = authToken.split(" ")[1];
  try {
    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedPayload.id)
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "invalid token, access denied" });
  }
});

// Verify Token & Admin
function verifyTokenAndAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      return res.status(403).json({ message: "not allowed, only admin" });
    }
  });
}

// Verify Token & Only User Himself
function verifyTokenAndOnlyUser(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id) {
      next();
    } else {
      return res.status(403).json({ message: "not allowed, only user himself" });
    }
  });
}

// Verify Token & Authorization
function verifyTokenAndAuthorization(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      return res.status(403).json({ message: "not allowed, only user himself or admin" });
    }
  });
}

function verifyStripeToken(req, res, next) {
  const signature = req.headers['stripe-signature'];
  const endpointSecret = "whsec_JKTVXVvfepCM9wgr3V38DkvDQRZuukCE";
  let event;
  try {
    event = StripeService.verifyStripeWebHook(req.body, signature, endpointSecret);
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  req.stripeEvent = event;
  next();
}



function verifyStripeTokenInvoice(req, res, next) {
  const signature = req.headers['stripe-signature'];
  const endpointSecret = "whsec_waB8MERCb97mOlZqCI1a5mbzTxsC11Hx";
  let event;
  try {
    event = StripeService.verifyStripeWebHook(req.body, signature, endpointSecret);
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  req.stripeEvent = event;
  next();
}



module.exports = {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndOnlyUser,
  verifyTokenAndAuthorization,
  verifyStripeToken,
  verifyStripeTokenInvoice
};
