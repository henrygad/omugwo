import "server-only";

import { getGmailSender } from "@/lib/email/gmail";

export async function sendReviewRequestEmail(input: {
  orderId: string;
  name: string;
  email: string;
}) {
  const { user, name: senderName, transporter } = getGmailSender();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://omugwoseries.vercel.app";
  const reviewUrl = `${siteUrl}/submit-review`;
  const greeting = input.name.trim() || "Reader";
  const text = [
    `Hello ${greeting},`,
    "",
    "We hope you have had time to begin reading Omugwo: The Season Mother Came.",
    "If you would like to share an honest response, you can submit a review here:",
    reviewUrl,
    "",
    "Every review is checked before publication. There is no reward for reviewing, and you are welcome to share your genuine opinion.",
    "",
    "Thank you for reading Omugwo.",
  ].join("\n");

  const result = await transporter.sendMail({
    from: { name: senderName, address: user },
    to: input.email,
    replyTo: user,
    subject: "How are you finding Omugwo?",
    text,
    html: `<!doctype html><html lang="en"><body style="margin:0;background:#f3eadb;color:#241916;font-family:Arial,Helvetica,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px"><tr><td align="center"><table role="presentation" width="100%" style="max-width:620px;background:#fffaf2;border-radius:18px;overflow:hidden"><tr><td style="padding:34px 38px;background:#4d1223;color:#fffaf2"><p style="margin:0 0 8px;color:#e8cda4;letter-spacing:2px;text-transform:uppercase;font-size:12px">A note for readers</p><h1 style="margin:0;font-family:Georgia,serif;font-size:34px">How are you finding <em>Omugwo</em>?</h1></td></tr><tr><td style="padding:34px 38px"><p style="font-size:17px;line-height:1.7">Hello ${escapeHtml(greeting)},</p><p style="font-size:17px;line-height:1.7">We hope you have had time to begin reading <strong>Omugwo: The Season Mother Came</strong>.</p><p style="font-size:16px;line-height:1.7">If you would like to share an honest response, we would be grateful to hear it.</p><p style="margin:26px 0"><a href="${reviewUrl}" style="display:inline-block;padding:13px 20px;border-radius:999px;background:#4d1223;color:#fffaf2;text-decoration:none;font-weight:700">Share an honest review</a></p><p style="font-size:14px;line-height:1.7;color:#6f615a">Every review is checked before publication. There is no reward for reviewing, and you are welcome to share your genuine opinion.</p></td></tr></table></td></tr></table></body></html>`,
    messageId: `<omugwo-review-request-${input.orderId}@gmail.com>`,
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

