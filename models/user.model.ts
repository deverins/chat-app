module.exports = (mongoose: any) => {
  const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "inactive" },
    messages: [
      {
        from: String,
        message: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  });

  return mongoose.model("User", userSchema);
};
