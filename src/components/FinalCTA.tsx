import { PurchaseButton } from "./PurchaseButton";

export function FinalCTA() {
  return (
    <section
      className="final-cta"
      id="final-purchase"
      aria-labelledby="final-cta-title"
    >
      <div className="final-cta__ornament" aria-hidden="true">
        <span>O</span>
      </div>
      <div className="final-cta__content">
        <p className="eyebrow">Your next unforgettable family read</p>
        <h2 id="final-cta-title">
          A mother comes to care. A family secret comes with her.
        </h2>
        <p>
          Enter a warm, funny, emotionally rich story about new life, old
          silences, and the love that travels through generations.
        </p>
        <div className="final-actions">
          <PurchaseButton edition="digital" className="button button--ivory">
            Get the Digital Copy — ₦1,999
          </PurchaseButton>
          <PurchaseButton edition="paperback" className="button button--outline-light">
            Pre-order Paperback — ₦4,999
          </PurchaseButton>
        </div>
      </div>
    </section>
  );
}
