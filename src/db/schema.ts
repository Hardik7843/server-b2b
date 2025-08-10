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

// Not Used As of Now
export const productFavourite = pgTable("product_favourite", {
  id: serial("id").primaryKey(),
  user_id: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  product_id: integer("product_id")
    .notNull()
    .references(() => product.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Not Used As of Now
export const category = pgTable("category", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  image: text("image"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  deletedAt: timestamp("deletedAt"),
});

// Not Used As of Now
export const productCategoryPivot = pgTable("productCategoryPivot", {
  id: serial("id").primaryKey(),
  productId: integer("productId")
    .notNull()
    .references(() => product.id, { onDelete: "cascade" }),
  categoryId: integer("categoryId")
    .notNull()
    .references(() => category.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(), // Not Used As of Now
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Not Used As of Now
export const productReview = pgTable("productReview", {
  id: serial("id").primaryKey(),
  productId: integer("productId")
    .notNull()
    .references(() => product.id, { onDelete: "cascade" }),
  userId: text("userId").references(() => users.id, { onDelete: "set null" }),
  rating: integer("rating").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// export const shop = pgTable("shop", {
//   id: text("id")
//     .primaryKey()
//     .$defaultFn(() => crypto.randomUUID()),

//   name : text("name"),
//   description : text("description")
// })

export const paymentAttempt = pgTable("payment_attempt", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  amount: real("amount").notNull(),
  status: varchar("status", { length: 255 }).notNull().default("PENDING"), // PENDING, SUCCESS, FAILED
  paymentGateway: varchar("payment_gateway", { length: 255 }).notNull(), // Example: "stripe", "razorpay"
  // paymentGatewayTxnId: text("payment_gateway_txn_id"), // Gateway's txn reference
  // failureReason: text("failure_reason"), // Null if successful
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Defination of Order : Order is placed after successfull payment Order Can Have Three Status. UNPLACED, PAID,
export const order = pgTable("order", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  status: varchar("status", { length: 255 }),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "set null" }),
  amount: real("amount"),
  createdAt: timestamp("createdAt").defaultNow().notNull(), // Not Used As of Now
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),

  attemptId: text("attemptId").references(() => paymentAttempt.id),

  // shopId: text("shopId")
  // .notNull().references(() => shop.id, { onDelete : 'cascade'})
});

export const orderItems = pgTable("orderItems", {
  id: serial("id").primaryKey(),
  productId: integer("productId")
    .notNull()
    .references(() => product.id, { onDelete: "cascade" }),
  quantity: integer("quantity").default(1),
  price: real("price"),
  orderId: text("orderId").references(() => order.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(), // Not Used As of Now
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const cartItems = pgTable("orderItems", {});
