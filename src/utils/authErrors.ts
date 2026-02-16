/**
 * Utility to map common backend auth error codes/messages to user-friendly display messages.
 */

const ERROR_MAP: Record<string, string> = {
  // Login errors
  invalid_credentials: "Invalid email or password. Please try again.",
  user_not_found: "No account found with this email address.",
  account_disabled: "Your account has been disabled. Please contact support.",
  invalid_password: "The password you entered is incorrect.",

  // Registration errors
  email_already_exists: "An account with this email already exists.",
  phone_already_exists: "An account with this phone number already exists.",
  weak_password: "The password is too weak. Please choose a stronger one.",

  // Generic / System errors
  unauthorized: "You must be logged in to perform this action.",
  forbidden: "You do not have permission to access this resource.",
  session_expired: "Your session has expired. Please log in again.",
  network_error: "Connection failed. Please check your internet connection.",
  server_error: "Something went wrong on our end. Please try again later.",
};

/**
 * Normalizes an error string or Error object into a user-friendly message.
 */
export function formatAuthError(error: unknown): string {
  if (!error) return "An unknown error occurred.";

  const originalMessage =
    error instanceof Error ? error.message : String(error);
  const lowerMessage = originalMessage.toLowerCase();

  // Try to find a match in the error map (case-insensitive keys for flexibility)
  for (const [key, value] of Object.entries(ERROR_MAP)) {
    if (lowerMessage.includes(key.toLowerCase())) {
      return value;
    }
  }

  // Handle specific substrings if not in the direct map
  if (lowerMessage.includes("credentials")) {
    return ERROR_MAP.invalid_credentials;
  }
  if (
    lowerMessage.includes("already registered") ||
    lowerMessage.includes("exists")
  ) {
    if (lowerMessage.includes("email")) return ERROR_MAP.email_already_exists;
    if (lowerMessage.includes("phone")) return ERROR_MAP.phone_already_exists;
  }

  // Return the original message if it seems helpful, otherwise a generic one
  if (
    originalMessage.length < 100 &&
    !originalMessage.includes("Error") &&
    !originalMessage.includes("{")
  ) {
    return originalMessage;
  }

  return ERROR_MAP.server_error;
}
