"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations/checkout";
import { getGuestId } from "@/utils/guestSession";
import { saveOrderAccessToken } from "@/utils/orderAccess";
import {
  createOrder,
  initializePayment,
  getImageUrl,
  updateOrderPaymentMethod,
} from "@/services/api";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Truck,
  CreditCard,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Minus,
  Plus,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Wallet,
  Smartphone,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Store,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import OrderSummary from "./OrderSummary";
import PaymentFailureSupport from "./PaymentFailureSupport";
import AppImage from "@/components/common/AppImage";

const CheckoutFlow = () => {
  const router = useRouter();
  const {
    cart,
    updateQuantity,
    removeItem,
    totalPrice,
    totalQuantity,
    clearCart,
  } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();

  const [currentStep, setCurrentStep] = useState(1);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [confirmedTotal, setConfirmedTotal] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  const [paymentError, setPaymentError] = useState(false);
  const [isUpdatingOffline, setIsUpdatingOffline] = useState(false);
  useEffect(() => {
    if (currentStep >= 4) return;
    const timer = setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("shoro-ai-trigger", {
          detail: {
            message: `I've been on the ${steps[currentStep - 1].title} step for a while. I might need some help or clarification.`,
          },
        }),
      );
    }, 45000);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutInput>({
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
      },
      paymentMethod: "momo",
      referralCode: "",
    },
  });

  const paymentMethod = watch("paymentMethod");
  const email = watch("email");

  // Autofill shipping info for logged-in users
  useEffect(() => {
    if (isAuthenticated && user) {
      const nameParts = user.name?.split(" ") || [];
      setValue("email", user.email || "");
      setValue(
        "shippingAddress.firstName",
        user.shippingAddress?.firstName || nameParts[0] || "",
      );
      setValue(
        "shippingAddress.lastName",
        user.shippingAddress?.lastName || nameParts.slice(1).join(" ") || "",
      );
      setValue("shippingAddress.address", user.shippingAddress?.address || "");
      setValue("shippingAddress.city", user.shippingAddress?.city || "");
      setValue("shippingAddress.region", user.shippingAddress?.region || "");
      setValue(
        "shippingAddress.postalCode",
        user.shippingAddress?.postalCode || "",
      );
    }
  }, [isAuthenticated, user, setValue]);

  // Redirect if cart is empty (must be in useEffect to avoid setState during render)
  useEffect(() => {
    if (cart.length === 0 && currentStep < 4) {
      router.push("/products");
    }
  }, [cart.length, currentStep, router]);

  // Show nothing while redirecting
  if (cart.length === 0 && currentStep < 4) {
    return null;
  }

  // Calculate pricing
  const subtotal = totalPrice;
  const isFreeShipping = paymentMethod === "store_pickup" || subtotal > 500;
  const shipping = isFreeShipping ? 0 : 50;
  const tax = 0;
  const total = subtotal + shipping + tax;

  const steps = [
    { num: 1, title: "Cart Review", icon: ShoppingBag },
    { num: 2, title: "Shipping", icon: Truck },
    { num: 3, title: "Payment", icon: CreditCard },
    { num: 4, title: "Confirmation", icon: CheckCircle },
  ];

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

  const processPayment = async (orderId: string, method: string) => {
    try {
      const paymentResponse = await initializePayment(
        orderId,
        total,
        `Order #${orderId}`,
        method === "paystack" ? "paystack" : "hubtel",
      );

      if (paymentResponse.success && paymentResponse.checkoutUrl) {
        clearCart();
        window.location.href = paymentResponse.checkoutUrl;
      } else {
        setPaymentError(true);
        window.dispatchEvent(
          new CustomEvent("shoro-ai-trigger", {
            detail: {
              message:
                "I encountered a payment connection error during checkout. Can you help?",
            },
          }),
        );
      }
    } catch (error) {
      console.error("Payment initialization failed:", error);
      setPaymentError(true);
      window.dispatchEvent(
        new CustomEvent("shoro-ai-trigger", {
          detail: {
            message:
              "The payment system is busy and I cannot complete my order. What should I do?",
          },
        }),
      );
      addNotification(
        "Payment System Busy",
        "We couldn't connect to the payment provider. We've saved your order!",
        "warning",
      );
    }
  };

  const handleRetryPayment = async () => {
    if (!orderId) return;
    setIsSubmitting(true);
    setPaymentError(false);
    await processPayment(orderId, paymentMethod);
    setIsSubmitting(false);
  };

  const handleSwitchToOffline = async (method: "cod" | "store_pickup") => {
    if (!orderId) return;
    setIsUpdatingOffline(true);
    try {
      await updateOrderPaymentMethod(orderId, {
        paymentMethod: method === "cod" ? "cash_on_delivery" : "store_pickup",
      });

      setPaymentError(false);
      setCurrentStep(4);
      clearCart();
    } catch (error) {
      console.error("Failed to switch to offline payment:", error);
      addNotification(
        "Error",
        "Failed to update order. Please contact support.",
        "error",
      );
    } finally {
      setIsUpdatingOffline(false);
    }
  };

  const onSubmit = async (data: CheckoutInput) => {
    setIsSubmitting(true);
    setPaymentError(false);
    try {
      const guestId = getGuestId();
      const paymentMethodMap: Record<string, string> = {
        momo: "momo",
        card: "card",
        cod: "cash_on_delivery",
        store_pickup: "store_pickup",
        paystack: "paystack",
      };

      const response = await createOrder({
        guestId,
        items: cart.map((item) => ({ ...item })),
        total,
        shippingInfo: {
          ...data.shippingAddress,
          email: data.email,
          phone: data.phone,
        },
        paymentMethod: paymentMethodMap[data.paymentMethod],
        referralCode: data.referralCode,
        userId: user?.id,
      });

      if (response.success) {
        setOrderId(response.orderId);

        if (response.orderAccessToken) {
          saveOrderAccessToken(response.orderId, response.orderAccessToken);
        }

        setConfirmedTotal(response.total ?? total);

        if (["momo", "card", "paystack"].includes(data.paymentMethod)) {
          await processPayment(response.orderId, data.paymentMethod);
          return;
        }

        setCurrentStep(4);
        clearCart();
      }
    } catch (error) {
      console.error("Failed to place order:", error);
      addNotification(
        "Order Error",
        "Failed to place order. Please try again.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 pb-16">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps (Mobile) */}
        <div className="mb-8 sm:hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Step {currentStep} of {steps.length}
              </p>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {steps[currentStep - 1].title}
              </h2>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              {(() => {
                const Icon = steps[currentStep - 1].icon;
                return <Icon className="w-6 h-6" />;
              })()}
            </div>
          </div>
          {/* Progress Bar Line */}
          <div className="mt-4 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Progress Steps (Desktop) */}
        <div className="mb-12 hidden sm:block">
          <div className="max-w-4xl mx-auto relative px-4">
            {/* Progress Track & Line */}
            <div className="absolute top-6 left-6 right-6 h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 rounded-full">
              <div
                className="h-full bg-emerald-600 transition duration-300 rounded-full"
                style={{
                  width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                }}
              />
            </div>

            <div className="flex justify-between relative z-10">
              {steps.map((step) => {
                const Icon = step.icon;
                const isActive = currentStep === step.num;
                const isCompleted = currentStep > step.num;

                let stepBaseStyle =
                  "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400";
                if (isCompleted) {
                  stepBaseStyle =
                    "bg-emerald-600 border-emerald-600 text-white";
                } else if (isActive) {
                  stepBaseStyle =
                    "bg-emerald-600 border-emerald-100 dark:border-emerald-900/50 text-white shadow shadow-emerald-500/30";
                }

                return (
                  <div
                    key={step.num}
                    className="flex flex-col items-center gap-2 relative z-20 w-12"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition border-4 ${stepBaseStyle}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-sm font-medium whitespace-nowrap ${
                        isActive || isCompleted
                          ? "text-slate-900 dark:text-white"
                          : "text-slate-500"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Collapsible Order Summary */}
        <div className="lg:hidden mb-6 bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 -mx-4 px-4 sm:mx-0 sm:px-0 sm:border sm:rounded overflow-hidden">
          <button
            onClick={() => setShowMobileSummary(!showMobileSummary)}
            className="w-full py-2 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
              <ShoppingCart className="w-5 h-5" />
              <span>{showMobileSummary ? "Hide" : "Show"} Order Summary</span>
              {showMobileSummary ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-lg">
              GH₵{total.toFixed(2)}
            </span>
          </button>

          <AnimatePresence>
            {showMobileSummary && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pb-6 border-t border-slate-200 dark:border-slate-800 pt-4">
                  <OrderSummary
                    subtotal={subtotal}
                    shipping={shipping}
                    tax={tax}
                    total={total}
                    itemCount={totalQuantity}
                    className="p-0! border-0! shadow-none bg-transparent dark:bg-transparent"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Payment Failure Support View */}
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
                    onBack={() => {
                      setPaymentError(false);
                      setCurrentStep(3);
                    }}
                  />
                </motion.div>
              ) : (
                <>
                  {/* STEP 1: Cart Review */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 p-6"
                    >
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                        Review Your Cart
                      </h2>

                      <div className="space-y-4">
                        {cart.map((item) => (
                          <div key={item.id} className="space-y-2">
                            <div className="flex flex-row sm:flex-row gap-4 p-4 rounded border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors">
                              <div className="relative w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center overflow-hidden shrink-0">
                                {item.image &&
                                (item.image.startsWith("/uploads") ||
                                  item.image.startsWith("http")) ? (
                                  <AppImage
                                    src={getImageUrl(item.image)}
                                    alt={item.name}
                                    fill
                                    sizes="80px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="text-3xl">{item.image}</div>
                                )}
                              </div>

                              <div className="flex-1">
                                <h3 className="font-bold text-slate-900 dark:text-white">
                                  {item.name}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  {item.category}
                                </p>
                                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                                  GH₵{item.price}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 mt-2 sm:mt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-4 sm:pt-0">
                              <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded overflow-hidden">
                                <button
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="cursor-pointer p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="px-4 font-bold text-slate-900 dark:text-white">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, 1)}
                                  className="cursor-pointer p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="cursor-pointer text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm flex items-center gap-1"
                              >
                                <Trash2 className="w-4 h-4" />
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end mt-8">
                        <Button
                          onClick={handleNext}
                          variant="brand"
                          className="font-bold gap-2 px-8"
                        >
                          Continue to Shipping
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2: Shipping Information */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 p-6"
                    >
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                        Shipping Information
                      </h2>

                      <form className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Input
                            id="firstName"
                            label="First Name"
                            placeholder="John"
                            error={errors.shippingAddress?.firstName?.message}
                            {...register("shippingAddress.firstName")}
                          />
                          <Input
                            id="lastName"
                            label="Last Name"
                            placeholder="Doe"
                            error={errors.shippingAddress?.lastName?.message}
                            {...register("shippingAddress.lastName")}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Input
                            id="email"
                            type="email"
                            label="Email Address"
                            placeholder="john@example.com"
                            leftIcon={<Mail className="w-4 h-4" />}
                            error={errors.email?.message}
                            {...register("email")}
                          />
                          <Input
                            id="phone"
                            type="tel"
                            label="Phone Number"
                            placeholder="024 123 4567"
                            leftIcon={<Phone className="w-4 h-4" />}
                            error={errors.phone?.message}
                            {...register("phone")}
                          />
                        </div>

                        <Input
                          id="referralCode"
                          label="Referral Code (Phone Number) - Optional"
                          placeholder="024 123 4567"
                          leftIcon={<Phone className="w-4 h-4" />}
                          error={errors.referralCode?.message}
                          {...register("referralCode")}
                        />

                        <Input
                          id="address"
                          label="Street Address"
                          placeholder="123 Main Street"
                          leftIcon={<MapPin className="w-4 h-4" />}
                          error={errors.shippingAddress?.address?.message}
                          {...register("shippingAddress.address")}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Input
                            id="city"
                            label="City"
                            placeholder="Accra"
                            error={errors.shippingAddress?.city?.message}
                            {...register("shippingAddress.city")}
                          />
                          <Select
                            id="region"
                            label="Region"
                            error={errors.shippingAddress?.region?.message}
                            {...register("shippingAddress.region")}
                            options={[
                              { value: "", label: "Select Region" },
                              {
                                value: "Greater Accra",
                                label: "Greater Accra",
                              },
                              { value: "Ashanti", label: "Ashanti" },
                              { value: "Central", label: "Central" },
                              { value: "Eastern", label: "Eastern" },
                              { value: "Northern", label: "Northern" },
                              { value: "Western", label: "Western" },
                              { value: "Bono", label: "Bono" },
                              { value: "Bono East", label: "Bono East" },
                              { value: "Ahafo", label: "Ahafo" },
                              { value: "Upper East", label: "Upper East" },
                              { value: "Upper West", label: "Upper West" },
                              { value: "Savannah", label: "Savannah" },
                              { value: "North East", label: "North East" },
                              { value: "Oti", label: "Oti" },
                              { value: "Volta", label: "Volta" },
                              {
                                value: "Western North",
                                label: "Western North",
                              },
                            ]}
                          />
                        </div>
                      </form>

                      <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-4 mt-8">
                        <Button
                          onClick={handleBack}
                          variant="outline"
                          className="font-bold gap-2 px-8 border-slate-300 dark:border-slate-700"
                        >
                          <ChevronLeft className="w-5 h-5" />
                          Back to Cart
                        </Button>
                        <Button
                          onClick={handleNext}
                          variant="brand"
                          className="font-bold gap-2 px-8"
                        >
                          Continue to Payment
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3: Payment Method */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 p-6"
                    >
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                        Payment Method
                      </h2>

                      <div className="space-y-4">
                        {/* Store Pickup */}
                        <button
                          onClick={() =>
                            setValue("paymentMethod", "store_pickup")
                          }
                          className={`w-full p-3 sm:p-6 rounded border-2 transition-colors text-left ${
                            paymentMethod === "store_pickup"
                              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                              : "border-slate-200 dark:border-slate-800 hover:border-emerald-500"
                          }`}
                        >
                          <div className="cursor-pointer flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
                            <div
                              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 ${
                                paymentMethod === "store_pickup"
                                  ? "bg-emerald-600 text-white"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-600"
                              }`}
                            >
                              <Store className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">
                                Store Pickup
                              </h3>
                              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                                Pay upon pickup at our store
                              </p>
                            </div>
                          </div>
                        </button>

                        {/* Mobile Money */}
                        <button
                          onClick={() => setValue("paymentMethod", "momo")}
                          className={`w-full p-3 sm:p-6 rounded border-2 transition-colors text-left ${
                            paymentMethod === "momo"
                              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                              : "border-slate-200 dark:border-slate-800 hover:border-emerald-500"
                          }`}
                        >
                          <div className="cursor-pointer flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
                            <div
                              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 ${
                                paymentMethod === "momo"
                                  ? "bg-emerald-600 text-white"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-600"
                              }`}
                            >
                              <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">
                                Mobile Money
                              </h3>
                              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                                Pay with MTN or Telecel Cash
                              </p>
                            </div>
                          </div>
                        </button>

                        {/* Card Payment */}
                        <button
                          onClick={() => setValue("paymentMethod", "card")}
                          className={`w-full p-3 sm:p-6 rounded border-2 transition-colors text-left ${
                            paymentMethod === "card"
                              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                              : "border-slate-200 dark:border-slate-800 hover:border-emerald-500"
                          }`}
                        >
                          <div className="cursor-pointer flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
                            <div
                              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 ${
                                paymentMethod === "card"
                                  ? "bg-emerald-600 text-white"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-600"
                              }`}
                            >
                              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">
                                Credit / Debit Card
                              </h3>
                              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                                Visa, Mastercard
                              </p>
                            </div>
                          </div>
                        </button>

                        {/* Paystack */}
                        <button
                          onClick={() => setValue("paymentMethod", "paystack")}
                          className={`w-full p-3 sm:p-6 rounded border-2 transition-colors text-left ${
                            paymentMethod === "paystack"
                              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                              : "border-slate-200 dark:border-slate-800 hover:border-emerald-500"
                          }`}
                        >
                          <div className="cursor-pointer flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
                            <div
                              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 ${
                                paymentMethod === "paystack"
                                  ? "bg-emerald-600 text-white"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-600"
                              }`}
                            >
                              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">
                                Pay with Paystack
                              </h3>
                              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                                Generic Mobile Money & Card
                              </p>
                            </div>
                          </div>
                        </button>

                        {/* Cash on Delivery */}
                        <button
                          onClick={() => setValue("paymentMethod", "cod")}
                          className={`w-full p-3 sm:p-6 rounded border-2 transition-colors text-left ${
                            paymentMethod === "cod"
                              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                              : "border-slate-200 dark:border-slate-800 hover:border-emerald-500"
                          }`}
                        >
                          <div className="cursor-pointer flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
                            <div
                              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 ${
                                paymentMethod === "cod"
                                  ? "bg-emerald-600 text-white"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-600"
                              }`}
                            >
                              <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">
                                Cash on Delivery
                              </h3>
                              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                                Pay when you receive your order
                              </p>
                            </div>
                          </div>
                        </button>
                        {errors.paymentMethod && (
                          <p className="text-red-500 text-sm mt-2">
                            {errors.paymentMethod.message}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-4 mt-8">
                        <Button
                          onClick={handleBack}
                          variant="outline"
                          className="font-bold gap-2 px-8 border-slate-300 dark:border-slate-700"
                        >
                          <ChevronLeft className="w-5 h-5" />
                          Back
                        </Button>
                        <Button
                          onClick={handleSubmit(onSubmit)}
                          disabled={isSubmitting}
                          variant="brand"
                          className="font-bold gap-2 px-8"
                        >
                          {isSubmitting ? "Processing..." : "Place Order"}
                          <CheckCircle className="w-5 h-5" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 4: Order Confirmation */}
                  {currentStep === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 p-6 sm:p-12 text-center"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
                      >
                        <CheckCircle className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                      </motion.div>

                      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                        Order Confirmed!
                      </h2>
                      <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                        Thank you for your order! We've sent a confirmation
                        email to{" "}
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 block sm:inline wrap-break-word">
                          {email}
                        </span>
                      </p>

                      <div className="bg-slate-50 dark:bg-slate-950 rounded p-6 mb-8 max-w-md mx-auto">
                        {orderId && (
                          <div className="mb-4">
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                              Order ID
                            </p>
                            <p className="font-mono text-sm font-bold text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-800 px-3 py-2 rounded break-all">
                              {orderId}
                            </p>
                          </div>
                        )}
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          Order Total
                        </p>
                        <p className="text-2xl sm:text-4xl font-bold text-emerald-600 dark:text-emerald-400 wrap-break-word">
                          GH₵{confirmedTotal.toFixed(2)}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                          onClick={() => router.push("/products")}
                          variant="outline"
                          className="font-bold px-8 border-slate-300 dark:border-slate-700"
                        >
                          Continue Shopping
                        </Button>
                        <Button
                          onClick={() => router.push("/")}
                          variant="brand"
                          className="font-bold px-8"
                        >
                          Back to Home
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar / Feedback Prompt */}
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
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  Rate Your Experience
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
                  We'd love to hear your thoughts! Let us know how we can
                  improve.
                </p>
                <Button
                  onClick={() => router.push("/contact-us")}
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
};

export default CheckoutFlow;
