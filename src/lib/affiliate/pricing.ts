import { editions, type EditionId } from "@/config/site";
import type { SalesOffer } from "@/types/commerce";

export function offerPrice(offer: SalesOffer, edition: EditionId) {
  return edition === "digital" ? offer.digitalPrice : offer.paperbackPrice;
}

export function editionWithOffer(offer: SalesOffer, edition: EditionId) {
  return { ...editions[edition], price: offerPrice(offer, edition) };
}
