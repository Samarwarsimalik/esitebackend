const Product = require("../models/Product");
const Category = require("../models/Category"); // 👈 ADD THIS LINE
const Brand = require("../models/Brand"); 
const slugify = (text) =>
  text.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
// GET /api/products/public  (publicly accessible)

/* ================= USER PRODUCTS ================= */
exports.getProductsByUser = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ message: "Unauthorized: user not logged in" });
    }

    const products = await Product.find({
      createdBy: req.user._id,
    })
      .populate("createdBy", "name email")
      .populate("category", "name")   // ✅ CATEGORY FIX
      .populate("brand", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get products" });
  }
};

/* ================= PUBLIC PRODUCTS ================= */
exports.getAllProductsPublic = async (req, res) => {
  try {
    console.log("Query params:", req.query);

    const filter = { active: true };

    if (req.query.category) {
      const category = await Category.findOne({ slug: req.query.category });
      console.log("Category found:", category);

      if (category) {
        filter.category = category._id; // ObjectId automatic
      } else {
        console.log("Category not found for slug:", req.query.category);
      }
    }

    console.log("FINAL FILTER:", filter);

    const products = await Product.find(filter)
      .populate("category", "name slug")
      .populate("brand", "name");

    console.log("Products fetched:", products.length);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};




exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("brand", "name slug")
      .populate("category", "name slug")
      .populate("tags", "name slug")
      .populate("attributes.attributeId", "name slug")
      .populate("attributes.terms", "name slug");

    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get product" });
  }
};



exports.createProduct = async (req, res) => {
  try {
    console.log("=== createProduct called ===");
    console.log("req.body.productType:", req.body.productType);

    // Parse JSON strings
    let attributes = [];
    let tags = [];
    let existingImages = [];
    let variations = [];

    try { attributes = req.body.attributes ? JSON.parse(req.body.attributes) : []; } catch (e) { console.log("attributes parse error:", e); }
    try { tags = req.body.tags ? JSON.parse(req.body.tags) : []; } catch (e) { console.log("tags parse error:", e); }
    try { existingImages = req.body.existingImages ? JSON.parse(req.body.existingImages) : []; } catch (e) { console.log("existingImages parse error:", e); }
    try { variations = req.body.variations ? JSON.parse(req.body.variations) : []; } catch (e) { console.log("variations parse error:", e); }

    const files = req.files || {};
    console.log("Uploaded files keys:", Object.keys(files));

    // Featured Image
    const featuredImage = files.featuredImage ? `/uploads/${files.featuredImage[0].filename}` : null;

    // Gallery Images
    let images = [...existingImages];
    if (files.images && Array.isArray(files.images)) {
      files.images.forEach(file => images.push(`/uploads/${file.filename}`));
    }

    // Variation images
    const variationImagesFiles = files.variationImages || []; // Array of files

    // Assign variation images by index to variations
    // Assuming frontend sends variation images in order matching variations array
    variations = variations.map((variation, index) => {
      const imageFile = variationImagesFiles[index];
      return {
        ...variation,
        images: imageFile ? [`/uploads/${imageFile.filename}`] : [],
      };
    });

    console.log("Final variations with images:", variations.map(v => ({
      ...v,
      images: v.images.length ? `${v.images.length} images` : "no images",
    })));

    const productData = {
      title: req.body.title,
      slug: req.body.slug || slugify(req.body.title),
      description: req.body.description,
      featuredImage,
      images,
      productType: req.body.productType,
      price: req.body.price,
      salePrice: req.body.salePrice,
      discountPercent: req.body.discountPercent,
      stockQty: req.body.stockQty,
      sku: req.body.sku,
      estimateDeliveryDate: req.body.estimateDeliveryDate,
      cutoffTime: req.body.cutoffTime,
      active: req.body.active === "true" || req.body.active === true,
      attributes,
      variations,
      category: req.body.category,
      brand: req.body.brand,
      tags,
      createdBy: req.user._id,
    };

    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (err) {
    console.error("Create product failed:", err);
    res.status(500).json({ 
      message: "Failed to create product", 
      error: err.message 
    });
  }
};


exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let attributes = [];
    let tags = [];
    let existingImages = [];
    let variations = [];

    try { attributes = JSON.parse(req.body.attributes || "[]"); } catch {}
    try { tags = JSON.parse(req.body.tags || "[]"); } catch {}
    try { existingImages = JSON.parse(req.body.existingImages || "[]"); } catch {}
    try { variations = JSON.parse(req.body.variations || "[]"); } catch {}

    const files = req.files || {};

    /* ---------- FEATURED IMAGE ---------- */
    let featuredImage = product.featuredImage;
    if (files.featuredImage?.length) {
      featuredImage = `/uploads/${files.featuredImage[0].filename}`;
    }

    /* ---------- GALLERY ---------- */
    let images = [...existingImages];
    if (files.images) {
      files.images.forEach(f => images.push(`/uploads/${f.filename}`));
    }

    /* ---------- VARIATIONS ---------- */
    const variationImagesFiles = files.variationImages || [];
    let imgIndex = 0;

    variations = variations.map((v, i) => {
      const oldImages = product.variations?.[i]?.images || [];
      const newImages = [];

      if (variationImagesFiles[imgIndex]) {
        newImages.push(`/uploads/${variationImagesFiles[imgIndex].filename}`);
        imgIndex++;
      }

      return {
        ...v,
        images: [...oldImages, ...newImages],
      };
    });

    product.set({
      title: req.body.title,
      slug: req.body.slug,
      description: req.body.description,
      productType: req.body.productType,
      price: req.body.price,
      salePrice: req.body.salePrice,
      discountPercent: req.body.discountPercent,
      stockQty: req.body.stockQty,
      sku: req.body.sku,
      estimateDeliveryDate: req.body.estimateDeliveryDate,
      cutoffTime: req.body.cutoffTime,
      active: req.body.active === "true" || req.body.active === true,
      category: req.body.category,
      brand: req.body.brand,
      tags,
      attributes,
      images,
      featuredImage,
      variations,
    });

    await product.save();
    res.json(product);

  } catch (err) {
    console.error("Update failed:", err);
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};







exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Failed to delete product", error: error.message });
  }
};



exports.addOrUpdateReview = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user._id;

    const { rating, comment } = req.body;

    if (!rating) {
      return res.status(400).json({ message: "Rating is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const images = (req.files || []).map(
      (file) => `/uploads/reviews/${file.filename}`
    );

    const existingReviewIndex = product.reviews.findIndex(
      (r) => r.userId.toString() === userId.toString()
    );

    const reviewData = {
      userId,
      userName: req.user.name, // ✅ NAME AUTO SAVE
      rating,
      comment,
      images,
      date: new Date(),
    };

    if (existingReviewIndex !== -1) {
      product.reviews[existingReviewIndex] = {
        ...product.reviews[existingReviewIndex],
        ...reviewData,
      };
    } else {
      product.reviews.push(reviewData);
    }

    await product.save();

    res.status(200).json({
      message: "Review saved successfully",
      reviews: product.reviews,
    });
  } catch (error) {
    console.error("Review save error:", error);
    res.status(500).json({ message: "Failed to save review" });
  }
};
// GET /api/products/slug/:slug  (public)
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate("brand", "name slug")
      .populate("category", "name slug")
      .populate("tags", "name slug")
      .populate("attributes.attributeId", "name slug")
      .populate("attributes.terms", "name slug");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get product" });
  }
};

// GET /api/products/public/by-brand?brand=brand-slug
exports.getAllProductsByBrandPublic = async (req, res) => {
  try {
    console.log("Query params:", req.query);

    const filter = { active: true };

    if (req.query.brand) {
      const brand = await Brand.findOne({ slug: req.query.brand });
      console.log("Brand found:", brand);

      if (brand) {
        filter.brand = brand._id; // ObjectId automatically
      } else {
        console.log("Brand not found for slug:", req.query.brand);
      }
    }

    console.log("FINAL FILTER:", filter);

    const products = await Product.find(filter)
      .populate("category", "name slug")
      .populate("brand", "name slug");

    console.log("Products fetched:", products.length);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
