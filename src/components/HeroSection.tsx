import { Book3D } from "./Book3D";
import { PurchaseButton } from "./PurchaseButton";
import { Icon } from "./Icon";
import { editions, formatPrice } from "@/config/site";

export function HeroSection() {
  return (
    <section className="hero shell" id="top" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow">An Igbo story of family, care &amp; inheritance</p>
        <p className="book-title-line">Omugwo: The Season Mother Came</p>
        <div className="hero-mobile-book" aria-label="Three-dimensional book preview">
          <Book3D compact eager />
        </div>
        <h1 id="hero-title">
          A mother comes to care. A family secret comes with her.
        </h1>
        <p className="hero-lede">
          A warm, funny, emotionally rich novella about mothers, daughters, new
          life, and the stories families carry across generations.
        </p>
        <div className="hero-actions">
          <PurchaseButton edition="digital" className="button button--primary">
            Get the Digital Copy — {formatPrice(editions.digital.price)}
          </PurchaseButton>
          <PurchaseButton edition="paperback" className="button button--secondary">
            Pre-order Paperback — {formatPrice(editions.paperback.price)}
          </PurchaseButton>
        </div>
        <div className="hero-assurances" aria-label="Purchase assurances">
          <span><Icon name="shield" /> Secure Paystack checkout</span>
          <span><Icon name="user" /> No account required</span>
          <span><Icon name="mail" /> Personal order support</span>
        </div>
      </div>

      <div className="hero-book-lane" aria-hidden="true" />
    </section>
  );
}
