import { z } from "zod";

const trimmedText = (minimum: number, maximum: number) =>
  z.string().trim().min(minimum).max(maximum);

export const editionIdSchema = z.enum(["digital", "paperback"]);

export const checkoutSchema = z
  .object({
    edition: editionIdSchema,
    acceptedTerms: z.literal(true),
    email: z.string().trim().email().max(254),
    name: trimmedText(2, 100),
    phone: z.string().trim().max(30).optional().default(""),
    country: z.string().trim().max(100).optional().default(""),
    state: z.string().trim().max(100).optional().default(""),
    city: z.string().trim().max(100).optional().default(""),
    address: z.string().trim().max(500).optional().default(""),
    marketingConsent: z.boolean().default(false),
    attribution: z
      .object({
        source: z.string().trim().max(120).optional(),
        medium: z.string().trim().max(120).optional(),
        campaign: z.string().trim().max(160).optional(),
        content: z.string().trim().max(160).optional(),
        term: z.string().trim().max(160).optional(),
        referrer: z.string().trim().url().max(500).optional(),
        landingPage: z.string().trim().max(500).optional(),
      })
      .optional(),
  })
  .superRefine((value, context) => {
    if (value.edition !== "paperback") return;

    if (!value.phone) {
      context.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Phone number is required.",
      });
    }
    for (const field of ["country", "state", "city"] as const) {
      if (!value[field]) {
        context.addIssue({
          code: "custom",
          path: [field],
          message: `${field[0].toUpperCase()}${field.slice(1)} is required.`,
        });
      }
    }
    if (!value.address) {
      context.addIssue({
        code: "custom",
        path: ["address"],
        message: "Street address is required.",
      });
    }
  });

export const reviewSubmissionSchema = z.object({
  name: trimmedText(2, 100),
  email: z.string().trim().email().max(254),
  rating: z.coerce.number().int().min(1).max(5),
  comment: trimmedText(20, 1200),
});

export const sessionSchema = z.object({
  idToken: z.string().min(100),
  remember: z.boolean().default(false),
});

export const fulfillmentUpdateSchema = z.object({
  status: z.enum([
    "unfulfilled",
    "processing",
    "fulfilled",
    "preorder_received",
    "printing",
    "ready_for_dispatch",
    "dispatched",
    "delivered",
    "cancelled",
  ]),
  trackingNumber: z.string().trim().max(120).optional().default(""),
  note: z.string().trim().max(500).optional().default(""),
});

export const reviewModerationSchema = z.object({
  status: z.enum(["approved", "rejected"]),
});

export const complimentaryDeliverySchema = z.object({
  name: trimmedText(2, 100),
  email: z.string().trim().email().max(254),
  note: z.string().trim().max(500).optional().default(""),
});

export const digitalDeliveryActionSchema = z.object({
  action: z.enum(["send", "retry", "regenerate", "resend"]),
});

export const analyticsEventSchema = z.object({
  visitorId: z.string().uuid(),
  sessionId: z.string().uuid(),
  event: z.enum([
    "page_view",
    "select_item",
    "begin_checkout",
    "add_payment_info",
    "purchase",
    "share",
  ]),
  path: z.string().trim().startsWith("/").max(500),
  source: z.string().trim().max(120).optional(),
  medium: z.string().trim().max(120).optional(),
  campaign: z.string().trim().max(160).optional(),
  device: z.enum(["mobile", "tablet", "desktop"]),
  edition: z.string().trim().max(100).optional(),
  method: z.string().trim().max(80).optional(),
  value: z.number().finite().min(0).max(10_000_000).optional(),
  orderId: z.string().trim().max(128).optional(),
});

export const paymentRecoveryActionSchema = z.object({
  resend: z.boolean().default(false),
});
