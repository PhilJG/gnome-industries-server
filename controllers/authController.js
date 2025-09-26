const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const pool = require("../database/connection");

// Generate JWT tokens
const generateTokens = (userId, userType) => {
  const payload = { userId, userType };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

// Register user
const registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, isGuest = false } = req.body;

    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT user_id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (name, email, password, is_guest, points) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING user_id, name, email, points, is_guest, registration_date`,
      [name, email, hashedPassword, isGuest, isGuest ? 0 : 25] // 25 points for sign-up bonus
    );

    const user = result.rows[0];

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.user_id, "user");

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        points: user.points,
        isGuest: user.is_guest,
        registrationDate: user.registration_date,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const result = await pool.query(
      "SELECT user_id, name, email, password, points, is_guest FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.user_id, "user");

    res.json({
      message: "Login successful",
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        points: user.points,
        isGuest: user.is_guest,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

// Register vendor
const registerVendor = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      email,
      password,
      storeName,
      storeDescription,
      storeAddress,
      storeHours,
    } = req.body;

    // Check if vendor already exists
    const existingVendor = await pool.query(
      "SELECT vendor_id FROM vendors WHERE email = $1",
      [email]
    );

    if (existingVendor.rows.length > 0) {
      return res.status(400).json({ message: "Vendor already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create vendor
    const result = await pool.query(
      `INSERT INTO vendors (name, email, password, store_name, store_description, store_address, store_hours) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING vendor_id, name, email, store_name, store_description, store_address, store_hours, registration_date`,
      [
        name,
        email,
        hashedPassword,
        storeName,
        storeDescription,
        storeAddress,
        storeHours,
      ]
    );

    const vendor = result.rows[0];

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      vendor.vendor_id,
      "vendor"
    );

    res.status(201).json({
      message: "Vendor registered successfully",
      vendor: {
        id: vendor.vendor_id,
        name: vendor.name,
        email: vendor.email,
        storeName: vendor.store_name,
        storeDescription: vendor.store_description,
        storeAddress: vendor.store_address,
        storeHours: vendor.store_hours,
        registrationDate: vendor.registration_date,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Vendor registration error:", error);
    res.status(500).json({ message: "Vendor registration failed" });
  }
};

// Login vendor
const loginVendor = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find vendor
    const result = await pool.query(
      "SELECT vendor_id, name, email, password, store_name, store_description, store_address, store_hours FROM vendors WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const vendor = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, vendor.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      vendor.vendor_id,
      "vendor"
    );

    res.json({
      message: "Login successful",
      vendor: {
        id: vendor.vendor_id,
        name: vendor.name,
        email: vendor.email,
        storeName: vendor.store_name,
        storeDescription: vendor.store_description,
        storeAddress: vendor.store_address,
        storeHours: vendor.store_hours,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Vendor login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      decoded.userId,
      decoded.userType
    );

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

// Validation middleware
const validateUserRegistration = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be 2-50 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const validateUserLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email required"),
  body("password")
    .notEmpty()
    .withMessage("Password required"),
];

const validateVendorRegistration = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be 2-50 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("storeName")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Store name must be 2-100 characters"),
];

module.exports = {
  registerUser,
  loginUser,
  registerVendor,
  loginVendor,
  refreshToken,
  validateUserRegistration,
  validateUserLogin,
  validateVendorRegistration,
};
