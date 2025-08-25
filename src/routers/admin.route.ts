import { Response, Router } from "express";

import { AdminAuthenticatedRequest } from "@/controller/auth.controller";
import productRouter from "./admin/product.route";

const adminRouter = Router();
// adminRouter.use(requireAdminauth);
// Mount product routes under /admin/product
// Other admin routes here
adminRouter.use("/product", productRouter);
adminRouter.get(
  "/check",
  async (req: AdminAuthenticatedRequest, res: Response): Promise<any> => {
    return res.status(200).json({
      success: true,
      data: { user: req.user },
      message: "User Detail Fetched",
    });
  }
);

export default adminRouter;
