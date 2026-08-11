import { NextResponse } from "next/server";
import { ZodError, ZodSchema } from "zod";
import { verifyCsrfToken } from "./csrf";

/**
 * Standard API Response helper to ensure consistent error formats
 */
export const apiResponse = {
  success: (data: any, status = 200, headers?: Record<string, string>) => {
    const init: ResponseInit = { status };
    if (headers) init.headers = headers;

    if (Array.isArray(data)) {
      return NextResponse.json(data, init);
    }
    return NextResponse.json({ success: true, ...data }, init);
  },

  error: (message: string, status = 500, details?: any) => {
    const isDev = process.env.NODE_ENV === "development";
    return NextResponse.json(
      {
        success: false,
        error: message,
        ...(details && { details: isDev ? details : undefined }),
      },
      { status }
    );
  },

  validationError: (error: ZodError) => {
    return NextResponse.json(
      {
        success: false,
        error: "Validation failed",
        issues: error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      },
      { status: 400 }
    );
  },

  unauthorized: (message = "Unauthorized") => {
    return NextResponse.json({ success: false, error: message }, { status: 401 });
  },

  forbidden: (message = "Forbidden") => {
    return NextResponse.json({ success: false, error: message }, { status: 403 });
  },

  notFound: (message = "Not found") => {
    return NextResponse.json({ success: false, error: message }, { status: 404 });
  },
};

/**
 * Helper to validate request body against a schema in Next.js routes
 */
export async function validateBody<T>(request: Request, schema: ZodSchema<T>): Promise<{ data?: T; error?: NextResponse }> {
  try {
    const body = await request.json();
    const data = await schema.parseAsync(body);
    return { data };
  } catch (error) {
    if (error instanceof ZodError) {
      return { error: apiResponse.validationError(error) };
    }
    return { error: apiResponse.error("Invalid JSON body", 400) };
  }
}

/**
 * Validates the CSRF token for mutating requests.
 * Returns an error response if validation fails, or null if successful.
 */
export async function validateCsrf(request: Request): Promise<NextResponse | null> {
  const isValid = await verifyCsrfToken(request);
  if (!isValid) {
    return apiResponse.forbidden("Invalid or missing CSRF token");
  }
  return null;
}

/**
 * Validates the CRON secret header for cron endpoint execution.
 */
export function validateCronAuth(request: Request): NextResponse | null {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret && process.env.NODE_ENV === "production") {
    console.error("CRON_SECRET is missing in production environment variables");
    return apiResponse.error("Server misconfiguration", 500);
  }
  const authHeader = request.headers.get("authorization");
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return apiResponse.unauthorized("Invalid CRON authorization token");
  }
  return null;
}
