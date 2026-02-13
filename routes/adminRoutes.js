const express = require("express");
const { protect, adminOnly } = require("../middleware/auth");
const {
  getAllClients,
  approveClient,
  cancelApproval,
} = require("../controllers/adminController");

const router = express.Router();

router.get("/clients", protect, adminOnly, getAllClients);
router.put("/approve-client/:clientId", protect, adminOnly, approveClient);
router.put("/cancel-approval/:clientId", protect, adminOnly, cancelApproval);

module.exports = router;
