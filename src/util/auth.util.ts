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

export async function getAuthenticatedAdmin(req: Request) {
  const token =
    req.cookies.sessionToken ||
    req.headers.authorization?.replace("Bearer ", "");

  console.log("Token: ", token);

  if (!token) throw new Error("Unauthorized: No token provided");

  // 1️⃣ Check session validity
  const session = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
    .limit(1);

  if (session.length === 0) throw new Error("Invalid or expired session");

  // 2️⃣ Get all columns except password
  const { password, ...userData } = getTableColumns(users);

  // 3️⃣ Fetch the user and check if admin
  const user = await db
    .select(userData)
    .from(users)
    .where(
      and(
        eq(users.id, session[0].userId),
        eq(users.type, "ADMIN") // ✅ only allow admins
      )
    )
    .limit(1);

  if (user.length === 0) throw new Error("Unauthorised: Admin not found");

  return user[0];
}
