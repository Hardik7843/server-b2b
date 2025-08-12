// import dotenv from "dotenv";
// dotenv.config({ path: ".env.local" });
// console.log("loaded environment");
import express from "express";
import userRouter from "./routers/user.route";
import authRouter from "./routers/auth.route";
import cookieParser from "cookie-parser";
import { requireAdminauth, requireAuth } from "./controller/auth.controller";
import adminRouter from "./routers/admin.route";

const app = express();
const port = process.env.PORT || 8080;

app.use(cookieParser());
app.use(express.json());
app.use("/auth", authRouter);
app.use("/user", requireAuth, userRouter);
app.use("/admin", requireAdminauth, adminRouter);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
