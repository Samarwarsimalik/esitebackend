const crypto = require("crypto");
const Order = require("../models/Order");
const Product = require("../models/Product");

exports.verifyPaymentAndCreateOrder = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      cartItems,
      totalAmount,
      customer,
      shippingAddress,
      paymentMethod,
    } = req.body;

    // Verify payment signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // Create Order
    const order = await Order.create({
      user: req.user?._id || null,
      items: cartItems.map((item) => ({
        productId: item.productId || item.product,
        variation: item.variation || null,
        title: item.title,
        price: item.price,
        seller: item.seller,
        quantity: item.quantity,
        featuredImage: item.featuredImage,
        estimateDeliveryDate: item.estimateDeliveryDate,
        sku: item.sku,
        selectedTerms: item.selectedTerms || {},
        brand: item.brand || {},
        category: item.category || {},
        cutoffTime: item.cutoffTime || "",
        stockQty: item.stockQty || 0,
      })),
      totalAmount,
      customer,
      shippingAddress,
      paymentMethod: paymentMethod || "razorpay",
      paymentStatus: "paid",
      orderStatus: "processing",
      razorpayPaymentId: razorpay_payment_id,
    });

    // Reduce stock
    for (const item of cartItems) {
      const productId = item.productId || item.product;

      if (item.variation) {
        // Reduce stock of variation
        await Product.updateOne(
          { _id: productId, "variations._id": item.variation },
          { $inc: { "variations.$.stockQty": -item.quantity } }
        );
      } else {
        // Reduce stock of simple product
        await Product.findByIdAndUpdate(productId, {
          $inc: { stockQty: -item.quantity },
        });
      }
    }

    res.json({ message: "Order placed successfully", order });
  } catch (err) {
    console.error("RAZORPAY ORDER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get orders with populated products
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate({
      path: "items.productId",
      model: "Product",
    });

    res.json(orders);
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};
