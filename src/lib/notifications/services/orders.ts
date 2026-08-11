import { sendOrderConfirmation } from "./orders/sendOrderConfirmation";
import { sendOrderStatusUpdateNotification } from "./orders/sendOrderStatusUpdate";
import { sendPaymentFailureNotification } from "./orders/sendPaymentFailure";
import { sendReviewRequestNotification } from "./orders/sendReviewRequest";

export const ordersNotifications = {
  sendOrderConfirmation,
  sendOrderStatusUpdateNotification,
  sendPaymentFailureNotification,
  sendReviewRequestNotification,
};
