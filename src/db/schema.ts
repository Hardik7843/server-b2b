import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  real,
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
  lastName: text("lastName"),
  email: varchar({ length: 255 }).notNull().unique(),
  phoneNumber: text("phoneNumber"),
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

export const sessions = pgTable("sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expiresAt", { mode: "date" }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const product = pgTable("product", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price"),
  originalPrice: real("originalPrice"),
  images: text("images").array().default([]),
  tags: text("tags").array().default([]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  deletedAt: timestamp("deletedAt"),
  active: boolean("active").default(false),
  stock: integer("stock").default(0),
});
