"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = exports.userTypeEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.userTypeEnum = (0, pg_core_1.pgEnum)("user_type", ["USER", "ADMIN"]);
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.text)("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    firstName: (0, pg_core_1.text)("firstName").notNull(),
    lastName: (0, pg_core_1.text)("lastName").notNull(),
    phoneNumber: (0, pg_core_1.text)("phoneNumber").notNull().unique(),
    email: (0, pg_core_1.varchar)({ length: 255 }).notNull().unique(),
    image: (0, pg_core_1.text)("image"),
    password: (0, pg_core_1.text)("password"), // hashed password
    type: (0, exports.userTypeEnum)("type").notNull().default("USER"),
    acceptTerms: (0, pg_core_1.boolean)().default(true),
    acceptPromos: (0, pg_core_1.boolean)().default(true),
    emailVerified: (0, pg_core_1.timestamp)("emailVerified", { mode: "date" }),
    createdAt: (0, pg_core_1.timestamp)("createdAt").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});
