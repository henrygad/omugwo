import type { Metadata } from "next";
import { PolicyPage } from "@/components/PolicyPage";

export const metadata: Metadata = { title: "Terms of Sale | Omugwo", description: "Terms governing purchases of Omugwo digital editions and paperback pre-orders." };

export default function TermsPage() {
  return (
    <PolicyPage eyebrow="Legal" title="Terms of Sale and Use">
      <section><h2>Agreement</h2><p>By placing an order, you confirm that the information you provide is accurate and that you have authority to use the selected payment method. Your order is accepted only after payment is successfully verified.</p></section>
      <section><h2>Digital edition</h2><p>The digital edition is fulfilled manually to the email address supplied at checkout. Delivery is not necessarily immediate. You are responsible for providing a working email address and checking your inbox and spam folder.</p></section>
      <section><h2>Paperback pre-order</h2><p>The paperback is not yet printed and the ₦4,999 payment reserves one copy from a forthcoming print run. No fixed printing or dispatch date is promised unless separately confirmed in writing. We will use the contact and address details supplied at checkout to provide updates and arrange delivery when copies are ready.</p></section>
      <section><h2>Prices and payment</h2><p>Displayed book prices are charged through Paystack. Paperback shipping is not included in the pre-order payment and will be arranged separately based on the delivery location. Any separate shipping charge will be communicated before shipping is arranged.</p></section>
      <section><h2>Personal-use licence and copyright</h2><p>Copyright in <em>Omugwo: The Season Mother Came</em> remains with the applicable author and rights holder. A digital purchase grants the named buyer a limited, personal, non-exclusive, non-transferable licence to read the supplied copy.</p><p>You must not share, upload, reproduce, distribute, rent, sublicense, sell, or resell the digital file, or create and sell unauthorised copies in any format. Purchasing a paperback transfers ownership of that physical copy only; it does not transfer copyright or permission to reproduce, scan, publish, or commercially distribute the work.</p></section>
      <section><h2>Acceptable use</h2><p>You may not use the website, checkout, book files, or artwork for fraud, infringement, unauthorised commercial activity, or any unlawful purpose.</p></section>
      <section><h2>Applicable rights</h2><p>Nothing in these terms excludes or limits a consumer right or remedy that cannot lawfully be excluded. If any term is unenforceable, the remaining terms continue to apply.</p></section>
    </PolicyPage>
  );
}
