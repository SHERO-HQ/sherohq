"use client";
import React from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useCheckout } from "../CheckoutContext";
import { GHANA_REGIONS, getCitiesForRegion, getDeliveryEstimate } from "@/lib/ghana-locations";

export default function CheckoutStepDelivery() {
  const { formMethods: { register, watch, setValue, formState: { errors } }, handleNext, handleBack } = useCheckout();

  const selectedRegion = watch("shippingAddress.region");
  const cities = getCitiesForRegion(selectedRegion || "");
  const deliveryEstimate = getDeliveryEstimate(selectedRegion || "");
  const [isOtherCity, setIsOtherCity] = React.useState(false);

  // Reset city when region changes (if current city isn't in new region's list)
  React.useEffect(() => {
    const currentCity = watch("shippingAddress.city");
    if (selectedRegion && currentCity && cities.length > 0 && !cities.includes(currentCity)) {
      setValue("shippingAddress.city", "");
      setIsOtherCity(false);
    }
  }, [selectedRegion, cities, setValue, watch]);

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

        {/* Region → City cascading dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Select
              id="region"
              label="Region"
              error={errors.shippingAddress?.region?.message}
              {...register("shippingAddress.region")}
              options={[
                { value: "", label: "Select Region" },
                ...GHANA_REGIONS.map((r) => ({ value: r.value, label: r.label })),
              ]}
            />
            {deliveryEstimate && (
              <p className="text-xs text-brand-secondary-600 dark:text-brand-secondary-400 font-medium px-1">
                Estimated Delivery: {deliveryEstimate}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Select
              id="city"
              label="City / Town"
              error={!isOtherCity ? errors.shippingAddress?.city?.message : undefined}
              value={isOtherCity ? "__other__" : watch("shippingAddress.city") || ""}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "__other__") {
                  setIsOtherCity(true);
                  setValue("shippingAddress.city", "");
                } else {
                  setIsOtherCity(false);
                  setValue("shippingAddress.city", val);
                }
              }}
              disabled={!selectedRegion}
              options={[
                { value: "", label: selectedRegion ? "Select City / Town" : "Select a region first" },
                ...cities.map((c) => ({ value: c, label: c })),
                ...(selectedRegion ? [{ value: "__other__", label: "Other (type your town)" }] : []),
              ]}
            />
            {isOtherCity && (
              <Input
                id="cityOther"
                placeholder="Enter your city or town"
                error={errors.shippingAddress?.city?.message}
                {...register("shippingAddress.city")}
                autoFocus
              />
            )}
            {!selectedRegion && (
              <p className="text-xs text-slate-400 dark:text-slate-500 px-1">
                Select a region to see available cities
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="address"
            label="Street Address / Landmark"
            placeholder="123 Main Street, Near Central Mosque"
            leftIcon={<MapPin className="w-4 h-4" />}
            error={errors.shippingAddress?.address?.message}
            {...register("shippingAddress.address")}
          />
          <div className="space-y-1">
            <Input
              id="gpsAddress"
              label="GhanaPost GPS Address (Optional)"
              placeholder="e.g. GA-183-1892"
              leftIcon={<MapPin className="w-4 h-4" />}
              error={errors.shippingAddress?.gpsAddress?.message}
              {...register("shippingAddress.gpsAddress")}
            />
            <p className="text-xs text-slate-400 dark:text-slate-500 px-1">
              Format: XX-XXXX-XXXX (e.g. GA-183-1892)
            </p>
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
