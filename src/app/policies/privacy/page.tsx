import type { Metadata } from "next";
import { PolicyPage } from "@/components/PolicyPage";

export const metadata: Metadata = { title: "Privacy Policy | Omugwo", description: "How we use customer and reviewer information on this book sales page." };

export default function PrivacyPage() {
  return (
    <PolicyPage eyebrow="Privacy" title="Privacy Policy">
      <section><h2>Information we collect</h2><p>For digital orders, we collect your name, email address, edition, payment reference, and transaction status. For paperback pre-orders, we also collect your phone number, country, state, city, and street address. Review submissions include the name, email, rating, and comment you provide.</p></section>
      <section><h2>How information is used</h2><p>We use this information to process and verify payments, fulfil digital orders, manage paperback pre-orders and delivery, provide customer support, prevent fraud, maintain transaction records, and moderate reviews. Review email addresses are not displayed publicly.</p></section>
      <section><h2>Analytics and campaign information</h2><p>With your permission, we may use Google Analytics and privacy-limited first-party analytics to understand page visits, checkout activity, device category, sharing, and general campaign performance. First-party analytics uses a random visitor identifier and does not identify an ordinary visitor by name or email. If a recorded visitor completes a purchase, the anonymous record may be linked to that order. We may also store first-touch referral and campaign parameters with an order so we can understand which promotions lead to sales. Analytics permission is optional and can be declined without affecting checkout.</p></section>
      <section><h2>Optional book news</h2><p>You may separately choose to receive occasional news about <em>Omugwo</em> and future books. This choice is optional, is not required to purchase, and is recorded with your order. You can withdraw your consent by replying to an email or contacting us.</p></section>
      <section><h2>Transactional follow-ups</h2><p>We may send necessary order emails, paperback status updates, one reminder when a checkout was not completed, and one request for an honest review after fulfilment. These messages are connected to your order and are separate from optional marketing messages.</p></section>
      <section><h2>Payment processing</h2><p>Payments are processed on Paystack’s hosted checkout. We do not receive or store your complete card details, PIN, or card security code.</p></section>
      <section><h2>Service providers</h2><p>Order and account information may be processed using service providers including Paystack, Google Firebase, Gmail, Google Analytics when permitted, and Vercel where necessary to operate the website, verify payments, send order communication, secure administrator access, store order records, and measure website performance.</p></section>
      <section><h2>Retention and security</h2><p>Records are retained for fulfilment, support, accounting, fraud prevention, dispute handling, and legal obligations. We use reasonable technical and organisational safeguards, but no internet service can guarantee absolute security.</p></section>
      <section><h2>Your choices</h2><p>You may contact us to request access to or correction of your information, or to ask about deletion where retention is not required for a transaction, dispute, security, or legal obligation.</p></section>
    </PolicyPage>
  );
}
