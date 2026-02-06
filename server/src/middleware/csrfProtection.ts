import { Request, Response, NextFunction } from "express";

/**
 * Custom CSRF Protection Middleware
 *
 * Since this API uses Bearer tokens (stateless), it is naturally resistant to
 * traditional CSRF (which targets cookie-based sessions).
 *
 * This middleware provides an extra layer of "Explicit CSRF Protection" by
 * enforcing a custom header check for non-idempotent methods (POST, PUT, DELETE, PATCH).
 * This ensures requests are deliberate and made from a standard fetch/xhr client.
 */
export const csrfProtection = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const idempotentMethods = ["GET", "HEAD", "OPTIONS"];

  if (idempotentMethods.includes(req.method)) {
    return next();
  }

  // Check for custom header that browsers don't allow to be set cross-origin without CORS preflight
  const csrfHeader =
    req.headers["x-csrf-protection"] || req.headers["x-requested-with"];

  if (!csrfHeader) {
    console.warn(
      `🛑 CSRF Blocked: Missing custom header on ${req.method} ${req.url}`,
    );
    return res.status(403).json({
      error: "CSRF protection: Missing required request header",
      details:
        "State-changing requests must include 'X-CSRF-Protection' header.",
    });
  }

  next();
};
