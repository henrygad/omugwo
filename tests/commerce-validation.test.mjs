import assert from "node:assert/strict";
import test from "node:test";
import {
  checkoutSchema,
  fulfillmentUpdateSchema,
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

