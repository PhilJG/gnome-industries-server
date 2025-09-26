const { dropTables, createTables } = require("../database/migrations");
const { seedData } = require("../database/seeds");

const reset = async () => {
  try {
    console.log("Starting database reset...");
    await dropTables();
    console.log("Tables dropped successfully");

    await createTables();
    console.log("Tables recreated successfully");

    await seedData();
    console.log("Database reset completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Reset failed:", error);
    process.exit(1);
  }
};

reset();
