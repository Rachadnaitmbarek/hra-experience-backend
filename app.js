const express = require("express");
const connectToDb = require("./config/connectToDb");
const xss = require("xss-clean");
const rateLimiting = require("express-rate-limit");
const helmet = require("helmet");
const hpp = require("hpp");
const { errorHandler, notFound } = require("./middlewares/error");
const cors = require("cors");
require("dotenv").config();

// Connection To Db
connectToDb();

// Init App
const app = express();

// Cors Policy
// app.use(cors({
//   origin: "*"
// }));

app.use(cors({
  origin: ["http://localhost:8100", "http://localhost:8101", "http://localhost:4200"],
  credentials: true,
}));
app.options("*", cors());
// Security Headers (helmet)
app.use(helmet());

// Prevent Http Param Pollution
app.use(hpp());

// Prevent XSS(Cross Site Scripting) Attacks
app.use(xss());

// Rate Limiting
app.use(rateLimiting({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max:200,
}));

// stripe route
app.use(
  "/stripe", 
  express.raw({type: 'application/json'}),
  require("./routes/stripe/stripeRoute")
);
// Middlewares
app.use(express.json());
// Routes
app.use("/api/auth", require("./routes/app/authRoute"));
app.use("/api/users", require("./routes/app/usersRoute"));
app.use("/api/Interests", require("./routes/app/interestsRoute"));
app.use("/api/Wallets", require("./routes/app/walletRoute"));
app.use("/api/hotels", require("./routes/app/hotelsRoute"));
app.use("/api/hotelRoomBookings", require("./routes/app/bookingRoute"));

// Error Handler Middleware
app.use(notFound);
app.use(errorHandler);

// Running The Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () =>
  console.log(
    `Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`
  )
);
