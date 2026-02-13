const Term = require("../models/Term");
const Attribute = require("../models/Attribute");

const slugify = (text) =>
  text.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

exports.getTerms = async (req, res) => {
  try {
    const { attributeId } = req.query;
    let filter = {};
    if (attributeId) filter.attribute = attributeId;

    const terms = await Term.find(filter)
      .populate("attribute", "name")
      .populate("parent", "name")
      .sort({ name: 1 });

    res.json(terms);
  } catch (err) {
    res.status(500).json({ message: "Failed to get terms" });
  }
};

exports.createTerm = async (req, res) => {
  try {
    const { name, description, attribute, parent } = req.body;
    if (!attribute)
      return res.status(400).json({ message: "Attribute is required" });

    const slug = slugify(name);

    // unique slug per attribute
    const exists = await Term.findOne({ slug, attribute });
    if (exists)
      return res.status(400).json({ message: "Term already exists in this attribute" });

    const term = await Term.create({
      name,
      slug,
      description,
      attribute,
      parent: parent || null,
    });

    res.status(201).json(term);
  } catch (err) {
    res.status(500).json({ message: "Failed to create term" });
  }
};

exports.updateTerm = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, attribute, parent } = req.body;
    if (!attribute)
      return res.status(400).json({ message: "Attribute is required" });

    const slug = slugify(name);

    // unique slug per attribute excluding self
    const exists = await Term.findOne({ slug, attribute, _id: { $ne: id } });
    if (exists)
      return res.status(400).json({ message: "Term name already used in this attribute" });

    const updated = await Term.findByIdAndUpdate(
      id,
      {
        name,
        slug,
        description,
        attribute,
        parent: parent || null,
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Term not found" });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update term" });
  }
};

exports.deleteTerm = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Term.findByIdAndDelete(id);

    if (!deleted) return res.status(404).json({ message: "Term not found" });

    res.json({ message: "Term deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete term" });
  }
};
