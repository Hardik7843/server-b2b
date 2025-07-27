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

export default userRouter;
