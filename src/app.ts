// import dotenv from "dotenv";
// dotenv.config({ path: ".env.local" });
// console.log("loaded environment");
import express from "express";
import userRouter from "./routers/user.route";
import authRouter from "./routers/auth.route";
import cookieParser from "cookie-parser";

const app = express();
const port = process.env.PORT || 8080;

app.use(cookieParser());
app.use(express.json());
app.use("/auth", authRouter);
app.use("/user", userRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
