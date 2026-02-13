const Tag = require("../models/Tag");

// Helper slugify function (you can also reuse from frontend)
const slugify = (text) =>
  text.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

exports.getTags = async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    res.json(tags);
  } catch (err) {
    console.error("Failed to get tags:", err);
    res.status(500).json({ message: "Failed to get tags" });
  }
};

exports.createTag = async (req, res) => {
  try {
    const { name, description } = req.body;
    const slug = slugify(name);

    const existing = await Tag.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: "Tag with this name already exists" });
    }

    const tag = await Tag.create({ name, slug, description });
    res.status(201).json(tag);
  } catch (err) {
    console.error("Failed to create tag:", err);
    res.status(500).json({ message: "Failed to create tag" });
  }
};

exports.updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const slug = slugify(name);

    // Optional: Check if slug already exists for other tag
    const existing = await Tag.findOne({ slug, _id: { $ne: id } });
    if (existing) {
      return res.status(400).json({ message: "Tag with this name already exists" });
    }

    const updatedTag = await Tag.findByIdAndUpdate(
      id,
      { name, slug, description },
      { new: true }
    );

    if (!updatedTag) return res.status(404).json({ message: "Tag not found" });

    res.json(updatedTag);
  } catch (err) {
    console.error("Failed to update tag:", err);
    res.status(500).json({ message: "Failed to update tag" });
  }
};

exports.deleteTag = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Tag.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Tag not found" });

    res.json({ message: "Tag deleted successfully" });
  } catch (err) {
    console.error("Failed to delete tag:", err);
    res.status(500).json({ message: "Failed to delete tag" });
  }
};
