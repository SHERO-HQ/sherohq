"use client";
import React from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useCheckout } from "../CheckoutContext";

export default function CheckoutStepDelivery() {
  const { formMethods: { register, formState: { errors } }, handleNext, handleBack } = useCheckout();

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
