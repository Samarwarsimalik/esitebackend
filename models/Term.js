const mongoose = require("mongoose");

const termSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  description: { type: String },
  attribute: { type: mongoose.Schema.Types.ObjectId, ref: "Attribute", required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "Term", default: null },
}, { timestamps: true });

termSchema.index({ slug: 1, attribute: 1 }, { unique: true }); 
// Unique slug per attribute

module.exports = mongoose.model("Term", termSchema);
