import test from "node:test";
import assert from "node:assert/strict";
import {
  affiliateAccountClosureSchema,
  affiliateOfferSchema,
  affiliateOnboardingSchema,
  affiliateProfileSettingsSchema,
} from "../src/lib/validation.ts";

test("accepts affiliate offers inside both approved price ranges", () => {
  const offer = affiliateOfferSchema.parse({
    title: "Launch offer",
    digitalPrice: 2000,
    paperbackPrice: 10000,
  });
  assert.equal(offer.digitalPrice, 2000);
  assert.equal(offer.paperbackPrice, 10000);
});

test("rejects affiliate prices below the company base or above the maximum", () => {
  assert.equal(
    affiliateOfferSchema.safeParse({
      title: "Too low",
      digitalPrice: 1999,
      paperbackPrice: 5000,
    }).success,
    false,
  );
  assert.equal(
    affiliateOfferSchema.safeParse({
      title: "Too high",
      digitalPrice: 5000,
      paperbackPrice: 10001,
    }).success,
    false,
  );
});

test("requires explicit affiliate terms acceptance during onboarding", () => {
  const result = affiliateOnboardingSchema.safeParse({
    fullName: "Test Affiliate",
    publicName: "Test Reads",
    phone: "07000000000",
    marketingDetails: "I share Nigerian literary fiction with my reading community.",
    acceptedTerms: false,
  });
  assert.equal(result.success, false);
});

test("accepts valid affiliate profile settings", () => {
  const result = affiliateProfileSettingsSchema.safeParse({
    publicName: "Test Reads",
    phone: "07000000000",
    marketingDetails: "I share Nigerian literary fiction with my reading community.",
  });
  assert.equal(result.success, true);
});

test("requires the exact account closure confirmation", () => {
  assert.equal(affiliateAccountClosureSchema.safeParse({ confirmation: "delete" }).success, false);
  assert.equal(affiliateAccountClosureSchema.safeParse({ confirmation: "DELETE" }).success, true);
});
