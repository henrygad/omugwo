import { Icon } from "@/components/Icon";
import { editions, formatPrice } from "@/config/site";

export function MobilePurchaseBar() {
  return (
    <div className="mobile-purchase-bar">
      <div>
        <span>Omugwo</span>
        <strong>Digital from {formatPrice(editions.digital.price)}</strong>
      </div>
      <a className="button button--mobile" href="/checkout?edition=digital">
        <Icon name="book" /> Buy digital
      </a>
    </div>
  );
}
