import { NextFunction, Request, Response } from "express";
import { success } from "zod";

type ParsedResponse = {
  success: boolean;
  message: string;
  error: unknown;
  stack?: string | undefined;
  statusCode: number;
};

export class CustomError extends Error {
  public readonly success: boolean;
  public readonly statusCode: number;
  public readonly error?: unknown;

  constructor({
    success = false,
    message,
    statusCode,
    error,
  }: {
    success?: boolean;
    message: string;
    statusCode: number;
    error?: unknown;
  }) {
    super(message);
    this.success = success;
    this.statusCode = statusCode;
    this.error = error;
  }
}
export const errorMiddleware = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): any => {
  const response: ParsedResponse = {
    success: false,
    message: "Something went wrong",
    error,
    statusCode: 501,
  };
  if (error instanceof Error) {
    response.error = error.message;
    response.stack = error.stack;
  }
  if (error instanceof CustomError) {
    response.message = error.message;
    response.statusCode = error.statusCode;
    response.error = error.error;

    // reassign the error for further processing
    // console.log("error.error", error.error);
    // if (error.error) error = error.error;
  }
  // Dont expose the stack trace in any non development environment
  if (process.env.NODE_ENV !== "development") delete response.stack;
  return res.status(response.statusCode).json(response);
};
