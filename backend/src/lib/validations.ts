import { z } from "zod";

export const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
export const pinCodeRegex = /^[1-9][0-9]{5}$/;

export const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters").max(100),
  customerPhone: z.string().regex(phoneRegex, "Please enter a valid 10-digit Indian phone number"),
  customerEmail: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  customerNote: z.string().max(500).optional(),
  shippingAddress: z.object({
    recipientName: z.string().min(2, "Recipient name is required"),
    phoneE164: z.string().regex(phoneRegex, "Valid contact number required"),
    addressLine1: z.string().min(5, "Flat/House/Street address required"),
    addressLine2: z.string().optional(),
    landmark: z.string().optional(),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    postalCode: z.string().regex(pinCodeRegex, "Valid 6-digit PIN code required"),
    countryCode: z.string().default("IN"),
  }),
  items: z.array(
    z.object({
      productId: z.string().min(1, "Product ID is required"),
      variantId: z.string().optional(),
      quantity: z.number().int().min(1, "Quantity must be at least 1"),
      personalisation: z.record(z.string(), z.any()).optional(),
    })
  ).min(1, "Cart cannot be empty"),
  paymentMethod: z.enum(["ONLINE", "COD"]),
  idempotencyKey: z.string().optional(),
});

export const customOrderRequestSchema = z.object({
  customerName: z.string().min(2, "Name is required").max(100),
  phoneE164: z.string().regex(phoneRegex, "Valid 10-digit phone number is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  occasion: z.string().max(100).optional(),
  budgetMinPaise: z.number().int().min(0).optional(),
  budgetMaxPaise: z.number().int().min(0).optional(),
  preferredColours: z.array(z.string()).default([]),
  description: z.string().min(10, "Please describe your custom gift idea (at least 10 characters)"),
  inspirationImageUrl: z.string().url().optional().or(z.literal("")),
  inspirationImagePublicId: z.string().optional(),
  requiredBy: z.string().optional(), // ISO date string
});

export const adminLoginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const productSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  name: z.string().min(2).max(160),
  slug: z.string().min(2).max(180),
  sku: z.string().optional(),
  shortDescription: z.string().max(300).default(""),
  description: z.string().default(""),
  basePricePaise: z.number().int().min(0, "Price must be >= 0"),
  currency: z.string().default("INR"),
  fulfilmentType: z.enum(["READY_STOCK", "MADE_TO_ORDER", "CUSTOM_ONLY"]),
  stockQuantity: z.number().int().min(0).optional(),
  preparationMinDays: z.number().int().min(0).optional(),
  preparationMaxDays: z.number().int().min(0).optional(),
  isPublished: z.boolean().default(false),
  images: z.array(
    z.object({
      imageUrl: z.string().url(),
      publicId: z.string().optional(),
      altText: z.string().default(""),
      sortOrder: z.number().default(0),
      isPrimary: z.boolean().default(false),
    })
  ).default([]),
  variants: z.array(
    z.object({
      name: z.string().min(1),
      sku: z.string().optional(),
      priceDeltaPaise: z.number().int().default(0),
      stockQuantity: z.number().int().min(0).optional(),
      isActive: z.boolean().default(true),
    })
  ).default([]),
  personalisationFields: z.array(
    z.object({
      fieldName: z.string(),
      fieldType: z.enum(["text", "textarea", "select"]).default("text"),
      label: z.string(),
      placeholder: z.string().optional(),
      options: z.array(z.string()).optional(),
      required: z.boolean().default(false),
      maxLength: z.number().optional(),
    })
  ).default([]),
  tags: z.array(z.string()).default([]),
  careInstructions: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(100),
  description: z.string().default(""),
  imageUrl: z.string().default(""),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});

export const updateOrderStatusSchema = z.object({
  status: z.string().min(1),
  note: z.string().optional(),
  trackingCarrier: z.string().optional(),
  trackingNumber: z.string().optional(),
});

export const manualOrderSchema = z.object({
  source: z.enum(["WEBSITE", "INSTAGRAM", "WHATSAPP", "MANUAL"]),
  customerName: z.string().min(2),
  customerPhone: z.string().regex(phoneRegex),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerNote: z.string().optional(),
  shippingAddress: z.object({
    recipientName: z.string().min(2),
    phoneE164: z.string().regex(phoneRegex),
    addressLine1: z.string().min(5),
    addressLine2: z.string().optional(),
    landmark: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    postalCode: z.string().regex(pinCodeRegex),
    countryCode: z.string().default("IN"),
  }),
  items: z.array(
    z.object({
      productName: z.string().min(1),
      sku: z.string().optional(),
      unitPricePaise: z.number().int().min(0),
      quantity: z.number().int().min(1),
      personalisation: z.record(z.string(), z.any()).optional(),
    })
  ).min(1),
  shippingPaise: z.number().int().min(0).default(0),
  discountPaise: z.number().int().min(0).default(0),
  paymentStatus: z.enum(["UNPAID", "PENDING", "PAID", "COD_DUE"]).default("UNPAID"),
});

export const updateCustomRequestSchema = z.object({
  status: z.enum([
    "SUBMITTED", "UNDER_REVIEW", "NEEDS_INFORMATION", "QUOTED",
    "ACCEPTED", "DECLINED", "CLOSED", "CONVERTED"
  ]).optional(),
  quotePaise: z.number().int().min(0).optional(),
  quoteValidUntil: z.string().optional(),
  adminNotes: z.string().optional(),
});

