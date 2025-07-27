import { config } from "dotenv";

config({
  path: ".env.local",
  debug: true,
  encoding: "utf-8",
});

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL not found in environment variables");
}

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
