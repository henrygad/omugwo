import { formatPrice, type EditionId } from "@/config/site";
import { getGmailSender } from "@/lib/email/gmail";
import type { OrderCustomer } from "@/types/commerce";

type PaymentConfirmationInput = {
  orderId: string;
  customer: OrderCustomer;
  edition: EditionId;
  editionName: string;
  amount: number;
  currency: "NGN";
  reference: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function deliveryMessage(edition: EditionId) {
  if (edition === "digital") {
    return {
      heading: "What happens next",
      text: "We will send your digital copy manually to this email address. Please keep this message and your payment reference for your records.",
    };
  }

  return {
    heading: "Your paperback pre-order is reserved",
    text: "We will contact you when printed copies are ready so that delivery can be arranged using the information supplied with your order.",
  };
}

export async function sendPaymentConfirmationEmail(
  input: PaymentConfirmationInput,
) {
  const { user: gmailUser, name: senderName, transporter } = getGmailSender();

  const customerName = input.customer.name?.trim() || "Reader";
  const delivery = deliveryMessage(input.edition);
  const amount = formatPrice(input.amount);
  const safeName = escapeHtml(customerName);
  const safeEdition = escapeHtml(input.editionName);
  const safeReference = escapeHtml(input.reference);

  const text = [
    `Hello ${customerName},`,
    "",
    "Thank you for ordering Omugwo: The Season Mother Came. Your payment has been received and verified.",
    "",
    `Edition: ${input.editionName}`,
    `Amount received: ${amount}`,
    `Payment reference: ${input.reference}`,
    "",
    delivery.heading,
    delivery.text,
    "",
    "Thank you for supporting this book.",
    "",
    "Warmly,",
    "The Omugwo book team",
  ].join("\n");

  const html = `
    <!doctype html>
    <html lang="en">
      <body style="margin:0;background:#f3eadb;color:#241916;font-family:Arial,Helvetica,sans-serif;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Your Omugwo payment has been received and verified.</div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3eadb;padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fffaf2;border:1px solid rgba(73,40,31,.15);border-radius:18px;overflow:hidden;">
                <tr>
                  <td style="padding:34px 38px 28px;background:#4d1223;color:#fffaf2;">
                    <p style="margin:0 0 10px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#e8cda4;">Payment confirmed</p>
                    <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:1.05;font-weight:600;">Thank you for ordering <em>Omugwo</em>.</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:34px 38px;">
                    <p style="margin:0 0 18px;font-size:17px;line-height:1.65;">Hello ${safeName},</p>
                    <p style="margin:0 0 26px;font-size:17px;line-height:1.65;">We have received and verified your payment for <strong>Omugwo: The Season Mother Came</strong>.</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 28px;border-collapse:collapse;background:#f7efe3;border-radius:12px;">
                      <tr><td style="padding:14px 18px;border-bottom:1px solid #dfcfbb;color:#6f615a;">Edition</td><td align="right" style="padding:14px 18px;border-bottom:1px solid #dfcfbb;font-weight:700;">${safeEdition}</td></tr>
                      <tr><td style="padding:14px 18px;border-bottom:1px solid #dfcfbb;color:#6f615a;">Amount received</td><td align="right" style="padding:14px 18px;border-bottom:1px solid #dfcfbb;font-weight:700;">${escapeHtml(amount)}</td></tr>
                      <tr><td style="padding:14px 18px;color:#6f615a;">Reference</td><td align="right" style="padding:14px 18px;font-weight:700;">${safeReference}</td></tr>
                    </table>
                    <h2 style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:24px;color:#4d1223;">${escapeHtml(delivery.heading)}</h2>
                    <p style="margin:0 0 28px;font-size:16px;line-height:1.7;">${escapeHtml(delivery.text)}</p>
                    <p style="margin:0;font-size:16px;line-height:1.7;">Thank you for supporting this book.</p>
                    <p style="margin:22px 0 0;font-size:16px;line-height:1.7;">Warmly,<br><strong>The Omugwo book team</strong></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const result = await transporter.sendMail({
    from: { name: senderName, address: gmailUser },
    to: input.customer.email,
    replyTo: gmailUser,
    subject: `Payment received — ${input.editionName}`,
    html,
    text,
    messageId: `<omugwo-payment-${input.orderId}@gmail.com>`,
    headers: {
      "X-Omugwo-Order": input.orderId,
      "X-Omugwo-Edition": input.edition,
    },
  });

  return result.messageId;
}
