import "server-only";

import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { requireAffiliateSession } from "@/lib/firebase/auth";
import type {
  AffiliateCommission,
  AffiliateOffer,
  AffiliateProfile,
} from "@/types/commerce";

function iso(value: unknown) {
  return value instanceof Timestamp ? value.toDate().toISOString() : "";
}

export async function getAffiliateProfile(uid?: string): Promise<AffiliateProfile | null> {
  const affiliateId = uid ?? (await requireAffiliateSession()).uid;
  const snapshot = await getAdminDb().collection("affiliates").doc(affiliateId).get();
  if (!snapshot.exists) return null;
  const value = snapshot.data() ?? {};
  return {
    id: snapshot.id,
    email: String(value.email ?? ""),
    fullName: String(value.fullName ?? ""),
    publicName: String(value.publicName ?? ""),
    phone: String(value.phone ?? ""),
    marketingDetails: String(value.marketingDetails ?? ""),
    status: value.status as AffiliateProfile["status"],
    ...(value.bankName ? { bankName: String(value.bankName) } : {}),
    ...(value.accountName ? { accountName: String(value.accountName) } : {}),
    ...(value.accountNumber ? { accountNumber: String(value.accountNumber) } : {}),
    ...(value.negativeBalance ? { negativeBalance: Number(value.negativeBalance) } : {}),
    ...(value.termsVersion ? { termsVersion: String(value.termsVersion) } : {}),
    ...(value.termsAcceptedAt ? { termsAcceptedAt: iso(value.termsAcceptedAt) } : {}),
    createdAt: iso(value.createdAt),
    updatedAt: iso(value.updatedAt),
  };
}

export async function requireApprovedAffiliate() {
  const session = await requireAffiliateSession();
  const profile = await getAffiliateProfile(session.uid);
  if (!profile || profile.status !== "approved") throw new Error("Affiliate approval required.");
  return { session, profile };
}

export async function listAffiliateOffers(affiliateId?: string): Promise<AffiliateOffer[]> {
  const id = affiliateId ?? (await requireApprovedAffiliate()).session.uid;
  const snapshot = await getAdminDb()
    .collection("affiliateOffers")
    .where("affiliateId", "==", id)
    .limit(200)
    .get();
  return snapshot.docs
    .map((document) => {
      const value = document.data();
      return {
        id: document.id,
        code: String(value.code),
        affiliateId: String(value.affiliateId),
        affiliateName: String(value.affiliateName),
        title: String(value.title),
        digitalPrice: Number(value.digitalPrice),
        paperbackPrice: Number(value.paperbackPrice),
        isCompany: false,
        active: value.active === true,
        clicks: Number(value.clicks ?? 0),
        checkouts: Number(value.checkouts ?? 0),
        paidSales: Number(value.paidSales ?? 0),
        createdAt: iso(value.createdAt),
        updatedAt: iso(value.updatedAt),
      } satisfies AffiliateOffer;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listAffiliateCommissions(affiliateId?: string): Promise<AffiliateCommission[]> {
  const id = affiliateId ?? (await requireApprovedAffiliate()).session.uid;
  const snapshot = await getAdminDb()
    .collection("affiliateCommissions")
    .where("affiliateId", "==", id)
    .limit(500)
    .get();
  return snapshot.docs.map((document) => {
    const value = document.data();
    return {
      id: document.id,
      orderId: String(value.orderId),
      affiliateId: String(value.affiliateId),
      affiliateName: String(value.affiliateName),
      offerId: String(value.offerId),
      edition: value.edition as AffiliateCommission["edition"],
      saleAmount: Number(value.saleAmount),
      companyBaseAmount: Number(value.companyBaseAmount),
      affiliateGrossAmount: Number(value.affiliateGrossAmount),
      paystackFee: Number(value.paystackFee),
      companyFeeShare: Number(value.companyFeeShare),
      affiliateFeeShare: Number(value.affiliateFeeShare),
      companyNetAmount: Number(value.companyNetAmount),
      affiliateNetAmount: Number(value.affiliateNetAmount),
      status: value.status as AffiliateCommission["status"],
      ...(value.paidAt ? { paidAt: iso(value.paidAt) } : {}),
      availableAt: iso(value.availableAt),
      createdAt: iso(value.createdAt),
      updatedAt: iso(value.updatedAt),
    };
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function refreshAvailableCommissions(affiliateId?: string) {
  const id = affiliateId ?? (await requireApprovedAffiliate()).session.uid;
  const snapshot = await getAdminDb()
    .collection("affiliateCommissions")
    .where("affiliateId", "==", id)
    .limit(500)
    .get();
  const now = Timestamp.now();
  const batch = getAdminDb().batch();
  let changed = 0;
  for (const document of snapshot.docs) {
    if (document.get("status") !== "pending") continue;
    const availableAt = document.get("availableAt") as Timestamp | undefined;
    if (availableAt && availableAt.toMillis() <= now.toMillis()) {
      batch.update(document.ref, { status: "available", updatedAt: FieldValue.serverTimestamp() });
      changed += 1;
    }
  }
  if (changed) await batch.commit();
}
