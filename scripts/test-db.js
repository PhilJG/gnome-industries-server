const pool = require("../database/connection");

const testConnection = async () => {
  try {
    console.log("Testing database connection...");

    // Test basic connection
    const result = await pool.query("SELECT NOW()");
    console.log("✅ Database connection successful");
    console.log("Current time:", result.rows[0].now);

    // Test table existence
    const tables = [
      "users",
      "vendors",
      "products",
      "surveys",
      "nfc_scans",
      "reviews",
      "badges",
      "rewards",
    ];

    for (const table of tables) {
      const tableCheck = await pool.query(
        `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `,
        [table]
      );

      if (tableCheck.rows[0].exists) {
        console.log(`✅ Table '${table}' exists`);
      } else {
        console.log(`❌ Table '${table}' missing`);
      }
    }

    // Test sample data
    const userCount = await pool.query("SELECT COUNT(*) FROM users");
    const vendorCount = await pool.query("SELECT COUNT(*) FROM vendors");
    const productCount = await pool.query("SELECT COUNT(*) FROM products");

    console.log(
      `📊 Sample data: ${userCount.rows[0].count} users, ${vendorCount.rows[0].count} vendors, ${productCount.rows[0].count} products`
    );

    console.log("✅ Database setup verification complete");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database test failed:", error);
    process.exit(1);
  }
};

testConnection();
