import Link from "next/link";
import { type EditionId } from "@/config/site";
import { Icon } from "@/components/Icon";

type PurchaseButtonProps = {
  edition: EditionId;
  className: string;
  children: React.ReactNode;
};

export function PurchaseButton({
  edition,
  className,
  children,
}: PurchaseButtonProps) {
  return (
    <Link className={className} href={`/checkout?edition=${edition}`}>
      <Icon name={edition === "digital" ? "book" : "orders"} />
      {children}
      <Icon name="arrow-right" />
    </Link>
  );
}
