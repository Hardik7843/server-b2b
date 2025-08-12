import db from "@/db";
import { sessions, users } from "@/db/schema";
import { getAuthenticatedAdmin, getAuthenticatedUser } from "@/util/auth.util";
import {
  logoutSchema,
  signinSchema,
  signupSchema,
} from "@/validators/auth.validator";
import bcrypt from "bcrypt";
import { DrizzleError, eq } from "drizzle-orm";
import { NextFunction, Request, Response } from "express";
import { success } from "zod";

// Signup Controller

export const signup = async (req: Request, res: Response): Promise<any> => {
  try {
    // Validate request body
    const validation = signupSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid Signup data",
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
      return res.status(400).json({
        success: false,
        message: "Email Matched with existing user",
        error: "User already exists",
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const [newUser] = await db
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
      userId: newUser.id,
      token: sessionToken,
      expiresAt,
    });

    res.cookie("sessionToken", sessionToken, {
      httpOnly: false,
      secure: false, // HTTPS only (production)
      sameSite: "strict", // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });

    // delete newUser,
    const { password: _password, ...finalUser } = newUser;
    return res.status(201).json({
      success: true,
      message: "User created successfully",
      sessionToken,
      data: {
        user: finalUser,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      success: false,
      message: "Server is unable to respond",
      error: "Internal server error",
    });
  }
};

export const signin = async (req: Request, res: Response): Promise<any> => {
  try {
    // Validate request body
    const validation = signinSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid Signin data",
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
    const token =
      req.cookies.sessionToken ||
      req.headers.authorization?.replace("Bearer ", "");

    console.log("Logout token:", token);
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

export const checkAuth = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = await getAuthenticatedUser(req);
    const { id, ...userData } = user;

    res.status(200).json({ user: userData });
  } catch (error) {
    let errorMessage = "Unauthorized";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    if (error instanceof DrizzleError) {
      errorMessage = "Database error: " + error.message;
    }
    res.status(401).json({ error: errorMessage || "Unauthorized" });
  }
};

export interface AuthenticatedRequest extends Request {
  user?: Awaited<ReturnType<typeof getAuthenticatedUser>>;
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const user = await getAuthenticatedUser(req);
    req.user = user;
    next();
  } catch (error) {
    // console.error("Auth middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Server Unable to Respond",
      error: "Internal server error",
    });
  }
};

export interface AdminAuthenticatedRquest extends Request {
  user?: Awaited<ReturnType<typeof getAuthenticatedAdmin>>;
}

export const requireAdminauth = async (
  req: AdminAuthenticatedRquest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const user = await getAuthenticatedAdmin(req);
    console.log("admin user: ", user);
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Unable to Respond",
      error: "Internal server error",
    });
  }
};
