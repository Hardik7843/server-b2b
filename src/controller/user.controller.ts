import db from "@/db";
import { orderItems, product, users } from "@/db/schema";
import { ProductFilters } from "@/types/product";
import { CustomError } from "@/util/error.util";
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
import { Request, Response } from "express";
import { AuthenticatedRequest } from "./auth.controller";

export const getAllProducts = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const {
      page = 1,
      limit = 20,
      name = "",
      // tags = "",
      description = "",
      priceSort,
      dateSort,
      minPrice,
      maxPrice,
      dateFrom,
      dateTo,
    }: // active,
    Omit<ProductFilters, "active" | "tags"> = req.body || {};

    // console.log(chalk.blue("ProductFilters from body: "), req.body);

    const offset = (page - 1) * limit;

    // Build dynamic where conditions
    const conditions = [];

    // Only show non-deleted products
    conditions.push(isNull(product.deletedAt));

    // Name search (partial match, case insensitive)
    if (name) {
      conditions.push(ilike(product.name, `%${name}%`));
    }

    // Tags search (check if any tag matches)
    // if (tags) {
    //   const tagArray = tags.split(",").map((tag) => tag.trim());
    //   const tagConditions = tagArray.map(
    //     (tag) => sql`${product.tags} @> ARRAY[${tag}]`
    //   );
    //   conditions.push(or(...tagConditions));
    // }

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
    // if (active !== undefined && active !== "") {
    //   conditions.push(eq(product.active, active === "true"));
    // }

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
        orderBy[0] = desc(product.updatedAt); // Default: newest first
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
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(product)
      .where(and(...conditions));

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: {
        // admin: req.user,
        products: products.map((p) => ({
          ...p,
        })),
        pagination: {
          page: page,
          limit: limit,
          total: count,
          pages: totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
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

export const addProduct = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.user;
    const { productId } = req.body;
    if (!user?.id) {
      throw new CustomError({
        success: false,
        statusCode: 401,
        message: "Please login to add product to cart",
        error: "Unauthorized",
      });
    }
    if (!productId) {
      throw new CustomError({
        success: false,
        statusCode: 400,
        message: "Product ID is required",
        error: "Bad Request",
      });
    }

    const productDetails = await db
      .select()
      .from(product)
      .where(and(eq(product.id, productId), isNull(product.deletedAt)));

    if (productDetails.length === 0) {
      throw new CustomError({
        success: false,
        statusCode: 404,
        message: "Product not found",
        error: "Not Found",
      });
    }

    const cartItem = await db
      .insert(orderItems)
      .values({
        userId: user.id,
        productId: productId,
      })
      .returning();

    return res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
      data: { user: user, cartItem: cartItem[0] },
    });
  } catch (error) {
    throw error;
  }
};

export const removeProduct = async (
  req: Request,
  res: Response
): Promise<any> => {};

export const increasItem = async (
  req: Request,
  res: Response
): Promise<any> => {};

export const decreaseItem = async (
  req: Request,
  res: Response
): Promise<any> => {};
