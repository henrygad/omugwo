import type { EditionId } from "@/config/site";

export type PaymentStatus = "pending" | "paid" | "failed" | "abandoned";
export type FulfillmentStatus =
  | "unfulfilled"
  | "processing"
  | "fulfilled"
  | "cancelled";
export type ReviewStatus = "pending" | "approved" | "rejected";
export type EpubGenerationStatus =
  | "awaiting_generation"
  | "generating"
  | "ready"
  | "failed";
export type DigitalDeliveryStatus =
  | "awaiting_approval"
  | "sending"
  | "sent"
  | "failed";
export type DigitalFulfilmentType = "paid" | "complimentary";

export type OrderCustomer = {
  email: string;
  name?: string;
  phone?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
};

export type OrderRecord = {
  customer: OrderCustomer;
  edition: EditionId;
  editionName: string;
  quantity: 1;
  amount: number;
  currency: "NGN";
  paystackReference: string;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  paystackTransactionId?: string;
  paymentChannel?: string;
};

export type OrderView = OrderRecord & {
  id: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
};

export type ReviewView = {
  id: string;
  name: string;
  email: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
};

export type PublicReview = Omit<
  ReviewView,
  "email" | "status" | "updatedAt"
>;

export type DigitalDeliveryView = {
  id: string;
  orderId?: string;
  orderReference: string;
  buyerName: string;
  buyerEmail: string;
  paymentReference?: string;
  paymentStatus?: PaymentStatus;
  amount: number;
  currency: "NGN";
  fulfilmentType: DigitalFulfilmentType;
  administratorNote?: string;
  epubGenerationStatus: EpubGenerationStatus;
  generatedFilePath?: string;
  generatedFileName?: string;
  generationNumber: number;
  deliveryStatus: DigitalDeliveryStatus;
  generatedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  sentAt?: string;
  emailMessageId?: string;
  lastDeliveryError?: string;
  createdAt: string;
  updatedAt: string;
};
