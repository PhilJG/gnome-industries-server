const express = require("express");
const router = express.Router();

// Placeholder routes for users
router.get("/", (req, res) => {
  res.json({ message: "Users endpoint - to be implemented" });
});

module.exports = router;
