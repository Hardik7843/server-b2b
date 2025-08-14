import {
  createProductAdmin,
  deleteProductAdmin,
  editProductAdmin,
  getAllProductAdmin,
} from "@/controller/admin/product.controller";
import { Router } from "express";

const productRouter = Router();
productRouter.get("/all", getAllProductAdmin);
productRouter.post("/new", createProductAdmin);
productRouter.put("/edit/:id", editProductAdmin);
productRouter.delete("/delete/:id", deleteProductAdmin);
// productRouter.delete("/unpublish/:id", deleteProductAdmin);
// productRouter.delete("/publish/:id", deleteProductAdmin);
// GET /admin/products - Get all products

export default productRouter;
