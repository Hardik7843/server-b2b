import db from "@/db";
import { sessions, users } from "@/db/schema";
import {
  logoutSchema,
  signinSchema,
  signupSchema,
} from "@/validators/auth.validator";
import bcrypt from "bcrypt";
import { and, eq, gt } from "drizzle-orm";
import { NextFunction, Request, Response } from "express";

// Signup Controller
export const signup = async (req: Request, res: Response): Promise<any> => {
  try {
    // Validate request body

    const validation = signupSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.error.issues.map((issue) => ({
          field: issue.path[0],
          message: issue.message,
        })),
      });
    }

    // console.log("validation.data: ", validation.data);
    const { firstName, lastName, email, password, phoneNumber } =
      validation.data;

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phoneNumber,
      })
      .returning();

    // Generate session token
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    // Create session
    await db.insert(sessions).values({
      userId: newUser[0].id,
      token: sessionToken,
      expiresAt,
    });

    res.cookie("sessionToken", sessionToken, {
      httpOnly: false,
      secure: false, // HTTPS only (production)
      sameSite: "strict", // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });

    return res.status(201).json({
      message: "User created successfully",
      sessionToken,
      user: {
        id: newUser[0].id,
        firstName: newUser[0].firstName,
        lastName: newUser[0].lastName,
        email: newUser[0].email,
        phoneNumber: newUser[0].phoneNumber,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const signin = async (req: Request, res: Response): Promise<any> => {
  try {
    // Validate request body
    const validation = signinSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.error.issues.map((issue) => ({
          field: issue.path[0],
          message: issue.message,
        })),
      });
    }

    const { email, password } = validation.data;

    // Find user by email
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length === 0 || !user[0].password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password

    const isValidPassword = await bcrypt.compare(password, user[0].password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate session token
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    // Delete existing session for the user
    await db
      .delete(sessions)
      .where(eq(sessions.userId, user[0].id))
      .returning();

    // Create session
    await db.insert(sessions).values({
      userId: user[0].id,
      token: sessionToken,
      expiresAt,
    });

    res.cookie("sessionToken", sessionToken, {
      httpOnly: false,
      secure: false, // HTTPS only (production)
      sameSite: "strict", // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });

    return res.status(200).json({
      message: "Login successful",
      sessionToken,
      user: {
        id: user[0].id,
        firstName: user[0].firstName,
        lastName: user[0].lastName,
        email: user[0].email,
        phoneNumber: user[0].phoneNumber,
      },
    });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const logout = async (req: Request, res: Response): Promise<any> => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    // Validate token
    const validation = logoutSchema.safeParse({ token });
    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid token format",
        details: validation.error.issues.map((issue) => ({
          field: issue.path[0],
          message: issue.message,
        })),
      });
    }

    // Delete session from database
    const deletedSessions = await db
      .delete(sessions)
      .where(eq(sessions.token, validation.data.token))
      .returning();

    if (deletedSessions.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.clearCookie("sessionToken", {
      httpOnly: false,
      secure: false, // HTTPS only (production)
      sameSite: "strict", // CSRF protection
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

interface AuthenticatedRequest extends Request {
  user?: any; // You can create a proper User type here
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const token =
      req.cookies.sessionToken ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      // console.error("No token provided");
      return res.status(401).json({ error: "No token provided" });
    }

    // Check if session exists and is valid
    const session = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
      .limit(1);

    if (session.length === 0) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    // Get user data
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session[0].userId))
      .limit(1);

    if (user.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user[0];
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
