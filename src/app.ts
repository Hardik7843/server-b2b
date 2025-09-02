// import dotenv from "dotenv";
// dotenv.config({ path: ".env.local" });
// console.log("loaded environment");
import express, { Request, Response } from "express";
import userRouter from "./routers/user.route";
import authRouter from "./routers/auth.route";
import cookieParser from "cookie-parser";
import { requireAdminauth } from "./controller/auth.controller";
import adminRouter from "./routers/admin.route";
import { errorMiddleware } from "./util/error.util";
// import { VercelRequest, VercelResponse } from "@vercel/node";

import cors from "cors";
const app = express();

const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "🚀 Meal Nest server is running fine!" });
});

app.use("/auth", authRouter);

app.use("/user", userRouter);
app.use("/admin", requireAdminauth, adminRouter);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.use(errorMiddleware);

// export default (req: VercelRequest, res: VercelResponse) => {
//   return app(req, res);
// };
