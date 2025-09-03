import {
  createProductAdmin,
  deleteProductAdmin,
  editProductAdmin,
  getAllProductAdmin,
  getProductByIdAdmin,
} from "@/controller/admin/product.controller";
import { Router } from "express";

const productRouter = Router();
productRouter.post("/all", getAllProductAdmin);
productRouter.get("/get/:id", getProductByIdAdmin);
productRouter.post("/new", createProductAdmin);
productRouter.put("/edit/:id", editProductAdmin);
productRouter.delete("/delete/:id", deleteProductAdmin);
// productRouter.delete("/unpublish/:id", deleteProductAdmin);
// productRouter.delete("/publish/:id", deleteProductAdmin);
// GET /admin/products - Get all products

export default productRouter;
