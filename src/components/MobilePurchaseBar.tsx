import { Icon } from "@/components/Icon";
import { formatPrice } from "@/config/site";
import type { SalesOffer } from "@/types/commerce";
import { editionWithOffer } from "@/lib/affiliate/pricing";

export function MobilePurchaseBar({ offer }: { offer: SalesOffer }) {
  const digital = editionWithOffer(offer, "digital");
  return (
    <div className="mobile-purchase-bar">
      <div>
        <span>Omugwo</span>
        <strong>Digital {formatPrice(digital.price)}</strong>
      </div>
      <a className="button button--mobile" href="/checkout?edition=digital">
        <Icon name="book" /> Buy digital
      </a>
    </div>
  );
}
