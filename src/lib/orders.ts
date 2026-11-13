import { FieldValue } from "firebase-admin/firestore";
import { editions, type EditionId } from "@/config/site";
import { getAdminDb } from "@/lib/firebase/admin";
import { sendPaymentConfirmationEmail } from "@/lib/email/payment-confirmation";
import { ensurePaidDigitalDelivery } from "@/lib/digital-deliveries";
import {
  initializePaystackTransaction,
  verifyPaystackTransaction,
} from "@/lib/paystack/client";
import type { OrderCustomer, PaymentStatus } from "@/types/commerce";
import type { OrderView } from "@/types/commerce";

export async function createPendingOrder(input: {
  edition: EditionId;
  customer: OrderCustomer;
  callbackUrl: string;
}) {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    throw new Error("Paystack is not configured.");
  }

  const db = getAdminDb();
  const orderRef = db.collection("orders").doc();
  const edition = editions[input.edition];
  const reference = `OMG-${orderRef.id}`;
  const now = FieldValue.serverTimestamp();

  await orderRef.create({
    customer: input.customer,
    edition: edition.format,
    editionName: edition.name,
    quantity: 1,
    amount: edition.price,
    currency: edition.currency,
    paystackReference: reference,
    paymentStatus: "pending",
    fulfillmentStatus: "unfulfilled",
    termsVersion: "2026-11-11",
    termsAcceptedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  try {
    const transaction = await initializePaystackTransaction({
      email: input.customer.email,
      amount: edition.price * 100,
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
    transaction.status === "abandoned" ? "abandoned" : "failed";

  const shouldSendConfirmation = await db.runTransaction(async (firestoreTransaction) => {
    const fresh = await firestoreTransaction.get(orderDocument.ref);
    if (!fresh.exists) return false;

    const freshOrder = fresh.data();
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
