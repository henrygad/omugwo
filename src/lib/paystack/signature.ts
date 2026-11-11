import { createHmac, timingSafeEqual } from "node:crypto";

type SignatureInput = {
  rawBody: Buffer;
  paystackSignature: string | null;
  legacySignature: string | null;
  webhookSecret?: string;
  paystackSecret?: string;
  nowSeconds?: number;
};

function safelyEqualHex(expected: string, supplied: string) {
  if (!/^[0-9a-f]{128}$/i.test(supplied)) return false;
  const expectedBuffer = Buffer.from(expected, "hex");
  const suppliedBuffer = Buffer.from(supplied, "hex");
  return (
    expectedBuffer.length === suppliedBuffer.length &&
    timingSafeEqual(expectedBuffer, suppliedBuffer)
  );
}

export function verifyPaystackSignature({
  rawBody,
  paystackSignature,
  legacySignature,
  webhookSecret,
  paystackSecret,
  nowSeconds = Math.floor(Date.now() / 1000),
}: SignatureInput) {
  if (paystackSignature && webhookSecret) {
    const parts = paystackSignature.split(",").map((part) => part.trim());
    const timestamp = Number(
      parts.find((part) => part.startsWith("t="))?.slice(2),
    );
    const signatures = parts
      .filter((part) => part.startsWith("v1="))
      .map((part) => part.slice(3).split(":", 2)[1])
      .filter((value): value is string => Boolean(value));

    if (
      Number.isSafeInteger(timestamp) &&
      Math.abs(nowSeconds - timestamp) <= 300
    ) {
      const digest = createHmac("sha512", webhookSecret)
        .update(Buffer.concat([Buffer.from(`${timestamp}.`), rawBody]))
        .digest("hex");
      if (signatures.some((signature) => safelyEqualHex(digest, signature))) {
        return true;
      }
    }
  }

  if (legacySignature && paystackSecret) {
    const digest = createHmac("sha512", paystackSecret)
      .update(rawBody)
      .digest("hex");
    return safelyEqualHex(digest, legacySignature);
  }

  return false;
}
