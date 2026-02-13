const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const { protect } = require("../middleware/auth");
const sendEmail = require("../utils/sendEmail");
const orderStatusUpdateTemplate = require("../utils/orderStatusUpdateTemplate");
const orderCompleteTemplate = require("../utils/orderCompleteTemplate");

/**
 * ================================
 * GET ALL ORDERS (ADMIN)
 * ================================
 */
router.get("/", protect, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.productId", "title") // ✅ FIX
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("GET ORDERS ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * ================================
 * UPDATE ORDER STATUS (ADMIN)
 * ================================
 */
router.put("/:id/status", protect, async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true }
    ).populate("user", "email name");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    await sendEmail(
      order.user.email,
      `Your order #${order._id} status updated to ${orderStatus}`,
      orderStatusUpdateTemplate(order)
    );

    res.json(order);
  } catch (err) {
    console.error("UPDATE STATUS ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * ================================
 * MARK COD AS PAID
 * ================================
 */
router.put("/:id/mark-paid", protect, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: "paid", orderStatus: "delivered" },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    console.error("MARK PAID ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * ================================
 * CASH ON DELIVERY ORDER
 * ================================
 */
router.post("/cod", protect, async (req, res) => {
  try {
    const { cartItems, totalAmount, customer, shippingAddress } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // 🔒 STOCK CHECK (SIMPLE + VARIABLE)
    for (const item of cartItems) {
      const productId = item.productId || item.product;
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(400).json({ message: "Product not found" });
      }

      // ✅ VARIABLE PRODUCT
      if (item.variation) {
        const variation = product.variations.find(
          (v) => v._id.toString() === item.variation.toString()
        );

        if (!variation || variation.stockQty < item.quantity) {
          return res.status(400).json({
            message: `${product.title} (variation) is out of stock`,
          });
        }
      }
      // ✅ SIMPLE PRODUCT
      else {
        if (product.stockQty < item.quantity) {
          return res.status(400).json({
            message: `${product.title} is out of stock`,
          });
        }
      }
    }

    // ✅ NORMALIZE ITEMS
    const normalizedItems = cartItems.map((item) => ({
      ...item,
      productId: item.productId || item.product,
      variation: item.variation || null,
    }));

    // ✅ CREATE ORDER
    const order = await Order.create({
      user: req.user._id,
      items: normalizedItems,
      totalAmount,
      customer,
      shippingAddress,
      paymentMethod: "cod",
      paymentStatus: "pending",
      orderStatus: "processing",
    });

    // 🔻 STOCK REDUCTION (SIMPLE + VARIABLE)
    for (const item of normalizedItems) {
      if (item.variation) {
        // variable product
        await Product.updateOne(
          { _id: item.productId, "variations._id": item.variation },
          { $inc: { "variations.$.stockQty": -item.quantity } }
        );
      } else {
        // simple product
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stockQty: -item.quantity },
        });
      }
    }

    // 📧 EMAIL
    if (customer?.email) {
      await sendEmail(
        customer.email,
        "Order Confirmation - Thank you for your purchase!",
        orderCompleteTemplate(order)
      );
    }

    res.json({ message: "COD order placed successfully", order });
  } catch (err) {
    console.error("COD ORDER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/**
 * ================================
 * GET MY ORDERS (USER)
 * ================================
 */
router.get("/my-orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.productId", "title price") // ✅ FIX
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("GET USER ORDERS ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * ================================
 * CANCEL ORDER (USER)
 * ================================
 */
router.put("/:id/cancel", protect, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (["delivered", "cancelled"].includes(order.orderStatus)) {
      return res.status(400).json({ message: "Order cannot be cancelled now" });
    }

    // 🔁 RESTORE STOCK (SIMPLE + VARIABLE)
    for (const item of order.items) {
      if (item.variation) {
        // ✅ VARIABLE PRODUCT STOCK RESTORE
        await Product.updateOne(
          { _id: item.productId, "variations._id": item.variation },
          { $inc: { "variations.$.stockQty": item.quantity } }
        );
      } else {
        // ✅ SIMPLE PRODUCT STOCK RESTORE
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stockQty: item.quantity },
        });
      }
    }

    order.orderStatus = "cancelled";
    await order.save();

    // 📧 EMAIL
    if (order.customer?.email) {
      await sendEmail(
        order.customer.email,
        `Your order #${order._id} has been cancelled`,
        `Hello ${order.customer.name || ""},<br><br>Your order has been successfully cancelled.`
      );
    }

    res.json({
      message: "Order cancelled successfully & stock restored",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/seller-orders", protect, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.productId", "title")
      .sort({ createdAt: -1 });

    const userId = req.user._id.toString();

    const filteredOrders = orders.filter(order =>
      order.items.some(item => item.seller && item.seller.toString() === userId)
    );

    res.json(filteredOrders);
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
