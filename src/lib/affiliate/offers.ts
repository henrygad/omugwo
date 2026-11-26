import "server-only";

import { cookies } from "next/headers";
import { affiliatePricing, type EditionId } from "@/config/site";
import { getAdminDb } from "@/lib/firebase/admin";
import type { SalesOffer } from "@/types/commerce";

export const affiliateOfferCookie = "omugwo_offer";

export function companyOffer(): SalesOffer {
  return {
    id: "company",
    code: "company",
    title: "Official Omugwo offer",
    digitalPrice: affiliatePricing.company.digital,
    paperbackPrice: affiliatePricing.company.paperback,
    isCompany: true,
  };
}

function validPrice(edition: EditionId, value: unknown) {
  const price = Number(value);
  return Number.isInteger(price) &&
    price >= affiliatePricing.minimum[edition] &&
    price <= affiliatePricing.maximum[edition];
}

export async function findActiveOfferByCode(code: string): Promise<SalesOffer | null> {
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(code)) return null;
  const match = await getAdminDb()
    .collection("affiliateOffers")
    .where("code", "==", code)
    .limit(1)
    .get();
  const document = match.docs[0];
  if (!document || document.get("active") !== true) return null;
  const value = document.data();
  if (
    !validPrice("digital", value.digitalPrice) ||
    !validPrice("paperback", value.paperbackPrice) ||
    typeof value.affiliateId !== "string" ||
    typeof value.affiliateName !== "string"
  ) return null;

  const affiliate = await getAdminDb().collection("affiliates").doc(value.affiliateId).get();
  if (!affiliate.exists || affiliate.get("status") !== "approved") return null;

  return {
    id: document.id,
    code: String(value.code),
    affiliateId: String(value.affiliateId),
    affiliateName: String(value.affiliateName),
    title: String(value.title),
    digitalPrice: Number(value.digitalPrice),
    paperbackPrice: Number(value.paperbackPrice),
    isCompany: false,
  };
}

export async function getActiveSalesOffer(): Promise<SalesOffer> {
  const code = (await cookies()).get(affiliateOfferCookie)?.value;
  if (!code) return companyOffer();
  return (await findActiveOfferByCode(code)) ?? companyOffer();
}


