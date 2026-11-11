type PaystackEnvelope<T> = {
  status: boolean;
  message: string;
  data: T;
};

export type PaystackTransaction = {
  id: number;
  status: string;
  reference: string;
  amount: number;
  currency: string;
  channel?: string;
  paid_at?: string | null;
  metadata?: { order_id?: string } | string | null;
};

type InitializedTransaction = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

function getSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("Paystack is not configured.");
  return key;
}

async function paystackRequest<T>(path: string, init?: RequestInit) {
  const response = await fetch(`https://api.paystack.co${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  const payload = (await response.json()) as PaystackEnvelope<T>;

  if (!response.ok || !payload.status) {
    throw new Error(payload.message || "Paystack request failed.");
  }

  return payload.data;
}

export function initializePaystackTransaction(input: {
  email: string;
  amount: number;
  reference: string;
  callbackUrl: string;
  orderId: string;
}) {
  return paystackRequest<InitializedTransaction>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      amount: String(input.amount),
      currency: "NGN",
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: JSON.stringify({ order_id: input.orderId }),
    }),
  });
}

export function verifyPaystackTransaction(reference: string) {
  return paystackRequest<PaystackTransaction>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
  );
}
