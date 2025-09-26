const express = require("express");
const router = express.Router();

// Placeholder routes for reviews
router.get("/", (req, res) => {
  res.json({ message: "Reviews endpoint - to be implemented" });
});

module.exports = router;
