const { createTables } = require("../database/migrations");

const migrate = async () => {
  try {
    console.log("Starting database migration...");
    await createTables();
    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrate();
