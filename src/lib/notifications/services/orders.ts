import { sendOrderConfirmation } from "./orders/sendOrderConfirmation";
import { sendOrderStatusUpdateNotification } from "./orders/sendOrderStatusUpdate";
import { sendPaymentFailureNotification } from "./orders/sendPaymentFailure";
import { sendReviewRequestNotification } from "./orders/sendReviewRequest";
import { sendPendingOrderReminderNotification } from "./orders/sendPendingOrderReminder";

export const ordersNotifications = {
  sendOrderConfirmation,
  sendOrderStatusUpdateNotification,
  sendPaymentFailureNotification,
  sendReviewRequestNotification,
  sendPendingOrderReminderNotification,
};
