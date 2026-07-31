import { desc } from "drizzle-orm";
import { db } from "./db.js";
import { scores, type Score } from "./schema.js";

export async function saveScore(
    username: string,
    score: number,
): Promise<Score> {
    const result = await db
        .insert(scores)
        .values({ username, score, createdAt: new Date() })
        .returning();

    return result[0];
}

export async function getTopScores(): Promise<Score[]> {
    return db.select().from(scores).orderBy(desc(scores.score)).limit(5);
}
