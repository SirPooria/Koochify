import {
  UserAssessmentProfile,
  RecommendedRouteResult,
  RecommendationSummary,
  EvaluatedCondition,
  NextActionStep,
  ConditionStatus,
  DegreeLevel
} from "../types";
import { ACTIVE_ROUTES, RouteDefinition } from "../data/routesData";
import { AUDITED_SOURCES } from "../data/migrationSources";
import { calculateRouteCost } from "./costCalculator";
import { OCCUPATIONS_CATALOG } from "../data/occupationsData";
import { STUDY_FIELDS } from "../data/studyFieldsData";

const DEGREE_RANKS: Record<string, number> = {
  diploma: 1,
  associate: 2,
  bachelor: 3,
  master: 4,
  phd: 5,
  postdoc: 6
};

const CEFR_RANKS: Record<string, number> = {
  none: 0,
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6
};

export function evaluateUserMigrationProfile(profile: UserAssessmentProfile): RecommendationSummary {
  // Filter relevant routes based on immigration goal
  let eligibleRoutesPool = ACTIVE_ROUTES.filter(route => {
    // If country is explicitly excluded by user
    if (profile.excludedCountries.includes(route.countryCode)) {
      return false;
    }

    if (profile.migrationGoal === "study") {
      return route.routeType === "study" || route.routeType === "research_phd";
    }
    if (profile.migrationGoal === "work") {
      return route.routeType === "work_job_offer" || route.routeType === "skilled_pr" || route.routeType === "job_seeker";
    }
    // "both" or "unsure": allow all
    return true;
  });

  const evaluatedRoutes: RecommendedRouteResult[] = eligibleRoutesPool.map(route => {
    return evaluateSingleRoute(route, profile);
  });

  // Sort primarily by:
  // 1. isEligibleNow (true first)
  // 2. fitScore (descending)
  // 3. estimatedFirstYearTotal (ascending for equal scores)
  evaluatedRoutes.sort((a, b) => {
    if (a.isEligibleNow !== b.isEligibleNow) {
      return a.isEligibleNow ? -1 : 1;
    }
    if (b.fitScore !== a.fitScore) {
      return b.fitScore - a.fitScore;
    }
    return a.financialBreakdown.estimatedFirstYearTotal - b.financialBreakdown.estimatedFirstYearTotal;
  });

  // Select top 3 DISTINCT countries
  const primaryDestinations: RecommendedRouteResult[] = [];
  const seenCountryCodes = new Set<string>();

  for (const route of evaluatedRoutes) {
    if (!seenCountryCodes.has(route.countryCode)) {
      seenCountryCodes.add(route.countryCode);
      primaryDestinations.push(route);
      if (primaryDestinations.length === 3) break;
    }
  }

  // Profile strengths & gaps analysis
  const profileStrengths: string[] = [];
  const profileGaps: string[] = [];

  // Age analysis
  if (profile.age >= 18 && profile.age <= 32) {
    profileStrengths.push(`سن در بازه طلایی (${profile.age} سال) جهت کسب حداکثر امتیاز در سیستم‌های امتیازی نظیر کانادا، آلمان و استرالیا.`);
  } else if (profile.age > 45) {
    profileGaps.push(`سن بالای ۴۵ سال محدودیت جدی در مسیرهای اقامت دائم فدرال استرالیا، نیوزیلند و امتیاز FSW کانادا ایجاد می‌کند.`);
  }

  // Degree analysis
  if (DEGREE_RANKS[profile.highestDegree] >= DEGREE_RANKS["master"]) {
    profileStrengths.push(`مدرک تحصیلات تکمیلی (${profile.highestDegree === "phd" ? "دکترا" : "کارشناسی ارشد"}) که امتیاز آموزشی را در تمام مقاصد ماکزیمم می‌کند.`);
  }

  // Language analysis
  if (CEFR_RANKS[profile.englishEstimatedLevel] >= CEFR_RANKS["B2"] || profile.englishScores.overall >= 6.5) {
    profileStrengths.push("سطح زبان انگلیسی رسمی آماده یا در آستانه B2/C1 که درهای پذیرش و مصاحبه را می‌گشاید.");
  } else {
    profileGaps.push("نیاز به ارتقای سطح زبان انگلیسی به حداقل B2 و اخذ مدرک آزمون معتبر (آیلتس/PTE).");
  }

  // Work & Experience
  if (profile.totalWorkExperienceYears >= 3 && profile.hasDocumentedInsuranceOrTaxes === "full_official") {
    profileStrengths.push(`سابقه کار بیش از ۳ سال (${profile.totalWorkExperienceYears} سال) همراه با مدارک بیمه و مالیات رسمی.`);
  } else if (profile.totalWorkExperienceYears < 1 && profile.migrationGoal === "work") {
    profileGaps.push("فقدان سابقه کار مستند حداقل ۱ ساله که مانع اکثر ویزاهای کار تخصصی است.");
  }

  // Military service status
  if (profile.militaryStatus === "not_completed_needs_guarantee") {
    profileGaps.push("وضعیت نظام وظیفه نیازمند تأمین وثیقه خروج از کشور یا معافیت تحصیلی است.");
  } else if (profile.militaryStatus === "completed" || profile.militaryStatus === "permanent_exemption_or_female") {
    profileStrengths.push("شفافیت کامل وضعیت خروج و پایان خدمت نظام وظیفه بدون مانع اداری.");
  }

  // Overall roadmap verdict text
  const topCountryNames = primaryDestinations.map(d => d.countryNameFa).join("، ");
  const overallRoadmapSummaryFa = primaryDestinations.length > 0
    ? `بر اساس تحلیل شرایط اظهارشده شما، ۳ مقصد برتر شامل ${topCountryNames} به عنوان متمایزترین مسیرهای قانونی شناسایی شدند. برای هر مقصد اقدامات مشخصی جهت تبدیل گزینه‌ها به پذیرش قطعی یا پیشنهاد کاری تدوین شده است.`
    : "با توجه به فیلترها و شرایط سخت‌گیرانه اعلام‌شده، در حال حاضر هیچ مقصدی شرایط احراز قطعی را برآورده نکرد. توصیه می‌شود به بخش رفع شکاف‌ها و جایگزین‌های قانونی مراجعه کنید.";

  return {
    primaryDestinations,
    allEvaluatedRoutes: evaluatedRoutes,
    totalEligibleCount: evaluatedRoutes.filter(r => r.isEligibleNow).length,
    totalEvaluatedRoutes: evaluatedRoutes.length,
    profileStrengths: profileStrengths.slice(0, 4),
    profileGaps: profileGaps.slice(0, 4),
    overallRoadmapSummaryFa,
    evaluationTimestamp: new Date().toISOString(),
    isUnderAge18: profile.age < 18
  };
}

function evaluateSingleRoute(route: RouteDefinition, profile: UserAssessmentProfile): RecommendedRouteResult {
  const conditions: EvaluatedCondition[] = [];
  const hardGateFailureReasons: string[] = [];
  let hardGateFailed = false;

  // 1. AGE HARD GATE
  if (route.minAge !== null && profile.age < route.minAge) {
    hardGateFailed = true;
    const msg = `حداقل سن قانونی برای این مسیر ${route.minAge} سال است (سن شما: ${profile.age}).`;
    hardGateFailureReasons.push(msg);
    conditions.push({
      id: "age_gate",
      titleFa: "شرط سنی ویزا",
      status: "failed",
      userValue: `${profile.age} سال`,
      requiredValue: `حداقل ${route.minAge} سال`,
      explanationFa: msg,
      isHardGate: true,
      remedyActionFa: "تا رسیدن به سن قانونی، پرونده باید از مسیر ویزای دانش‌آموزی همراه با قیم بررسی شود."
    });
  } else if (route.maxAge !== null && profile.age > route.maxAge) {
    hardGateFailed = true;
    const msg = `سقف سن واجدشرایط‌بودن این مسیر ${route.maxAge} سال است (سن شما: ${profile.age}).`;
    hardGateFailureReasons.push(msg);
    conditions.push({
      id: "age_gate",
      titleFa: "شرط سنی ویزا",
      status: "failed",
      userValue: `${profile.age} سال`,
      requiredValue: `حداکثر ${route.maxAge} سال`,
      explanationFa: msg,
      isHardGate: true,
      remedyActionFa: "انتخاب مسیرهای بدون محدودیت سنی نظیر ویزای تحصیلی، بلوکارت یا انتقال درون‌شرکتی."
    });
  } else {
    conditions.push({
      id: "age_gate",
      titleFa: "شرط سنی ویزا",
      status: "passed",
      userValue: `${profile.age} سال`,
      requiredValue: route.maxAge ? `بین ${route.minAge || 18} تا ${route.maxAge} سال` : `بالای ${route.minAge || 18} سال`,
      explanationFa: "سن شما کاملاً در بازه قانونی مجاز قرار دارد.",
      isHardGate: true
    });
  }

  // 2. DEGREE HARD GATE
  const userDegreeRank = DEGREE_RANKS[profile.highestDegree] || 1;
  const routeMinDegreeRank = DEGREE_RANKS[route.minDegree] || 1;
  if (userDegreeRank < routeMinDegreeRank) {
    hardGateFailed = true;
    const msg = `این مسیر نیازمند مدرک دانشگاهی حداقل ${translateDegree(route.minDegree)} است.`;
    hardGateFailureReasons.push(msg);
    conditions.push({
      id: "degree_gate",
      titleFa: "مدرک تحصیلی پایه",
      status: "failed",
      userValue: translateDegree(profile.highestDegree),
      requiredValue: translateDegree(route.minDegree),
      explanationFa: msg,
      isHardGate: true,
      remedyActionFa: "تکمیل مقطع تحصیلی مورد نیاز یا اقدام از طریق کالج‌های پیش‌نیاز."
    });
  } else {
    conditions.push({
      id: "degree_gate",
      titleFa: "مدرک تحصیلی پایه",
      status: "passed",
      userValue: translateDegree(profile.highestDegree),
      requiredValue: translateDegree(route.minDegree),
      explanationFa: "مقطع تحصیلی شما الزامات این مسیر را برآورده می‌کند.",
      isHardGate: true
    });
  }

  // 3. JOB OFFER / ADMISSION GATE
  if (route.requiresJobOffer) {
    if (profile.hasJobOfferOrSponsor === "written_sponsor_offer") {
      conditions.push({
        id: "job_offer_gate",
        titleFa: "پیشنهاد شغلی اسپانسر",
        status: "passed",
        userValue: "دارای جاب‌آفر کتبی",
        requiredValue: "پیشنهاد کاری از کارفرمای معتبر",
        explanationFa: "شما جاب‌آفر لازم برای این ویزای کارفرمایی را در اختیار دارید.",
        isHardGate: true
      });
    } else {
      hardGateFailed = true;
      const msg = "این ویزا وابسته به کارفرما است و نیازمند قرارداد کاری و جاب‌آفر تاییدشده است.";
      hardGateFailureReasons.push(msg);
      conditions.push({
        id: "job_offer_gate",
        titleFa: "پیشنهاد شغلی اسپانسر",
        status: "failed",
        userValue: profile.hasJobOfferOrSponsor === "interviewing" ? "در حال مصاحبه" : "بدون جاب‌آفر فعلی",
        requiredValue: "پیشنهاد کاری از کارفرمای دارای لایسنس",
        explanationFa: msg,
        isHardGate: true,
        remedyActionFa: "استفاده از پورتال‌های کاریابی رسمی کشور مقصد جهت یافتن کارفرمای اسپانسر یا انتخاب مسیرهای جست‌وجوی کار (مانند Chancenkarte آلمان)."
      });
    }
  }

  // 4. LANGUAGE GATE & EVALUATION
  const userCefrRank = CEFR_RANKS[profile.englishEstimatedLevel] || 0;
  const routeMinCefrRank = CEFR_RANKS[route.minCefrEnglish] || 0;
  let languageGapStatus: "satisfied" | "manageable_gap" | "critical_gap" = "satisfied";
  let languageGapExplanationFa = "سطح زبان فعلی شما نیاز قانونی و کاربردی این مسیر را تأمین می‌کند.";

  if (routeMinCefrRank > 0) {
    if (userCefrRank >= routeMinCefrRank) {
      conditions.push({
        id: "lang_gate",
        titleFa: "سطح زبان قانونی ویزا",
        status: "passed",
        userValue: profile.englishEstimatedLevel,
        requiredValue: route.minCefrEnglish,
        explanationFa: "سطح زبان شما با حداقل الزام قانونی ویزا منطبق است.",
        isHardGate: true
      });
    } else if (routeMinCefrRank - userCefrRank === 1) {
      // Manageable gap: not hard reject, but gap
      languageGapStatus = "manageable_gap";
      languageGapExplanationFa = `شما در سطح ${profile.englishEstimatedLevel} هستید و برای این مسیر رسیدن به سطح ${route.minCefrEnglish} در یک برنامه ۳ الی ۵ ماهه قابل دستیابی است.`;
      conditions.push({
        id: "lang_gate",
        titleFa: "سطح زبان قانونی ویزا",
        status: "unknown",
        userValue: profile.englishEstimatedLevel,
        requiredValue: route.minCefrEnglish,
        explanationFa: `نیاز به ارتقای مهارت از ${profile.englishEstimatedLevel} به ${route.minCefrEnglish}.`,
        isHardGate: false,
        remedyActionFa: "شرکت در کلاس‌های متمرکز آمادگی آزمون رسمی آیلتس یا پی‌تی‌ئی."
      });
    } else {
      hardGateFailed = true;
      languageGapStatus = "critical_gap";
      const msg = `فاصله زبانی زیاد؛ این مسیر سطح ${route.minCefrEnglish} می‌خواهد در حالی که سطح شما ${profile.englishEstimatedLevel} است.`;
      languageGapExplanationFa = msg;
      hardGateFailureReasons.push(msg);
      conditions.push({
        id: "lang_gate",
        titleFa: "سطح زبان قانونی ویزا",
        status: "failed",
        userValue: profile.englishEstimatedLevel,
        requiredValue: route.minCefrEnglish,
        explanationFa: msg,
        isHardGate: true,
        remedyActionFa: "برنامه‌ریزی حداقل ۶ ماهه برای آموزش فشرده زبان قبل از آغاز مراحل درخواست ویزا."
      });
    }
  }

  // Calculate Costs
  const cost = calculateRouteCost(route, profile);

  // 5. FINANCIAL AFFORDABILITY CHECK
  let financialFitScore = 12;
  const userBudgetRange = profile.budgetRangeCategory;
  if (cost.approximateTotalUsd < 15000) {
    financialFitScore = 15;
  } else if (cost.approximateTotalUsd <= 30000) {
    financialFitScore = userBudgetRange === "under_10k" ? 6 : 14;
  } else {
    financialFitScore = (userBudgetRange === "25k_to_50k" || userBudgetRange === "above_50k") ? 14 : 5;
  }

  if (cost.approximateTotalUsd > 25000 && userBudgetRange === "under_10k") {
    conditions.push({
      id: "finance_gate",
      titleFa: "استطاعت مالی و تمکن مصوب",
      status: "failed",
      userValue: "زیر ۱۰ هزار دلار",
      requiredValue: `${cost.approximateTotalUsd.toLocaleString()} دلار`,
      explanationFa: "بودجه اعلام‌شده شما برای پوشش شهریه و تمکن رسمی این کشور در سال اول کافی نیست.",
      isHardGate: false,
      remedyActionFa: "بررسی گزینه‌های با بورسیه ۱۰۰٪ (نظیر ایتالیا یا DAAD آلمان) یا افزایش تمکن از طریق اسپانسر خانوادگی."
    });
  } else {
    conditions.push({
      id: "finance_gate",
      titleFa: "استطاعت مالی و تمکن مصوب",
      status: "passed",
      userValue: "متناسب با بازه",
      requiredValue: `${cost.officialLivingFundFa} تمکن زندگی`,
      explanationFa: "بودجه شما با استانداردهای تمکن و هزینه‌های این مسیر همخوانی دارد.",
      isHardGate: false
    });
  }

  // 6. CALCULATE EXPLAINABLE FIT SCORE (Strict weights: 25 + 20 + 15 + 15 + 10 + 10 + 5 = 100)
  // A. Realism and Route Suitability (max 25)
  let realismScore = 20;
  if (hardGateFailed) realismScore = 5;
  else if (route.routeType === "study" && profile.targetDegreeLevel === "phd" && profile.supervisorSecured) realismScore = 25;
  else if (route.routeType === "work_job_offer" && profile.hasJobOfferOrSponsor === "written_sponsor_offer") realismScore = 25;
  else if (route.routeType === "job_seeker" && profile.totalWorkExperienceYears >= 3) realismScore = 23;

  // B. Field or Occupation Fit (max 20)
  let fieldFitScore = 14;
  const isTargetFieldInCatalog = STUDY_FIELDS.some(f => f.bestDestinations.includes(route.countryCode) && f.nameFa.includes(profile.fieldOfStudy));
  const isTargetOccInCatalog = OCCUPATIONS_CATALOG.some(o => o.topTargetCountries.includes(route.countryCode) && o.titleFa.includes(profile.primaryJobTitle));
  if (isTargetFieldInCatalog || isTargetOccInCatalog) {
    fieldFitScore = 19;
  }

  // C. Language Fit (max 15)
  let langFitScore = 12;
  if (languageGapStatus === "satisfied") langFitScore = 15;
  else if (languageGapStatus === "manageable_gap") langFitScore = 9;
  else langFitScore = 3;

  // D. Financial Affordability (max 15)
  // already calculated as financialFitScore (max 15)

  // E. Degree and Experience Quality (max 10)
  let qualityScore = 7;
  if (profile.gpa >= 16) qualityScore += 2;
  if (profile.academicPublicationsCount > 0 || profile.toolsAndTechStack.length > 2) qualityScore += 1;
  qualityScore = Math.min(10, qualityScore);

  // F. User Preferences Fit (max 10)
  let preferencesFitScore = 7;
  if (profile.acceptedCountries.includes(route.countryCode)) preferencesFitScore += 2;
  if (profile.climatePreference !== "any" && route.countryCode === "CA" && profile.climatePreference === "cold_winter_ok") preferencesFitScore += 1;
  preferencesFitScore = Math.min(10, preferencesFitScore);

  // G. Readiness and Timing (max 5)
  let readinessScore = 4;
  if (profile.passportValidityMonths >= 12 && profile.militaryStatus !== "not_completed_needs_guarantee") readinessScore = 5;

  const totalFitScore = Math.round(
    realismScore + fieldFitScore + langFitScore + financialFitScore + qualityScore + preferencesFitScore + readinessScore
  );

  // Status classification
  let verdictStatus: "eligible_after_final_check" | "achievable_with_gaps" | "not_currently_eligible" = "eligible_after_final_check";
  let verdictLabelFa = "تناسب بالا؛ قابل اقدام پس از کنترل نهایی مدارک";

  if (hardGateFailed) {
    verdictStatus = "not_currently_eligible";
    verdictLabelFa = "فعلاً واجد شرایط نیست (نیازمند رفع شروط مسدودکننده)";
  } else if (totalFitScore < 70 || languageGapStatus === "manageable_gap") {
    verdictStatus = "achievable_with_gaps";
    verdictLabelFa = "قابل‌دستیابی با رفع شکاف‌های مشخص";
  }

  // Personalized "Why this option for you?"
  const whyReasons: string[] = [];
  if (route.routeType === "study") {
    whyReasons.push(`تناسب با مقطع تحصیلی هدف شما (${translateDegree(profile.targetDegreeLevel)}) و رشته تحصیلی ${profile.fieldOfStudy}.`);
    if (cost.approximateTotalUsd < 20000) {
      whyReasons.push("شهریه و هزینه‌های سال اول با توجه به مدل مالی کشور در سطحی معقول قرار دارد.");
    }
  } else {
    whyReasons.push(`انطباق سابقه کاری شما (${profile.totalWorkExperienceYears} سال) در حوزه ${profile.primaryJobTitle} با تقاضای بازار کار ${route.countryNameFa}.`);
  }
  if (profile.englishEstimatedLevel === "B2" || profile.englishEstimatedLevel === "C1") {
    whyReasons.push("سطح زبان فعلی شما نیازهای ارتباطی و مهاجرتی این مقصد را به خوبی پشتیبانی می‌کند.");
  }
  const whyThisOptionFa = whyReasons.join(" همچنین ");

  // Next Action Steps (3 to 7 actionable steps)
  const nextActions: NextActionStep[] = [
    {
      id: "act_1",
      titleFa: "آزادسازی و ترجمه رسمی مدارک تحصیلی و ریزنمرات",
      descriptionFa: "ترجمه رسمی ریزنمرات و دانشنامه دانشگاهی با مهرهای دادگستری و امور خارجه جهت بارگذاری در سامانه‌های ارزیابی.",
      responsibleParty: "user",
      priority: "high",
      estimatedCostFa: "حدود ۳ تا ۶ میلیون تومان",
      deadlineFa: "ظرف ۳۰ روز آینده",
      outputDocumentFa: "پلمپ ترجمه رسمی دادگستری"
    },
    {
      id: "act_2",
      titleFa: route.routeType === "study" ? "اخذ پذیرش رسمی دانشگاه (Admission Letter)" : "ارزیابی مهارت شغلی / معادل‌سازی مدرک (ECA/Skill Assessment)",
      descriptionFa: route.routeType === "study"
        ? "ارسال اپلیکیشن به ۳ تا ۵ دپارتمان متناسب با رزومه و اخذ تأییدیه رسمی پذیرش."
        : "ارسال سوابق تحصیلی و کاری به نهاد ارزیاب رسمی کشور مقصد جهت دریافت گواهی تطبیق شغلی.",
      responsibleParty: route.routeType === "study" ? "university" : "official_body",
      priority: "high",
      estimatedCostFa: route.routeType === "study" ? "۱۰۰ تا ۲۵۰ دلار Application Fee" : "۵۰۰ تا ۱٬۲۰۰ دلار هزینه ارزیابی مهارت",
      deadlineFa: "ظرف ۶۰ تا ۹۰ روز آینده",
      outputDocumentFa: route.routeType === "study" ? "نامه پذیرش قطعی / فرم CoE یا I-20" : "نامه مثبت ارزیابی مهارت"
    },
    {
      id: "act_3",
      titleFa: "تثبیت و دوره نگهداری تمکن مالی در حساب بانکی",
      descriptionFa: `فراهم‌آوری مبلغ مصوب (${cost.officialLivingFundFa}) در حساب بانکی معتبر با منبع وجوه روشن و قابل ردیابی (سند ملکی یا شغلی).`,
      responsibleParty: "user",
      priority: "high",
      estimatedCostFa: cost.officialLivingFundFa,
      deadlineFa: "حداقل ۳۰ تا ۶۰ روز قبل از ارسال مدارک ویزا",
      outputDocumentFa: "گواهی تمکن بانکی لاتین و گردش حساب"
    },
    {
      id: "act_4",
      titleFa: "شرکت در آزمون زبان رسمی استاندارد",
      descriptionFa: `کسب نمره هدف در آزمون آیلتس آکادمیک/جنرال، تافل یا PTE جهت احراز شرط قطعی ویزا (${route.practicalLanguageTargetFa}).`,
      responsibleParty: "user",
      priority: languageGapStatus === "satisfied" ? "medium" : "high",
      estimatedCostFa: "حدود ۲۸۰ دلار (هزینه ثبت‌نام سنتر)",
      deadlineFa: "ظرف ۹۰ روز آینده",
      outputDocumentFa: "کارنامه رسمی آزمون (TRF)"
    }
  ];

  // Resolve citations
  const citations = route.citationSourceIds
    .map(id => AUDITED_SOURCES[id])
    .filter(Boolean);

  return {
    countryCode: route.countryCode,
    countryNameFa: route.countryNameFa,
    countryNameEn: route.countryNameEn,
    flagEmoji: route.flagEmoji,
    routeId: route.id,
    routeNameFa: route.routeNameFa,
    routeType: route.routeType,
    routeTypeBadgeFa: route.routeTypeBadgeFa,
    fitScore: totalFitScore,
    isEligibleNow: !hardGateFailed && totalFitScore >= 55,
    verdictStatus,
    verdictLabelFa,
    whyThisOptionFa,
    scoreBreakdown: {
      realismAndRouteSuitability: realismScore,
      fieldOrOccupationFit: fieldFitScore,
      languageFit: langFitScore,
      financialAffordability: financialFitScore,
      degreeAndExperienceQuality: qualityScore,
      preferencesFit: preferencesFitScore,
      readinessAndTiming: readinessScore
    },
    hardGateFailed,
    hardGateFailureReasons,
    conditions,
    languageRequirement: {
      legalMinimumFa: route.legalLanguageRuleFa,
      practicalTargetFa: route.practicalLanguageTargetFa,
      userLevelFa: profile.englishEstimatedLevel,
      gapStatus: languageGapStatus,
      gapExplanationFa: languageGapExplanationFa
    },
    financialBreakdown: cost,
    documents: route.documents,
    timelineEstFa: route.estimatedProcessMonthsFa,
    keyRisksFa: route.keyRisksFa,
    nextActions,
    citations,
    lastVerifiedAt: route.lastVerifiedAt
  };
}

function translateDegree(degree: DegreeLevel): string {
  const map: Record<DegreeLevel, string> = {
    diploma: "دیپلم متوسطه",
    associate: "کاردانی (فوق دیپلم)",
    bachelor: "کارشناسی (لیسانس)",
    master: "کارشناسی ارشد (فوق لیسانس)",
    phd: "دکتری تخصصی (Ph.D)",
    postdoc: "پژوهش پسادکترا"
  };
  return map[degree] || degree;
}
