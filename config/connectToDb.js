// const mongoose = require("mongoose");

// module.exports = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log("Connected To MongoDB ^_^");
//   } catch (error) {
//     console.log("Connection Failed To MongoDB!", error);
//   }
// };

const mongoose = require('mongoose');

// Suppress strictQuery warning
mongoose.set('strictQuery', true);

const connectToDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};
module.exports = connectToDb;
