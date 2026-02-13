const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },  // ref to Product
        title: String,
        price: Number,
        quantity: Number,
        featuredImage: String,
        seller: String,

        sku: String,
        variation: { type: String, default: null },
        selectedTerms: Object,
        brand: Object,
        category: Object,
        cutoffTime: String,
        estimateDeliveryDate: String,
        stockQty: Number,
      },
    ],

    totalAmount: { type: Number, required: true },

    customer: {
      name: String,
      email: String,
      phone: String,
    },

    shippingAddress: {
      address: String,
      city: String,
      state: String,
      pincode: String,
    },

    paymentMethod: { type: String, enum: ["cod", "razorpay"], required: true },

    paymentStatus: { type: String, enum: ["pending", "paid"], default: "pending" },

    orderStatus: {
      type: String,
      enum: ["processing", "shipped", "delivered", "cancelled"],
      default: "processing",
    },

    razorpayPaymentId: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
