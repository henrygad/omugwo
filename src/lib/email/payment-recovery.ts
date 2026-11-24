import "server-only";

import { getGmailSender } from "@/lib/email/gmail";
import type { EditionId } from "@/config/site";

export async function sendPaymentRecoveryEmail(input: {
  orderId: string;
  name: string;
  email: string;
  edition: EditionId;
}) {
  const { user, name: senderName, transporter } = getGmailSender();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://omugwoseries.vercel.app";
  const checkoutUrl = `${siteUrl}/checkout?edition=${input.edition}`;
  const greeting = input.name.trim() || "Reader";
  const text = [
    `Hello ${greeting},`,
    "",
    "Your recent Omugwo checkout was not completed, and we have not recorded a successful payment for it.",
    "If you would still like the book, you can safely begin a new checkout here:",
    checkoutUrl,
    "",
    "If you believe you were charged, do not pay again. Reply to this email with your payment reference so we can check it.",
  ].join("\n");
  const result = await transporter.sendMail({
    from: { name: senderName, address: user },
    to: input.email,
    replyTo: user,
    subject: "Your Omugwo checkout was not completed",
    text,
    html: `<!doctype html><html lang="en"><body style="margin:0;background:#f3eadb;color:#241916;font-family:Arial,Helvetica,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px"><tr><td align="center"><table role="presentation" width="100%" style="max-width:620px;background:#fffaf2;border-radius:18px;overflow:hidden"><tr><td style="padding:34px 38px;background:#4d1223;color:#fffaf2"><h1 style="margin:0;font-family:Georgia,serif;font-size:32px">Would you still like to read <em>Omugwo</em>?</h1></td></tr><tr><td style="padding:34px 38px"><p style="font-size:17px;line-height:1.7">Hello ${escapeHtml(greeting)},</p><p style="font-size:16px;line-height:1.7">Your recent checkout was not completed, and we have not recorded a successful payment for it.</p><p style="margin:26px 0"><a href="${checkoutUrl}" style="display:inline-block;padding:13px 20px;border-radius:999px;background:#4d1223;color:#fffaf2;text-decoration:none;font-weight:700">Return to secure checkout</a></p><p style="font-size:14px;line-height:1.7;color:#6f615a"><strong>If you believe you were charged, do not pay again.</strong> Reply to this email with your payment reference so we can check it.</p></td></tr></table></td></tr></table></body></html>`,
    messageId: `<omugwo-recovery-${input.orderId}@gmail.com>`,
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

