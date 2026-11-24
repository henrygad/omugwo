import "server-only";

import { getGmailSender } from "@/lib/email/gmail";
import type { FulfillmentStatus } from "@/types/commerce";

const statusCopy: Partial<Record<FulfillmentStatus, { subject: string; heading: string; text: string }>> = {
  preorder_received: {
    subject: "Your Omugwo paperback preorder is reserved",
    heading: "Your preorder is safely recorded.",
    text: "We will contact you again as the paperback moves through printing and delivery preparation.",
  },
  printing: {
    subject: "Your Omugwo paperback is being printed",
    heading: "Printing is underway.",
    text: "Your reserved copy is now part of the print run. We will contact you again when it is ready for dispatch.",
  },
  ready_for_dispatch: {
    subject: "Your Omugwo paperback is ready for dispatch",
    heading: "Your copy is ready.",
    text: "Your paperback is ready for dispatch. We will confirm the shipping arrangement using your order contact details.",
  },
  dispatched: {
    subject: "Your Omugwo paperback has been dispatched",
    heading: "Your book is on its way.",
    text: "Your paperback has been dispatched to the delivery address supplied with your order.",
  },
  delivered: {
    subject: "Your Omugwo paperback order is complete",
    heading: "We hope you enjoy your copy.",
    text: "Your paperback order has been marked as delivered. Please contact us if you need any help.",
  },
};

export async function sendPreorderUpdateEmail(input: {
  orderId: string;
  name: string;
  email: string;
  reference: string;
  status: FulfillmentStatus;
  trackingNumber?: string;
  note?: string;
}) {
  const copy = statusCopy[input.status];
  if (!copy) return null;
  const { user, name: senderName, transporter } = getGmailSender();
  const greeting = input.name.trim() || "Reader";
  const extras = [
    input.trackingNumber ? `Tracking or dispatch reference: ${input.trackingNumber}` : "",
    input.note || "",
  ].filter(Boolean);
  const text = [
    `Hello ${greeting},`,
    "",
    copy.heading,
    copy.text,
    `Order reference: ${input.reference}`,
    ...extras,
    "",
    "Thank you for your patience and support.",
  ].join("\n");
  const result = await transporter.sendMail({
    from: { name: senderName, address: user },
    to: input.email,
    replyTo: user,
    subject: copy.subject,
    text,
    html: `<!doctype html><html lang="en"><body style="margin:0;background:#f3eadb;color:#241916;font-family:Arial,Helvetica,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px"><tr><td align="center"><table role="presentation" width="100%" style="max-width:620px;background:#fffaf2;border-radius:18px;overflow:hidden"><tr><td style="padding:34px 38px;background:#4d1223;color:#fffaf2"><p style="margin:0 0 8px;color:#e8cda4;letter-spacing:2px;text-transform:uppercase;font-size:12px">Paperback preorder update</p><h1 style="margin:0;font-family:Georgia,serif;font-size:32px">${escapeHtml(copy.heading)}</h1></td></tr><tr><td style="padding:34px 38px"><p style="font-size:17px;line-height:1.7">Hello ${escapeHtml(greeting)},</p><p style="font-size:16px;line-height:1.7">${escapeHtml(copy.text)}</p><p style="padding:14px 18px;background:#f7efe3;border-radius:10px"><strong>Order reference:</strong> ${escapeHtml(input.reference)}</p>${extras.map((value) => `<p style="font-size:15px;line-height:1.7">${escapeHtml(value)}</p>`).join("")}<p style="font-size:16px;line-height:1.7">Thank you for your patience and support.</p></td></tr></table></td></tr></table></body></html>`,
    messageId: `<omugwo-preorder-${input.orderId}-${input.status}@gmail.com>`,
  });
  return result.messageId;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

