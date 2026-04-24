import { NextResponse } from "next/server";
import { ZodError, ZodSchema } from "zod";

/**
 * Standard API Response helper to ensure consistent error formats
 */
export const apiResponse = {
  success: (data: any, status = 200) => {
    if (Array.isArray(data)) {
      return NextResponse.json(data, { status });
    }
    return NextResponse.json({ success: true, ...data }, { status });
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
