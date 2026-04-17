import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

/**
 * Middleware to validate request body against a Zod schema
 */
export function validateBody(schema: ZodSchema) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = await schema.parseAsync(req.body);
            req.body = validated;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: "Validation failed",
                    issues: error.issues.map((err) => ({
                        field: err.path.join("."),
                        message: err.message,
                    })),
                });
            }
            next(error);
        }
    };
}

/**
 * Middleware to validate request query parameters against a Zod schema
 */
export function validateQuery(schema: ZodSchema) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = await schema.parseAsync(req.query);
            Object.defineProperty(req, "query", {
                value: validated,
                writable: true,
                configurable: true,
                enumerable: true,
            });
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: "Invalid query parameters",
                    issues: error.issues.map((err) => ({
                        field: err.path.join("."),
                        message: err.message,
                    })),
                });
            }
            next(error);
        }
    };
}

/**
 * Middleware to validate request params against a Zod schema
 */
export function validateParams(schema: ZodSchema) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = await schema.parseAsync(req.params);
            Object.defineProperty(req, "params", {
                value: validated,
                writable: true,
                configurable: true,
                enumerable: true,
            });
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: "Invalid URL parameters",
                    issues: error.issues.map((err) => ({
                        field: err.path.join("."),
                        message: err.message,
                    })),
                });
            }
            next(error);
        }
    };
}

/**
 * Combined validation middleware for body, query, and params
 */
export function validate(options: { body?: ZodSchema; query?: ZodSchema; params?: ZodSchema }) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (options.body) {
                req.body = await options.body.parseAsync(req.body);
            }
            if (options.query) {
                const validatedQuery = await options.query.parseAsync(req.query);
                Object.defineProperty(req, "query", {
                    value: validatedQuery,
                    writable: true,
                    configurable: true,
                    enumerable: true,
                });
            }
            if (options.params) {
                const validatedParams = await options.params.parseAsync(req.params);
                Object.defineProperty(req, "params", {
                    value: validatedParams,
                    writable: true,
                    configurable: true,
                    enumerable: true,
                });
            }
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: "Validation failed",
                    issues: error.issues.map((err) => ({
                        field: err.path.join("."),
                        message: err.message,
                    })),
                });
            }
            next(error);
        }
    };
}
