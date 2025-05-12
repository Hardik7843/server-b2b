import { date, integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";


export const usersTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    age: integer().notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at', { mode: 'date', precision: 3 }).defaultNow().$onUpdate(() => new Date)
});

