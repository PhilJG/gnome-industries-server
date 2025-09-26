const pool = require("./connection");

// Create all tables
const createTables = async () => {
  try {
    // Create Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        points FLOAT DEFAULT 0,
        google_id VARCHAR(255),
        is_guest BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Vendors table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vendors (
        vendor_id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        store_name VARCHAR(100),
        store_description TEXT,
        store_address TEXT,
        store_hours TEXT,
        logo_url VARCHAR(500),
        banner_url VARCHAR(500),
        sustainability_score FLOAT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Products table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        product_id SERIAL PRIMARY KEY,
        vendor_id INTEGER REFERENCES vendors(vendor_id) ON DELETE CASCADE,
        product_name VARCHAR(50) NOT NULL,
        points INTEGER DEFAULT 0,
        notes VARCHAR(200),
        purchase_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Surveys table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS surveys (
        survey_id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        vendor_id INTEGER REFERENCES vendors(vendor_id) ON DELETE CASCADE,
        survey_type VARCHAR(20) NOT NULL CHECK (survey_type IN ('rating', 'written')),
        survey_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        questions JSONB NOT NULL,
        answers JSONB NOT NULL,
        notes VARCHAR(200),
        points_awarded INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create NFC Scans table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS nfc_scans (
        scan_id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        vendor_id INTEGER REFERENCES vendors(vendor_id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(product_id) ON DELETE SET NULL,
        item VARCHAR(25),
        scan_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        points_awarded INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Reviews table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        review_id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        vendor_id INTEGER REFERENCES vendors(vendor_id) ON DELETE CASCADE,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        content TEXT,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        helpful_votes INTEGER DEFAULT 0,
        points_awarded INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Badges table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS badges (
        badge_id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        badge_name VARCHAR(50) NOT NULL,
        badge_type VARCHAR(30) NOT NULL CHECK (badge_type IN ('survey', 'scan', 'review', 'milestone')),
        points_awarded INTEGER DEFAULT 0,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Rewards table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rewards (
        reward_id SERIAL PRIMARY KEY,
        vendor_id INTEGER REFERENCES vendors(vendor_id) ON DELETE CASCADE,
        reward_name VARCHAR(100) NOT NULL,
        reward_type VARCHAR(30) NOT NULL CHECK (reward_type IN ('discount', 'social', 'gift')),
        description TEXT,
        points_cost INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create User Rewards table (for tracking redeemed rewards)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_rewards (
        user_reward_id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        reward_id INTEGER REFERENCES rewards(reward_id) ON DELETE CASCADE,
        vendor_id INTEGER REFERENCES vendors(vendor_id) ON DELETE CASCADE,
        redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        points_spent INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_vendors_email ON vendors(email);
      CREATE INDEX IF NOT EXISTS idx_surveys_user_vendor ON surveys(user_id, vendor_id);
      CREATE INDEX IF NOT EXISTS idx_nfc_scans_user_vendor ON nfc_scans(user_id, vendor_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_vendor_status ON reviews(vendor_id, status);
      CREATE INDEX IF NOT EXISTS idx_badges_user ON badges(user_id);
    `);

    console.log("All tables created successfully");
  } catch (error) {
    console.error("Error creating tables:", error);
    throw error;
  }
};

// Drop all tables (for reset)
const dropTables = async () => {
  try {
    const tables = [
      "user_rewards",
      "rewards",
      "badges",
      "reviews",
      "nfc_scans",
      "surveys",
      "products",
      "vendors",
      "users",
    ];

    for (const table of tables) {
      await pool.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
    }

    console.log("All tables dropped successfully");
  } catch (error) {
    console.error("Error dropping tables:", error);
    throw error;
  }
};

module.exports = {
  createTables,
  dropTables,
};
