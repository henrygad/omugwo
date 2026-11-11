import { z } from "zod";
import { verifyPaystackSignature } from "@/lib/paystack/signature";
import { verifyAndApplyPayment } from "@/lib/orders";

const webhookSchema = z.object({
  event: z.string(),
  data: z.object({ reference: z.string() }).passthrough(),
});

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
    if (event.event === "charge.success") {
      await verifyAndApplyPayment(event.data.reference);
    }
    return Response.json({ received: true });
  } catch (error) {
    console.error("Paystack webhook processing failed", error);
    return Response.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
