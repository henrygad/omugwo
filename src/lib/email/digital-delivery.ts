import "server-only";

import { getGmailSender } from "@/lib/email/gmail";

type DigitalDeliveryEmailInput = {
  deliveryId: string;
  recipientName: string;
  recipientEmail: string;
  orderReference: string;
  complimentary: boolean;
  fileName: string;
  file: Buffer;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendDigitalDeliveryEmail(
  input: DigitalDeliveryEmailInput,
) {
  const { user, name, transporter } = getGmailSender();
  const safeName = escapeHtml(input.recipientName);
  const safeReference = escapeHtml(input.orderReference);
  const referenceLabel = input.complimentary
    ? "Complimentary copy reference"
    : "Order reference";
  const text = [
    `Hello ${input.recipientName},`,
    "",
    "Your personalized copy of Omugwo: The Season Mother Came is attached to this email as an EPUB file.",
    `${referenceLabel}: ${input.orderReference}`,
    "",
    "How to open your book:",
    "• iPhone or iPad: Tap the EPUB attachment. If asked, tap Share, then choose Books to open it in Apple Books.",
    "• Android: Open the attachment with Google Play Books. If you do not have it, download Google Play Books from the Play Store, then choose Open with Play Books or Upload to Play Books.",
    "",
    "This copy is licensed to you for personal, non-commercial reading. Please do not share, upload, distribute, sell, or resell the file.",
    "",
    "Thank you for reading and supporting Omugwo.",
    "For help, reply to this email or contact Henrygad.orji@gmail.com.",
  ].join("\n");
  const html = `<!doctype html><html lang="en"><body style="margin:0;background:#f3eadb;color:#241916;font-family:Arial,Helvetica,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fffaf2;border-radius:18px;overflow:hidden"><tr><td style="padding:34px 38px;background:#4d1223;color:#fffaf2"><p style="margin:0 0 10px;color:#e8cda4;font-size:12px;letter-spacing:2px;text-transform:uppercase">Your digital edition</p><h1 style="margin:0;font-family:Georgia,serif;font-size:34px">Your copy of <em>Omugwo</em> is here.</h1></td></tr><tr><td style="padding:34px 38px"><p style="font-size:17px;line-height:1.7">Hello ${safeName},</p><p style="font-size:17px;line-height:1.7">Your personalized copy of <strong>Omugwo: The Season Mother Came</strong> is attached as an EPUB file.</p><p style="padding:14px 18px;background:#f7efe3;border-radius:10px"><strong>${referenceLabel}:</strong> ${safeReference}</p><div style="margin:24px 0;padding:20px;background:#f7efe3;border-radius:12px"><h2 style="margin:0 0 12px;font-family:Georgia,serif;font-size:21px">How to open your book</h2><p style="margin:0 0 10px;font-size:15px;line-height:1.7"><strong>iPhone or iPad:</strong> Tap the EPUB attachment. If asked, tap <strong>Share</strong>, then choose <strong>Books</strong> to open it in Apple Books.</p><p style="margin:0;font-size:15px;line-height:1.7"><strong>Android:</strong> Open the attachment with <strong>Google Play Books</strong>. If you do not have it, download Google Play Books from the Play Store, then choose <strong>Open with Play Books</strong> or <strong>Upload to Play Books</strong>.</p></div><p style="font-size:16px;line-height:1.7">This copy is licensed to you for personal, non-commercial reading. Please do not share, upload, distribute, sell, or resell it.</p><p style="font-size:16px;line-height:1.7">Thank you for reading and supporting <em>Omugwo</em>.</p><p style="font-size:14px;line-height:1.6;color:#6f615a">Need help? Reply to this email or contact Henrygad.orji@gmail.com.</p></td></tr></table></td></tr></table></body></html>`;
  const result = await transporter.sendMail({
    from: { name, address: user },
    to: input.recipientEmail,
    replyTo: user,
    subject: "Your personalized copy of Omugwo",
    text,
    html,
    attachments: [
      {
        filename: input.fileName,
        content: input.file,
        contentType: "application/epub+zip",
      },
    ],
    messageId: `<omugwo-delivery-${input.deliveryId}-${Date.now()}@gmail.com>`,
    headers: { "X-Omugwo-Delivery": input.deliveryId },
  });
  return result.messageId;
}
