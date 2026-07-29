"use client";
import React from "react";
import { useCheckout } from "./CheckoutContext";
import { ShoppingBag, Truck, CreditCard, CheckCircle } from "lucide-react";

export const CHECKOUT_STEPS = [
  { num: 1, title: "Cart Review", icon: ShoppingBag },
  { num: 2, title: "Delivery Address", icon: Truck },
  { num: 3, title: "Payment", icon: CreditCard },
  { num: 4, title: "Confirmation", icon: CheckCircle },
] as const;

export default function CheckoutProgress() {
  const { currentStep } = useCheckout();

  return (
    <>
      {/* Progress Steps (Mobile) */}
      <div className="mb-8 sm:hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-brand-secondary-600 dark:text-brand-secondary-400">
              Step {currentStep} of {CHECKOUT_STEPS.length}
            </p>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {CHECKOUT_STEPS[currentStep - 1]?.title}
            </h2>
          </div>
          <div className="w-12 h-12 rounded-full bg-brand-secondary-100 dark:bg-brand-secondary-900/30 flex items-center justify-center text-brand-secondary-600 dark:text-brand-secondary-400">
            {(() => {
              const Icon = CHECKOUT_STEPS[currentStep - 1]?.icon;
              return Icon ? <Icon className="w-6 h-6" /> : null;
            })()}
          </div>
        </div>
        {/* Progress Bar Line */}
        <div className="mt-4 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-secondary-600 rounded-full transition duration-300"
            style={{ width: `${(currentStep / CHECKOUT_STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Progress Steps (Desktop) */}
      <div className="mb-12 hidden sm:block">
        <div className="max-w-4xl mx-auto relative px-4">
          {/* Progress Track & Line */}
          <div className="absolute top-6 left-6 right-6 h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 rounded-full">
            <div
              className="h-full bg-brand-secondary-600 transition duration-300 rounded-full"
              style={{ width: `${((currentStep - 1) / (CHECKOUT_STEPS.length - 1)) * 100}%` }}
            />
          </div>

          <div className="flex justify-between relative z-10">
            {CHECKOUT_STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.num;
              const isCompleted = currentStep > step.num;

              let stepBaseStyle =
                "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400";
              if (isCompleted) {
                stepBaseStyle =
                  "bg-brand-secondary-600 border-brand-secondary-600 text-white";
              } else if (isActive) {
                stepBaseStyle =
                  "bg-brand-secondary-600 border-brand-secondary-100 dark:border-brand-secondary-900/50 text-white shadow shadow-brand-secondary-500/30";
              }

              return (
                <div key={step.num} className="flex flex-col items-center gap-2 relative z-20 w-12">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition border-4 ${stepBaseStyle}`}>
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
    </>
  );
}
