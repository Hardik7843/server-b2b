"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import dotenv from "dotenv";
// dotenv.config({ path: ".env.local" });
// console.log("loaded environment");
const express_1 = __importDefault(require("express"));
const user_route_1 = __importDefault(require("./routers/user.route"));
const auth_route_1 = __importDefault(require("./routers/auth.route"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_controller_1 = require("./controller/auth.controller");
const admin_route_1 = __importDefault(require("./routers/admin.route"));
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use("/auth", auth_route_1.default);
app.use("/user", auth_controller_1.requireAuth, user_route_1.default);
app.use("/admin", auth_controller_1.requireAdminauth, admin_route_1.default);
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
