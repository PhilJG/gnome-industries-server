const express = require("express");
const router = express.Router();

// Placeholder routes for surveys
router.get("/", (req, res) => {
  res.json({ message: "Surveys endpoint - to be implemented" });
});

module.exports = router;
