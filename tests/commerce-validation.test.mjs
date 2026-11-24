import assert from "node:assert/strict";
import test from "node:test";
import {
  analyticsEventSchema,
  checkoutSchema,
  fulfillmentUpdateSchema,
  paymentRecoveryActionSchema,
} from "../src/lib/validation.ts";

test("accepts optional marketing consent and campaign attribution", () => {
  const result = checkoutSchema.parse({
    edition: "digital",
    acceptedTerms: true,
    name: "Ada Reader",
    email: "ada@example.com",
    marketingConsent: true,
    attribution: {
      source: "instagram",
      medium: "social",
      campaign: "launch",
      landingPage: "/?utm_source=instagram",
    },
  });

  assert.equal(result.marketingConsent, true);
  assert.equal(result.attribution?.source, "instagram");
});

test("requires a complete delivery address for paperback preorders", () => {
  const result = checkoutSchema.safeParse({
    edition: "paperback",
    acceptedTerms: true,
    name: "Ada Reader",
    email: "ada@example.com",
    phone: "+2347000000000",
    country: "Nigeria",
  });

  assert.equal(result.success, false);
  if (!result.success) {
    const fields = result.error.issues.map((issue) => issue.path[0]);
    assert.deepEqual(fields, ["state", "city", "address"]);
  }
});

test("accepts paperback printing and dispatch details", () => {
  const result = fulfillmentUpdateSchema.parse({
    status: "dispatched",
    trackingNumber: "DSP-12345",
    note: "Delivery arranged by phone.",
  });

  assert.equal(result.status, "dispatched");
  assert.equal(result.trackingNumber, "DSP-12345");
});

test("accepts anonymous visitor events and removes unexpected identity fields", () => {
  const result = analyticsEventSchema.parse({
    visitorId: "550e8400-e29b-41d4-a716-446655440000",
    sessionId: "6ba7b810-9dad-41d1-80b4-00c04fd430c8",
    event: "page_view",
    path: "/",
    source: "instagram",
    device: "mobile",
    email: "must-not-be-stored@example.com",
  });

  assert.equal(result.visitorId, "550e8400-e29b-41d4-a716-446655440000");
  assert.equal("email" in result, false);
});

test("requires an explicit choice before resending a recovery email", () => {
  assert.equal(paymentRecoveryActionSchema.parse({}).resend, false);
  assert.equal(paymentRecoveryActionSchema.parse({ resend: true }).resend, true);
});

