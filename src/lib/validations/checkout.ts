import { z } from "zod";
import { addressSchema } from "./profile";

export const checkoutSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^0[25]\d{8}$/, "Invalid Ghana phone number (e.g. 0244123456)"),
  shippingAddress: addressSchema,
  paymentMethod: z.enum(["momo", "card", "cod", "store_pickup", "paystack"], {
    message: "Please select a payment method",
  }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
