import { faqs } from "@/config/site";

export function FAQSection() {
  return (
    <section className="faq-section section-shell" id="faq" aria-labelledby="faq-title">
      <div className="faq-heading">
        <p className="section-index">08 — Frequently asked questions</p>
        <h2 id="faq-title">Before you choose your copy.</h2>
        <p>
          Straight answers about digital access, paperback delivery, and guest
          checkout.
        </p>
      </div>
      <div className="faq-list">
        {faqs.map((item, index) => (
          <details key={item.question} name="purchase-faq">
            <summary>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item.question}</strong>
              <i aria-hidden="true" />
            </summary>
            <div className="faq-answer">
              <p>{item.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
