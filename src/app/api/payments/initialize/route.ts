import { verifyAppCheckRequest } from "@/lib/firebase/app-check";
import { apiError } from "@/lib/http";
import { createPendingOrder } from "@/lib/orders";
import { checkoutSchema } from "@/lib/validation";
import { getActiveSalesOffer } from "@/lib/affiliate/offers";

function paymentCallbackUrl(request: Request) {
  const origin = new URL(request.url);
  const isLocalhost = ["localhost", "127.0.0.1", "[::1]", "::1"].includes(
    origin.hostname,
  );

  if (
    origin.protocol !== "https:" &&
    !(isLocalhost && origin.protocol === "http:")
  ) {
    throw new Error("Checkout requires a secure HTTPS connection.");
  }

  return new URL("/order/confirm", origin.origin).toString();
}

export async function POST(request: Request) {
  try {
    await verifyAppCheckRequest(request);
    const input = checkoutSchema.parse(await request.json());
    const offer = await getActiveSalesOffer();
    if (offer.code !== input.offerCode) {
      return Response.json({ error: "The active offer changed. Refresh the page and confirm the current price before paying." }, { status: 409 });
    }
    const result = await createPendingOrder({
      edition: input.edition,
      customer: {
        email: input.email,
        ...(input.name ? { name: input.name } : {}),
        ...(input.phone ? { phone: input.phone } : {}),
        ...(input.country ? { country: input.country } : {}),
        ...(input.state ? { state: input.state } : {}),
        ...(input.city ? { city: input.city } : {}),
        ...(input.address ? { address: input.address } : {}),
      },
      callbackUrl: paymentCallbackUrl(request),
      marketingConsent: input.marketingConsent,
      attribution: input.attribution,
      offer,
    });

    return Response.json(result, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
