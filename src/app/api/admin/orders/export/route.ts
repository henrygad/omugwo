import { Timestamp } from "firebase-admin/firestore";
import { connection } from "next/server";
import { requireAdminSession } from "@/lib/firebase/auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { apiError } from "@/lib/http";

function csvCell(value: unknown) {
  let text = String(value ?? "");
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

function dateCell(value: unknown) {
  return value instanceof Timestamp ? value.toDate().toISOString() : "";
}

export async function GET() {
  await connection();
  try {
    await requireAdminSession();
    const snapshot = await getAdminDb()
      .collection("orders")
      .orderBy("createdAt", "desc")
      .limit(5000)
      .get();
    const headings = [
      "Order reference",
      "Customer name",
      "Email",
      "Phone",
      "Edition",
      "Amount NGN",
      "Payment",
      "Fulfilment",
      "Country",
      "State",
      "City",
      "Street address",
      "Marketing consent",
      "UTM source",
      "UTM medium",
      "UTM campaign",
      "Tracking reference",
      "Created at",
      "Paid at",
    ];
    const rows = snapshot.docs.map((document) => {
      const value = document.data();
      const customer = (value.customer ?? {}) as Record<string, unknown>;
      const attribution = (value.attribution ?? {}) as Record<string, unknown>;
      return [
        value.paystackReference,
        customer.name,
        customer.email,
        customer.phone,
        value.editionName,
        value.amount,
        value.paymentStatus,
        value.fulfillmentStatus,
        customer.country,
        customer.state,
        customer.city,
        customer.address,
        value.marketingConsent ? "yes" : "no",
        attribution.source,
        attribution.medium,
        attribution.campaign,
        value.trackingNumber,
        dateCell(value.createdAt),
        dateCell(value.paidAt),
      ];
    });
    const csv = [headings, ...rows]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n");
    const date = new Date().toISOString().slice(0, 10);
    return new Response(`\uFEFF${csv}`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="omugwo-orders-${date}.csv"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return apiError(error);
  }
}

