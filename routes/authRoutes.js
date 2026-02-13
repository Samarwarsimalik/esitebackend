const express = require("express");
const {
  userRegister,
  clientRegister,
  login,
  changePasswordOld,
  forgotPassword,
  resetPassword,
  logout,
} = require("../controllers/authController");

const { protect } = require("../middleware/auth");
const router = express.Router();

router.post("/user-register", userRegister);
router.post("/client-register", clientRegister);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// 🔐 Logout (protected)
router.post("/logout", protect, logout);

// 🔐 Current logged-in user info
router.get("/me", protect, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not logged in" });
  }

  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  });
});


module.exports = router;
