"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductAdmin = exports.editProductAdmin = exports.createProductAdmin = exports.getProductByIdAdmin = exports.getAllProductAdmin = void 0;
const schema_1 = require("../../db/schema");
const db_1 = __importDefault(require("../../db"));
const drizzle_orm_1 = require("drizzle-orm");
const error_util_1 = require("../../util/error.util");
const product_validator_1 = require("../../validators/product.validator");
const getAllProductAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 20, name = "", tags = "", description = "", priceSort, dateSort, minPrice, maxPrice, dateFrom, dateTo, active, } = req.body || {};
        // console.log(chalk.blue("ProductFilters from body: "), req.body);
        const offset = (page - 1) * limit;
        // Build dynamic where conditions
        const conditions = [];
        // Only show non-deleted products
        conditions.push((0, drizzle_orm_1.isNull)(schema_1.product.deletedAt));
        // Name search (partial match, case insensitive)
        if (name) {
            conditions.push((0, drizzle_orm_1.ilike)(schema_1.product.name, `%${name}%`));
        }
        // Tags search (check if any tag matches)
        if (tags) {
            const tagArray = tags.split(",").map((tag) => tag.trim());
            const tagConditions = tagArray.map((tag) => (0, drizzle_orm_1.sql) `${schema_1.product.tags} @> ARRAY[${tag}]`);
            conditions.push((0, drizzle_orm_1.or)(...tagConditions));
        }
        // Description similarity search
        if (description) {
            conditions.push((0, drizzle_orm_1.ilike)(schema_1.product.description, `%${description}%`));
        }
        // Price range filters
        if (minPrice) {
            conditions.push((0, drizzle_orm_1.gte)(schema_1.product.price, minPrice));
        }
        if (maxPrice) {
            conditions.push((0, drizzle_orm_1.lte)(schema_1.product.price, maxPrice));
        }
        // Date range filters
        if (dateFrom) {
            conditions.push((0, drizzle_orm_1.gte)(schema_1.product.createdAt, new Date(dateFrom)));
        }
        if (dateTo) {
            const endDate = new Date(dateTo);
            endDate.setHours(23, 59, 59, 999); // End of day
            conditions.push((0, drizzle_orm_1.lte)(schema_1.product.createdAt, endDate));
        }
        // Active status filter
        if (active !== undefined && active !== "") {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.product.active, active === "true"));
        }
        // Build order by clause
        let orderBy = [];
        switch (dateSort) {
            case "DESC":
                orderBy[0] = (0, drizzle_orm_1.desc)(schema_1.product.createdAt);
                break;
            case "ASC":
                orderBy[0] = (0, drizzle_orm_1.asc)(schema_1.product.createdAt);
                break;
            default:
                orderBy[0] = (0, drizzle_orm_1.desc)(schema_1.product.updatedAt); // Default: newest first
        }
        switch (priceSort) {
            case "DESC":
                orderBy[0] = (0, drizzle_orm_1.desc)(schema_1.product.createdAt);
                break;
            case "ASC":
                orderBy[0] = (0, drizzle_orm_1.asc)(schema_1.product.createdAt);
                break;
            default:
                orderBy[0] = (0, drizzle_orm_1.desc)(schema_1.product.createdAt); // Default: newest first
        }
        // Execute query with filters, pagination, and sorting
        const products = yield db_1.default
            .select()
            .from(schema_1.product)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy(...orderBy)
            .limit(limit)
            .offset(offset);
        // Get total count for pagination
        const [{ count }] = yield db_1.default
            .select({ count: (0, drizzle_orm_1.sql) `count(*)`.mapWith(Number) })
            .from(schema_1.product)
            .where((0, drizzle_orm_1.and)(...conditions));
        const totalPages = Math.ceil(count / limit);
        return res.status(200).json({
            success: true,
            message: "Products retrieved successfully",
            data: {
                // admin: req.user,
                products: products.map((p) => (Object.assign({}, p))),
                pagination: {
                    page: page,
                    limit: limit,
                    total: count,
                    pages: totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
                // filters: {
                //   name,
                //   tags,
                //   description,
                //   priceSort,
                //   minPrice: minPrice ? Number(minPrice) : undefined,
                //   maxPrice: maxPrice ? Number(maxPrice) : undefined,
                //   dateFrom,
                //   dateTo,
                //   active: active ? active === "true" : undefined,
                // },
            },
        });
    }
    catch (error) {
        console.error("Error fetching products:", error);
        throw new error_util_1.CustomError({
            statusCode: 500,
            success: false,
            error: "Failed to fetch products",
            message: error instanceof Error ? error.message : "Unknown error",
        });
        // return res.status(500).json({
        //   success: false,
        // error: "Failed to fetch products",
        // message: error instanceof Error ? error.message : "Unknown error",
        // });
    }
});
exports.getAllProductAdmin = getAllProductAdmin;
const getProductByIdAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const [productData] = yield db_1.default
            .select()
            .from(schema_1.product)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.product.id, Number(id)), (0, drizzle_orm_1.isNull)(schema_1.product.deletedAt)));
        if (!productData) {
            throw new error_util_1.CustomError({
                success: false,
                statusCode: 404,
                message: "Product Not Found",
            });
            // return res.status(404).json({
            //   success: false,
            //   error: "Product not found",
            // });
        }
        return res.status(200).json({
            success: true,
            message: `Product ${id} retrieved successfully`,
            data: {
                admin: req.user,
                product: productData,
            },
        });
    }
    catch (error) {
        console.error("Error fetching product:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to fetch product",
            message: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.getProductByIdAdmin = getProductByIdAdmin;
const createProductAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // const {
        //   name,
        //   description,
        //   price,
        //   originalPrice,
        //   images = [],
        //   tags = [],
        //   stock = 0,
        //   active = false,
        // } = req.body;
        // Validation
        // if (!name || price === undefined) {
        //   return res.status(400).json({
        //     success: false,
        //     error: "Name and price are required",
        //   });
        // }
        const validation = product_validator_1.createProductSchema.safeParse(req.body);
        if (!validation.success) {
            throw new error_util_1.CustomError({
                message: "Invalid Inputs for Creating Product",
                statusCode: 400,
                error: validation.error.issues.map((issue) => ({
                    field: issue.path[0],
                    message: issue.message,
                })),
            });
        }
        // const [newProduct] = await db
        //   .insert(product)
        //   .values({
        //     name,
        //     description,
        //     price: Number(price),
        //     originalPrice: originalPrice ? Number(originalPrice) : null,
        //     images: Array.isArray(images) ? images : [],
        //     tags: Array.isArray(tags) ? tags : [],
        //     stock: Number(stock),
        //     active: Boolean(active),
        //   })
        //   .returning();
        const parsedData = validation.data;
        const [newProduct] = yield db_1.default
            .insert(schema_1.product)
            .values({
            name: parsedData.name,
            description: parsedData.description,
            price: Number(parsedData.price),
            originalPrice: parsedData.originalPrice
                ? Number(parsedData.originalPrice)
                : null,
            images: Array.isArray(parsedData.images) ? parsedData.images : [],
            tags: Array.isArray(parsedData.tags) ? parsedData.tags : [],
            stock: Number((_a = parsedData.stock) !== null && _a !== void 0 ? _a : 0),
            // active: Boolean(parsedData.active ?? false),
        })
            .returning();
        // console.log("product: ", newProduct);
        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: {
                admin: req.user,
                product: newProduct,
            },
        });
    }
    catch (error) {
        // console.error("Error creating product:", error);
        if (error instanceof error_util_1.CustomError)
            throw error;
        else
            throw new error_util_1.CustomError({
                statusCode: 500,
                success: false,
                error: "Failed to create product",
                message: error instanceof Error ? error.message : "Unknown error",
            });
    }
});
exports.createProductAdmin = createProductAdmin;
const editProductAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updateData = req.body;
        // Remove undefined values
        const validation = product_validator_1.createProductSchema.safeParse(updateData);
        if (!validation.success) {
            throw new error_util_1.CustomError({
                message: "Invalid Inputs for Update Product",
                statusCode: 400,
                error: validation.error.issues.map((issue) => ({
                    field: issue.path[0],
                    message: issue.message,
                })),
            });
        }
        const parsedData = validation.data;
        const [updatedProduct] = yield db_1.default
            .update(schema_1.product)
            .set(Object.assign({}, parsedData))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.product.id, Number(id)), (0, drizzle_orm_1.isNull)(schema_1.product.deletedAt)))
            .returning();
        if (!updatedProduct) {
            throw new error_util_1.CustomError({
                success: false,
                statusCode: 404,
                message: "Product Not Found",
            });
        }
        return res.status(200).json({
            success: true,
            message: `Product ${id} updated successfully`,
            data: {
                admin: req.user,
                product: updatedProduct,
            },
        });
    }
    catch (error) {
        if (error instanceof error_util_1.CustomError)
            throw error;
        else
            throw new error_util_1.CustomError({
                statusCode: 500,
                success: false,
                error: "Failed to update product",
                message: error instanceof Error ? error.message : "Unknown error",
            });
    }
});
exports.editProductAdmin = editProductAdmin;
const deleteProductAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Soft delete by setting deletedAt timestamp
        const [deletedProduct] = yield db_1.default
            .update(schema_1.product)
            .set({
            deletedAt: new Date(),
        })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.product.id, Number(id)), (0, drizzle_orm_1.isNull)(schema_1.product.deletedAt)))
            .returning();
        if (!deletedProduct) {
            return res.status(404).json({
                success: false,
                error: "Product not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: `Product ${id} deleted successfully`,
            data: {
                admin: req.user,
                deletedProduct,
            },
        });
    }
    catch (error) {
        console.error("Error deleting product:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to delete product",
            message: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.deleteProductAdmin = deleteProductAdmin;
// export const editProductAdmin = async (
//   req: AdminAuthenticatedRequest,
//   res: Response
// ): Promise<any> => {
//   try {
//     const { id } = req.params;
//     // Soft delete by setting deletedAt timestamp
//     const [deletedProduct] = await db
//       .update(product)
//       .set({
//         deletedAt: new Date(),
//         updatedAt: new Date(),
//       })
//       .where(and(eq(product.id, Number(id)), isNull(product.deletedAt)))
//       .returning({ id: product.id, name: product.name });
//     if (!deletedProduct) {
//       return res.status(404).json({
//         success: false,
//         error: "Product not found",
//       });
//     }
//     return res.status(200).json({
//       success: true,
//       message: `Product ${id} deleted successfully`,
//       data: {
//         admin: req.user,
//         deletedProduct,
//       },
//     });
//   } catch (error) {
//     console.error("Error deleting product:", error);
//     return res.status(500).json({
//       success: false,
//       error: "Failed to delete product",
//       message: error instanceof Error ? error.message : "Unknown error",
//     });
//   }
// };
