const Brand = require("../models/Brand");

// Helper slugify function (reuse if you want)
const slugify = (text) =>
  text.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

exports.getBrands = async (req, res) => {
  try {
    const brands = await Brand.find().populate("parent", "name").sort({ name: 1 });
    res.json(brands);
  } catch (err) {
    console.error("Failed to get brands:", err);
    res.status(500).json({ message: "Failed to get brands" });
  }
};

exports.getParentBrands = async (req, res) => {
  try {
    const parents = await Brand.find({ parent: null }).sort({ name: 1 });
    res.json(parents);
  } catch (err) {
    console.error("Failed to get parent brands:", err);
    res.status(500).json({ message: "Failed to get parent brands" });
  }
};

exports.createBrand = async (req, res) => {
  try {
    const { name, color, description, parent } = req.body;
    const slug = slugify(name);

    const existing = await Brand.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: "Brand with this name already exists" });
    }

    const brand = await Brand.create({
      name,
      slug,
      color,
      description,
      parent: parent && parent !== "" ? parent : null,
      image: req.file ? `/uploads/${req.file.filename}` : null,
    });

    res.status(201).json(brand);
  } catch (err) {
    console.error("Failed to create brand:", err);
    res.status(500).json({ message: "Failed to create brand" });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, description, parent } = req.body;

    const slug = slugify(name);

    // Check if slug exists for another brand
    const existing = await Brand.findOne({ slug, _id: { $ne: id } });
    if (existing) {
      return res.status(400).json({ message: "Brand with this name already exists" });
    }

    const updateData = {
      name,
      slug,
      color,
      description,
      parent: parent && parent !== "" ? parent : null,
    };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updatedBrand = await Brand.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedBrand) return res.status(404).json({ message: "Brand not found" });

    res.json(updatedBrand);
  } catch (err) {
    console.error("Failed to update brand:", err);
    res.status(500).json({ message: "Failed to update brand" });
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    // Optional: Check if brand has children before deleting

    const deleted = await Brand.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Brand not found" });

    res.json({ message: "Brand deleted successfully" });
  } catch (err) {
    console.error("Failed to delete brand:", err);
    res.status(500).json({ message: "Failed to delete brand" });
  }
};
