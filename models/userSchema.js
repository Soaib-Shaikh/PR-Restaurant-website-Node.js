const { default: mongoose } = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String },
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    bio: { type: String },
    profileImage: {
      type: String,
      default: "/uploads/default-avatar.png",
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user' // by default normal user
    }
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("userTBL", userSchema);
module.exports = User;
