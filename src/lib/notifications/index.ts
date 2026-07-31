import { adminNotifications } from "./services/admin";
import { authNotifications } from "./services/auth";
import { consultationsNotifications } from "./services/consultations";
import { inquiriesNotifications } from "./services/inquiries";
import { marketingNotifications } from "./services/marketing";
import { ordersNotifications } from "./services/orders";
import { supportNotifications } from "./services/support";

export * from "./types";

export const notificationService = {
  ...adminNotifications,
  ...authNotifications,
  ...consultationsNotifications,
  ...inquiriesNotifications,
  ...marketingNotifications,
  ...ordersNotifications,
  ...supportNotifications,
};
