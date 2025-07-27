import {
  boolean,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const userTypeEnum = pgEnum("user_type", ["USER", "ADMIN"]);

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  firstName: text("firstName").notNull(),
  lastName: text("lastName").notNull(),
  phoneNumber: text("phoneNumber").notNull().unique(),
  email: varchar({ length: 255 }).notNull().unique(),
  image: text("image"),
  password: text("password"), // hashed password
  type: userTypeEnum("type").notNull().default("USER"),
  acceptTerms: boolean().default(true),
  acceptPromos: boolean().default(true),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
