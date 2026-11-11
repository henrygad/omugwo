import type { EditionId } from "@/config/site";

export type PaymentStatus = "pending" | "paid" | "failed" | "abandoned";
export type FulfillmentStatus =
  | "unfulfilled"
  | "processing"
  | "fulfilled"
  | "cancelled";
export type ReviewStatus = "pending" | "approved" | "rejected";

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
