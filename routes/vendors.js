const express = require("express");
const router = express.Router();

// Placeholder routes for vendors
router.get("/", (req, res) => {
  res.json({ message: "Vendors endpoint - to be implemented" });
});

module.exports = router;
