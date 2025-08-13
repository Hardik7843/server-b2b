"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartItems = exports.orderItems = exports.order = exports.paymentAttempt = exports.productReview = exports.productCategoryPivot = exports.category = exports.productFavourite = exports.product = exports.sessions = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.text)("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    firstName: (0, pg_core_1.text)("firstName").notNull(),
    lastName: (0, pg_core_1.text)("lastName"),
    email: (0, pg_core_1.varchar)({ length: 255 }).notNull().unique(),
    phoneNumber: (0, pg_core_1.text)("phoneNumber"),
    image: (0, pg_core_1.text)("image"),
    password: (0, pg_core_1.text)("password"), // hashed password
    type: (0, pg_core_1.varchar)("type", { length: 255 }).$type().default("USER"),
    acceptTerms: (0, pg_core_1.boolean)().default(true),
    acceptPromos: (0, pg_core_1.boolean)().default(true),
    emailVerified: (0, pg_core_1.timestamp)("emailVerified", { mode: "date" }),
    createdAt: (0, pg_core_1.timestamp)("createdAt").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});
exports.sessions = (0, pg_core_1.pgTable)("sessions", {
    id: (0, pg_core_1.text)("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: (0, pg_core_1.text)("userId")
        .notNull()
        .references(() => exports.users.id, { onDelete: "cascade" }),
    token: (0, pg_core_1.text)("token").notNull().unique(),
    expiresAt: (0, pg_core_1.timestamp)("expiresAt", { mode: "date" }).notNull(),
    createdAt: (0, pg_core_1.timestamp)("createdAt").defaultNow().notNull(),
});
exports.product = (0, pg_core_1.pgTable)("product", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    price: (0, pg_core_1.real)("price"),
    originalPrice: (0, pg_core_1.real)("originalPrice"),
    images: (0, pg_core_1.text)("images").array().default([]),
    tags: (0, pg_core_1.text)("tags").array().default([]),
    createdAt: (0, pg_core_1.timestamp)("createdAt").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
    deletedAt: (0, pg_core_1.timestamp)("deletedAt"),
    active: (0, pg_core_1.boolean)("active").default(false),
    stock: (0, pg_core_1.integer)("stock").default(0),
});
// Not Used As of Now
exports.productFavourite = (0, pg_core_1.pgTable)("product_favourite", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    user_id: (0, pg_core_1.text)("user_id")
        .notNull()
        .references(() => exports.users.id, { onDelete: "cascade" }),
    product_id: (0, pg_core_1.integer)("product_id")
        .notNull()
        .references(() => exports.product.id, { onDelete: "cascade" }),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
// Not Used As of Now
exports.category = (0, pg_core_1.pgTable)("category", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    image: (0, pg_core_1.text)("image"),
    createdAt: (0, pg_core_1.timestamp)("createdAt").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
    deletedAt: (0, pg_core_1.timestamp)("deletedAt"),
});
// Not Used As of Now
exports.productCategoryPivot = (0, pg_core_1.pgTable)("productCategoryPivot", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    productId: (0, pg_core_1.integer)("productId")
        .notNull()
        .references(() => exports.product.id, { onDelete: "cascade" }),
    categoryId: (0, pg_core_1.integer)("categoryId")
        .notNull()
        .references(() => exports.category.id, { onDelete: "cascade" }),
    createdAt: (0, pg_core_1.timestamp)("createdAt").defaultNow().notNull(), // Not Used As of Now
    updatedAt: (0, pg_core_1.timestamp)("updatedAt")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});
// Not Used As of Now
exports.productReview = (0, pg_core_1.pgTable)("productReview", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    productId: (0, pg_core_1.integer)("productId")
        .notNull()
        .references(() => exports.product.id, { onDelete: "cascade" }),
    userId: (0, pg_core_1.text)("userId").references(() => exports.users.id, { onDelete: "set null" }),
    rating: (0, pg_core_1.integer)("rating").notNull().default(0),
    content: (0, pg_core_1.text)("content"),
    images: (0, pg_core_1.text)("images").array().default([]), // Array of image URLs
    createdAt: (0, pg_core_1.timestamp)("createdAt").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
    deletedAt: (0, pg_core_1.timestamp)("deletedAt"),
});
// export const shop = pgTable("shop", {
//   id: text("id")
//     .primaryKey()
//     .$defaultFn(() => crypto.randomUUID()),
//   name : text("name"),
//   description : text("description")
// })
exports.paymentAttempt = (0, pg_core_1.pgTable)("payment_attempt", {
    id: (0, pg_core_1.text)("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: (0, pg_core_1.text)("user_id")
        .notNull()
        .references(() => exports.users.id, { onDelete: "cascade" }),
    amount: (0, pg_core_1.real)("amount").notNull(),
    status: (0, pg_core_1.varchar)("status", { length: 255 }).notNull().default("PENDING"), // PENDING, SUCCESS, FAILED
    paymentGateway: (0, pg_core_1.varchar)("payment_gateway", { length: 255 }).notNull(), // Example: "stripe", "razorpay"
    // paymentGatewayTxnId: text("payment_gateway_txn_id"), // Gateway's txn reference
    // failureReason: text("failure_reason"), // Null if successful
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});
// Defination of Order : Order is placed after successfull payment Order Can Have Three Status. UNPLACED, PAID,
exports.order = (0, pg_core_1.pgTable)("order", {
    id: (0, pg_core_1.text)("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    status: (0, pg_core_1.varchar)("status", { length: 255 }),
    userId: (0, pg_core_1.text)("userId")
        .notNull()
        .references(() => exports.users.id, { onDelete: "set null" }),
    amount: (0, pg_core_1.real)("amount"),
    attemptId: (0, pg_core_1.text)("attemptId").references(() => exports.paymentAttempt.id),
    createdAt: (0, pg_core_1.timestamp)("createdAt").defaultNow().notNull(), // Not Used As of Now
    updatedAt: (0, pg_core_1.timestamp)("updatedAt")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
    // shopId: text("shopId")
    // .notNull().references(() => shop.id, { onDelete : 'cascade'})
});
exports.orderItems = (0, pg_core_1.pgTable)("orderItems", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    productId: (0, pg_core_1.integer)("productId")
        .notNull()
        .references(() => exports.product.id, { onDelete: "cascade" }),
    quantity: (0, pg_core_1.integer)("quantity").default(1),
    price: (0, pg_core_1.real)("price"),
    orderId: (0, pg_core_1.text)("orderId").references(() => exports.order.id),
    createdAt: (0, pg_core_1.timestamp)("createdAt").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt") // Not Used As of Now
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});
exports.cartItems = (0, pg_core_1.pgTable)("orderItems", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    productId: (0, pg_core_1.integer)("productId")
        .notNull()
        .references(() => exports.product.id, { onDelete: "cascade" }),
    quantity: (0, pg_core_1.integer)("quantity").default(1),
    price: (0, pg_core_1.real)("price"),
    userId: (0, pg_core_1.text)("userId").references(() => exports.users.id, { onDelete: "cascade" }),
    createdAt: (0, pg_core_1.timestamp)("createdAt").defaultNow().notNull(), // Not Used As of Now
    updatedAt: (0, pg_core_1.timestamp)("updatedAt")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});
