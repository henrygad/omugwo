import "server-only";

import nodemailer from "nodemailer";

export function getGmailSender() {
  const user = process.env.GMAIL_USER?.trim();
  const password = process.env.GMAIL_APP_PASSWORD?.replaceAll(" ", "").trim();
  const name = process.env.ORDER_EMAIL_FROM_NAME?.trim() || "Omugwo Book";
  if (!user || !password) {
    throw new Error(
      "Order email is not configured. GMAIL_USER and GMAIL_APP_PASSWORD are required.",
    );
  }
  return {
    user,
    name,
    transporter: nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass: password },
    }),
  };
}
