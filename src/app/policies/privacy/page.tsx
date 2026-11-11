import type { Metadata } from "next";
import { PolicyPage } from "@/components/PolicyPage";

export const metadata: Metadata = { title: "Privacy Policy | Omugwo", description: "How customer and reviewer information is used for the Omugwo sales page." };

export default function PrivacyPage() {
  return (
    <PolicyPage eyebrow="Privacy" title="Privacy Policy">
      <section><h2>Information we collect</h2><p>For digital orders, we collect your name, email address, edition, payment reference, and transaction status. For paperback pre-orders, we also collect your phone number, country, state, city, and street address. Review submissions include the name, email, rating, and comment you provide.</p></section>
      <section><h2>How information is used</h2><p>We use this information to process and verify payments, fulfil digital orders, manage paperback pre-orders and delivery, provide customer support, prevent fraud, maintain transaction records, and moderate reviews. Review email addresses are not displayed publicly.</p></section>
      <section><h2>Payment processing</h2><p>Payments are processed on Paystack’s hosted checkout. We do not receive or store your complete card details, PIN, or card security code.</p></section>
      <section><h2>Service providers</h2><p>Order and account information may be processed using service providers including Paystack and Google Firebase where necessary to operate the website, verify payments, secure administrator access, and store order records.</p></section>
      <section><h2>Retention and security</h2><p>Records are retained for fulfilment, support, accounting, fraud prevention, dispute handling, and legal obligations. We use reasonable technical and organisational safeguards, but no internet service can guarantee absolute security.</p></section>
      <section><h2>Your choices</h2><p>You may contact us to request access to or correction of your information, or to ask about deletion where retention is not required for a transaction, dispute, security, or legal obligation.</p></section>
    </PolicyPage>
  );
}
