import type { Metadata } from "next";
import { PolicyPage } from "@/components/PolicyPage";

export const metadata: Metadata = { title: "Refund Policy | Omugwo", description: "Our refund and cancellation policy for digital purchases and paperback pre-orders." };

export default function RefundsPage() {
  return (
    <PolicyPage eyebrow="Purchases" title="Refund and Cancellation Policy">
      <section><h2>All-sales-final policy</h2><p>Except where applicable law requires otherwise, completed purchases are final and we do not provide refunds for a change of mind, failure to read the product description, or failure to provide accurate delivery information.</p></section>
      <section><h2>Digital purchases</h2><p>Once the digital edition has been sent to the supplied email address, it cannot be returned and is not refundable for change of mind. Contact us if you were charged more than once, received the wrong file, cannot access the supplied file, or did not receive delivery after allowing a reasonable manual-fulfilment period.</p></section>
      <section><h2>Paperback pre-orders</h2><p>Paperback orders are advance pre-orders. Cancellation and refund requests made before printing or fulfilment will be considered in accordance with applicable consumer law and may be subject to any reasonable, lawful administrative charge. If we cannot supply the paperback, you will be offered an appropriate remedy.</p></section>
      <section><h2>Defective or incorrect goods</h2><p>This policy does not remove rights relating to defective, unsafe, materially misdescribed, incorrect, or undelivered goods, duplicate charges, fraud, or other rights and remedies that cannot lawfully be excluded.</p></section>
      <section><h2>Requesting assistance</h2><p>Contact us with your name, payment reference, edition, purchase email, and a clear description of the issue. Do not send card details or passwords.</p></section>
    </PolicyPage>
  );
}
