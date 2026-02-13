const express = require("express");
const router = express.Router();

const {
  getAttributes,
  createAttribute,
  updateAttribute,
  deleteAttribute,
} = require("../controllers/attributeController");

router.get("/", getAttributes);
router.post("/", createAttribute);
router.put("/:id", updateAttribute);
router.delete("/:id", deleteAttribute);

module.exports = router;
