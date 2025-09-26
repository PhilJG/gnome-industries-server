const express = require("express");
const {
  registerUser,
  loginUser,
  registerVendor,
  loginVendor,
  refreshToken,
  validateUserRegistration,
  validateUserLogin,
  validateVendorRegistration,
} = require("../controllers/authController");

const router = express.Router();

// User routes
router.post("/register/user", validateUserRegistration, registerUser);
router.post("/login/user", validateUserLogin, loginUser);

// Vendor routes
router.post("/register/vendor", validateVendorRegistration, registerVendor);
router.post("/login/vendor", validateUserLogin, loginVendor);

// Token refresh
router.post("/refresh", refreshToken);

module.exports = router;
