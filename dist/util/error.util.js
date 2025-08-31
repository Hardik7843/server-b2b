"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = exports.CustomError = void 0;
class CustomError extends Error {
    constructor({ success = false, message, statusCode, error, }) {
        super(message);
        this.success = success;
        this.statusCode = statusCode;
        this.error = error;
    }
}
exports.CustomError = CustomError;
const errorMiddleware = (error, req, res, _next) => {
    const response = {
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
    if (process.env.NODE_ENV !== "development")
        delete response.stack;
    return res.status(response.statusCode).json(response);
};
exports.errorMiddleware = errorMiddleware;
