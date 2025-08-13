"use strict";
// import "dotenv/config";
// Version 1
// import { drizzle } from "drizzle-orm/node-postgres";
// import { Pool } from "pg";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL!,
// });
// const db = drizzle({ client: pool });
// version 2 NW
// import 'dotenv/config';
// import { drizzle } from 'drizzle-orm/node-postgres';
// const db = drizzle(process.env.DATABASE_URL!);
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: ".env.local" });
console.log("loading database");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
const db = (0, node_postgres_1.drizzle)({ client: pool });
console.log("loaded database");
exports.default = db;
