"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import OrderSummary from "./OrderSummary";
import PaymentFailureSupport from "./PaymentFailureSupport";
import { CheckoutProvider, useCheckout } from "./CheckoutContext";
import CheckoutProgress from "./CheckoutProgress";
import CheckoutStepCart from "./steps/CheckoutStepCart";
import CheckoutStepDelivery from "./steps/CheckoutStepDelivery";
import CheckoutStepPayment from "./steps/CheckoutStepPayment";
import CheckoutStepConfirmation from "./steps/CheckoutStepConfirmation";
import { createOrder, cancelOrder } from "@/services/api";
import { getGuestId } from "@/utils/guestSession";
import { saveOrderAccessToken } from "@/utils/orderAccess";
import { useNotifications } from "@/hooks/useNotifications";
import type { CheckoutInput } from "@/lib/validations/checkout";
import { useCart } from "@/context/CartContext";

const CHECKOUT_STEPS = [
  { num: 1, title: "Cart Review" },
  { num: 2, title: "Delivery Address" },
  { num: 3, title: "Payment" },
  { num: 4, title: "Confirmation" },
];

function CheckoutContent() {
  const router = useRouter();
  const { cart, totalQuantity } = useCart();
  const { addNotification } = useNotifications();
  const {
    currentStep, setCurrentStep,
    orderId, setOrderId,
    setConfirmedTotal,
    isSubmitting, setIsSubmitting,
    showMobileSummary, setShowMobileSummary,
    paymentError, setPaymentError,
    isUpdatingOffline,
    isRetryOrder, isRestoringRetry,
    processPayment, handleRetryPayment, handleSwitchToOffline,
    subtotal, shipping, tax, total
  } = useCheckout();

  useEffect(() => {
    if (cart.length === 0 && !orderId && !isRetryOrder && !isRestoringRetry && currentStep < 4) {
      addNotification("Empty Cart", "Your cart is empty. Please add items to checkout.", "warning");
      router.push("/products");
    }
  }, [cart.length, orderId, isRetryOrder, isRestoringRetry, currentStep, router, addNotification]);

  useEffect(() => {
    if (currentStep >= 4) return;
    const timer = setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("shoro-ai-trigger", {
          detail: {
            message: `I've been on the ${CHECKOUT_STEPS[currentStep - 1].title} step for a while. I might need some help or clarification.`}}),
      );
    }, 120000);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const onSubmit = async (data: CheckoutInput) => {
    setIsSubmitting(true);
    setPaymentError(false);

    try {
      const isOnline = data.paymentMethod === "card" || data.paymentMethod === "momo";

      const orderData = {
        guestId: getGuestId(),
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image})),
        total: total,
        shippingInfo: {
          firstName: data.shippingAddress.firstName,
          lastName: data.shippingAddress.lastName,
          email: data.email,
          phone: data.phone,
          address: data.shippingAddress.address,
          city: data.shippingAddress.city,
          region: data.shippingAddress.region,
          postalCode: data.shippingAddress.postalCode,
          gpsAddress: data.shippingAddress.gpsAddress,
          wantsWhatsAppUpdates: data.wantsWhatsAppUpdates},
        paymentMethod: data.paymentMethod,
        referralCode: data.referralCode};

      const result = await createOrder(orderData);
      
      setOrderId(result.orderId);
      setConfirmedTotal(result.total ?? 0);
      
      if (result.orderAccessToken) {
        saveOrderAccessToken(result.orderId, result.orderAccessToken);
      }

      if (isOnline) {
        await processPayment(result.orderId);
      } else {
        setCurrentStep(4);
      }
    } catch (error: any) {
      console.error("Order creation failed:", error);
      addNotification("Checkout Failed", error.message || "Failed to create order", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0 && !orderId && !isRetryOrder && !isRestoringRetry && currentStep < 4) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      {currentStep < 4 && !paymentError && <CheckoutProgress />}

      <div className="max-w-6xl mx-auto px-4">
        {currentStep < 4 && (
          <div className="mb-6 lg:hidden">
            <Button
              variant="outline"
              onClick={() => setShowMobileSummary(!showMobileSummary)}
              className="w-full flex items-center justify-between border-brand-secondary-200 dark:border-brand-secondary-900/50 bg-white dark:bg-slate-900 shadow-sm"
            >
              <div className="flex items-center gap-2 text-brand-secondary-600 dark:text-brand-secondary-400">
                <ShoppingCart className="w-5 h-5" />
                <span className="font-semibold">
                  {showMobileSummary ? "Hide Order Summary" : "Show Order Summary"}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-slate-900 dark:text-white">
                  GHS {total.toFixed(2)}
                </span>
                {showMobileSummary ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </div>
            </Button>
            
            <AnimatePresence>
              {showMobileSummary && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mt-4"
                >
                  <OrderSummary
                    subtotal={subtotal}
                    shipping={shipping}
                    tax={tax}
                    total={total}
                    itemCount={totalQuantity}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {paymentError && orderId ? (
                <motion.div
                  key="payment-error"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <PaymentFailureSupport
                    orderId={orderId}
                    amount={total}
                    onRetry={handleRetryPayment}
                    onSwitchToOffline={handleSwitchToOffline}
                    isUpdatingOffline={isUpdatingOffline}
                    onBack={async () => {
                      if (!isRetryOrder && orderId) {
                        try {
                          await cancelOrder(orderId);
                          addNotification("Order Cancelled", "Your pending order has been cancelled and stock restored.", "info");
                        } catch (error) {
                          console.error("Failed to cancel order on back:", error);
                        }
                      }
                      setOrderId(null);
                      setPaymentError(false);
                      setCurrentStep(3);
                    }}
                  />
                </motion.div>
              ) : (
                <>
                  {currentStep === 1 && <CheckoutStepCart />}
                  {currentStep === 2 && <CheckoutStepDelivery />}
                  {currentStep === 3 && <CheckoutStepPayment onSubmit={onSubmit} />}
                  {currentStep === 4 && <CheckoutStepConfirmation />}
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-1 hidden lg:block">
            {currentStep < 4 && (
              <OrderSummary
                subtotal={subtotal}
                shipping={shipping}
                tax={tax}
                total={total}
                itemCount={totalQuantity}
              />
            )}
            {currentStep === 4 && (
              <div className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 p-6 text-center">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                  Rate Your Experience
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
                  We'd love to hear your thoughts! Let us know how we can improve.
                </p>
                <Button
                  onClick={() => router.push("/feedback")}
                  variant="brand"
                  className="w-full font-bold px-8"
                >
                  Leave us a feedback
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutFlow() {
  return (
    <CheckoutProvider>
      <CheckoutContent />
    </CheckoutProvider>
  );
}
