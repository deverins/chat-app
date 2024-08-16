import Models from "./../../models/user.model";

const connectDB = async () => {
  const { mongoose } = Models;
  if (mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI || "");
    console.log("MongoDB connection is on");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw new Error("Failed to connect to MongoDB");
  }
};

export default connectDB;
