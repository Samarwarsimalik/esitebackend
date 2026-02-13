const express = require("express");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

const {
  getMyProfile,
  updateMyProfile,
  changePassword,
  getAllUsers,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const router = express.Router();

const profileUpload = (req, res, next) => {
  req.uploadFolder = "profile";
  next();
};

router.get("/me", protect, getMyProfile);

router.put(
  "/me",
  protect,
  profileUpload,
  upload.single("profileImage"),
  updateMyProfile
);

router.put("/change-password", protect, changePassword);

// ADMIN
router.get("/", protect, getAllUsers);
router.put("/:id", protect, updateUser);
router.delete("/:id", protect, deleteUser);

module.exports = router;
