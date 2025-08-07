import db from "@/db";
import { sessions, users } from "@/db/schema";
import { and, eq, getTableColumns, gt } from "drizzle-orm";
import { Request } from "express";

export async function getAuthenticatedUser(req: Request) {
  const token =
    req.cookies.sessionToken ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) throw new Error("Unauthorized: No token provided");

  const session = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
    .limit(1);

  if (session.length === 0) throw new Error("Invalid or expired session");
  const { password, ...userData } = getTableColumns(users);
  const user = await db
    .select(userData)
    .from(users)
    .where(eq(users.id, session[0].userId))
    .limit(1);

  if (user.length === 0) throw new Error("User not found");

  return user[0];
}
