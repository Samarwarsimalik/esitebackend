const Attribute = require("../models/Attribute");

const slugify = (text) =>
  text.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

exports.getAttributes = async (req, res) => {
  try {
    const attrs = await Attribute.find().sort({ name: 1 });
    res.json(attrs);
  } catch (err) {
    res.status(500).json({ message: "Failed to get attributes" });
  }
};

exports.createAttribute = async (req, res) => {
  try {
    const { name, description } = req.body;
    const slug = slugify(name);

    const exists = await Attribute.findOne({ slug });
    if (exists)
      return res.status(400).json({ message: "Attribute already exists" });

    const attr = await Attribute.create({ name, slug, description });
    res.status(201).json(attr);
  } catch (err) {
    res.status(500).json({ message: "Failed to create attribute" });
  }
};

exports.updateAttribute = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const slug = slugify(name);

    const exists = await Attribute.findOne({ slug, _id: { $ne: id } });
    if (exists)
      return res.status(400).json({ message: "Attribute name already used" });

    const updated = await Attribute.findByIdAndUpdate(
      id,
      { name, slug, description },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Attribute not found" });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update attribute" });
  }
};

exports.deleteAttribute = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Attribute.findByIdAndDelete(id);

    if (!deleted) return res.status(404).json({ message: "Attribute not found" });

    res.json({ message: "Attribute deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete attribute" });
  }
};
