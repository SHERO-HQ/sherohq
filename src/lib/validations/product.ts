import { z } from "zod";

export const specRowSchema = z.object({
  id: z.string(),
  key: z.string(),
  value: z.string(),
});

export const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().optional().nullable(),
  slug: z.string().optional().nullable(),
  category: z.string().min(1, "Please select a category"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  originalPrice: z.coerce.number().optional().nullable(),
  costPrice: z.coerce.number().min(0, "Cost Price cannot be negative"),
  image: z.string().optional().nullable(),
  images: z.array(z.string()).default([]),
  inStock: z.boolean().default(true),
  condition: z.enum(["New", "Used", "Refurbished"]).default("New"),
  stockQuantity: z.coerce.number().optional().nullable(),
  description: z.string().min(1, "Product description is required"),
  features: z.array(z.string()).default([]),
  specsList: z.array(specRowSchema).default([]),
  badge: z.string().optional().nullable(),
  isSpotlight: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
