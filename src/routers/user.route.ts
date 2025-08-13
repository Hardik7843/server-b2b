import { AuthenticatedRequest } from "@/controller/auth.controller";
import { makeUser } from "@/controller/user.controller";
import { Request, Response, Router } from "express";
// import { makeUser } from "../controller/user.controller";

export const userRouter = Router();

// userRouter.post('/createOne', UserCreator)
// userRouter.delete('/truncate', UserTruncate)
// userRouter.post('/update', updateUser)

userRouter.get(
  "/check",
  async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    // console.log("hiii", req.user);

    return res.status(200).json({
      success: true,
      data: { user: req.user },
      message: "User Detail Fetched",
    });
  }
);

// userRouter.post("/signup", signup);
// userRouter.post("/login", login);
// userRouter.post("/logout", logout);

// userRouter.use(protectedView);

// userRouter.put("/updateProfile", updateProfile);
// userRouter.get("/check", checkAuth);
// userRouter.post("/createOne", makeUser);

export default userRouter;
