import { Response, Router } from "express";

import { AdminAuthenticatedRquest } from "@/controller/auth.controller";

const adminRouter = Router();

// Mount product routes under /admin/product

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
