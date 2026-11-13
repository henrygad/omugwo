import "server-only";

import { FieldValue, Timestamp, type DocumentSnapshot } from "firebase-admin/firestore";
import { getAdminDb, getAdminStorage } from "@/lib/firebase/admin";
import { generatePersonalizedEpub } from "@/lib/epub/generate";
import { sendDigitalDeliveryEmail } from "@/lib/email/digital-delivery";
import type {
  DigitalDeliveryView,
  DigitalFulfilmentType,
  EpubGenerationStatus,
  DigitalDeliveryStatus,
  PaymentStatus,
} from "@/types/commerce";

type Administrator = { uid: string; email?: string };

function isoDate(value: unknown) {
  return value instanceof Timestamp ? value.toDate().toISOString() : "";
}

function deliveryFromDocument(document: DocumentSnapshot): DigitalDeliveryView {
  const value = document.data() ?? {};
  return {
    id: document.id,
    ...(value.orderId ? { orderId: String(value.orderId) } : {}),
    orderReference: String(value.orderReference ?? ""),
    buyerName: String(value.buyerName ?? ""),
    buyerEmail: String(value.buyerEmail ?? ""),
    ...(value.paymentReference
      ? { paymentReference: String(value.paymentReference) }
      : {}),
    ...(value.paymentStatus
      ? { paymentStatus: value.paymentStatus as PaymentStatus }
      : {}),
    amount: Number(value.amount ?? 0),
    currency: "NGN",
    fulfilmentType: value.fulfilmentType as DigitalFulfilmentType,
    ...(value.administratorNote
      ? { administratorNote: String(value.administratorNote) }
      : {}),
    epubGenerationStatus: value.epubGenerationStatus as EpubGenerationStatus,
    ...(value.generatedFilePath
      ? { generatedFilePath: String(value.generatedFilePath) }
      : {}),
    ...(value.generatedFileName
      ? { generatedFileName: String(value.generatedFileName) }
      : {}),
    generationNumber: Number(value.generationNumber ?? 0),
    deliveryStatus: value.deliveryStatus as DigitalDeliveryStatus,
    ...(value.generatedAt ? { generatedAt: isoDate(value.generatedAt) } : {}),
    ...(value.approvedBy ? { approvedBy: String(value.approvedBy) } : {}),
    ...(value.approvedAt ? { approvedAt: isoDate(value.approvedAt) } : {}),
    ...(value.sentAt ? { sentAt: isoDate(value.sentAt) } : {}),
    ...(value.emailMessageId
      ? { emailMessageId: String(value.emailMessageId) }
      : {}),
    ...(value.lastDeliveryError
      ? { lastDeliveryError: String(value.lastDeliveryError) }
      : {}),
    createdAt: isoDate(value.createdAt),
    updatedAt: isoDate(value.updatedAt),
  };
}

export async function getDigitalDelivery(deliveryId: string) {
  const document = await getAdminDb()
    .collection("digitalDeliveries")
    .doc(deliveryId)
    .get();
  return document.exists ? deliveryFromDocument(document) : null;
}

export async function listDigitalDeliveries(filter?: string) {
  const snapshot = await getAdminDb()
    .collection("digitalDeliveries")
    .orderBy("createdAt", "desc")
    .limit(250)
    .get();
  const deliveries = snapshot.docs.map(deliveryFromDocument);
  if (!filter) return deliveries;
  return deliveries.filter((delivery) => {
    if (filter === "awaiting_approval") {
      return delivery.deliveryStatus === "awaiting_approval";
    }
    if (filter === "ready_to_send") {
      return (
        delivery.epubGenerationStatus === "ready" &&
        delivery.deliveryStatus === "awaiting_approval"
      );
    }
    if (filter === "complimentary") {
      return delivery.fulfilmentType === "complimentary";
    }
    return delivery.deliveryStatus === filter;
  });
}

export async function ensurePaidDigitalDelivery(orderId: string) {
  const db = getAdminDb();
  const orderRef = db.collection("orders").doc(orderId);
  const deliveryRef = db.collection("digitalDeliveries").doc(orderId);
  const shouldGenerate = await db.runTransaction(async (transaction) => {
    const [order, delivery] = await Promise.all([
      transaction.get(orderRef),
      transaction.get(deliveryRef),
    ]);
    if (!order.exists) throw new Error("Order not found.");
    const value = order.data() ?? {};
    if (value.paymentStatus !== "paid" || value.edition !== "digital") {
      return false;
    }
    if (delivery.exists) return false;
    const customer = value.customer as Record<string, unknown>;
    const now = FieldValue.serverTimestamp();
    transaction.create(deliveryRef, {
      orderId,
      orderReference: String(value.paystackReference),
      buyerName: String(customer.name ?? ""),
      buyerEmail: String(customer.email ?? ""),
      paymentReference: String(value.paystackReference),
      paymentStatus: "paid",
      amount: Number(value.amount),
      currency: "NGN",
      fulfilmentType: "paid",
      epubGenerationStatus: "awaiting_generation",
      generationNumber: 0,
      deliveryStatus: "awaiting_approval",
      createdAt: now,
      updatedAt: now,
    });
    transaction.create(db.collection("auditLogs").doc(), {
      action: "digital_delivery.created_from_payment",
      deliveryId: deliveryRef.id,
      orderId,
      createdAt: now,
    });
    return true;
  });
  if (shouldGenerate) await generateDeliveryFile(deliveryRef.id, "payment");
  return deliveryRef.id;
}

export async function createComplimentaryDelivery(
  input: { name: string; email: string; note?: string },
  administrator: Administrator,
) {
  const db = getAdminDb();
  const deliveryRef = db.collection("digitalDeliveries").doc();
  const reference = `CMP-${deliveryRef.id.slice(0, 12).toUpperCase()}`;
  const now = FieldValue.serverTimestamp();
  await db.runTransaction(async (transaction) => {
    transaction.create(deliveryRef, {
      orderReference: reference,
      buyerName: input.name,
      buyerEmail: input.email,
      amount: 0,
      currency: "NGN",
      fulfilmentType: "complimentary",
      administratorNote: input.note ?? "",
      epubGenerationStatus: "awaiting_generation",
      generationNumber: 0,
      deliveryStatus: "awaiting_approval",
      createdBy: administrator.uid,
      createdByEmail: administrator.email ?? "",
      createdAt: now,
      updatedAt: now,
    });
    transaction.create(db.collection("auditLogs").doc(), {
      action: "digital_delivery.complimentary_created",
      deliveryId: deliveryRef.id,
      administratorId: administrator.uid,
      recipientEmail: input.email,
      createdAt: now,
    });
  });
  await generateDeliveryFile(deliveryRef.id, administrator.uid);
  return deliveryRef.id;
}

export async function generateDeliveryFile(
  deliveryId: string,
  initiatedBy: string,
  force = false,
) {
  const db = getAdminDb();
  const deliveryRef = db.collection("digitalDeliveries").doc(deliveryId);
  const generationNumber = await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(deliveryRef);
    if (!snapshot.exists) throw new Error("Digital delivery not found.");
    const value = snapshot.data() ?? {};
    if (!force && ["generating", "ready"].includes(value.epubGenerationStatus)) {
      return 0;
    }
    const nextGeneration = Number(value.generationNumber ?? 0) + 1;
    transaction.update(deliveryRef, {
      epubGenerationStatus: "generating",
      generationNumber: nextGeneration,
      lastGenerationError: FieldValue.delete(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.create(db.collection("auditLogs").doc(), {
      action: force
        ? "digital_delivery.regeneration_started"
        : "digital_delivery.generation_started",
      deliveryId,
      generationNumber: nextGeneration,
      initiatedBy,
      createdAt: FieldValue.serverTimestamp(),
    });
    return nextGeneration;
  });
  if (!generationNumber) return;

  try {
    const snapshot = await deliveryRef.get();
    const value = snapshot.data() ?? {};
    const generated = await generatePersonalizedEpub({
      purchaserName: String(value.buyerName),
      purchaserEmail: String(value.buyerEmail),
      orderReference: String(value.orderReference),
    });
    const storagePath = `digital-deliveries/${deliveryId}/generation-${generationNumber}/${generated.fileName}`;
    await getAdminStorage().file(storagePath).save(generated.buffer, {
      resumable: false,
      contentType: "application/epub+zip",
      metadata: {
        cacheControl: "private, no-store, max-age=0",
        metadata: {
          deliveryId,
          orderReference: String(value.orderReference),
          generatedHash: generated.generatedHash,
          masterHash: generated.masterHash,
        },
      },
    });
    await db.runTransaction(async (transaction) => {
      const fresh = await transaction.get(deliveryRef);
      if (!fresh.exists || fresh.data()?.generationNumber !== generationNumber) {
        return;
      }
      const previousPath = fresh.data()?.generatedFilePath;
      transaction.update(deliveryRef, {
        epubGenerationStatus: "ready",
        generatedFilePath: storagePath,
        generatedFileName: generated.fileName,
        generatedHash: generated.generatedHash,
        masterHash: generated.masterHash,
        generatedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        ...(previousPath
          ? {
              generationHistory: FieldValue.arrayUnion({
                filePath: String(previousPath),
                generationNumber: generationNumber - 1,
                replacedAt: Timestamp.now(),
              }),
            }
          : {}),
      });
      transaction.create(db.collection("auditLogs").doc(), {
        action: "digital_delivery.generated",
        deliveryId,
        generationNumber,
        storagePath,
        initiatedBy,
        createdAt: FieldValue.serverTimestamp(),
      });
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "EPUB generation failed.";
    await deliveryRef.update({
      epubGenerationStatus: "failed",
      lastGenerationError: message.slice(0, 500),
      updatedAt: FieldValue.serverTimestamp(),
    });
    await db.collection("auditLogs").add({
      action: "digital_delivery.generation_failed",
      deliveryId,
      generationNumber,
      initiatedBy,
      error: message.slice(0, 500),
      createdAt: FieldValue.serverTimestamp(),
    });
    throw error;
  }
}

export async function getGeneratedDeliveryFile(deliveryId: string) {
  const snapshot = await getAdminDb()
    .collection("digitalDeliveries")
    .doc(deliveryId)
    .get();
  if (!snapshot.exists) throw new Error("Digital delivery not found.");
  const value = snapshot.data() ?? {};
  const filePath = String(value.generatedFilePath ?? "");
  const fileName = String(value.generatedFileName ?? "");
  if (value.epubGenerationStatus !== "ready" || !filePath || !fileName) {
    throw new Error("The personalized EPUB is not ready.");
  }
  const [buffer] = await getAdminStorage().file(filePath).download();
  return { buffer, fileName };
}

export async function sendDelivery(
  deliveryId: string,
  mode: "send" | "retry" | "resend",
  administrator: Administrator,
) {
  const db = getAdminDb();
  const deliveryRef = db.collection("digitalDeliveries").doc(deliveryId);
  const lock = await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(deliveryRef);
    if (!snapshot.exists) throw new Error("Digital delivery not found.");
    const value = snapshot.data() ?? {};
    if (value.epubGenerationStatus !== "ready" || !value.generatedFilePath) {
      throw new Error("The personalized EPUB is not ready.");
    }
    if (value.deliveryStatus === "sending") {
      throw new Error("This delivery is already being sent.");
    }
    if (mode === "send" && value.deliveryStatus !== "awaiting_approval") {
      throw new Error("This delivery is not awaiting approval.");
    }
    if (mode === "retry" && value.deliveryStatus !== "failed") {
      throw new Error("Only a failed delivery can be retried.");
    }
    if (mode === "resend" && value.deliveryStatus !== "sent") {
      throw new Error("Only a sent delivery can be resent.");
    }
    const attemptId = db.collection("auditLogs").doc().id;
    transaction.update(deliveryRef, {
      deliveryStatus: "sending",
      deliveryLock: attemptId,
      deliveryAttempts: FieldValue.increment(1),
      approvedBy: administrator.uid,
      approvedByEmail: administrator.email ?? "",
      approvedAt: FieldValue.serverTimestamp(),
      lastDeliveryError: FieldValue.delete(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.create(db.collection("auditLogs").doc(attemptId), {
      action: `digital_delivery.${mode}_attempted`,
      deliveryId,
      administratorId: administrator.uid,
      recipientEmail: String(value.buyerEmail),
      createdAt: FieldValue.serverTimestamp(),
    });
    return {
      attemptId,
      recipientName: String(value.buyerName),
      recipientEmail: String(value.buyerEmail),
      orderReference: String(value.orderReference),
      complimentary: value.fulfilmentType === "complimentary",
      orderId: value.orderId ? String(value.orderId) : "",
    };
  });

  try {
    const file = await getGeneratedDeliveryFile(deliveryId);
    const messageId = await sendDigitalDeliveryEmail({
      deliveryId,
      ...lock,
      fileName: file.fileName,
      file: file.buffer,
    });
    await db.runTransaction(async (transaction) => {
      const fresh = await transaction.get(deliveryRef);
      if (!fresh.exists || fresh.data()?.deliveryLock !== lock.attemptId) {
        throw new Error("The delivery lock changed before completion.");
      }
      transaction.update(deliveryRef, {
        deliveryStatus: "sent",
        sentAt: FieldValue.serverTimestamp(),
        emailMessageId: messageId,
        deliveryLock: FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      if (lock.orderId) {
        transaction.update(db.collection("orders").doc(lock.orderId), {
          fulfillmentStatus: "fulfilled",
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
      transaction.create(db.collection("auditLogs").doc(), {
        action: mode === "resend"
          ? "digital_delivery.resent"
          : "digital_delivery.sent",
        deliveryId,
        administratorId: administrator.uid,
        emailMessageId: messageId,
        createdAt: FieldValue.serverTimestamp(),
      });
    });
    return messageId;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Email delivery failed.";
    await deliveryRef.update({
      deliveryStatus: "failed",
      deliveryLock: FieldValue.delete(),
      lastDeliveryError: message.slice(0, 500),
      updatedAt: FieldValue.serverTimestamp(),
    });
    await db.collection("auditLogs").add({
      action: "digital_delivery.failed",
      deliveryId,
      administratorId: administrator.uid,
      error: message.slice(0, 500),
      createdAt: FieldValue.serverTimestamp(),
    });
    throw error;
  }
}
