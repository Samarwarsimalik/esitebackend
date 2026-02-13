const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { protect, adminOnly } = require("../middleware/auth");
const productController = require("../controllers/productController");

// Multer middleware to accept only these fields
router.post(
  "/",
  protect,
  upload.fields([
    { name: "featuredImage", maxCount: 1 },
    { name: "images" }, // gallery images (multiple)
    { name: "variationImages" }, // all variation images sent under this one field
  ]),
  productController.createProduct
);

router.put(
  "/:id",
  protect,
  upload.fields([
    { name: "featuredImage", maxCount: 1 },
    { name: "images" },
    { name: "variationImages" },
  ]),
  productController.updateProduct
);

// Other routes...
router.get("/", protect, productController.getProductsByUser);
router.get("/public", productController.getAllProductsPublic);
router.get("/:id", productController.getProductById);
router.get("/slug/:slug", productController.getProductBySlug);
router.delete("/:id", protect, productController.deleteProduct);
router.get("/public/by-brand", productController.getAllProductsByBrandPublic);

router.post(
  "/:id/review",
  protect,
  (req, res, next) => {
    req.uploadFolder = "reviews"; // dynamically set folder for review images
    next();
  },
  upload.array("reviewImages", 5),
  productController.addOrUpdateReview
);
router.get("/public", productController.getAllProductsPublic);

module.exports = router;
