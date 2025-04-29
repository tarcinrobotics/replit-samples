import { db } from "./db";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { seedDatabase } from "./seed";

async function main() {
  console.log("Starting database migration and seeding...");
  
  try {
    // Migrate database schema
    console.log("Migrating database schema...");
    await migrate(db, { migrationsFolder: "migrations" });
    console.log("Database schema migrated successfully!");
    
    // Seed database with initial data
    console.log("Seeding database with initial data...");
    await seedDatabase();
    console.log("Database seeded successfully!");
    
    console.log("Database setup complete!");
  } catch (error) {
    console.error("Error during database migration:", error);
    process.exit(1);
  }
}

main();