const { Pool } = require("pg");
require("dotenv").config();

// Prefer DATABASE_URL when provided (Render/production),
// otherwise fall back to local developer defaults
const isProduction =
  process.env.NODE_ENV === "production" || !!process.env.DATABASE_URL;

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      user: process.env.DB_USER || "phil",
      host: process.env.DB_HOST || "localhost",
      database: process.env.DB_NAME || "auth_template",
      port: Number(process.env.DB_PORT || 5432),
      ssl: false,
    });

// Test the connection
pool.on("connect", () => {
  console.log("Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("Database connection error:", err);
});

module.exports = pool;
