export type MigrationGoal = "study" | "work" | "both" | "unsure";

export type DegreeLevel = "diploma" | "associate" | "bachelor" | "master" | "phd" | "postdoc";

export type EnglishExamType = "none" | "ielts_academic" | "ielts_general" | "toefl_ibt" | "pte_academic" | "duolingo" | "self_estimated";

export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | "none";

export type MaritalStatus = "single" | "married_solo" | "married_together" | "divorced_or_other";

export type MilitaryStatus = "completed" | "educational_exemption" | "permanent_exemption_or_female" | "not_completed_needs_guarantee" | "unsure";

export interface SkillScores {
  listening: number; // 0-9 for IELTS, or equivalent
  reading: number;
  writing: number;
  speaking: number;
  overall: number;
}

export interface UserAssessmentProfile {
  // Goal & Timeline
  migrationGoal: MigrationGoal;
  targetTimeline: "immediate_6m" | "6_to_12m" | "1_to_2y" | "exploring_unsure";
  acceptedCountries: string[];
  excludedCountries: string[];
  relocationFlexibility: "high" | "medium" | "low";

  // Identity & Household
  fullName: string;
  age: number; // or approximate
  citizenships: string[]; // default ["IR"]
  currentResidenceCountry: string; // default "Iran"
  currentCityOrProvince: string;
  passportValidityMonths: number; // approx months left
  hasExitRestrictions: "no" | "yes_military" | "yes_other" | "unsure";
  militaryStatus: MilitaryStatus;
  maritalStatus: MaritalStatus;
  dependentsCount: number;
  dependentsAges: number[];
  familyJoinTiming: "together" | "join_later" | "no_dependents";

  // Education
  highestDegree: DegreeLevel;
  fieldOfStudy: string;
  subFieldOrMajor: string;
  universityName: string;
  universityType: "state_top" | "state_regular" | "azad" | "payam_noor_applied" | "foreign" | "unsure";
  gpa: number; // e.g. 16.5
  gpaScale: "20" | "4.0" | "100" | "unsure";
  graduationYear: number;
  hasOfficialDegreeInHand: "yes" | "unofficial_only" | "in_progress" | "no";
  thesisOrCapstoneCompleted: boolean;
  taughtInEnglish: boolean;
  academicPublicationsCount: number; // 0, 1, 2, 3+
  recommendationLettersAvailable: "yes" | "can_get" | "no";

  // Study Ambitions (if study or both)
  targetDegreeLevel: DegreeLevel;
  hasAdmissionOrOffer: "none" | "applied_waiting" | "accepted_conditional" | "accepted_unconditional";
  supervisorSecured: boolean;
  needsScholarship: "full_essential" | "partial_helpful" | "self_funded";
  preferredStudyCities: string[];

  // Work & Experience (if work or both)
  primaryJobTitle: string;
  jobDutiesSummary: string;
  occupationCode: string; // ISCO, NOC, ANZSCO if known
  totalWorkExperienceYears: number;
  relevantExperienceYears: number;
  currentWorkStatus: "full_time" | "part_time" | "freelance" | "unemployed" | "student";
  hasDocumentedInsuranceOrTaxes: "full_official" | "partial" | "contract_only" | "no_documentation" | "unsure";
  industrySector: string;
  toolsAndTechStack: string[];
  hasProfessionalLicense: "yes_regulated" | "in_progress" | "not_regulated_or_no" | "unsure";
  hasJobOfferOrSponsor: "none" | "interviewing" | "verbal_offer" | "written_sponsor_offer";

  // Languages
  englishExam: EnglishExamType;
  englishScores: SkillScores;
  englishEstimatedLevel: CEFRLevel;
  examDate?: string;
  secondLanguage: "none" | "german" | "french" | "italian" | "spanish" | "other";
  secondLanguageLevel: CEFRLevel;
  willingnessToLearnLocalLanguage: "high" | "moderate" | "prefer_english_only";

  // Finance & Budget
  budgetCurrency: "USD" | "EUR" | "TOMAN";
  liquidBudgetAmount: number; // e.g. in USD or Tomans
  budgetRangeCategory: "under_10k" | "10k_to_25k" | "25k_to_50k" | "above_50k";
  primaryFundingSource: "personal_savings" | "family_sponsor" | "property_sale" | "loan_or_third_party" | "scholarship_only";
  debtTolerance: "low" | "medium" | "high";

  // Preferences
  climatePreference: "any" | "mild_temperate" | "cold_winter_ok" | "warm_mediterranean";
  citySizePreference: "large_metropolis" | "medium_city" | "college_town" | "no_preference";
  prTrackImportance: "essential" | "nice_to_have" | "not_important";
  iranianCommunityNearby: "prefer_large_community" | "not_important" | "prefer_integration";

  // Metadata
  lastUpdated: string;
}

export type ConditionStatus = "passed" | "failed" | "unknown" | "needs_fresh_source";

export interface EvaluatedCondition {
  id: string;
  titleFa: string;
  status: ConditionStatus;
  userValue: string;
  requiredValue: string;
  explanationFa: string;
  isHardGate: boolean;
  remedyActionFa?: string;
}

export interface NextActionStep {
  id: string;
  titleFa: string;
  descriptionFa: string;
  responsibleParty: "user" | "university" | "employer" | "official_body" | "translator";
  priority: "high" | "medium" | "low";
  estimatedCostFa: string;
  deadlineFa: string;
  outputDocumentFa: string;
  sourceUrl?: string;
}

export interface DocumentItem {
  id: string;
  titleFa: string;
  category: "identity" | "civil" | "education" | "language" | "finance" | "work" | "admission" | "health_police" | "forms";
  status: "have" | "need_to_get" | "needs_translation" | "needs_legalization" | "not_required";
  translationRule: string;
  legalisationRule: string;
  notesFa: string;
  isMandatory: boolean;
}

export interface OfficialSourceCitation {
  sourceId: string;
  publisher: string;
  title: string;
  canonicalUrl: string;
  sourceType: "government" | "embassy" | "university" | "official_statistics" | "secondary";
  effectiveFrom: string;
  effectiveTo?: string;
  checkedAt: string;
  confidence: "official_current_page" | "secondary_estimate" | "needs_fresh_verification";
  summaryFa: string;
}

export interface FinancialBreakdown {
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
  approximateTotalTomanBillionFa: string;
  formulaNotesFa: string;
  rateEffectiveDate: string;
  isCurrentDataVerified: boolean;
}

export interface RecommendedRouteResult {
  countryCode: string;
  countryNameFa: string;
  countryNameEn: string;
  flagEmoji: string;
  routeId: string;
  routeNameFa: string;
  routeNameEn?: string;
  routeType: "study" | "work_job_offer" | "skilled_pr" | "job_seeker" | "research_phd";
  routeTypeBadgeFa: string;
  fitScore: number; // 0-100 (Fit Score, NOT probability)
  isEligibleNow: boolean;
  verdictStatus: "eligible_after_final_check" | "achievable_with_gaps" | "not_currently_eligible";
  verdictLabelFa: string;
  whyThisOptionFa: string;

  // Score breakdown
  scoreBreakdown: {
    realismAndRouteSuitability: number; // max 25
    fieldOrOccupationFit: number; // max 20
    languageFit: number; // max 15
    financialAffordability: number; // max 15
    degreeAndExperienceQuality: number; // max 10
    preferencesFit: number; // max 10
    readinessAndTiming: number; // max 5
  };

  // Conditions
  hardGateFailed: boolean;
  hardGateFailureReasons: string[];
  conditions: EvaluatedCondition[];

  // Language comparison
  languageRequirement: {
    legalMinimumFa: string;
    practicalTargetFa: string;
    userLevelFa: string;
    gapStatus: "satisfied" | "manageable_gap" | "critical_gap";
    gapExplanationFa: string;
  };

  // Financial details
  financialBreakdown: FinancialBreakdown;

  // Documents & Steps
  documents: DocumentItem[];
  timelineEstFa: string;
  keyRisksFa: string[];
  nextActions: NextActionStep[];
  citations: OfficialSourceCitation[];
  lastVerifiedAt: string;
}

export interface RecommendationSummary {
  primaryDestinations: RecommendedRouteResult[]; // Up to 3 distinct countries
  allEvaluatedRoutes?: RecommendedRouteResult[];
  totalEligibleCount: number;
  totalEvaluatedRoutes: number;
  profileStrengths: string[];
  profileGaps: string[];
  overallRoadmapSummaryFa: string;
  evaluationTimestamp: string;
  isUnderAge18: boolean;
}
