import type { EditionId } from "@/config/site";

export type PaymentStatus = "pending" | "paid" | "failed" | "abandoned" | "reversed";
export type FulfillmentStatus =
  | "unfulfilled"
  | "processing"
  | "fulfilled"
  | "preorder_received"
  | "printing"
  | "ready_for_dispatch"
  | "dispatched"
  | "delivered"
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
export type AffiliateStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "suspended";
export type CommissionStatus = "pending" | "available" | "paid" | "reversed";

export type OrderCustomer = {
  email: string;
  name?: string;
  phone?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
};

export type OrderAttribution = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  referrer?: string;
  landingPage?: string;
};

export type SalesOffer = {
  id: string;
  code: string;
  affiliateId?: string;
  affiliateName?: string;
  title: string;
  digitalPrice: number;
  paperbackPrice: number;
  isCompany: boolean;
};

export type AffiliateAttribution = {
  offerId: string;
  offerCode: string;
  affiliateId: string;
  affiliateName: string;
  offerTitle: string;
  digitalPrice: number;
  paperbackPrice: number;
};

export type AffiliateProfile = {
  id: string;
  email: string;
  fullName: string;
  publicName: string;
  phone: string;
  marketingDetails: string;
  status: AffiliateStatus;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  negativeBalance?: number;
  termsVersion?: string;
  termsAcceptedAt?: string;
  applicationEmailSentAt?: string;
  applicationEmailError?: string;
  statusEmailSentAt?: string;
  statusEmailError?: string;
  createdAt: string;
  updatedAt: string;
};

export type AffiliateOffer = SalesOffer & {
  active: boolean;
  clicks: number;
  checkouts: number;
  paidSales: number;
  createdAt: string;
  updatedAt: string;
};

export type AffiliateCommission = {
  id: string;
  orderId: string;
  affiliateId: string;
  affiliateName: string;
  offerId: string;
  edition: EditionId;
  saleAmount: number;
  companyBaseAmount: number;
  affiliateGrossAmount: number;
  paystackFee: number;
  companyFeeShare: number;
  affiliateFeeShare: number;
  companyNetAmount: number;
  affiliateNetAmount: number;
  status: CommissionStatus;
  paidAt?: string;
  availableAt: string;
  createdAt: string;
  updatedAt: string;
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
  marketingConsent?: boolean;
  attribution?: OrderAttribution;
  affiliate?: AffiliateAttribution;
  trackingNumber?: string;
  fulfillmentNote?: string;
};

export type OrderView = OrderRecord & {
  id: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  fulfilledAt?: string;
  recoveryEmailSentAt?: string;
  recoveryEmailStatus?: string;
  recoveryEmailError?: string;
  reviewRequestSentAt?: string;
};

export type VisitorView = {
  id: string;
  sessionCount: number;
  pageViews: number;
  eventCount: number;
  source: string;
  medium?: string;
  campaign?: string;
  device: "mobile" | "tablet" | "desktop";
  lastPath: string;
  linkedOrderId?: string;
  convertedOrderId?: string;
  firstSeenAt: string;
  lastSeenAt: string;
};

export type AnalyticsEventView = {
  id: string;
  visitorId: string;
  event: string;
  path: string;
  source: string;
  device: string;
  edition?: string;
  method?: string;
  value?: number;
  orderId?: string;
  createdAt: string;
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
