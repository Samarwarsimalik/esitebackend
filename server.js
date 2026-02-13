require('dotenv').config();

const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const adminRoutes = require("./routes/adminRoutes");
const productRoutes = require("./routes/productRoutes.js");
const path = require("path");
const tagRoutes = require("./routes/tagRoutes");
const brandRoutes = require("./routes/brandRoutes");
const attributeRoutes = require("./routes/attributeRoutes");
const termRoutes = require("./routes/termRoutes");
const { protect } = require("./middleware/auth.js");
const ordersRoute = require("./routes/orders");
const userRoutes = require("./routes/userRoutes")
const paymentRoutes = require("./routes/paymentRoutes");
dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Serve uploads folder statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/tags", tagRoutes)
app.use("/api/products", productRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/orders", ordersRoute);


app.use("/api/attributes", attributeRoutes);
app.use("/api/terms", termRoutes);
app.use("/api/users", userRoutes);

app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
