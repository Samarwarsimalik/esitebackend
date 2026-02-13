const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Basic Info
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },

   password: {
  type: String,
  required: function () {
    return this.role === "user" || this.role === "admin";
  },
},


    phone: {
      type: String,
    },

    // 🆕 Profile Extras
    dob: {
      type: Date,
    },

    profileImage: {
      type: String, // /uploads/profile/xxx.jpg
    },

    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },

    aadharNo: {
      type: String,
    },

    // Role & Status
    role: {
      type: String,
      enum: ["user", "client", "admin"],
      default: "user",
    },

    isApproved: {
      type: Boolean,
      default: false,
    },

    // Password Reset
    resetOTP: String,
    resetOTPExpiry: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
