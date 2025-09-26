const express = require("express");
const router = express.Router();

// Placeholder routes for rewards
router.get("/", (req, res) => {
  res.json({ message: "Rewards endpoint - to be implemented" });
});

module.exports = router;
