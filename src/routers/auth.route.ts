import {
  logout,
  requireAuth,
  signin,
  signup,
} from "@/controller/auth.controller";
import { Router } from "express";

const authRouter = Router();

authRouter.post("/signup", signup);

authRouter.post("/login", signin);
authRouter.post("/logout", requireAuth, logout);

export default authRouter;
