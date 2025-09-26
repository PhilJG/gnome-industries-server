const { seedData } = require("../database/seeds");

const seed = async () => {
  try {
    console.log("Starting database seeding...");
    await seedData();
    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seed();
