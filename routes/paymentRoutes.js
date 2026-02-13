const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { createRazorpayOrder } = require("../controllers/paymentController");
const { verifyPaymentAndCreateOrder } = require("../controllers/orderController");

router.post("/create-order", protect, createRazorpayOrder);
router.post("/verify-payment", protect, verifyPaymentAndCreateOrder);

module.exports = router;
