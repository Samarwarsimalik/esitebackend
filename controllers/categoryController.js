const Category = require("../models/Category");

exports.createCategory = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const { name, color, description, parent } = req.body;

    const category = await Category.create({
      name,
      slug: name.toLowerCase().trim().replace(/\s+/g, "-"),
      color,
      description,
      parent: parent && parent !== "" ? parent : null, // 🔥 FIX
      image: req.file ? `/uploads/${req.file.filename}` : null,
    });

    console.log("✅ SAVED:", category);

    res.status(201).json(category);
  } catch (err) {
    console.error("❌ SAVE ERROR:", err);
    res.status(500).json({ message: "Failed to save category" });
  }
};

exports.getCategories = async (req, res) => {
  const cats = await Category.find().populate("parent", "name slug");
  res.json(cats);
};
exports.getParentCategories = async (req, res) => {
  try {
    const parents = await Category.find({
      $or: [{ parent: null }, { parent: { $exists: false } }],
    });

    res.json(parents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "error fetching parents" });
  }
};
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, description, parent } = req.body;

    const updateData = {
      name,
      slug: name.toLowerCase().trim().replace(/\s+/g, "-"),
      color,
      description,
      parent: parent && parent !== "" ? parent : null,
    };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updatedCategory = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    res.json(updatedCategory);
  } catch (err) {
    console.error("Failed to update category:", err);
    res.status(500).json({ message: "Failed to update category" });
  }
};
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    // Optional: You can add logic to prevent deleting categories which have child categories

    await Category.findByIdAndDelete(id);
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error("Failed to delete category:", err);
    res.status(500).json({ message: "Failed to delete category" });
  }
};

exports.getAllProductsPublic = async (req, res) => {
  try {
    console.log("Category Slug:", req.query.category);

    const filter = { active: true }; // sirf active products

    if (req.query.category) {
      const category = await Category.findOne({
        slug: req.query.category.toLowerCase()
      });

      console.log("Category found:", category);

      if (!category) {
        return res.json([]);
      }

      filter.category = category._id;
    }

    const products = await Product.find(filter)
      .populate("category", "name slug")
      .populate("brand", "name")
      .sort({ createdAt: -1 });

    console.log("Products found:", products.length);

    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error fetching products" });
  }
};

