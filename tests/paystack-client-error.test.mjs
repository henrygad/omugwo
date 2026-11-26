import assert from "node:assert/strict";
import test from "node:test";
import {
  isMissingPaystackTransaction,
  PaystackRequestError,
} from "../src/lib/paystack/client.ts";

test("recognizes Paystack's missing transaction reference response", () => {
  const error = new PaystackRequestError(
    "Transaction reference not found.",
    404,
  );

  assert.equal(isMissingPaystackTransaction(error), true);
  assert.equal(
    isMissingPaystackTransaction(new PaystackRequestError("Unauthorized", 401)),
    false,
  );
});
