const mongoose = require("mongoose");

const DbConnect = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_URL);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (e) {
    console.log(`MongoDB connection error: ${e}`);
    process.exit(1);
  }
};
module.exports = DbConnect;
