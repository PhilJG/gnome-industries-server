const jwt = require("jsonwebtoken");
const pool = require("../database/connection");

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify user still exists
    let user;
    if (decoded.userType === "user") {
      const result = await pool.query(
        "SELECT user_id, name, email, points, is_guest FROM users WHERE user_id = $1",
        [decoded.userId]
      );
      user = result.rows[0];
    } else if (decoded.userType === "vendor") {
      const result = await pool.query(
        "SELECT vendor_id, name, email, store_name FROM vendors WHERE vendor_id = $1",
        [decoded.userId]
      );
      user = result.rows[0];
    }

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      id: decoded.userId,
      type: decoded.userType,
      ...user,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }

    console.error("Authentication error:", error);
    res.status(500).json({ message: "Authentication failed" });
  }
};

// Optional authentication (for guest users)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user;
    if (decoded.userType === "user") {
      const result = await pool.query(
        "SELECT user_id, name, email, points, is_guest FROM users WHERE user_id = $1",
        [decoded.userId]
      );
      user = result.rows[0];
    } else if (decoded.userType === "vendor") {
      const result = await pool.query(
        "SELECT vendor_id, name, email, store_name FROM vendors WHERE vendor_id = $1",
        [decoded.userId]
      );
      user = result.rows[0];
    }

    if (user) {
      req.user = {
        id: decoded.userId,
        type: decoded.userType,
        ...user,
      };
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // If token is invalid, continue without authentication
    req.user = null;
    next();
  }
};

// Check if user is vendor
const requireVendor = (req, res, next) => {
  if (req.user && req.user.type === "vendor") {
    next();
  } else {
    res.status(403).json({ message: "Vendor access required" });
  }
};

// Check if user is regular user (not vendor)
const requireUser = (req, res, next) => {
  if (req.user && req.user.type === "user") {
    next();
  } else {
    res.status(403).json({ message: "User access required" });
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireVendor,
  requireUser,
};
