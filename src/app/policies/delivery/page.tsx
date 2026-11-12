import type { Metadata } from "next";
import { PolicyPage } from "@/components/PolicyPage";

export const metadata: Metadata = { title: "Delivery and Pre-order Policy | Omugwo", description: "How we fulfil digital orders and manage paperback pre-order delivery." };

export default function DeliveryPage() {
  return (
    <PolicyPage eyebrow="Fulfilment" title="Delivery and Pre-order Policy">
      <section><h2>Digital delivery</h2><p>Digital copies are sent manually to the email address entered at checkout after payment verification. Please provide an accurate email address and check your spam or promotions folder. If your copy has not arrived within a reasonable period, contact us with your payment reference.</p></section>
      <section><h2>Paperback pre-orders</h2><p>The paperback is currently in pre-order and is not ready for immediate dispatch. Your payment reserves a copy. We will contact you using the supplied email address or phone number when printing is complete and copies are ready.</p></section>
      <section><h2>Shipping arrangements</h2><p>The paperback pre-order price does not include shipping. Delivery availability, method, timing, and cost depend on the country, state, city, and address supplied. We will communicate the shipping arrangement before dispatch.</p></section>
      <section><h2>Address changes</h2><p>Notify us promptly if your delivery address or contact details change. We are not responsible for delays caused by inaccurate information that was not corrected before dispatch.</p></section>
      <section><h2>Delays</h2><p>Printing and delivery schedules may change. We will provide reasonable updates when a material delay becomes known. Statutory cancellation and consumer rights remain unaffected.</p></section>
    </PolicyPage>
  );
}
