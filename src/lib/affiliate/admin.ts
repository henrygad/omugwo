import "server-only";

import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { requireAdminSession } from "@/lib/firebase/auth";
import type {
  AffiliateCommission,
  AffiliateOffer,
  AffiliateProfile,
} from "@/types/commerce";

function iso(value: unknown) { return value instanceof Timestamp ? value.toDate().toISOString() : ""; }

function affiliateFromDocument(
  document: FirebaseFirestore.QueryDocumentSnapshot | FirebaseFirestore.DocumentSnapshot,
): AffiliateProfile {
  const value = document.data() ?? {};
  return {
    id: document.id,
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
    ...(value.applicationEmailSentAt ? { applicationEmailSentAt: iso(value.applicationEmailSentAt) } : {}),
    ...(value.applicationEmailError ? { applicationEmailError: String(value.applicationEmailError) } : {}),
    ...(value.statusEmailSentAt ? { statusEmailSentAt: iso(value.statusEmailSentAt) } : {}),
    ...(value.statusEmailError ? { statusEmailError: String(value.statusEmailError) } : {}),
    createdAt: iso(value.createdAt),
    updatedAt: iso(value.updatedAt),
  };
}

function offerFromDocument(document: FirebaseFirestore.QueryDocumentSnapshot): AffiliateOffer {
  const value = document.data();
  return {
    id: document.id,
    code: String(value.code ?? ""),
    affiliateId: String(value.affiliateId ?? ""),
    affiliateName: String(value.affiliateName ?? ""),
    title: String(value.title ?? ""),
    digitalPrice: Number(value.digitalPrice ?? 0),
    paperbackPrice: Number(value.paperbackPrice ?? 0),
    isCompany: false,
    active: value.active === true,
    clicks: Number(value.clicks ?? 0),
    checkouts: Number(value.checkouts ?? 0),
    paidSales: Number(value.paidSales ?? 0),
    createdAt: iso(value.createdAt),
    updatedAt: iso(value.updatedAt),
  };
}

function commissionFromDocument(document: FirebaseFirestore.QueryDocumentSnapshot): AffiliateCommission {
  const value = document.data();
  return {
    id: document.id,
    orderId: String(value.orderId ?? ""),
    affiliateId: String(value.affiliateId ?? ""),
    affiliateName: String(value.affiliateName ?? ""),
    offerId: String(value.offerId ?? ""),
    edition: value.edition as AffiliateCommission["edition"],
    saleAmount: Number(value.saleAmount ?? 0),
    companyBaseAmount: Number(value.companyBaseAmount ?? 0),
    affiliateGrossAmount: Number(value.affiliateGrossAmount ?? 0),
    paystackFee: Number(value.paystackFee ?? 0),
    companyFeeShare: Number(value.companyFeeShare ?? 0),
    affiliateFeeShare: Number(value.affiliateFeeShare ?? 0),
    companyNetAmount: Number(value.companyNetAmount ?? 0),
    affiliateNetAmount: Number(value.affiliateNetAmount ?? 0),
    status: value.status as AffiliateCommission["status"],
    ...(value.paidAt ? { paidAt: iso(value.paidAt) } : {}),
    availableAt: iso(value.availableAt),
    createdAt: iso(value.createdAt),
    updatedAt: iso(value.updatedAt),
  };
}

export async function listAllAffiliates(): Promise<AffiliateProfile[]> {
  await requireAdminSession();
  const snapshot = await getAdminDb().collection("affiliates").limit(500).get();
  return snapshot.docs.map(affiliateFromDocument).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getAffiliateAdminDetails(affiliateId: string): Promise<{
  profile: AffiliateProfile;
  offers: AffiliateOffer[];
  commissions: AffiliateCommission[];
} | null> {
  await requireAdminSession();
  const database = getAdminDb();
  const [profileSnapshot, offersSnapshot, commissionsSnapshot] = await Promise.all([
    database.collection("affiliates").doc(affiliateId).get(),
    database.collection("affiliateOffers").where("affiliateId", "==", affiliateId).limit(200).get(),
    database.collection("affiliateCommissions").where("affiliateId", "==", affiliateId).limit(500).get(),
  ]);

  if (!profileSnapshot.exists) return null;

  return {
    profile: affiliateFromDocument(profileSnapshot),
    offers: offersSnapshot.docs.map(offerFromDocument).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    commissions: commissionsSnapshot.docs.map(commissionFromDocument).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  };
}

export async function listAvailableCommissions(): Promise<AffiliateCommission[]> {
  await requireAdminSession();
  const snapshot = await getAdminDb().collection("affiliateCommissions").where("status", "==", "available").limit(1000).get();
  return snapshot.docs.map(commissionFromDocument);
}
