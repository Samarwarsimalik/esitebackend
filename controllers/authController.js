const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");


const createToken = (res, user) => {
const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
res.cookie("token", token, { httpOnly: true, sameSite: "lax" });
};


exports.userRegister = async (req,res)=>{
const { name,email,password } = req.body;
const hash = await bcrypt.hash(password,10);
const user = await User.create({ name,email,password:hash, role:"user" });
createToken(res,user);
res.json({ message:"User registered" });
};



exports.clientRegister = async (req, res) => {
  const { name, email, phone, aadharNo } = req.body;

  const client = await User.create({
    name,
    email,
    phone,
    aadharNo,
    role: "client",
    isApproved: false,
  });

  res.json({
    message: "Client registered. Waiting for admin approval",
  });
};


exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return res.status(400).json({ message: "User not found" });

  // ❗ client ke liye password ho sakta hai null jab tak approve na ho
  if (user.role === "client" && !user.isApproved) {
    return res.status(403).json({
      message: "Account not approved by admin yet",
    });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok)
    return res.status(400).json({ message: "Wrong password" });

  createToken(res, user);

  res.json({
    message: "Login success",
    role: user.role,
  });
};
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.resetOTP = otp;
  user.resetOTPExpiry = Date.now() + 10 * 60 * 1000; // 10 min
  await user.save();

  await sendEmail(
    email,
    "Password Reset OTP",
    `Your OTP is ${otp}. Valid for 10 minutes`
  );

  res.json({ message: "OTP sent to email" });
};
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid request" });

  if (
    user.resetOTP !== otp ||
    user.resetOTPExpiry < Date.now()
  ) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetOTP = null;
  user.resetOTPExpiry = null;

  await user.save();

  res.json({ message: "Password reset successful" });
};

exports.logout = (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Logout failed" });
  }
};
