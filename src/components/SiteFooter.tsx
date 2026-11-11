import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Icon } from "@/components/Icon";

export function SiteFooter() {
  return (
    <footer className="site-footer" id="footer">
      <div className="footer-main">
        <div className="footer-brand">
          <span className="brand-mark" aria-hidden="true">
            O
          </span>
          <h2>Omugwo</h2>
          <p>The Season Mother Came</p>
        </div>
        <div className="footer-column">
          <h3>Explore</h3>
          {siteConfig.navigation.map((item) => (
            <Link className="icon-label" href={item.href} key={item.href}>
              <Icon name="arrow-right" /> {item.label}
            </Link>
          ))}
          <Link className="icon-label" href="/submit-review"><Icon name="message" /> Submit a review</Link>
          <Link className="icon-label" href="/#top"><Icon name="arrow-right" className="icon-rotate-up" /> Back to top</Link>
        </div>
        <div className="footer-column">
          <h3>Contact &amp; policies</h3>
          <a className="icon-label" href="mailto:Henrygad.orji@gmail.com">
            <Icon name="mail" /> Henrygad.orji@gmail.com
          </a>
          <a className="icon-label" href="tel:+2347081477330">
            <Icon name="phone" /> +234 708 147 7330
          </a>
          <Link href="/policies/terms">Terms of Sale</Link>
          <Link href="/policies/refunds">Refund Policy</Link>
          <Link href="/policies/delivery">Delivery &amp; Pre-order Policy</Link>
          <Link href="/policies/privacy">Privacy Policy</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© Omugwo: The Season Mother Came.</p>
        <p className="icon-label"><Icon name="shield" /> Secure hosted checkout powered by Paystack</p>
      </div>
    </footer>
  );
}
