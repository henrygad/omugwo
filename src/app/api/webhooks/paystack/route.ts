import { z } from "zod";
import { verifyPaystackSignature } from "@/lib/paystack/signature";
import { reverseAffiliateCommission, verifyAndApplyPayment } from "@/lib/orders";

const webhookSchema = z.object({
  event: z.string(),
  data: z.record(z.string(), z.unknown()),
});

function eventReference(data: Record<string, unknown>) {
  if (typeof data.reference === "string") return data.reference;
  const transaction = data.transaction;
  if (transaction && typeof transaction === "object" && "reference" in transaction && typeof transaction.reference === "string") return transaction.reference;
  return null;
}

export async function POST(request: Request) {
  const rawBody = Buffer.from(await request.arrayBuffer());
  const signatureIsValid = verifyPaystackSignature({
    rawBody,
    paystackSignature: request.headers.get("paystack-signature"),
    legacySignature: request.headers.get("x-paystack-signature"),
    webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET,
    paystackSecret: process.env.PAYSTACK_SECRET_KEY,
  });

  if (!signatureIsValid) {
    return Response.json({ error: "Invalid signature." }, { status: 401 });
  }

  try {
    const event = webhookSchema.parse(JSON.parse(rawBody.toString("utf8")));
    const reference = eventReference(event.data);
    if (event.event === "charge.success" && reference) {
      await verifyAndApplyPayment(reference);
    }
    if (event.event === "refund.processed" && reference) {
      await reverseAffiliateCommission(reference, "Paystack reported a processed refund.");
    }
    if (event.event === "charge.dispute.resolve" && reference) {
      const verified = await verifyAndApplyPayment(reference);
      if (verified.paymentStatus === "reversed") {
        await reverseAffiliateCommission(reference, `Paystack event: ${event.event}`);
      }
    }
    return Response.json({ received: true });
  } catch (error) {
    console.error("Paystack webhook processing failed", error);
    return Response.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
