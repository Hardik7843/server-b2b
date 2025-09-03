// import { drizzle } from "drizzle-orm/node-postgres";
// import { seed } from "drizzle-seed";
// import { product, users } from "./schema";
// import db from ".";

// async function main() {
//   //   const db = drizzle(process.env.DATABASE_URL);
//   await seed(db, { product }, { count: 20 });
//   console.log("Database seeded successfully");
// }

// main();

// scripts/seed.ts
import db from ".";
import { product } from "../db/schema";

const imagesPool = [
  "https://ckfob8zphd0vlpan.public.blob.vercel-storage.com/1-To-10-Numbers-Transparent-PNG.webp",
  "https://ckfob8zphd0vlpan.public.blob.vercel-storage.com/letters-p-q-r-s-t.webp",
];

async function main() {
  const products = Array.from({ length: 20 }).map((_, i) => {
    const price = parseFloat((Math.random() * 1000).toFixed(2));
    return {
      name: `Product 2.0 ${i + 1}`,
      description: `This is product ${i + 1}`,
      price,
      originalPrice: parseFloat((price + 20).toFixed(2)),
      stock: Math.floor(Math.random() * 100), // 0–99
      active: true,
      deletedAt: null,
      images: imagesPool,
      tags: ["sample", "demo"],
    };
  });

  await db.insert(product).values(products);

  console.log("✅ Database seeded successfully with products");
}

main().catch((err) => {
  console.error("❌ Error seeding database:", err);
  process.exit(1);
});
