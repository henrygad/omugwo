import { Icon } from "@/components/Icon";

export function MobilePurchaseBar() {
  return (
    <div className="mobile-purchase-bar">
      <div>
        <span>Omugwo</span>
        <strong>Digital from ₦1,999</strong>
      </div>
      <a className="button button--mobile" href="/checkout?edition=digital">
        <Icon name="book" /> Buy digital
      </a>
    </div>
  );
}
