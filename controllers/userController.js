const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ==========================
// GET MY PROFILE
// ==========================
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password -resetOTP -resetOTPExpiry"
    );

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to load profile" });
  }
};

// ==========================
// UPDATE MY PROFILE (NO PASSWORD HERE ❌)
// ==========================
exports.updateMyProfile = async (req, res) => {
  try {
    const { name, phone, dob, address, aadharNo } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (dob) user.dob = dob;

    // 🖼 profile image
    if (req.file) {
      user.profileImage = `/uploads/${req.file.filename}`;
    }

    // 📍 address (from FormData)
    if (address) {
      user.address = JSON.parse(address);
    }

    // 🔒 aadhar only once
    if (aadharNo && !user.aadharNo) {
      user.aadharNo = aadharNo;
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ==========================
// CHANGE PASSWORD (ONLY HERE 🔐)
// ==========================
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to change password" });
  }
};


// ADMIN: get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADMIN: update user
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, phone, isApproved } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, phone, isApproved },
      { new: true }
    ).select("-password");

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADMIN: delete user
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
