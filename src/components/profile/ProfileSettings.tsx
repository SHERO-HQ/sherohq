"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileInput } from "@/lib/validations/profile";
import { User as UserIcon, MapPin, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { User } from "@/services/api";

interface ProfileSettingsProps {
  user: User;
  saving: boolean;
  saveMessage: string;
  onSubmit: (data: ProfileInput) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  user,
  saving,
  saveMessage,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
      phone: user.phone || "",
      shippingAddress: {
        firstName: user.shippingAddress?.firstName || "",
        lastName: user.shippingAddress?.lastName || "",
        address: user.shippingAddress?.address || "",
        city: user.shippingAddress?.city || "",
        region: user.shippingAddress?.region || "",
        postalCode: user.shippingAddress?.postalCode || "",
      },
    },
  });

  // Update form when user data changes (e.g. after successful save or fetch)
  useEffect(() => {
    reset({
      name: user.name || "",
      phone: user.phone || "",
      shippingAddress: {
        firstName: user.shippingAddress?.firstName || "",
        lastName: user.shippingAddress?.lastName || "",
        address: user.shippingAddress?.address || "",
        city: user.shippingAddress?.city || "",
        region: user.shippingAddress?.region || "",
        postalCode: user.shippingAddress?.postalCode || "",
      },
    });
  }, [user, reset]);
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Personal Information */}
      <div className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-emerald-500" />
          Personal Information
        </h3>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="sm:col-span-2">
            <Input
              id="fullName"
              label="Full Name"
              error={errors.name?.message}
              {...register("name")}
            />
          </div>
          <Input
            id="email"
            label="Email Address"
            value={user.email}
            disabled
            rightIcon={<Mail className="w-5 h-5" />}
          />
          <Input
            id="phone"
            label="Phone Number"
            type="tel"
            placeholder="0244123456"
            error={errors.phone?.message}
            {...register("phone")}
          />
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-500" />
          Default Shipping Address
        </h3>
        <div className="grid sm:grid-cols-2 gap-6">
          <Input
            id="firstName"
            label="First Name"
            error={errors.shippingAddress?.firstName?.message}
            {...register("shippingAddress.firstName")}
          />
          <Input
            id="lastName"
            label="Last Name"
            error={errors.shippingAddress?.lastName?.message}
            {...register("shippingAddress.lastName")}
          />
          <div className="sm:col-span-2">
            <Input
              id="streetAddress"
              label="Street Address"
              placeholder="e.g., 123 Main Street"
              error={errors.shippingAddress?.address?.message}
              {...register("shippingAddress.address")}
            />
          </div>
          <Input
            id="city"
            label="City"
            placeholder="e.g., Accra"
            error={errors.shippingAddress?.city?.message}
            {...register("shippingAddress.city")}
          />
          <div>
            <Select
              id="region"
              label="Region"
              error={errors.shippingAddress?.region?.message}
              {...register("shippingAddress.region")}
              options={[
                { value: "", label: "Select Region" },
                { value: "Greater Accra", label: "Greater Accra" },
                { value: "Ashanti", label: "Ashanti" },
                { value: "Western", label: "Western" },
                { value: "Eastern", label: "Eastern" },
                { value: "Central", label: "Central" },
                { value: "Volta", label: "Volta" },
                { value: "Northern", label: "Northern" },
                { value: "Upper East", label: "Upper East" },
                { value: "Upper West", label: "Upper West" },
                { value: "Bono", label: "Bono" },
                { value: "Bono East", label: "Bono East" },
                { value: "Ahafo", label: "Ahafo" },
                { value: "Oti", label: "Oti" },
                { value: "Savannah", label: "Savannah" },
                { value: "North East", label: "North East" },
                { value: "Western North", label: "Western North" },
              ]}
            />
          </div>
          <Input
            id="postalCode"
            label="GPS/Postal Code (Optional)"
            placeholder="e.g., GA-123-4567"
            error={errors.shippingAddress?.postalCode?.message}
            {...register("shippingAddress.postalCode")}
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        {saveMessage && (
          <p
            className={`text-sm ${
              saveMessage.includes("success")
                ? "text-emerald-600"
                : "text-red-600"
            }`}
          >
            {saveMessage}
          </p>
        )}
        <Button
          type="submit"
          variant="brand"
          disabled={saving}
          className="ml-auto font-bold px-8 h-10"
        >
          {saving ? (
            <span className="flex items-center gap-2">Saving...</span>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
};

export default ProfileSettings;
