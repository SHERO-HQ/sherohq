import { z } from "zod";

/** GhanaPost GPS format: 2 letters, dash, 3-4 digits, dash, 4 digits (e.g. GA-183-1892) */
const GPS_ADDRESS_REGEX = /^[A-Z]{2}-\d{3,4}-\d{4}$/i;

export const addressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  region: z.string().min(2, "Region is required"),
  postalCode: z.string().optional(),
  gpsAddress: z
    .string()
    .optional()
    .refine(
      (val) => !val || GPS_ADDRESS_REGEX.test(val),
      "Invalid GPS address format (e.g. GA-183-1892)",
    ),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .regex(/^0[25]\d{8}$/, "Invalid Ghana phone number (e.g., 0244123456)")
    .optional()
    .or(z.literal("")),
  shippingAddress: addressSchema.optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
