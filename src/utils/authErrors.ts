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

function getSubstringError(lowerMessage: string): string | null {
  if (
    lowerMessage.includes("credential") ||
    lowerMessage.includes("invalid username") ||
    lowerMessage.includes("invalid password") ||
    lowerMessage.includes("incorrect password") ||
    lowerMessage.includes("user not found") ||
    lowerMessage.includes("admin not found") ||
    lowerMessage.includes("invalid email")
  ) {
    return "Invalid email/username or password. Please try again.";
  }
  if (
    lowerMessage.includes("locked") ||
    lowerMessage.includes("too many failed") ||
    lowerMessage.includes("rate limit")
  ) {
    return "Too many failed attempts. Please wait a few minutes before trying again.";
  }
  if (lowerMessage.includes("deactivated") || lowerMessage.includes("disabled")) {
    return "Your account has been disabled. Please contact support.";
  }
  if (
    lowerMessage.includes("already registered") ||
    lowerMessage.includes("exists")
  ) {
    if (lowerMessage.includes("email")) return ERROR_MAP.email_already_exists;
    if (lowerMessage.includes("phone")) return ERROR_MAP.phone_already_exists;
  }
  return null;
}

function mapErrorToMessage(lowerMessage: string): string | null {
  for (const [key, value] of Object.entries(ERROR_MAP)) {
    if (lowerMessage.includes(key.toLowerCase())) return value;
  }
  return null;
}

/**
 * Normalizes an error string or Error object into a user-friendly message.
 */
export function formatAuthError(error: unknown): string {
  if (!error) return "An unknown error occurred.";

  let originalMessage = "";
  if (error instanceof Error) {
    originalMessage = error.message;
  } else if (typeof error === "object" && error !== null) {
    const errObj = error as Record<string, unknown>;
    originalMessage = String(
      errObj.message || errObj.error || JSON.stringify(error),
    );
  } else {
    originalMessage = String(error);
  }

  const lowerMessage = originalMessage.toLowerCase();
  const directMatch = mapErrorToMessage(lowerMessage);
  if (directMatch) return directMatch;

  const substringError = getSubstringError(lowerMessage);
  if (substringError) return substringError;

  // Return the original message if it seems helpful
  if (
    originalMessage.length < 150 &&
    !originalMessage.includes("{") &&
    !originalMessage.includes("<!doctype")
  ) {
    if (lowerMessage.includes("failed to fetch") || lowerMessage.includes("networkerror")) {
      return "Network Error: Could not reach the server. Please check your internet connection or if the backend service is running.";
    }
    return originalMessage;
  }

  return ERROR_MAP.server_error;
}
