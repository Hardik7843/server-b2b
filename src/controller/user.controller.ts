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
  SQL,
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
    // console.log("req.body: ", req.body);
    const { productId } = req.body || {};

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
      .where(
        and(
          eq(product.id, productId),
          isNull(product.deletedAt),
          eq(product.active, true)
        )
      );

    if (productDetails.length === 0) {
      throw new CustomError({
        success: false,
        statusCode: 404,
        message: "Product not found",
        error: "Not Found",
      });
    }

    // Check if the product is already in the user's cart
    const [existingCartItem] = await db
      .select()
      .from(orderItems)
      .where(
        and(eq(orderItems.userId, user.id), eq(orderItems.productId, productId))
      )
      .limit(1);

    if (existingCartItem) {
      // Return without fetching updated cart list
      return res.status(200).json({
        success: true,
        message: "Product is already in the cart",
        data: { user: user, cartItem: existingCartItem },
      });
    }

    // Add new item to cart
    const cartItem = await db
      .insert(orderItems)
      .values({
        userId: user.id,
        productId: productId,
      })
      .returning();

    // Fetch updated cart list with product details
    const updatedCartItems = await db
      .select({
        id: orderItems.id,
        productId: orderItems.productId,
        userId: orderItems.userId,
        quantity: orderItems.quantity, // if you have quantity field
        createdAt: orderItems.createdAt,
        // Product details
        productName: product.name,
        productPrice: product.price,
        productOriginalPrice: product.originalPrice,
        productImages: product.images,
        productDescription: product.description,
        // Add other product fields you need
      })
      .from(orderItems)
      .innerJoin(product, eq(orderItems.productId, product.id))
      .where(
        and(
          eq(orderItems.userId, user.id),
          isNull(product.deletedAt),
          eq(product.active, true)
        )
      );

    return res.status(201).json({
      success: true,
      message: "Product added to cart successfully",
      data: {
        user: user,
        cartItems: updatedCartItems,
        addedItem: cartItem[0],
      },
    });
  } catch (error) {
    // console.error("Error adding product to cart:", error);
    throw error;
  }
};

export const removeProduct = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.user;
    // console.log("req.body: ", req.body);
    const { productId } = req.body || {};

    if (!user?.id) {
      throw new CustomError({
        success: false,
        statusCode: 401,
        message: "Please login to remove product from cart",
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

    // Check if the product exists in the user's cart
    const [existingCartItem] = await db
      .select()
      .from(orderItems)
      .where(
        and(eq(orderItems.userId, user.id), eq(orderItems.productId, productId))
      )
      .limit(1);

    if (!existingCartItem) {
      throw new CustomError({
        success: false,
        statusCode: 404,
        message: "Product not found in cart",
        error: "Not Found",
      });
    }

    // Remove the product from cart
    const removedItem = await db
      .delete(orderItems)
      .where(
        and(eq(orderItems.userId, user.id), eq(orderItems.productId, productId))
      )
      .returning();

    // Fetch updated cart list with product details (after removal)
    const updatedCartItems = await db
      .select({
        id: orderItems.id,
        productId: orderItems.productId,
        userId: orderItems.userId,
        quantity: orderItems.quantity, // if you have quantity field
        createdAt: orderItems.createdAt,
        // Product details
        productName: product.name,
        productPrice: product.price,
        productOriginalPrice: product.originalPrice,
        productImages: product.images,
        productDescription: product.description,
        // Add other product fields you need
      })
      .from(orderItems)
      .innerJoin(product, eq(orderItems.productId, product.id))
      .where(
        and(
          eq(orderItems.userId, user.id),
          isNull(product.deletedAt),
          eq(product.active, true)
        )
      );

    return res.status(200).json({
      success: true,
      message: "Product removed from cart successfully",
      data: {
        user: user,
        cartItems: updatedCartItems,
        removedItem: removedItem[0],
      },
    });
  } catch (error) {
    // console.error("Error removing product from cart:", error);
    throw error;
  }
};

export const increasItem = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.user;
    // console.log("req.body: ", req.body);
    const { productId } = req.body || {};

    if (!user?.id) {
      throw new CustomError({
        success: false,
        statusCode: 401,
        message: "Please login to increase item quantity",
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

    // Check if the product exists in the user's cart
    const [existingCartItem] = await db
      .select({
        id: orderItems.id,
        stock: sql`COALESCE(${product.stock}, 0)` as SQL<number>,
        quantity: sql`COALESCE(${orderItems.quantity}, 1)` as SQL<number>,
      })
      .from(orderItems)
      .where(
        and(eq(orderItems.userId, user.id), eq(orderItems.productId, productId))
      )
      .innerJoin(product, eq(orderItems.productId, product.id))
      .limit(1);

    if (!existingCartItem) {
      throw new CustomError({
        success: false,
        statusCode: 404,
        message: "Product not found in cart",
        error: "Not Found",
      });
    }

    if (existingCartItem.quantity >= existingCartItem.stock) {
      throw new CustomError({
        success: false,
        statusCode: 400,
        message: "Stock limit reached.",
        error: "Bad Request",
      });
    }

    // Increase the quantity
    await db
      .update(orderItems)
      .set({
        quantity: sql`${orderItems.quantity} + 1`,
      })
      .where(
        and(eq(orderItems.userId, user.id), eq(orderItems.productId, productId))
      );

    // Fetch updated cart list with product details
    const updatedCartItems = await db
      .select({
        id: orderItems.id,
        productId: orderItems.productId,
        userId: orderItems.userId,
        quantity: orderItems.quantity,
        createdAt: orderItems.createdAt,
        // Product details
        productName: product.name,
        productPrice: product.price,
        productOriginalPrice: product.originalPrice,
        productImages: product.images,
        productDescription: product.description,
      })
      .from(orderItems)
      .innerJoin(product, eq(orderItems.productId, product.id))
      .where(
        and(
          eq(orderItems.userId, user.id),
          isNull(product.deletedAt),
          eq(product.active, true)
        )
      );

    return res.status(200).json({
      success: true,
      message: "Item quantity increased successfully",
      data: {
        user: user,
        cartItems: updatedCartItems,
      },
    });
  } catch (error) {
    // console.error("Error increasing item quantity:", error);
    throw error;
  }
};

export const decreaseItem = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.user;
    // console.log("req.body: ", req.body);
    const { productId } = req.body || {};

    if (!user?.id) {
      throw new CustomError({
        success: false,
        statusCode: 401,
        message: "Please login to decrease item quantity",
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

    // Check if the product exists in the user's cart
    const [existingCartItem] = await db
      .select({
        id: orderItems.id,
        quantity: sql`COALESCE(${orderItems.quantity}, 1)` as SQL<number>,
      })
      .from(orderItems)
      .where(
        and(eq(orderItems.userId, user.id), eq(orderItems.productId, productId))
      )
      .limit(1);

    if (!existingCartItem) {
      throw new CustomError({
        success: false,
        statusCode: 404,
        message: "Product not found in cart",
        error: "Not Found",
      });
    }

    if (existingCartItem.quantity <= 1) {
      throw new CustomError({
        success: false,
        statusCode: 400,
        message: "Cannot decrease below 1. Remove item instead.",
        error: "Bad Request",
      });
    }

    // Decrease the quantity
    await db
      .update(orderItems)
      .set({
        quantity: sql`${orderItems.quantity} - 1`,
      })
      .where(
        and(eq(orderItems.userId, user.id), eq(orderItems.productId, productId))
      );

    // Fetch updated cart list with product details
    const updatedCartItems = await db
      .select({
        id: orderItems.id,
        productId: orderItems.productId,
        userId: orderItems.userId,
        quantity: orderItems.quantity,
        createdAt: orderItems.createdAt,
        // Product details
        productName: product.name,
        productPrice: product.price,
        productOriginalPrice: product.originalPrice,
        productImages: product.images,
        productDescription: product.description,
      })
      .from(orderItems)
      .innerJoin(product, eq(orderItems.productId, product.id))
      .where(
        and(
          eq(orderItems.userId, user.id),
          isNull(product.deletedAt),
          eq(product.active, true)
        )
      );

    return res.status(200).json({
      success: true,
      message: "Item quantity decreased successfully",
      data: {
        user: user,
        cartItems: updatedCartItems,
      },
    });
  } catch (error) {
    // console.error("Error decreasing item quantity:", error);
    throw error;
  }
};
