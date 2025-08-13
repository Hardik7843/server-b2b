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
exports.getAuthenticatedUser = getAuthenticatedUser;
exports.getAuthenticatedAdmin = getAuthenticatedAdmin;
const db_1 = __importDefault(require("../db"));
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
function getAuthenticatedUser(req) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const token = req.cookies.sessionToken ||
            ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", ""));
        if (!token)
            throw new Error("Unauthorized: No token provided");
        const session = yield db_1.default
            .select()
            .from(schema_1.sessions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.sessions.token, token), (0, drizzle_orm_1.gt)(schema_1.sessions.expiresAt, new Date())))
            .limit(1);
        if (session.length === 0)
            throw new Error("Invalid or expired session");
        const _b = (0, drizzle_orm_1.getTableColumns)(schema_1.users), { password } = _b, userData = __rest(_b, ["password"]);
        const user = yield db_1.default
            .select(userData)
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, session[0].userId))
            .limit(1);
        if (user.length === 0)
            throw new Error("User not found");
        return user[0];
    });
}
function getAuthenticatedAdmin(req) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const token = req.cookies.sessionToken ||
            ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", ""));
        if (!token)
            throw new Error("Unauthorized: No token provided");
        // 1️⃣ Check session validity
        const session = yield db_1.default
            .select()
            .from(schema_1.sessions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.sessions.token, token), (0, drizzle_orm_1.gt)(schema_1.sessions.expiresAt, new Date())))
            .limit(1);
        if (session.length === 0)
            throw new Error("Invalid or expired session");
        // 2️⃣ Get all columns except password
        const _b = (0, drizzle_orm_1.getTableColumns)(schema_1.users), { password } = _b, userData = __rest(_b, ["password"]);
        // 3️⃣ Fetch the user and check if admin
        const user = yield db_1.default
            .select(userData)
            .from(schema_1.users)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.users.id, session[0].userId), (0, drizzle_orm_1.eq)(schema_1.users.type, "ADMIN") // ✅ only allow admins
        ))
            .limit(1);
        if (user.length === 0)
            throw new Error("Admin not found or not authorized");
        return user[0];
    });
}
