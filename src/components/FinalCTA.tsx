import { PurchaseButton } from "./PurchaseButton";
import { formatPrice } from "@/config/site";
import type { SalesOffer } from "@/types/commerce";
import { editionWithOffer } from "@/lib/affiliate/pricing";

export function FinalCTA({ offer }: { offer: SalesOffer }) {
  const digital = editionWithOffer(offer, "digital");
  const paperback = editionWithOffer(offer, "paperback");
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
            Get the Digital Copy — {formatPrice(digital.price)}
          </PurchaseButton>
          <PurchaseButton edition="paperback" className="button button--outline-light">
            Pre-order Paperback — {formatPrice(paperback.price)}
          </PurchaseButton>
        </div>
      </div>
    </section>
  );
}
