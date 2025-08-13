import { AdminAuthenticatedRquest } from "@/controller/auth.controller";
import { Router, Response } from "express";

const productRouter = Router();

// GET /admin/products - Get all products
productRouter.get("/", (req: AdminAuthenticatedRquest, res: Response) => {
  const { page = 1, limit = 10, category = "", status = "" } = req.query;

  res.json({
    success: true,
    message: "Products retrieved successfully",
    data: {
      admin: req.user,
      products: [
        {
          id: 1,
          name: "Premium Laptop",
          price: 1299.99,
          category: "Electronics",
          status: "active",
          stock: 45,
        },
        {
          id: 2,
          name: "Wireless Headphones",
          price: 199.99,
          category: "Electronics",
          status: "active",
          stock: 120,
        },
        {
          id: 3,
          name: "Office Chair",
          price: 299.99,
          category: "Furniture",
          status: "inactive",
          stock: 0,
        },
      ],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: 75,
        pages: 8,
      },
      filters: { category, status },
    },
  });
});

productRouter.post("/", (req: AdminAuthenticatedRquest, res: Response) => {
  const { page = 1, limit = 10, category = "", status = "" } = req.query;

  res.json({
    success: true,
    message: "Products retrieved successfully",
    data: {
      admin: req.user,
      products: [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: 75,
        pages: 8,
      },
      filters: { category, status },
    },
  });
});

export default productRouter;
