/**
 * Extracts a human-readable error message from unknown caught errors.
 * Falls back to the provided default message if the error can't be parsed.
 *
 * Usage:
 *   catch (err) {
 *     addNotification("Error", getErrorMessage(err, "Failed to save project"), "error");
 *   }
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message || fallback;
  }

  if (typeof error === "string") {
    return error;
  }

  // Handle axios-style error objects
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  return fallback;
}
