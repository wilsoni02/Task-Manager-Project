require('dotenv').config(); // Add this line
const mongoose = require("mongoose");
const connectionString = process.env.MONGODB_URI || "mongodb+srv://Team9:1234@cluster0.glhvt.mongodb.net/TM-T9?retryWrites=true&w=majority";

const connectDB = async () => {
  try {
    await mongoose.connect(connectionString);
    console.log('MongoDB Connected...');
  } catch (error) {
    console.error("Failed to connect to MongoDB", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;