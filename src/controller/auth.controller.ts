import db from "@/db";
import { sessions, users } from "@/db/schema";
import { getAuthenticatedAdmin, getAuthenticatedUser } from "@/util/auth.util";
import { CustomError } from "@/util/error.util";
import {
  logoutSchema,
  signinSchema,
  signupSchema,
} from "@/validators/auth.validator";
import bcrypt from "bcrypt";
import { DrizzleError, eq } from "drizzle-orm";
import { NextFunction, Request, Response } from "express";

// Signup Controller

export const signup = async (req: Request, res: Response): Promise<any> => {
  try {
    // Validate request body
    const validation = signupSchema.safeParse(req.body);
    if (!validation.success) {
      throw new CustomError({
        message: "Invalid Signup data",
        error: validation.error.issues.map((issue) => ({
          field: issue.path[0],
          message: issue.message,
        })),
        statusCode: 400,
      });
      // return res.status(400).json({
      // success: false,
      // message: "Invalid Signup data",
      // error: "Validation failed",
      // details: validation.error.issues.map((issue) => ({
      //   field: issue.path[0],
      //   message: issue.message,
      // })),
      // });
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
      throw new CustomError({
        message: "Email Matched with existing user",
        statusCode: 400,
        error: "User Already Exists",
      });
      // return res.status(400).json({
      //   success: false,
      //   message: "Email Matched with existing user",
      //   error: "User already exists",
      // });
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
    // console.error("Signup error:", error);
    throw error;
    // return res.status(500).json({
    //   success: false,
    //   message: "Server is unable to respond",
    //   error: "Internal server error",
    // });
  }
};

export const signin = async (req: Request, res: Response): Promise<any> => {
  try {
    // Validate request body
    const validation = signinSchema.safeParse(req.body);
    if (!validation.success) {
      throw new CustomError({
        message: "Invalid Signin data",
        statusCode: 400,
        error: validation.error.issues.map((issue) => ({
          field: issue.path[0],
          message: issue.message,
        })),
      });
      // return res.status(400).json({
      //   success: false,
      //   message: "Invalid Signin data",
      //   error: "Validation failed",
      //   details: validation.error.issues.map((issue) => ({
      //     field: issue.path[0],
      //     message: issue.message,
      //   })),
      // });
    }

    const { email, password } = validation.data;

    // Find user by email
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length === 0 || !user[0].password) {
      throw new CustomError({
        statusCode: 401,
        message: "Wrong Email",
        error: "Invalid credentials",
      });
      // return res.status(401).json({
      //   success: false,
      //   message: "Wrong Email",
      //   error: "Invalid credentials",
      // });
    }

    // Verify password

    const isValidPassword = await bcrypt.compare(password, user[0].password);
    if (!isValidPassword) {
      throw new CustomError({
        statusCode: 401,
        message: "Wrong Password",
        error: "Invalid credentials",
      });
      // return res.status(401).json({
      //   success: false,
      //   message: "Wrong Password",
      //   error: "Invalid credentials",
      // });
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

    const { password: _password, ...finalUser } = user[0];

    return res.status(200).json({
      success: true,
      message: "Login successful",
      sessionToken,
      data: { user: finalUser },
    });
  } catch (error) {
    // console.error("Signin error:", error);
    throw error;
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
      throw new CustomError({
        message: "Invalid Session",
        statusCode: 400,
        error: validation.error.issues.map((issue) => ({
          field: issue.path[0],
          message: issue.message,
        })),
      });
      // return res.status(400).json({
      //   message: "Invalid Session",
      //   error: "Invalid token format",
      //   details: validation.error.issues.map((issue) => ({
      //     field: issue.path[0],
      //     message: issue.message,
      //   })),
      // });
    }

    // Delete session from database
    const deletedSessions = await db
      .delete(sessions)
      .where(eq(sessions.token, validation.data.token))
      .returning();

    if (deletedSessions.length === 0) {
      throw new CustomError({
        statusCode: 404,
        message: "Session not found",
        error: "Session not found",
      });
      // return res.status(404).json({
      //   message: "Session not found",
      //   error: "Session not found",
      // });
    }

    res.clearCookie("sessionToken", {
      httpOnly: false,
      secure: false, // HTTPS only (production)
      sameSite: "strict", // CSRF protection
    });

    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

export const checkAuth = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = await getAuthenticatedUser(req);
    const { id, ...userData } = user;

    res.status(200).json({
      success: true,
      message: "User Details Found",
      data: { user: userData },
    });
  } catch (error) {
    let errorMessage = "Unauthorized";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    if (error instanceof DrizzleError) {
      errorMessage = "Database error: " + error.message;
    }
    throw new CustomError({
      statusCode: 401,
      message: "Please Signup/Signin first",
      error: errorMessage || "Unauthorized",
    });
    // res.status(401).json({
    //   success: false,
    //   message: "",
    //   error: errorMessage || "Unauthorized",
    // });
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
    let errorMessage = "Unauthorized";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    if (error instanceof DrizzleError) {
      errorMessage = "Database error: " + error.message;
    }
    throw new CustomError({
      statusCode: 401,
      message: "Please Signup/Signin first",
      error: errorMessage || "Unauthorized",
    });
    // return res.status(401).json({
    //   success: false,
    //   message: "",
    //   error: errorMessage || "Unauthorized",
    // });
  }
};

export interface AdminAuthenticatedRequest extends Request {
  user?: Awaited<ReturnType<typeof getAuthenticatedAdmin>>;
}

export const requireAdminauth = async (
  req: AdminAuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const user = await getAuthenticatedAdmin(req);
    // console.log("admin user: ", user);
    req.user = user;
    next();
  } catch (error) {
    let errorMessage = "Unauthorized";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    if (error instanceof DrizzleError) {
      errorMessage = "Database error: " + error.message;
    }
    throw new CustomError({
      statusCode: 401,
      success: false,
      message: "No Authorized Admin Found",
      error: errorMessage || "Unauthorized",
    });
    // res.status(401).json({
    //   success: false,
    //   message: "No Authorized Admin Found",
    //   error: errorMessage || "Unauthorized",
    // });
  }
};
