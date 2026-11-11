import { createHmac } from "node:crypto";
import assert from "node:assert/strict";
import test from "node:test";
import { verifyPaystackSignature } from "../src/lib/paystack/signature.ts";

const rawBody = Buffer.from('{"event":"charge.success"}');

test("accepts current Paystack webhook signatures", () => {
  const timestamp = 1_800_000_000;
  const secret = "whsec_test_value";
  const digest = createHmac("sha512", secret)
    .update(Buffer.concat([Buffer.from(`${timestamp}.`), rawBody]))
    .digest("hex");
  assert.equal(verifyPaystackSignature({ rawBody, paystackSignature: `t=${timestamp},v1=whk_test:${digest}`, legacySignature: null, webhookSecret: secret, nowSeconds: timestamp }), true);
});

test("rejects stale webhook signatures", () => {
  const timestamp = 1_800_000_000;
  const secret = "whsec_test_value";
  const digest = createHmac("sha512", secret).update(Buffer.concat([Buffer.from(`${timestamp}.`), rawBody])).digest("hex");
  assert.equal(verifyPaystackSignature({ rawBody, paystackSignature: `t=${timestamp},v1=whk_test:${digest}`, legacySignature: null, webhookSecret: secret, nowSeconds: timestamp + 301 }), false);
});

test("accepts legacy x-paystack-signature and rejects modified bodies", () => {
  const secret = "sk_test_value";
  const digest = createHmac("sha512", secret).update(rawBody).digest("hex");
  assert.equal(verifyPaystackSignature({ rawBody, paystackSignature: null, legacySignature: digest, paystackSecret: secret }), true);
  assert.equal(verifyPaystackSignature({ rawBody: Buffer.from("modified"), paystackSignature: null, legacySignature: digest, paystackSecret: secret }), false);
});
