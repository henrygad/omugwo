import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { requireAdminSession } from "@/lib/firebase/auth";
import { apiError } from "@/lib/http";
import { affiliatePayoutSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const administrator = await requireAdminSession();
    const input = affiliatePayoutSchema.parse(await request.json());
    const db = getAdminDb();
    const affiliateRef = db.collection("affiliates").doc(input.affiliateId);
    const commissionRefs = input.commissionIds.map((id) => db.collection("affiliateCommissions").doc(id));
    const payoutRef = db.collection("affiliatePayouts").doc();
    const result = await db.runTransaction(async (transaction) => {
      const [affiliate, ...commissions] = await Promise.all([transaction.get(affiliateRef), ...commissionRefs.map((ref) => transaction.get(ref))]);
      if (!affiliate.exists || affiliate.get("status") !== "approved") throw new Error("Approved affiliate not found.");
      if (!affiliate.get("bankName") || !affiliate.get("accountName") || !affiliate.get("accountNumber")) throw new Error("The affiliate must add complete bank details first.");
      let grossAmount = 0;
      commissions.forEach((commission) => {
        if (!commission.exists || commission.get("affiliateId") !== input.affiliateId || commission.get("status") !== "available") throw new Error("One or more commissions are no longer available.");
        grossAmount += Number(commission.get("affiliateNetAmount") ?? 0);
      });
      const debt = Number(affiliate.get("negativeBalance") ?? 0);
      const debtApplied = Math.min(debt, grossAmount);
      const amount = Math.max(0, grossAmount - debtApplied);
      commissions.forEach((commission) => transaction.update(commission.ref, { status: "paid", payoutId: payoutRef.id, paidAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }));
      transaction.update(affiliateRef, { negativeBalance: debt - debtApplied, updatedAt: FieldValue.serverTimestamp() });
      transaction.create(payoutRef, { affiliateId: input.affiliateId, affiliateName: affiliate.get("publicName"), commissionIds: input.commissionIds, grossAmount, debtApplied, amount, paymentReference: input.paymentReference, bankName: affiliate.get("bankName"), accountName: affiliate.get("accountName"), accountNumberLast4: String(affiliate.get("accountNumber")).slice(-4), status: "paid", paidBy: administrator.uid, paidAt: FieldValue.serverTimestamp(), createdAt: FieldValue.serverTimestamp() });
      transaction.create(db.collection("auditLogs").doc(), { action: "affiliate.payout_recorded", affiliateId: input.affiliateId, payoutId: payoutRef.id, amount, administratorId: administrator.uid, createdAt: FieldValue.serverTimestamp() });
      return { amount, debtApplied };
    });
    return Response.json({ recorded: true, ...result });
  } catch (error) { return apiError(error); }
}
