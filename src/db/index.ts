// import 'dotenv/config';
// import { drizzle } from "drizzle-orm/node-postgres";
// import { Pool } from "pg";

// const pool = new Pool({
//     connectionString: process.env.DATABASE_URL!,
// });
// const db = drizzle({ client: pool });

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';

const db = drizzle(process.env.DATABASE_URL!);


export default db