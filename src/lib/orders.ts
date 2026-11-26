import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { editions, type EditionId } from "@/config/site";
import { getAdminDb } from "@/lib/firebase/admin";
import { sendPaymentConfirmationEmail } from "@/lib/email/payment-confirmation";
import { ensurePaidDigitalDelivery } from "@/lib/digital-deliveries";
import {
  initializePaystackTransaction,
  isMissingPaystackTransaction,
  verifyPaystackTransaction,
} from "@/lib/paystack/client";
import type {
  OrderAttribution,
  OrderCustomer,
  PaymentStatus,
} from "@/types/commerce";
import type { OrderView } from "@/types/commerce";
import type { SalesOffer } from "@/types/commerce";
import { calculateAffiliateCommission } from "@/lib/affiliate/commission";
import { offerPrice } from "@/lib/affiliate/pricing";
import { affiliatePricing } from "@/config/site";

export async function createPendingOrder(input: {
  edition: EditionId;
  customer: OrderCustomer;
  callbackUrl: string;
  marketingConsent: boolean;
  attribution?: OrderAttribution;
  offer: SalesOffer;
}) {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    throw new Error("Paystack is not configured.");
  }

  const db = getAdminDb();
  const orderRef = db.collection("orders").doc();
  const edition = editions[input.edition];
  const price = offerPrice(input.offer, input.edition);
  const reference = `OMG-${orderRef.id}`;
  const now = FieldValue.serverTimestamp();

  const orderData = {
    customer: input.customer,
    edition: edition.format,
    editionName: edition.name,
    quantity: 1,
    amount: price,
    currency: edition.currency,
    paystackReference: reference,
    paymentStatus: "pending",
    fulfillmentStatus: "unfulfilled",
    marketingConsent: input.marketingConsent,
    ...(input.marketingConsent ? { marketingConsentAt: now } : {}),
    ...(input.attribution ? { attribution: input.attribution } : {}),
    ...(!input.offer.isCompany && input.offer.affiliateId && input.offer.affiliateName ? {
      affiliate: {
        offerId: input.offer.id,
        offerCode: input.offer.code,
        affiliateId: input.offer.affiliateId,
        affiliateName: input.offer.affiliateName,
        offerTitle: input.offer.title,
        digitalPrice: input.offer.digitalPrice,
        paperbackPrice: input.offer.paperbackPrice,
      },
    } : {}),
    termsVersion: "2026-11-25",
    termsAcceptedAt: now,
    createdAt: now,
    updatedAt: now,
  };
  const orderBatch = db.batch();
  orderBatch.create(orderRef, orderData);
  if (!input.offer.isCompany) {
    orderBatch.update(db.collection("affiliateOffers").doc(input.offer.id), {
      checkouts: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
  await orderBatch.commit();

  try {
    const transaction = await initializePaystackTransaction({
      email: input.customer.email,
      amount: price * 100,
      reference,
      callbackUrl: input.callbackUrl,
      orderId: orderRef.id,
    });
    return {
      orderId: orderRef.id,
      reference,
      authorizationUrl: transaction.authorization_url,
    };
  } catch (error) {
    await orderRef.update({
      paymentStatus: "failed",
      updatedAt: FieldValue.serverTimestamp(),
    });
    throw error;
  }
}

export async function verifyAndApplyPayment(reference: string) {
  const db = getAdminDb();
  const match = await db
    .collection("orders")
    .where("paystackReference", "==", reference)
    .limit(1)
    .get();
  const orderDocument = match.docs[0];
  if (!orderDocument) throw new Error("Order not found.");

  const order = orderDocument.data();
  const transaction = await verifyPaystackTransaction(reference);
  const validPayment =
    transaction.status === "success" &&
    transaction.reference === reference &&
    transaction.amount === order.amount * 100 &&
    transaction.currency === order.currency;

  const unsuccessfulStatus: PaymentStatus =
    transaction.status === "abandoned"
      ? "abandoned"
      : transaction.status === "reversed"
        ? "reversed"
        : transaction.status === "failed"
          ? "failed"
        : "pending";

  if (transaction.status === "reversed" && order.paymentStatus === "paid") {
    await reverseAffiliateCommission(reference, "Paystack reported a reversed transaction.");
  }

  const shouldSendConfirmation = await db.runTransaction(async (firestoreTransaction) => {
    const fresh = await firestoreTransaction.get(orderDocument.ref);
    if (!fresh.exists) return false;

    const freshOrder = fresh.data();
    const affiliate = freshOrder?.affiliate as { offerId?: string; affiliateId?: string; affiliateName?: string } | undefined;
    const commissionRef = affiliate?.affiliateId
      ? db.collection("affiliateCommissions").doc(orderDocument.id)
      : null;
    const existingCommission = commissionRef
      ? await firestoreTransaction.get(commissionRef)
      : null;
    const emailStatus = String(
      freshOrder?.paymentConfirmationEmailStatus ?? "",
    );
    const emailClaimedAt = freshOrder?.paymentConfirmationEmailClaimedAt;
    const emailClaimExpired =
      typeof emailClaimedAt?.toMillis === "function" &&
      Date.now() - emailClaimedAt.toMillis() > 10 * 60 * 1000;
    const canClaimEmail =
      emailStatus !== "sent" &&
      (emailStatus !== "sending" || emailClaimExpired);

    if (!validPayment) {
      if (freshOrder?.paymentStatus === "paid") return false;

      firestoreTransaction.update(orderDocument.ref, {
        paymentStatus: unsuccessfulStatus,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return false;
    }

    if (freshOrder?.paymentStatus === "paid") {
      if (!canClaimEmail) return false;

      firestoreTransaction.update(orderDocument.ref, {
        paymentConfirmationEmailStatus: "sending",
        paymentConfirmationEmailClaimedAt: FieldValue.serverTimestamp(),
      });
      return true;
    }

    firestoreTransaction.update(orderDocument.ref, {
      paymentStatus: "paid",
      ...(freshOrder?.edition === "paperback" &&
      freshOrder?.fulfillmentStatus === "unfulfilled"
        ? { fulfillmentStatus: "preorder_received" }
        : {}),
      paystackTransactionId: String(transaction.id),
      paymentChannel: transaction.channel ?? "unknown",
      paidAt: transaction.paid_at
        ? new Date(transaction.paid_at)
        : FieldValue.serverTimestamp(),
      ...(canClaimEmail
        ? {
            paymentConfirmationEmailStatus: "sending",
            paymentConfirmationEmailClaimedAt: FieldValue.serverTimestamp(),
          }
        : {}),
      updatedAt: FieldValue.serverTimestamp(),
    });
    if (commissionRef && affiliate?.affiliateId && affiliate.affiliateName && !existingCommission?.exists) {
      const paidAt = transaction.paid_at ? new Date(transaction.paid_at) : new Date();
      const financials = calculateAffiliateCommission({
        edition: freshOrder?.edition as EditionId,
        saleAmount: Number(freshOrder?.amount),
        paystackFeeKobo: Number(transaction.fees ?? 0),
      });
      firestoreTransaction.create(commissionRef, {
        orderId: orderDocument.id,
        affiliateId: affiliate.affiliateId,
        affiliateName: affiliate.affiliateName,
        offerId: affiliate.offerId,
        edition: freshOrder?.edition,
        saleAmount: Number(freshOrder?.amount),
        ...financials,
        status: "pending",
        availableAt: Timestamp.fromMillis(paidAt.getTime() + affiliatePricing.commissionHoldDays * 24 * 60 * 60 * 1000),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      if (affiliate.offerId) {
        firestoreTransaction.update(db.collection("affiliateOffers").doc(affiliate.offerId), {
          paidSales: FieldValue.increment(1),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    }
    firestoreTransaction.create(db.collection("auditLogs").doc(), {
      action: "payment.verified",
      orderId: orderDocument.id,
      reference,
      source: "paystack",
      createdAt: FieldValue.serverTimestamp(),
    });
    return canClaimEmail;
  });

  const updated = await orderDocument.ref.get();
  const value = updated.data() ?? {};

  if (value.paymentStatus === "paid" && value.edition === "digital") {
    try {
      await ensurePaidDigitalDelivery(updated.id);
    } catch (error) {
      console.error("Personalized EPUB generation failed", {
        orderId: updated.id,
        message: error instanceof Error ? error.message : "Unknown generation error.",
      });
    }
  }

  if (shouldSendConfirmation) {
    try {
      const emailId = await sendPaymentConfirmationEmail({
        orderId: updated.id,
        customer: value.customer as OrderCustomer,
        edition: value.edition as EditionId,
        editionName: String(value.editionName),
        amount: Number(value.amount),
        currency: "NGN",
        reference: String(value.paystackReference),
      });
      await orderDocument.ref.update({
        paymentConfirmationEmailStatus: "sent",
        paymentConfirmationEmailId: emailId,
        paymentConfirmationEmailSentAt: FieldValue.serverTimestamp(),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown email delivery error.";
      console.error("Payment confirmation email failed", {
        orderId: updated.id,
        message,
      });
      await orderDocument.ref.update({
        paymentConfirmationEmailStatus: "failed",
        paymentConfirmationEmailError: message.slice(0, 300),
        paymentConfirmationEmailFailedAt: FieldValue.serverTimestamp(),
      });
    }
  }

  return {
    id: updated.id,
    customer: value.customer as OrderCustomer,
    edition: value.edition as EditionId,
    editionName: String(value.editionName),
    quantity: 1,
    amount: Number(value.amount),
    currency: "NGN",
    paystackReference: String(value.paystackReference),
    paymentStatus: value.paymentStatus as PaymentStatus,
    fulfillmentStatus: value.fulfillmentStatus as OrderView["fulfillmentStatus"],
    createdAt: value.createdAt?.toDate?.().toISOString?.() ?? "",
    updatedAt: value.updatedAt?.toDate?.().toISOString?.() ?? "",
    ...(value.paidAt
      ? { paidAt: value.paidAt?.toDate?.().toISOString?.() ?? "" }
      : {}),
  } satisfies OrderView;
}

export async function resolvePaymentStatusForRecovery(
  reference: unknown,
  storedStatus: PaymentStatus,
) {
  const normalizedReference =
    typeof reference === "string" ? reference.trim() : "";

  if (!normalizedReference) return storedStatus;

  try {
    const order = await verifyAndApplyPayment(normalizedReference);
    return order.paymentStatus;
  } catch (error) {
    if (
      isMissingPaystackTransaction(error) &&
      (storedStatus === "failed" || storedStatus === "abandoned")
    ) {
      return storedStatus;
    }
    throw error;
  }
}

export async function reverseAffiliateCommission(reference: string, reason: string) {
  const db = getAdminDb();
  const match = await db.collection("orders").where("paystackReference", "==", reference).limit(1).get();
  const order = match.docs[0];
  if (!order) return false;
  const commissionRef = db.collection("affiliateCommissions").doc(order.id);
  return db.runTransaction(async (transaction) => {
    const [orderSnapshot, commission] = await Promise.all([
      transaction.get(order.ref),
      transaction.get(commissionRef),
    ]);
    if (!orderSnapshot.exists) return false;
    if (commission.exists && commission.get("status") !== "reversed") {
      const wasPaid = commission.get("status") === "paid";
      const affiliateId = String(commission.get("affiliateId"));
      const amount = Number(commission.get("affiliateNetAmount") ?? 0);
      transaction.update(commissionRef, {
        status: "reversed",
        reversalReason: reason.slice(0, 300),
        reversedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      if (wasPaid && amount > 0) {
        transaction.update(db.collection("affiliates").doc(affiliateId), {
          negativeBalance: FieldValue.increment(amount),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    }
    transaction.update(order.ref, {
      paymentStatus: "reversed",
      paymentReversalReason: reason.slice(0, 300),
      reversedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.create(db.collection("auditLogs").doc(), {
      action: "payment.reversed",
      orderId: order.id,
      reference,
      reason: reason.slice(0, 300),
      source: "paystack",
      createdAt: FieldValue.serverTimestamp(),
    });
    return true;
  });
}
