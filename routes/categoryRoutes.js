console.log("✅ categoryRoutes loaded");
const express = require("express");
const router = express.Router();
const {
  createCategory,
  getCategories,
  getParentCategories,
  deleteCategory,
  updateCategory,  // Import karo
} = require("../controllers/categoryController");
const upload = require("../middleware/upload");

// 🔥 ORDER MAT BADALNA
router.get("/parents", getParentCategories);
router.get("/", getCategories);
router.put("/:id", upload.single("image"), updateCategory);
router.post("/", upload.single("image"), createCategory);
router.delete("/:id", deleteCategory);

module.exports = router;
