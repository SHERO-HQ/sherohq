import { useState } from "react";
import type { User } from "@/services/api";
import type { ProfileInput } from "@/lib/validations/profile";

export const useProfileForm = (
  user: User | null,
  updateProfile: (data: {
    name?: string;
    phone?: string;
    shippingAddress?: import("@/services/api").ShippingAddress | null;
  }) => Promise<void>,
  refreshUser: () => Promise<void>,
) => {
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const handleSaveProfile = async (data: ProfileInput) => {
    if (!user) return;

    setSaving(true);
    setSaveMessage("");

    try {
      await updateProfile({
        name: data.name,
        phone: data.phone || undefined,
        shippingAddress: data.shippingAddress
          ? {
              firstName: data.shippingAddress.firstName,
              lastName: data.shippingAddress.lastName,
              address: data.shippingAddress.address,
              city: data.shippingAddress.city,
              region: data.shippingAddress.region,
              postalCode: data.shippingAddress.postalCode || undefined,
            }
          : undefined,
      });

      setSaveMessage("Profile updated successfully!");
      await refreshUser();
    } catch (err: unknown) {
      setSaveMessage(
        err instanceof Error ? err.message : "Failed to update profile",
      );
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    saveMessage,
    handleSaveProfile,
  };
};
