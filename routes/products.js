const express = require("express");
const router = express.Router();

// Placeholder routes for products
router.get("/", (req, res) => {
  res.json({ message: "Products endpoint - to be implemented" });
});

module.exports = router;
