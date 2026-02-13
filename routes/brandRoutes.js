const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {
  getBrands,
  getParentBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} = require("../controllers/brandController");

router.get("/parents", getParentBrands);
router.get("/", getBrands);
router.post("/", upload.single("image"), createBrand);
router.put("/:id", upload.single("image"), updateBrand);
router.delete("/:id", deleteBrand);

module.exports = router;
