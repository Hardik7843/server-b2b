"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdminauth = exports.requireAuth = exports.checkAuth = exports.logout = exports.signin = exports.signup = void 0;
const db_1 = __importDefault(require("../db"));
const schema_1 = require("../db/schema");
const auth_util_1 = require("../util/auth.util");
const error_util_1 = require("../util/error.util");
const auth_validator_1 = require("../validators/auth.validator");
const bcrypt_1 = __importDefault(require("bcrypt"));
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = __importDefault(require("crypto"));
// Signup Controller
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate request body
        const validation = auth_validator_1.signupSchema.safeParse(req.body);
        if (!validation.success) {
            throw new error_util_1.CustomError({
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
        const { firstName, lastName, email, password, phoneNumber } = validation.data;
        // Check if user already exists
        const existingUser = yield db_1.default
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.email, email))
            .limit(1);
        if (existingUser.length > 0) {
            throw new error_util_1.CustomError({
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
        const hashedPassword = yield bcrypt_1.default.hash(password, saltRounds);
        // Create user
        const [newUser] = yield db_1.default
            .insert(schema_1.users)
            .values({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phoneNumber,
        })
            .returning();
        // Generate session token
        const sessionToken = crypto_1.default.randomUUID();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
        // Create session
        yield db_1.default.insert(schema_1.sessions).values({
            userId: newUser.id,
            token: sessionToken,
            expiresAt,
        });
        res.cookie("sessionToken", sessionToken, {
            httpOnly: true,
            secure: false, // true only with HTTPS
            sameSite: "lax", // CSRF protection
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        });
        // delete newUser,
        const { password: _password } = newUser, finalUser = __rest(newUser, ["password"]);
        return res.status(201).json({
            success: true,
            message: "User created successfully",
            sessionToken,
            data: {
                user: finalUser,
            },
        });
    }
    catch (error) {
        // console.error("Signup error:", error);
        throw error;
        // return res.status(500).json({
        //   success: false,
        //   message: "Server is unable to respond",
        //   error: "Internal server error",
        // });
    }
});
exports.signup = signup;
const signin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate request body
        const validation = auth_validator_1.signinSchema.safeParse(req.body);
        if (!validation.success) {
            throw new error_util_1.CustomError({
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
        const user = yield db_1.default
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.email, email))
            .limit(1);
        if (user.length === 0 || !user[0].password) {
            throw new error_util_1.CustomError({
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
        const isValidPassword = yield bcrypt_1.default.compare(password, user[0].password);
        if (!isValidPassword) {
            throw new error_util_1.CustomError({
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
        const sessionToken = crypto_1.default.randomUUID();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
        // Delete existing session for the user
        yield db_1.default
            .delete(schema_1.sessions)
            .where((0, drizzle_orm_1.eq)(schema_1.sessions.userId, user[0].id))
            .returning();
        // Create session
        yield db_1.default.insert(schema_1.sessions).values({
            userId: user[0].id,
            token: sessionToken,
            expiresAt,
        });
        res.cookie("sessionToken", sessionToken, {
            httpOnly: true,
            secure: false, // true only with HTTPS
            sameSite: "lax", // CSRF protection
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        });
        const _a = user[0], { password: _password } = _a, finalUser = __rest(_a, ["password"]);
        res.status(200).json({
            success: true,
            message: "Login successful",
            sessionToken,
            data: { user: finalUser },
        });
        return;
    }
    catch (error) {
        // console.error("Signin error:", error);
        throw error;
    }
});
exports.signin = signin;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = req.cookies.sessionToken ||
            ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", ""));
        console.log("Logout token:", token);
        // Validate token
        const validation = auth_validator_1.logoutSchema.safeParse({ token });
        if (!validation.success) {
            throw new error_util_1.CustomError({
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
        const deletedSessions = yield db_1.default
            .delete(schema_1.sessions)
            .where((0, drizzle_orm_1.eq)(schema_1.sessions.token, validation.data.token))
            .returning();
        if (deletedSessions.length === 0) {
            throw new error_util_1.CustomError({
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
    }
    catch (error) {
        console.error("Logout error:", error);
        throw error;
    }
});
exports.logout = logout;
const checkAuth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield (0, auth_util_1.getAuthenticatedUser)(req);
        const { id } = user, userData = __rest(user, ["id"]);
        res.status(200).json({
            success: true,
            message: "User Details Found",
            data: { user: userData },
        });
    }
    catch (error) {
        let errorMessage = "Unauthorized";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        if (error instanceof drizzle_orm_1.DrizzleError) {
            errorMessage = "Database error: " + error.message;
        }
        throw new error_util_1.CustomError({
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
});
exports.checkAuth = checkAuth;
const requireAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield (0, auth_util_1.getAuthenticatedUser)(req);
        req.user = user;
        next();
    }
    catch (error) {
        let errorMessage = "Unauthorized";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        if (error instanceof drizzle_orm_1.DrizzleError) {
            errorMessage = "Database error: " + error.message;
        }
        throw new error_util_1.CustomError({
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
});
exports.requireAuth = requireAuth;
const requireAdminauth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield (0, auth_util_1.getAuthenticatedAdmin)(req);
        // console.log("admin user: ", user);
        req.user = user;
        next();
    }
    catch (error) {
        let errorMessage = "Unauthorized";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        if (error instanceof drizzle_orm_1.DrizzleError) {
            errorMessage = "Database error: " + error.message;
        }
        throw new error_util_1.CustomError({
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
});
exports.requireAdminauth = requireAdminauth;
