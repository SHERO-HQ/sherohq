import { z } from "zod";

// ============ User & Auth Schemas ============

export const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(
      /[@$!%*?&#]/,
      "Password must contain at least one special character",
    ),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  phone: z
    .string()
    .regex(
      /^(02|05)\d{8}$/,
      "Invalid Ghana phone number. Must start with 02 or 05 and be 10 digits",
    )
    .optional(),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z
    .string()
    .regex(/^(02|05)\d{8}$/, "Invalid Ghana phone number")
    .optional(),
  shippingAddress: z
    .object({
      firstName: z.string().min(1).max(50),
      lastName: z.string().min(1).max(50),
      address: z.string().min(5).max(200),
      city: z.string().min(1).max(50),
      region: z.string().min(1).max(50),
      postalCode: z.string().optional(),
    })
    .optional(),
});

export const VerifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

export const ResendVerificationSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const UpdateAvatarSchema = z.object({
  avatarUrl: z.string().url("Invalid URL"),
});

// ============ Admin Auth Schemas ============

export const AdminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const AdminRegisterSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[a-z]/, "Must contain lowercase")
    .regex(/\d/, "Must contain number"),
  phone: z
    .string()
    .regex(/^(02|05)\d{8}$/, "Invalid Ghana phone number")
    .optional(),
  role: z
    .enum(["admin", "superadmin", "manager", "attendant", "clerk"])
    .default("admin"),
});

export const AdminUpdateProfileSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  email: z.string().email().optional(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/\d/)
    .optional(),
  phone: z
    .string()
    .regex(/^(02|05)\d{8}$/, "Invalid Ghana phone number")
    .optional(),
  avatar: z.string().url().optional(),
});

// ============ Shipping & Address Schemas ============

export const ShippingInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^(02|05)\d{8}$/, "Invalid Ghana phone number"),
  address: z.string().min(5, "Address must be at least 5 characters").max(200),
  city: z.string().min(1, "City is required").max(50),
  region: z.string().min(1, "Region is required").max(50),
  postalCode: z.string().max(20).optional(),
});

// ============ Order Schemas ============

export const OrderItemSchema = z.object({
  id: z.string().uuid("Invalid product ID"),
  name: z.string().min(1),
  price: z.number().positive("Price must be positive"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  image: z.string().url().optional(),
});

export const CreateOrderSchema = z.object({
  guestId: z.string().optional(),
  items: z
    .array(OrderItemSchema)
    .min(1, "Order must contain at least one item")
    .max(50, "Too many items in order"),
  total: z.number().positive("Total must be positive"),
  shippingInfo: ShippingInfoSchema,
  paymentMethod: z.enum(
    [
      "card",
      "momo",
      "cash",
      "cod",
      "cash_on_delivery",
      "paystack",
      "store_pickup",
      "invoice_payment",
    ],
    {
      message: "Invalid payment method",
    },
  ),
});

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(
    ["pending", "processing", "shipped", "delivered", "cancelled", "quote"],
    {
      message: "Invalid order status",
    },
  ),
});

// ============ Product Schemas ============

export const CreateProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200),
  price: z.number().positive("Price must be positive"),
  originalPrice: z.number().positive().optional(),
  category: z.string().uuid("Invalid category ID"),
  description: z.string().max(5000).optional(),
  image: z.string().url("Invalid image URL").optional(),
  images: z
    .array(z.string().url())
    .max(10, "Maximum 10 images allowed")
    .optional(),
  stockQuantity: z
    .number()
    .int()
    .nonnegative("Stock quantity cannot be negative"),
  inStock: z.boolean(),
  badge: z.string().max(50).optional(),
  features: z.record(z.string(), z.string()).optional(),
  specifications: z.record(z.string(), z.string()).optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export const ProductQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().max(200).optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().positive().optional(),
  inStock: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).default(50).optional(),
  offset: z.number().int().nonnegative().default(0).optional(),
});

// ============ Category Schemas ============

export const CreateCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100),
  icon: z.string().max(50).optional(),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();

// ============ Review Schemas ============

export const CreateReviewSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  userName: z.string().min(1, "Name is required").max(100),
  rating: z
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
  comment: z.string().max(1000, "Comment is too long").optional(),
});

export const UpdateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(1000).optional(),
});

// ============ Payment Schemas ============

export const InitializePaymentSchema = z.object({
  orderId: z.string().uuid("Invalid order ID"),
  totalAmount: z.number().positive("Amount must be positive"),
  description: z.string().max(200).optional(),
  provider: z.enum(["paystack", "hubtel"]).default("paystack"),
});

// ============ Support & Inquiry Schemas ============

export const CreateTicketSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .regex(/^(02|05)\d{8}$/)
    .optional(),
  subject: z.string().min(1, "Subject is required").max(200),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000),
  category: z.enum(["technical", "billing", "general", "product"]),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  productId: z.string().uuid().optional(),
});

export const UpdateTicketSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

export const CreateInquirySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1).max(200).optional(),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000),
});

export const CreateConsultationSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .regex(/^(02|05)\d{8}$/, "Invalid Ghana phone number")
    .optional(),
  service: z.string().min(1, "Service is required").max(200),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  message: z.string().max(1000).optional(),
});

export const NewsletterSubscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1).max(100).optional(),
  source: z.string().min(1).max(50).optional(),
});

export const NewsletterCampaignSchema = z.object({
  subject: z.string().min(3, "Subject is required").max(200),
  content: z.string().min(10, "Content must be at least 10 characters"),
  testEmail: z.string().email("Invalid test email").optional(),
  batchSize: z.number().int().min(1).max(500).optional(),
  sendDelayMs: z.number().int().min(0).max(10000).optional(),
  limit: z.number().int().min(1).max(50000).optional(),
});

export const ChangePasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(
      /[@$!%*?&#]/,
      "Password must contain at least one special character",
    ),
});

// ============ Guide Schemas ============

export const CreateGuideSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  summary: z.string().max(500).optional(),
  category: z.enum([
    "hardware",
    "software",
    "troubleshooting",
    "setup",
    "maintenance",
  ]),
  coverImage: z.string().url().optional(),
  published: z.boolean().default(false),
});

export const UpdateGuideSchema = CreateGuideSchema.partial();

// ============ Project Schemas ============

export const CreateProjectSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  category: z.string().min(1).max(100),
  client: z.string().max(100).optional(),
  description: z.string().max(1000).optional(),
  useCase: z.string().max(1000).optional(),
  technologies: z.array(z.string()).max(20).optional(),
  image: z.string().url().optional(),
  link: z.string().url().optional(),
});

export const UpdateProjectSchema = CreateProjectSchema.partial();

// ============ Team Member Schemas ============

export const CreateTeamMemberSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  role: z.string().min(1, "Role is required").max(100),
  bio: z.string().max(500).optional(),
  image: z.string().url().optional(),
  social: z
    .object({
      twitter: z.string().url().optional(),
      linkedin: z.string().url().optional(),
      github: z.string().url().optional(),
    })
    .optional(),
  order: z.number().int().nonnegative().default(0),
});

export const UpdateTeamMemberSchema = CreateTeamMemberSchema.partial();

// ============ Testimonial Schemas ============

export const CreateTestimonialSchema = z.object({
  quote: z.string().min(10, "Quote must be at least 10 characters").max(500),
  author: z.string().min(1, "Author name is required").max(100),
  role: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
  image: z.string().url().optional(),
  order: z.number().int().nonnegative().default(0),
  active: z.boolean().default(true),
});

export const UpdateTestimonialSchema = CreateTestimonialSchema.partial();

// ============ Stats Schemas ============

export const CreateStatSchema = z.object({
  label: z.string().min(1, "Label is required").max(100),
  value: z.string().min(1, "Value is required").max(50),
  suffix: z.string().max(20).optional(),
  prefix: z.string().max(20).optional(),
  icon: z.string().max(50).optional(),
  color: z.string().max(50).optional(),
  order: z.number().int().nonnegative().default(0),
});

export const UpdateStatSchema = CreateStatSchema.partial();

// ============ Upload Schemas ============

export const UploadImageSchema = z.object({
  image: z.any(), // Multer handles file validation
});

// ============ Pagination & Query Schemas ============

export const PaginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().nonnegative().default(0),
});

export const DateRangeSchema = z.object({
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional(),
});

// ============ ID Parameter Schemas ============

export const UUIDParamSchema = z.object({
  id: z.string().uuid("Invalid ID format"),
});

export const SlugParamSchema = z.object({
  slug: z.string().min(1).max(200),
});

// Type exports for use in route handlers
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;
export type ShippingInfo = z.infer<typeof ShippingInfoSchema>;
export type CreateTicketInput = z.infer<typeof CreateTicketSchema>;
export type CreateGuideInput = z.infer<typeof CreateGuideSchema>;
export type AdminLoginInput = z.infer<typeof AdminLoginSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type CreateConsultationInput = z.infer<typeof CreateConsultationSchema>;
export type CreateInquiryInput = z.infer<typeof CreateInquirySchema>;
