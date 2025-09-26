const express = require("express");
const router = express.Router();

// Placeholder routes for scans
router.get("/", (req, res) => {
  res.json({ message: "Scans endpoint - to be implemented" });
});

module.exports = router;
