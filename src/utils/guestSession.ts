import { v4 as uuidv4 } from "uuid";

const GUEST_ID_KEY = "sherotech_guest_id";

/**
 * Get or create a unique guest ID for the current visitor.
 * This ID is used to track orders without requiring user accounts.
 */
export function getGuestId(): string {
  // Check if we already have a guest ID
  let guestId = localStorage.getItem(GUEST_ID_KEY);

  if (!guestId) {
    // Generate a new UUID for this guest
    guestId = uuidv4();
    localStorage.setItem(GUEST_ID_KEY, guestId);
    console.log("🆕 New guest session created:", guestId);
  }

  return guestId;
}

/**
 * Clear the guest ID (useful for testing or after account creation)
 */
export function clearGuestId(): void {
  localStorage.removeItem(GUEST_ID_KEY);
}
