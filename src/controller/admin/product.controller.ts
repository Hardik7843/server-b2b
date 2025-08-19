import { Response } from "express";
import { AdminAuthenticatedRequest } from "../auth.controller";
import { product } from "@/db/schema";
import db from "@/db";
import {
  and,
  asc,
  desc,
  eq,
  gte,
  ilike,
  isNull,
  lte,
  or,
  sql,
} from "drizzle-orm";
import { CustomError } from "@/util/error.util";
import { createProductSchema } from "@/validators/product.validator";

interface ProductFilters {
  page?: string;
  limit?: number;
  name?: string;
  tags?: string;
  description?: string;
  priceSort?: "DESC" | "ASC";
  dateSort?: "DESC" | "ASC";
  minPrice?: number;
  maxPrice?: number;
  dateFrom?: string;
  dateTo?: string;
  active?: string;
}

export const getAllProductAdmin = async (
  req: AdminAuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const {
      page = "1",
      limit = 10,
      name = "",
      tags = "",
      description = "",
      priceSort,
      dateSort,
      minPrice,
      maxPrice,
      dateFrom,
      dateTo,
      active,
    }: ProductFilters = req.body;

    // console.log(chalk.blue("ProductFilters from body: "), req.body);
    const pageNum = Number(page);
    const limitNum = limit;
    const offset = (pageNum - 1) * limitNum;

    // Build dynamic where conditions
    const conditions = [];

    // Only show non-deleted products
    conditions.push(isNull(product.deletedAt));

    // Name search (partial match, case insensitive)
    if (name) {
      conditions.push(ilike(product.name, `%${name}%`));
    }

    // Tags search (check if any tag matches)
    if (tags) {
      const tagArray = tags.split(",").map((tag) => tag.trim());
      const tagConditions = tagArray.map(
        (tag) => sql`${product.tags} @> ARRAY[${tag}]`
      );
      conditions.push(or(...tagConditions));
    }

    // Description similarity search
    if (description) {
      conditions.push(ilike(product.description, `%${description}%`));
    }

    // Price range filters
    if (minPrice) {
      conditions.push(gte(product.price, minPrice));
    }
    if (maxPrice) {
      conditions.push(lte(product.price, maxPrice));
    }

    // Date range filters
    if (dateFrom) {
      conditions.push(gte(product.createdAt, new Date(dateFrom)));
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999); // End of day
      conditions.push(lte(product.createdAt, endDate));
    }

    // Active status filter
    if (active !== undefined && active !== "") {
      conditions.push(eq(product.active, active === "true"));
    }

    // Build order by clause
    let orderBy = [];
    switch (dateSort) {
      case "DESC":
        orderBy[0] = desc(product.createdAt);
        break;
      case "ASC":
        orderBy[0] = asc(product.createdAt);
        break;
      default:
        orderBy[0] = desc(product.createdAt); // Default: newest first
    }

    switch (priceSort) {
      case "DESC":
        orderBy[0] = desc(product.createdAt);
        break;
      case "ASC":
        orderBy[0] = asc(product.createdAt);
        break;
      default:
        orderBy[0] = desc(product.createdAt); // Default: newest first
    }

    // Execute query with filters, pagination, and sorting
    const products = await db
      .select()
      .from(product)
      .where(and(...conditions))
      .orderBy(...orderBy)
      .limit(limitNum)
      .offset(offset);

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(product)
      .where(and(...conditions));

    const totalPages = Math.ceil(count / limitNum);

    return res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: {
        // admin: req.user,
        products: products.map((p) => ({
          ...p,
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count,
          pages: totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1,
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
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new CustomError({
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
};

export const getProductByIdAdmin = async (
  req: AdminAuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;

    const [productData] = await db
      .select()
      .from(product)
      .where(and(eq(product.id, Number(id)), isNull(product.deletedAt)));

    if (!productData) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Product ${id} retrieved successfully`,
      data: {
        admin: req.user,
        product: productData,
      },
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch product",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const createProductAdmin = async (
  req: AdminAuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      images = [],
      tags = [],
      stock = 0,
      active = false,
    } = req.body;

    // Validation
    // if (!name || price === undefined) {
    //   return res.status(400).json({
    //     success: false,
    //     error: "Name and price are required",
    //   });
    // }

    const validation = createProductSchema.safeParse(req.body);
    if (!validation.success) {
      throw new CustomError({
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

    const [newProduct] = await db
      .insert(product)
      .values({
        name: parsedData.name,
        description: parsedData.description,
        price: Number(parsedData.price),
        originalPrice: parsedData.originalPrice
          ? Number(parsedData.originalPrice)
          : null,
        images: Array.isArray(parsedData.images) ? parsedData.images : [],
        tags: Array.isArray(parsedData.tags) ? parsedData.tags : [],
        stock: Number(parsedData.stock ?? 0),
        active: Boolean(parsedData.active ?? false),
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
  } catch (error) {
    // console.error("Error creating product:", error);
    if (error instanceof CustomError) throw error;
    else
      throw new CustomError({
        statusCode: 500,
        success: false,
        error: "Failed to create product",
        message: error instanceof Error ? error.message : "Unknown error",
      });
  }
};

export const editProductAdmin = async (
  req: AdminAuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove undefined values
    const validation = createProductSchema.safeParse(updateData);
    if (!validation.success) {
      throw new CustomError({
        message: "Invalid Inputs for Update Product",
        statusCode: 400,
        error: validation.error.issues.map((issue) => ({
          field: issue.path[0],
          message: issue.message,
        })),
      });
    }
    const parsedData = validation.data;

    const [updatedProduct] = await db
      .update(product)
      .set({ ...parsedData })
      .where(and(eq(product.id, Number(id)), isNull(product.deletedAt)))
      .returning();

    if (!updatedProduct) {
      throw new CustomError({
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
  } catch (error) {
    if (error instanceof CustomError) throw error;
    else
      throw new CustomError({
        statusCode: 500,
        success: false,
        error: "Failed to update product",
        message: error instanceof Error ? error.message : "Unknown error",
      });
  }
};

export const deleteProductAdmin = async (
  req: AdminAuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;

    // Soft delete by setting deletedAt timestamp
    const [deletedProduct] = await db
      .update(product)
      .set({
        deletedAt: new Date(),
      })
      .where(and(eq(product.id, Number(id)), isNull(product.deletedAt)))
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
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to delete product",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

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
