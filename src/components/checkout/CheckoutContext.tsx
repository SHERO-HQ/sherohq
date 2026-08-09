"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations/checkout";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useSearchParams } from "next/navigation";
import { getRetryOrderId } from "@/lib/checkoutRetry";
import { trackOrder, initializePayment, updateOrderPaymentMethod} from "@/services/api";
import { getOrderAccessToken } from "@/utils/orderAccess";
import { useNotifications } from "@/hooks/useNotifications";
import { displayOrderId } from "@/utils/orderId";

interface CheckoutContextValue {
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  orderId: string | null;
  setOrderId: React.Dispatch<React.SetStateAction<string | null>>;
  confirmedTotal: number;
  setConfirmedTotal: React.Dispatch<React.SetStateAction<number>>;
  isSubmitting: boolean;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  showMobileSummary: boolean;
  setShowMobileSummary: React.Dispatch<React.SetStateAction<boolean>>;
  paymentError: boolean;
  setPaymentError: React.Dispatch<React.SetStateAction<boolean>>;
  isUpdatingOffline: boolean;
  setIsUpdatingOffline: React.Dispatch<React.SetStateAction<boolean>>;
  isRestoringRetry: boolean;
  setIsRestoringRetry: React.Dispatch<React.SetStateAction<boolean>>;
  isRetryOrder: boolean;
  setIsRetryOrder: React.Dispatch<React.SetStateAction<boolean>>;
  formMethods: UseFormReturn<CheckoutInput>;
  processPayment: (orderId: string, amountOverride?: number, paymentMethodOverride?: string) => Promise<void>;
  handleRetryPayment: () => Promise<void>;
  handleSwitchToOffline: (method: "cod" | "store_pickup") => Promise<void>;
  handleNext: () => Promise<void>;
  handleBack: () => void;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  isFreeShipping: boolean;
}

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
};

export const CheckoutProvider = ({ children }: { children: ReactNode }) => {
  const searchParams = useSearchParams();
  const retryOrderId = getRetryOrderId(searchParams);
  const { cart, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();

  const [currentStep, setCurrentStep] = useState(1);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [confirmedTotal, setConfirmedTotal] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  const [paymentError, setPaymentError] = useState(false);
  const [isUpdatingOffline, setIsUpdatingOffline] = useState(false);
  const [isRestoringRetry, setIsRestoringRetry] = useState(false);
  const [isRetryOrder, setIsRetryOrder] = useState(false);

  const formMethods = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: "",
      shippingAddress: {
        firstName: "",
        lastName: "",
        address: "",
        city: "",
        region: "",
        postalCode: "",
        gpsAddress: ""},
      paymentMethod: "momo",
      referralCode: ""}});

  const { setValue, watch, trigger } = formMethods;
  const paymentMethod = watch("paymentMethod");

  // Autofill shipping info for logged-in users
  useEffect(() => {
    if (isAuthenticated && user) {
      const nameParts = user.name?.split(" ") || [];
      setValue("email", user.email || "");
      setValue("phone", user.phone || "");
      setValue("shippingAddress.firstName", user.shippingAddress?.firstName || nameParts[0] || "");
      setValue("shippingAddress.lastName", user.shippingAddress?.lastName || nameParts.slice(1).join(" ") || "");
      setValue("shippingAddress.address", user.shippingAddress?.address || "");
      setValue("shippingAddress.city", user.shippingAddress?.city || "");
      setValue("shippingAddress.region", user.shippingAddress?.region || "");
      setValue("shippingAddress.postalCode", user.shippingAddress?.postalCode || "");
      setValue("shippingAddress.gpsAddress", user.shippingAddress?.gpsAddress || "");
    }
  }, [isAuthenticated, user, setValue]);

  // Pricing
  const subtotal = totalPrice;
  const isFreeShipping = paymentMethod === "store_pickup" || subtotal > 500;
  const shipping = 0; // Auto shipping fee removed
  const tax = 0;
  const total = subtotal + shipping + tax;

  const processPayment = async (
    targetOrderId: string,
    amountOverride?: number,
    paymentMethodOverride?: string,
  ) => {
    try {
      const paymentAmount = amountOverride ?? total;
      const selectedPaymentMethod = paymentMethodOverride ?? paymentMethod;

      const provider =
        selectedPaymentMethod === "card"
          ? "paystack"
          : selectedPaymentMethod === "momo"
            ? "hubtel"
            : undefined;

      const paymentResponse = await initializePayment(
        targetOrderId,
        paymentAmount,
        `Order ${displayOrderId(targetOrderId)}`,
        provider,
      );

      const checkoutUrl = paymentResponse.checkoutUrl?.trim();
      const isSafeCheckoutUrl = Boolean(
        checkoutUrl && /^(https?:\/\/)/i.test(checkoutUrl),
      );

      if (paymentResponse.success && isSafeCheckoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        setPaymentError(true);
        window.dispatchEvent(
          new CustomEvent("shoro-ai-trigger", {
            detail: { message: "I encountered a payment connection error during checkout. Can you help?" }}),
        );
      }
    } catch (error) {
      console.error("[payment:processPayment]", { error });
      setPaymentError(true);
      window.dispatchEvent(
        new CustomEvent("shoro-ai-trigger", {
          detail: { message: "The payment system is busy and I cannot complete my order. What should I do?" }}),
      );
      addNotification("Payment System Busy", "We couldn't connect to the payment provider. We've saved your order!", "warning");
    }
  };

  const handleRetryPayment = async () => {
    if (!orderId) return;
    setIsSubmitting(true);
    setPaymentError(false);
    await processPayment(orderId);
    setIsSubmitting(false);
  };

  const handleSwitchToOffline = async (method: "cod" | "store_pickup") => {
    if (!orderId) return;
    setIsUpdatingOffline(true);
    try {
      await updateOrderPaymentMethod(orderId, {
        paymentMethod: method === "cod" ? "cash_on_delivery" : "store_pickup"});
      setPaymentError(false);
      setCurrentStep(4);
      clearCart();
    } catch (error) {
      console.error("Failed to switch to offline payment:", error);
      addNotification("Error", "Failed to update order. Please contact support.", "error");
    } finally {
      setIsUpdatingOffline(false);
    }
  };

  const validateStep = async (step: number) => {
    if (step === 2) {
      return await trigger([
        "email",
        "phone",
        "shippingAddress.firstName",
        "shippingAddress.lastName",
        "shippingAddress.address",
        "shippingAddress.city",
        "shippingAddress.region",
      ]);
    }
    if (step === 3) {
      return await trigger("paymentMethod");
    }
    return true;
  };

  const handleNext = async () => {
    if (await validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  useEffect(() => {
    if (!retryOrderId || isRestoringRetry) return;

    let isCancelled = false;

    const restoreRetryOrder = async () => {
      setIsRestoringRetry(true);
      setIsRetryOrder(true);
      setIsSubmitting(true);
      setPaymentError(false);

      try {
        const order = await trackOrder(
          retryOrderId,
          getOrderAccessToken(retryOrderId) || undefined,
        );

        if (isCancelled) return;

        setOrderId(order.id);
        setConfirmedTotal(order.total ?? 0);
        setCurrentStep(3);

        if (order.status !== "pending") {
          setPaymentError(true);
          return;
        }

        const shippingInfo = order.shippingInfo || {};
        setValue("email", shippingInfo.email || "");
        setValue("phone", shippingInfo.phone || "");
        setValue("shippingAddress.firstName", shippingInfo.firstName || "");
        setValue("shippingAddress.lastName", shippingInfo.lastName || "");
        setValue("shippingAddress.address", shippingInfo.address || "");
        setValue("shippingAddress.city", shippingInfo.city || "");
        setValue("shippingAddress.region", shippingInfo.region || "");
        setValue("shippingAddress.postalCode", shippingInfo.postalCode || "");
        setValue("shippingAddress.gpsAddress", shippingInfo.gpsAddress || "");

        const paymentMethodValue =
          order.paymentMethod === "cash_on_delivery"
            ? "cod"
            : order.paymentMethod === "store_pickup"
              ? "store_pickup"
              : order.paymentMethod === "card"
                ? "card"
                : "momo";
        setValue("paymentMethod", paymentMethodValue as CheckoutInput["paymentMethod"]);

        if (paymentMethodValue !== "momo" && paymentMethodValue !== "card") {
          setPaymentError(true);
          return;
        }

        await processPayment(order.id, order.total, paymentMethodValue);
      } catch (error) {
        console.error("Failed to restore retry order:", error);
        setPaymentError(true);
      } finally {
        if (!isCancelled) {
          setIsSubmitting(false);
          setIsRestoringRetry(false);
        }
      }
    };

    void restoreRetryOrder();
    return () => { isCancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryOrderId, setValue]);

  return (
    <CheckoutContext.Provider
      value={{
        currentStep, setCurrentStep,
        orderId, setOrderId,
        confirmedTotal, setConfirmedTotal,
        isSubmitting, setIsSubmitting,
        showMobileSummary, setShowMobileSummary,
        paymentError, setPaymentError,
        isUpdatingOffline, setIsUpdatingOffline,
        isRestoringRetry, setIsRestoringRetry,
        isRetryOrder, setIsRetryOrder,
        formMethods,
        processPayment, handleRetryPayment, handleSwitchToOffline,
        handleNext, handleBack,
        subtotal, shipping, tax, total, isFreeShipping}}
    >
      {children}
    </CheckoutContext.Provider>
  );
};
