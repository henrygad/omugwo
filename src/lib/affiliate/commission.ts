import { affiliatePricing, type EditionId } from "@/config/site";

export function calculateAffiliateCommission(input: {
  edition: EditionId;
  saleAmount: number;
  paystackFeeKobo: number;
}) {
  const saleKobo = Math.round(input.saleAmount * 100);
  const baseKobo = affiliatePricing.minimum[input.edition] * 100;
  const grossKobo = Math.max(0, saleKobo - baseKobo);
  const feeKobo = Math.max(0, Math.round(input.paystackFeeKobo));
  const affiliateFeeKobo = saleKobo > 0
    ? Math.round((feeKobo * grossKobo) / saleKobo)
    : 0;
  const companyFeeKobo = feeKobo - affiliateFeeKobo;

  return {
    companyBaseAmount: baseKobo / 100,
    affiliateGrossAmount: grossKobo / 100,
    paystackFee: feeKobo / 100,
    companyFeeShare: companyFeeKobo / 100,
    affiliateFeeShare: affiliateFeeKobo / 100,
    companyNetAmount: (baseKobo - companyFeeKobo) / 100,
    affiliateNetAmount: (grossKobo - affiliateFeeKobo) / 100,
  };
}
