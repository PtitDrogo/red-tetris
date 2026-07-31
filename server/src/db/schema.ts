import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const scores = sqliteTable("scores", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    username: text("username").notNull(),
    score: integer("score").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .$defaultFn(() => new Date()),
});

export type Score = typeof scores.$inferSelect;
export type NewScore = typeof scores.$inferInsert;
