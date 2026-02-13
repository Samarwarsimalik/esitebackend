const express = require("express");
const router = express.Router();

const {
  getTerms,
  createTerm,
  updateTerm,
  deleteTerm,
} = require("../controllers/termController");

router.get("/", getTerms); // optional query ?attributeId=xxx
router.post("/", createTerm);
router.put("/:id", updateTerm);
router.delete("/:id", deleteTerm);

module.exports = router;
