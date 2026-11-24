import "server-only";

import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { sendPaymentRecoveryEmail } from "@/lib/email/payment-recovery";
import { sendReviewRequestEmail } from "@/lib/email/review-request";
import { verifyAndApplyPayment } from "@/lib/orders";
import type { EditionId } from "@/config/site";
import type { OrderCustomer } from "@/types/commerce";

const hour = 60 * 60 * 1000;

export async function runStoreAutomations(now = Date.now()) {
  const [recoveries, reviewRequests] = await Promise.all([
    recoverIncompletePayments(now),
    requestReaderReviews(now),
  ]);
  return { recoveries, reviewRequests };
}

async function recoverIncompletePayments(now: number) {
  const db = getAdminDb();
  const snapshot = await db
    .collection("orders")
    .orderBy("createdAt", "desc")
    .limit(250)
    .get();
  let sent = 0;

  for (const document of snapshot.docs) {
    const value = document.data();
    if (!["pending", "failed", "abandoned"].includes(String(value.paymentStatus))) continue;
    const createdAt = value.createdAt as Timestamp | undefined;
    if (!createdAt || now - createdAt.toMillis() < 2 * hour) continue;
    if (value.recoveryEmailStatus === "sent") continue;

    try {
      const order = await verifyAndApplyPayment(String(value.paystackReference));
      if (order.paymentStatus !== "failed" && order.paymentStatus !== "abandoned") continue;

      const claimed = await claimEmail(document.ref, "recoveryEmailStatus");
      if (!claimed) continue;
      const customer = value.customer as OrderCustomer;
      const messageId = await sendPaymentRecoveryEmail({
        orderId: document.id,
        name: customer.name ?? "Reader",
        email: customer.email,
        edition: value.edition as EditionId,
      });
      await document.ref.update({
        recoveryEmailStatus: "sent",
        recoveryEmailSentAt: FieldValue.serverTimestamp(),
        recoveryEmailMessageId: messageId,
      });
      sent += 1;
    } catch (error) {
      await document.ref.update({
        recoveryEmailStatus: "failed",
        recoveryEmailError: error instanceof Error ? error.message.slice(0, 300) : "Unknown error",
      });
    }
  }
  return { checked: snapshot.size, sent };
}

async function requestReaderReviews(now: number) {
  const db = getAdminDb();
  const [snapshot, existingReviews] = await Promise.all([
    db
      .collection("orders")
      .where("paymentStatus", "==", "paid")
      .limit(250)
      .get(),
    db.collection("reviews").select("email").limit(1000).get(),
  ]);
  const reviewerEmails = new Set(
    existingReviews.docs.map((document) =>
      String(document.get("email") ?? "").trim().toLowerCase(),
    ),
  );
  let sent = 0;

  for (const document of snapshot.docs) {
    const value = document.data();
    const customer = value.customer as OrderCustomer;
    if (reviewerEmails.has(customer.email.trim().toLowerCase())) continue;
    if (value.reviewRequestStatus === "sent") continue;
    if (!["fulfilled", "delivered"].includes(String(value.fulfillmentStatus))) continue;
    const fulfilledAt = value.fulfilledAt as Timestamp | undefined;
    if (!fulfilledAt || now - fulfilledAt.toMillis() < 7 * 24 * hour) continue;

    const claimed = await claimEmail(document.ref, "reviewRequestStatus");
    if (!claimed) continue;
    try {
      const messageId = await sendReviewRequestEmail({
        orderId: document.id,
        name: customer.name ?? "Reader",
        email: customer.email,
      });
      await document.ref.update({
        reviewRequestStatus: "sent",
        reviewRequestSentAt: FieldValue.serverTimestamp(),
        reviewRequestMessageId: messageId,
      });
      sent += 1;
    } catch (error) {
      await document.ref.update({
        reviewRequestStatus: "failed",
        reviewRequestError: error instanceof Error ? error.message.slice(0, 300) : "Unknown error",
      });
    }
  }
  return { checked: snapshot.size, sent };
}

async function claimEmail(
  reference: FirebaseFirestore.DocumentReference,
  field: "recoveryEmailStatus" | "reviewRequestStatus",
) {
  const db = getAdminDb();
  const claimField =
    field === "recoveryEmailStatus"
      ? "recoveryEmailClaimedAt"
      : "reviewRequestClaimedAt";
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    const status = String(snapshot.get(field) ?? "");
    const claimedAt = (snapshot.get(claimField) ??
      snapshot.get(`${field}ClaimedAt`)) as Timestamp | undefined;
    const staleClaim =
      status === "sending" &&
      claimedAt instanceof Timestamp &&
      Date.now() - claimedAt.toMillis() > 30 * 60 * 1000;
    if (status === "sent" || (status === "sending" && !staleClaim)) return false;
    transaction.update(reference, {
      [field]: "sending",
      [claimField]: FieldValue.serverTimestamp(),
    });
    return true;
  });
}

