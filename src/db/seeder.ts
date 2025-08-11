import { drizzle } from "drizzle-orm/node-postgres";
import { seed } from "drizzle-seed";
import { product, users } from "./schema";
import db from ".";

async function main() {
  //   const db = drizzle(process.env.DATABASE_URL);
  await seed(db, { product });
  console.log("Database seeded successfully");
}

main();
