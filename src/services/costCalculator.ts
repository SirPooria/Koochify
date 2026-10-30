import { UserAssessmentProfile } from "../types";
import { RouteDefinition } from "../data/routesData";

export interface ComputedCostResult {
  currency: string;
  officialLivingFund: number;
  officialLivingFundFa: string;
  annualTuitionEstimate: number;
  annualTuitionEstimateFa: string;
  travelAndSettlingFund: number;
  travelAndSettlingFundFa: string;
  dependentsAllowance: number;
  dependentsAllowanceFa: string;
  scholarshipDeduction: number;
  scholarshipDeductionFa: string;
  estimatedFirstYearTotal: number;
  estimatedFirstYearTotalFa: string;
  approximateTotalUsd: number;
  approximateTotalEur: number;
  approximateTotalFa: string;
  approximateTotalTomanBillionFa?: string;
  formulaNotesFa: string;
  rateEffectiveDate: string;
  isCurrentDataVerified: boolean;
}

// Exchange rates as of October 2026 (Audited standard indicative baselines)
const USD_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 1.09,
  CAD: 0.74,
  GBP: 1.31,
  AUD: 0.67,
  NZD: 0.61,
  CHF: 1.16,
  SEK: 0.096,
  NOK: 0.093,
  DKK: 0.146,
  JPY: 0.0067,
  KRW: 0.00075,
  SGD: 0.77,
  AED: 0.272
};

export function calculateRouteCost(route: RouteDefinition, profile: UserAssessmentProfile): ComputedCostResult {
  const pof = route.proofOfFunds;
  const isStudy = route.routeType === "study";
  
  // Accompanying Family Members:
  // 1. Accompanying spouse if married and traveling together
  const isSpouseAccompanying = profile.maritalStatus === "married_together";
  // 2. Accompanying children
  const numChildren = profile.familyJoinTiming === "no_dependents" ? 0 : (profile.dependentsCount || 0);
  const totalAccompanyingMembers = (isSpouseAccompanying ? 1 : 0) + numChildren;

  // 1. Official Living Fund
  let livingFund = pof.livingAmountSingle;
  let dependentsAllowance = 0;

  if (totalAccompanyingMembers === 1) {
    // 2-person household (e.g. couple without kids, or single parent with 1 child)
    livingFund = pof.livingAmountTwoPeople > 0 ? pof.livingAmountTwoPeople : Math.round(livingFund * 1.5);
    dependentsAllowance = livingFund - pof.livingAmountSingle;
  } else if (totalAccompanyingMembers > 1) {
    // Family with 3 or more members
    const baseTwo = pof.livingAmountTwoPeople > 0 ? pof.livingAmountTwoPeople : Math.round(livingFund * 1.5);
    const additionalRate = pof.livingAmountPerAdditionalDependent > 0 
      ? pof.livingAmountPerAdditionalDependent 
      : Math.round(pof.livingAmountSingle * 0.3);
    const additional = (totalAccompanyingMembers - 1) * additionalRate;
    livingFund = baseTwo + additional;
    dependentsAllowance = livingFund - pof.livingAmountSingle;
  }

  // 2. Annual Tuition
  let annualTuition = 0;
  if (isStudy) {
    if (profile.targetDegreeLevel === "phd") {
      annualTuition = route.typicalTuitionUsdEstimate.phd;
    } else if (profile.targetDegreeLevel === "master") {
      annualTuition = route.typicalTuitionUsdEstimate.master;
    } else {
      annualTuition = route.typicalTuitionUsdEstimate.bachelor;
    }
    // Adjust to local currency if needed
    const toLocalCurrencyRate = USD_RATES[pof.currency] || 1;
    annualTuition = Math.round(annualTuition / toLocalCurrencyRate);
  }

  // 3. Travel & Initial Settlement buffer (flight, visa fee, deposit)
  let travelAndSettling = isStudy ? 2500 : 3500;
  if (totalAccompanyingMembers > 0) {
    travelAndSettling += totalAccompanyingMembers * 1500;
  }
  const travelInCurrency = Math.round(travelAndSettling / (USD_RATES[pof.currency] || 1));

  // 4. Scholarship / Funding deduction
  let scholarshipDeduction = 0;
  if (isStudy && profile.targetDegreeLevel === "phd" && profile.supervisorSecured) {
    // Verified funding deduction
    scholarshipDeduction = Math.round(annualTuition * 0.8 + livingFund * 0.5);
  } else if (route.id === "it_study_dsu") {
    // DSU regional scholarship in Italy
    scholarshipDeduction = Math.round(annualTuition * 0.9);
  }

  // Total First Year in Route's Official Currency
  const totalInCurrency = Math.max(
    0,
    Math.round(pof.livingAmountSingle + dependentsAllowance + annualTuition + travelInCurrency - scholarshipDeduction)
  );

  // Family breakdown descriptor
  const familyDescriptorFa = totalAccompanyingMembers === 0 
    ? "متقاضی مجرد (انفرادی)" 
    : isSpouseAccompanying && numChildren > 0
    ? `خانواده ${totalAccompanyingMembers + 1} نفره (متقاضی + همسر + ${numChildren} فرزند)`
    : isSpouseAccompanying
    ? "زوج متأهل همسفر (متقاضی + همسر)"
    : `متقاضی همراه با ${numChildren} فرزند`;

  // Convert to USD and EUR for international financial planning (No Toman/Rial)
  const rateToUsd = USD_RATES[pof.currency] || 1.0;
  const approxTotalUsd = Math.round(totalInCurrency * rateToUsd);
  const approxTotalEur = Math.round(approxTotalUsd / 1.09);
  const approxTotalFa = `معادل حدود ${approxTotalUsd.toLocaleString()} دلار (~${approxTotalEur.toLocaleString()} یورو)`;

  const formulaNotesFa = isStudy
    ? `مبنای محاسبه: ${familyDescriptorFa} | تمکن زندگی پایه (${pof.livingAmountSingle.toLocaleString()} ${pof.currency})${dependentsAllowance > 0 ? ` + هزینه همراهان خانواده (${dependentsAllowance.toLocaleString()} ${pof.currency})` : ""} + شهریه برآورد شده دوره (${annualTuition.toLocaleString()} ${pof.currency}) + بلیت و ودیعه استقرار اولیه (${travelInCurrency.toLocaleString()} ${pof.currency})${scholarshipDeduction > 0 ? ` - کسر کمک‌هزینه (${scholarshipDeduction.toLocaleString()} ${pof.currency})` : ""}.`
    : `مبنای محاسبه: ${familyDescriptorFa} | استقرار اولیه و بلیت پرواز (${travelInCurrency.toLocaleString()} ${pof.currency})${pof.livingAmountSingle > 0 ? ` + تمکن رسمی حساب بانکی (${(pof.livingAmountSingle + dependentsAllowance).toLocaleString()} ${pof.currency})` : " (در صورت داشتن جاب‌آفر، حقوق کارفرما هزینه زندگی را پوشش می‌دهد)"}.`;

  return {
    currency: pof.currency,
    officialLivingFund: pof.livingAmountSingle,
    officialLivingFundFa: `${pof.livingAmountSingle.toLocaleString()} ${pof.currency}`,
    annualTuitionEstimate: annualTuition,
    annualTuitionEstimateFa: isStudy ? `${annualTuition.toLocaleString()} ${pof.currency}` : "ندارد (مسیر کاری)",
    travelAndSettlingFund: travelInCurrency,
    travelAndSettlingFundFa: `${travelInCurrency.toLocaleString()} ${pof.currency}`,
    dependentsAllowance,
    dependentsAllowanceFa: dependentsAllowance > 0 ? `${dependentsAllowance.toLocaleString()} ${pof.currency}` : "ندارد",
    scholarshipDeduction,
    scholarshipDeductionFa: scholarshipDeduction > 0 ? `${scholarshipDeduction.toLocaleString()} ${pof.currency}` : "صفر",
    estimatedFirstYearTotal: totalInCurrency,
    estimatedFirstYearTotalFa: `${totalInCurrency.toLocaleString()} ${pof.currency}`,
    approximateTotalUsd: approxTotalUsd,
    approximateTotalEur: approxTotalEur,
    approximateTotalFa: approxTotalFa,
    approximateTotalTomanBillionFa: `~${approxTotalUsd.toLocaleString()} $ / ~${approxTotalEur.toLocaleString()} €`,
    formulaNotesFa,
    rateEffectiveDate: pof.effectiveFrom || "2026-10-04",
    isCurrentDataVerified: true
  };
}
