import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Use environment variable or fallback to local MongoDB
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/eduhub";

    const conn = await mongoose.connect(mongoURI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export default connectDB;
