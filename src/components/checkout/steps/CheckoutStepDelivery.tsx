"use client";
import React from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useCheckout } from "../CheckoutContext";

export default function CheckoutStepDelivery() {
  const { formMethods: { register, watch, formState: { errors } }, handleNext, handleBack } = useCheckout();

  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 p-6"
    >
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        Delivery Details
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
            placeholder="john@shero.com"
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

        <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-200 dark:border-slate-700">
          <div className="flex items-center h-5">
            <input
              id="wantsWhatsAppUpdates"
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 text-brand-secondary-600 focus:ring-brand-secondary-600 dark:border-slate-600 dark:bg-slate-900"
              {...register("wantsWhatsAppUpdates")}
            />
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="wantsWhatsAppUpdates"
              className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-green-500" />
              Get order updates on WhatsApp
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              We'll send you tracking info and updates to this phone number.
            </p>
          </div>
        </div>

        <Input
          id="referralCode"
          label="Referral Code (Phone Number) - Optional"
          placeholder="024 123 4567"
          leftIcon={<Phone className="w-4 h-4" />}
          error={errors.referralCode?.message}
          {...register("referralCode")}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="address"
            label="Street Address"
            placeholder="123 Main Street"
            leftIcon={<MapPin className="w-4 h-4" />}
            error={errors.shippingAddress?.address?.message}
            {...register("shippingAddress.address")}
          />
          <Input
            id="gpsAddress"
            label="GhanaPost GPS Address (Optional)"
            placeholder="e.g. GA-183-1892"
            leftIcon={<MapPin className="w-4 h-4" />}
            error={errors.shippingAddress?.gpsAddress?.message}
            {...register("shippingAddress.gpsAddress")}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="city"
            label="City"
            placeholder="Accra"
            error={errors.shippingAddress?.city?.message}
            {...register("shippingAddress.city")}
          />
          <div className="space-y-1">
            <Select
              id="region"
              label="Region"
              error={errors.shippingAddress?.region?.message}
              {...register("shippingAddress.region")}
              options={[
                { value: "", label: "Select Region" },
                { value: "Greater Accra", label: "Greater Accra" },
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
                { value: "Western North", label: "Western North" },
              ]}
            />
            {watch("shippingAddress.region") && (
              <p className="text-xs text-brand-secondary-600 dark:text-brand-secondary-400 font-medium px-1">
                Estimated Delivery: {
                  watch("shippingAddress.region") === "Greater Accra" ? "24–48 hours" :
                    ["Ashanti", "Central", "Eastern"].includes(watch("shippingAddress.region") || "") ? "2-3 days" :
                      ["Western", "Bono", "Bono East", "Ahafo", "Volta", "Oti"].includes(watch("shippingAddress.region") || "") ? "3-5 days" :
                        "4-7 days"
                }
              </p>
            )}
          </div>
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
  );
}
