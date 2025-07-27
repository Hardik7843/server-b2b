import { makeUser } from "@/controller/user.controller";
import { Request, Response, Router } from "express";
// import { makeUser } from "../controller/user.controller";

export const userRouter = Router();

// userRouter.post('/createOne', UserCreator)
// userRouter.delete('/truncate', UserTruncate)
// userRouter.post('/update', updateUser)
userRouter.get("/check", (req: Request, res: Response) => {
  res.status(200).send({ message: "hiiiiiiii" });
});

// userRouter.post("/signup", signup);
// userRouter.post("/login", login);
// userRouter.post("/logout", logout);

// userRouter.use(protectedView);

// userRouter.put("/updateProfile", updateProfile);
// userRouter.get("/check", checkAuth);
userRouter.post("/createOne", makeUser);

export default userRouter;
