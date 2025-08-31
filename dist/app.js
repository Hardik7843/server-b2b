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
const error_util_1 = require("./util/error.util");
// import { VercelRequest, VercelResponse } from "@vercel/node";
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000", "https://app-b2b-three.vercel.app"],
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.status(200).json({ message: "🚀 Meal Nest server is running fine!" });
});
app.use("/auth", auth_route_1.default);
app.use("/user", auth_controller_1.requireAuth, user_route_1.default);
app.use("/admin", auth_controller_1.requireAdminauth, admin_route_1.default);
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
app.use(error_util_1.errorMiddleware);
// export default (req: VercelRequest, res: VercelResponse) => {
//   return app(req, res);
// };
