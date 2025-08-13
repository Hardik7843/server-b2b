import { Response, Router } from "express";

import { AdminAuthenticatedRquest } from "@/controller/auth.controller";
import productRouter from "./admin/product.route";

const adminRouter = Router();

// Mount product routes under /admin/product
adminRouter.use("/product", productRouter);
// Other admin routes here
adminRouter.get(
  "/check",
  async (req: AdminAuthenticatedRquest, res: Response): Promise<any> => {
    return res.status(200).json({
      success: true,
      data: { user: req.user },
      message: "User Detail Fetched",
    });
  }
);

export default adminRouter;
