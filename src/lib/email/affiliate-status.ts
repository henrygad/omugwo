import "server-only";

import { getGmailSender } from "@/lib/email/gmail";
import type { AffiliateStatus } from "@/types/commerce";

type AffiliateEmailInput = { email: string; name: string };

export async function sendAffiliateApplicationReceivedEmail(input: AffiliateEmailInput) {
  const { user, name: senderName, transporter } = getGmailSender();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://omugwoseries.vercel.app";
  const safeName = escapeHtml(input.name);
  const result = await transporter.sendMail({
    from: { name: senderName, address: user },
    to: input.email,
    replyTo: user,
    subject: "Welcome to the Omugwo Affiliate Programme",
    text: [
      `Hello ${input.name},`,
      "",
      "Welcome to the Omugwo Affiliate Programme. We have received your application and it is now awaiting review.",
      "",
      "We will email you again as soon as your account is approved. After approval, you can create offer links, choose your selling prices and track your earnings from the affiliate portal.",
      "",
      `Check your application status: ${siteUrl}/affiliate/dashboard`,
      "",
      "Thank you for choosing to introduce Omugwo to more readers.",
      "",
      "The Omugwo book team",
    ].join("\n"),
    html: emailShell({
      preheader: "Your Omugwo affiliate application has been received.",
      eyebrow: "Application received",
      heading: "Welcome to the Omugwo Affiliate Programme.",
      name: safeName,
      body: "We have received your application and it is now awaiting review. We will email you again as soon as your account is approved.",
      detail: "After approval, you can create offer links, choose your selling prices and track your earnings from the affiliate portal.",
      buttonLabel: "Check application status",
      buttonUrl: `${siteUrl}/affiliate/dashboard`,
    }),
  });
  return result.messageId;
}

export async function sendAffiliateStatusEmail(input: { email: string; name: string; status: Exclude<AffiliateStatus, "pending"> }) {
  const { user, name: senderName, transporter } = getGmailSender();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://omugwoseries.vercel.app";
  const approved = input.status === "approved";
  const subject = approved ? "Your Omugwo affiliate application is approved" : input.status === "suspended" ? "Your Omugwo affiliate account is suspended" : "Update on your Omugwo affiliate application";
  const message = approved
    ? "Your application has been approved. Your affiliate portal is ready, and you can now create offer links, choose your selling prices and begin sharing Omugwo."
    : input.status === "suspended"
      ? "Your affiliate account and offer links are currently suspended. Reply to this email if you need clarification."
      : "Your affiliate application was not approved at this time. Reply to this email if important information was missing.";
  const result = await transporter.sendMail({
    from: { name: senderName, address: user }, to: input.email, replyTo: user, subject,
    text: `Hello ${input.name},\n\n${message}\n\nAffiliate portal: ${siteUrl}/affiliate/login`,
    html: emailShell({
      preheader: approved ? "Your Omugwo affiliate account is approved." : "There is an update to your Omugwo affiliate account.",
      eyebrow: approved ? "Account approved" : "Account update",
      heading: approved ? "You are approved and ready to begin." : "An update to your affiliate account.",
      name: escapeHtml(input.name),
      body: escapeHtml(message),
      detail: approved ? "Sign in to create your first offer link. Your dashboard will track link activity, verified sales and commission status." : "Reply to this email if you need help or believe important information is missing.",
      buttonLabel: "Open affiliate portal",
      buttonUrl: `${siteUrl}/affiliate/login`,
    }),
  });
  return result.messageId;
}

function escapeHtml(value: string) { return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }

function emailShell(input: { preheader: string; eyebrow: string; heading: string; name: string; body: string; detail: string; buttonLabel: string; buttonUrl: string }) {
  return `<!doctype html><html lang="en"><body style="margin:0;background:#f3eadb;color:#241916;font-family:Arial,Helvetica,sans-serif"><div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(input.preheader)}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;background:#f3eadb"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;overflow:hidden;border:1px solid #dfcfbb;border-radius:18px;background:#fffaf2"><tr><td style="padding:34px 38px;background:#4d1223;color:#fffaf2"><p style="margin:0 0 10px;color:#e8cda4;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">${escapeHtml(input.eyebrow)}</p><h1 style="margin:0;font-family:Georgia,serif;font-size:34px;line-height:1.1">${escapeHtml(input.heading)}</h1></td></tr><tr><td style="padding:34px 38px"><p style="margin:0 0 18px;font-size:17px;line-height:1.65">Hello ${input.name},</p><p style="margin:0 0 18px;font-size:17px;line-height:1.7">${input.body}</p><p style="margin:0 0 26px;color:#5f5049;font-size:16px;line-height:1.7">${escapeHtml(input.detail)}</p><a href="${input.buttonUrl}" style="display:inline-block;padding:14px 21px;border-radius:999px;background:#4d1223;color:white;text-decoration:none;font-weight:bold">${escapeHtml(input.buttonLabel)}</a><p style="margin:28px 0 0;font-size:15px;line-height:1.7">Thank you for helping more readers discover <em>Omugwo</em>.<br><strong>The Omugwo book team</strong></p></td></tr></table></td></tr></table></body></html>`;
}
