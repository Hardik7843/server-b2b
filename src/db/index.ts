// import "dotenv/config";
// Version 1
// import { drizzle } from "drizzle-orm/node-postgres";
// import { Pool } from "pg";

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL!,
// });
// const db = drizzle({ client: pool });

// version 2 NW
// import 'dotenv/config';
// import { drizzle } from 'drizzle-orm/node-postgres';

// const db = drizzle(process.env.DATABASE_URL!);

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

console.log("loading database");
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle({ client: pool });
console.log("loaded database");

export default db;
