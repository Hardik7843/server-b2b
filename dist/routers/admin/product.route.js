"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const product_controller_1 = require("../../controller/admin/product.controller");
const express_1 = require("express");
const productRouter = (0, express_1.Router)();
productRouter.get("/all", product_controller_1.getAllProductAdmin);
productRouter.get("/get/:id", product_controller_1.getProductByIdAdmin);
productRouter.post("/new", product_controller_1.createProductAdmin);
productRouter.put("/edit/:id", product_controller_1.editProductAdmin);
productRouter.delete("/delete/:id", product_controller_1.deleteProductAdmin);
// productRouter.delete("/unpublish/:id", deleteProductAdmin);
// productRouter.delete("/publish/:id", deleteProductAdmin);
// GET /admin/products - Get all products
exports.default = productRouter;
