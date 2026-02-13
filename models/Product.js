const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    featuredImage: { type: String },
    images: [{ type: String }],
    productType: { type: String, enum: ["simple", "variable"], default: "simple" },
    price: { type: Number, required: function () { return this.productType === "simple";},},
    salePrice: { type: Number },
    discountPercent: { type: Number },
    attributes: [
      {
        attributeId: { type: mongoose.Schema.Types.ObjectId, ref: "Attribute", required: true },
        terms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Term" }],
      },
    ],
    
    variations: [
  {
    attributeTermIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Term", required: true }],
    price: Number,
    salePrice: Number,
    stockQty: { type: Number, default: 0 },
    sku: String,
    images: [{ type: String }], // <-- Add this line to hold array of image URLs
  },
],

    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
    stockQty: { type: Number, default: 0 },
    sku: { type: String, unique: true, sparse: true },
    estimateDeliveryDate: { type: String },
    cutoffTime: { type: String },
    active: { type: Boolean, default: true },
    reviews: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        rating: Number,
        comment: String,
        date: Date,
        userName: String, 
        images: [String],
      }
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
