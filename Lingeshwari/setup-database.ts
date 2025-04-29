import { db } from "./server/db";
import { seedDatabase } from "./server/seed";
import { users } from "./shared/schema";

async function setupDatabase() {
  try {
    console.log("Starting database setup...");
    
    // Check if we already have data
    const existingUsers = await db.select().from(users);
    if (existingUsers.length > 0) {
      console.log(`Database already has ${existingUsers.length} users, skipping seed.`);
      return;
    }
    
    // Seed the database with initial data
    console.log("Seeding database with initial data...");
    await seedDatabase();
    console.log("Database setup complete!");
  } catch (error) {
    console.error("Error during database setup:", error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase()
  .then(() => {
    console.log("Database setup finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error during database setup:", error);
    process.exit(1);
  });