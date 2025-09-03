import {
  AuthenticatedRequest,
  requireAuth,
} from "@/controller/auth.controller";
import {
  addProduct,
  decreaseItem,
  getAllProducts,
  increasItem,
  removeProduct,
} from "@/controller/user.controller";

import { Response, Router } from "express";

export const userRouter = Router();

userRouter.get("/product/all", getAllProducts);

userRouter.use(requireAuth);
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

userRouter.post("/product/add", addProduct);
userRouter.delete("/product/remove", removeProduct);
userRouter.post("/product/increment", increasItem);
userRouter.post("/product/decrement", decreaseItem);

// userRouter.post("/signup", signup);
// userRouter.post("/login", login);
// userRouter.post("/logout", logout);

// userRouter.use(protectedView);

// userRouter.put("/updateProfile", updateProfile);
// userRouter.get("/check", checkAuth);

export default userRouter;
