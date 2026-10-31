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
    profileStrengths.push(`سن در بازه طلایی (${profile.age} سال) جهت کسب حداکثر امتیاز در سیستم‌های امتیازی نظیر کانادا، آلمان و استرالیا و ریسک بسیار پایین در صدور ویزای تحصیلی.`);
  } else if (profile.age >= 33 && profile.age <= 40) {
    if (profile.migrationGoal === "study") {
      profileGaps.push(`سن (${profile.age} سال) برای مقطع کارشناسی ارشد در سفارت‌های کانادا و استرالیا نیازمند تبیین قوی قصد تحصیلی (SOP) و توجیه با سابقه کار است؛ مقاصدی نظیر آلمان، ایتالیا یا دکترا ریسک بسیار کمتری دارند.`);
    } else {
      profileStrengths.push(`سن (${profile.age} سال) با تجربه کاری ارزشمند که همچنان در بازه مجاز کارت شانس آلمان و جاب‌آفر اروپا قرار دارد.`);
    }
  } else if (profile.age > 45) {
    profileGaps.push(`سن بالای ۴۵ سال محدودیت جدی در مسیرهای اقامت دائم فدرال استرالیا، نیوزیلند و امتیاز FSW کانادا ایجاد می‌کند؛ تمرکز بر مسیرهای تخصصی جاب‌آفر، بلوکارت، ثبت شرکت یا خودحمایتی اولویت دارد.`);
  }

  // Study Gap Analysis
  const gapYears = profile.studyGapYears ?? (profile.graduationYear ? Math.max(0, 1404 - profile.graduationYear) : undefined);
  if (gapYears !== undefined) {
    if (gapYears <= 2) {
      profileStrengths.push(`گپ تحصیلی بسیار پایین یا صفر (${gapYears} سال) که پرونده شما را از نظر آفیسر ویزای تحصیلی کاملاً شفاف و بی‌ریسک نشان می‌دهد.`);
    } else if (gapYears >= 3 && gapYears <= 5) {
      if (profile.studyGapReason === "working_with_insurance" || profile.hasDocumentedInsuranceOrTaxes === "full_official") {
        profileStrengths.push(`گپ تحصیلی ${gapYears} ساله شما به طور قانونی با سابقه کار و بیمه رسمی پوشش داده شده و به جای ضعف، امتیاز تجربی محسوب می‌شود.`);
      } else {
        profileGaps.push(`گپ تحصیلی ${gapYears} ساله بدون سابقه بیمه رسمی نیازمند ارائه مستندات کاری، فریلنسری یا مدارک زبان جهت پیشگیری از ابهام آفیسر سفارت است.`);
      }
    } else if (gapYears > 5) {
      if (profile.studyGapReason === "working_with_insurance" || profile.hasDocumentedInsuranceOrTaxes === "full_official") {
        profileStrengths.push(`گپ تحصیلی طولانی (${gapYears} سال) به طور پیوسته با سوابق شغلی و تخصصی معتبر پر شده که مسیر مهاجرت کاری را بسیار هموار می‌کند.`);
      } else {
        profileGaps.push(`گپ تحصیلی طولانی بالای ۵ سال (${gapYears} سال) در صورت اقدام تحصیلی در سفارت‌های سخت‌گیر (کانادا، استرالیا، آلمان) ریسک ریجکتی به همراه دارد؛ مسیرهای پژوهشی با استاد یا مهاجرت کاری اولویت بالاتری دارند.`);
      }
    }
  }

  // Marital Status & Family Analysis
  if (profile.maritalStatus === "married_together") {
    if (profile.spouseLanguageLevel && profile.spouseLanguageLevel !== "none") {
      profileStrengths.push(`مهارت زبانی همسر امتیاز قابل توجهی به پرونده شما در سیستم‌های امتیازی اضافه کرده و احتمال اشتغال سریع خانواده در مقصد را بالا می‌برد.`);
    }
    if (profile.spouseEducation && profile.spouseEducation !== "diploma" && profile.spouseEducation !== "none") {
      profileStrengths.push(`تحصیلات دانشگاهی همسر امکان همراهی همزمان و بهره‌مندی از ویزای کار باز (Open Work Permit) در کانادا و کشورهای اروپایی را فراهم می‌کند.`);
    }
    profileGaps.push(`اقدام همزمان خانوادگی (${profile.dependentsCount > 0 ? `با ${profile.dependentsCount} فرزند` : "همراه با همسر"}) نیازمند تامین کف تمکن مالی بالاتری در حساب مسدود سفارت نسبت به متقاضی مجرد است.`);
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

  // Analysis for specific target country requested by user
  let specificTargetCountryResult: RecommendationSummary["specificTargetCountryResult"] = null;
  if (profile.destinationScope === "specific" && profile.targetSpecificCountry?.trim()) {
    const rawTarget = profile.targetSpecificCountry.trim();
    const targetQuery = rawTarget.toLowerCase();
    
    // Check if target country is already in primary destinations (top 3)
    const inTopRoute = primaryDestinations.find(d => 
      d.countryNameFa.toLowerCase().includes(targetQuery) || 
      targetQuery.includes(d.countryNameFa.toLowerCase()) ||
      d.countryNameEn.toLowerCase().includes(targetQuery) ||
      targetQuery.includes(d.countryNameEn.toLowerCase())
    );

    if (inTopRoute) {
      specificTargetCountryResult = {
        countryName: rawTarget,
        route: inTopRoute,
        isInTop3: true,
        qualificationGapsFa: [],
        requiredActionsFa: inTopRoute.nextActions.slice(0, 3).map(a => a.titleFa),
        budgetRequirementFa: inTopRoute.financialBreakdown.approximateTotalFa || `${inTopRoute.financialBreakdown.approximateTotalUsd.toLocaleString()} دلار`,
        languageRequirementFa: inTopRoute.languageRequirement.practicalTargetFa,
        summaryFa: `کشور انتخابی شما (${rawTarget}) با موفقیت در بین ۳ مقصد برتر و واجد شرایط شما قرار دارد.`
      };
    } else {
      // Find candidate route for this country from all evaluated routes
      const candidateRoute = evaluatedRoutes.find(r => 
        r.countryNameFa.toLowerCase().includes(targetQuery) || 
        targetQuery.includes(r.countryNameFa.toLowerCase()) ||
        r.countryNameEn.toLowerCase().includes(targetQuery) ||
        targetQuery.includes(r.countryNameEn.toLowerCase())
      );

      const gaps: string[] = [];
      const actions: string[] = [];
      let budgetReq = "نیاز به بررسی تمکن ارزی بر مبنای آخرین نرخ رسمی سفارت";
      let langReq = "حداقل مدرک زبان معتبر بین‌المللی B2/C1";

      if (candidateRoute) {
        budgetReq = candidateRoute.financialBreakdown.approximateTotalFa || `${candidateRoute.financialBreakdown.approximateTotalUsd.toLocaleString()} دلار (~${candidateRoute.financialBreakdown.approximateTotalEur.toLocaleString()} یورو)`;
        langReq = candidateRoute.languageRequirement.practicalTargetFa;

        if (candidateRoute.hardGateFailed && candidateRoute.hardGateFailureReasons.length > 0) {
          gaps.push(...candidateRoute.hardGateFailureReasons);
        }
        if (candidateRoute.languageRequirement.gapStatus !== "satisfied") {
          gaps.push(`سطح زبان: ${candidateRoute.languageRequirement.gapExplanationFa}`);
          actions.push(`ارتقای مدرک زبان به ${candidateRoute.languageRequirement.practicalTargetFa}`);
        }
        if (candidateRoute.financialBreakdown.approximateTotalUsd > (profile.liquidBudgetAmount || 20000)) {
          gaps.push(`بودجه سال اول: این مسیر نیازمند حدود ${budgetReq} است.`);
          actions.push(`تأمین تمکن مالی ارزی یا دریافت بورسیه/اسپانسرشیپ به میزان ${budgetReq}`);
        }
        if (candidateRoute.nextActions && candidateRoute.nextActions.length > 0) {
          actions.push(...candidateRoute.nextActions.slice(0, 2).map(a => a.titleFa));
        }
      } else {
        gaps.push(`برای کشور «${rawTarget}»، مسیرهای مهاجرت قانونی نیازمند قرارداد کاری معتبر از کارفرمای محلی یا پذیرش تحصیلی رسمی است.`);
        actions.push("تقویت رزومه تخصصی و اقدام برای دریافت جاب‌آفر یا پذیرش دانشگاهی");
        actions.push("اخذ مدرک زبان بین‌المللی معتبر (آیلتس/PTE یا زبان محلی مقصد در سطح B2)");
      }

      specificTargetCountryResult = {
        countryName: rawTarget,
        route: candidateRoute,
        isInTop3: false,
        qualificationGapsFa: gaps.length > 0 ? gaps : ["برای احراز شرایط این مقصد، نیازمند تکمیل مدارک و ارتقای سوابق تخصصی هستید."],
        requiredActionsFa: actions.length > 0 ? actions : ["تقویت رزومه کاری و اخذ مدرک زبان رسمی"],
        budgetRequirementFa: budgetReq,
        languageRequirementFa: langReq,
        summaryFa: `کشور مدنظر شما (${rawTarget}) در حال حاضر در جمع ۳ مقصد برتر واجد شرایط شما نیست، اما با رفع شکاف‌های زیر می‌توانید پرونده خود را برای آن آماده کنید:`
      };
    }
  }

  return {
    primaryDestinations,
    allEvaluatedRoutes: evaluatedRoutes,
    totalEligibleCount: evaluatedRoutes.filter(r => r.isEligibleNow).length,
    totalEvaluatedRoutes: evaluatedRoutes.length,
    profileStrengths: profileStrengths.slice(0, 4),
    profileGaps: profileGaps.slice(0, 4),
    overallRoadmapSummaryFa,
    evaluationTimestamp: new Date().toISOString(),
    isUnderAge18: profile.age < 18,
    specificTargetCountryResult
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
  if (route.routeType === "study" || route.routeType === "research_phd") {
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

function getCountrySpecificWorkLinks(countryCode: string) {
  const links = [
    { labelFa: "LinkedIn Jobs (بین‌المللی)", url: "https://www.linkedin.com/jobs/" },
    { labelFa: "Indeed (کاریابی جهانی)", url: "https://www.indeed.com/" },
    { labelFa: "Glassdoor (بررسی حقوق و آگهی)", url: "https://www.glassdoor.com/Job/" },
  ];

  if (countryCode === "CA") {
    links.unshift({ labelFa: "پرتال رسمی Job Bank کانادا (دارای LMIA)", url: "https://www.jobbank.gc.ca/" });
  } else if (countryCode === "DE") {
    links.unshift(
      { labelFa: "پرتال رسمی اداره کار فدرال آلمان (BA Jobsuche)", url: "https://www.arbeitsagentur.de/jobsuche/" },
      { labelFa: "سایت StepStone آلمان (انگلیسی‌زبان)", url: "https://www.stepstone.de/en" }
    );
  } else if (countryCode === "AU") {
    links.unshift(
      { labelFa: "پرتال دولتی Workforce Australia", url: "https://www.workforceaustralia.gov.au/individuals/jobs/" },
      { labelFa: "سایت SEEK استرالیا", url: "https://www.seek.com.au/" }
    );
  } else if (countryCode === "GB") {
    links.unshift({ labelFa: "پرتال رسمی Find a Job بریتانیا (GOV.UK)", url: "https://www.gov.uk/find-a-job" });
  } else if (countryCode === "NL") {
    links.unshift({ labelFa: "پرتال دولتی Werk.nl هلند", url: "https://www.werk.nl/" });
  } else if (countryCode === "SE") {
    links.unshift({ labelFa: "سایت رسمی آژانس کاریابی سوئد (Platsbanken)", url: "https://arbetsformedlingen.se/platsbanken/" });
  } else if (countryCode === "DK") {
    links.unshift({ labelFa: "پرتال متخصصان خارجی دانمارک (Workindenmark)", url: "https://www.workindenmark.dk/" });
  } else if (countryCode === "FI") {
    links.unshift({ labelFa: "پلتفرم رسمی بازار کار فنلاند (Job Market Finland)", url: "https://tyomarkkinatori.fi/en" });
  } else {
    links.push({ labelFa: "پرتال رسمی کاریابی اتحادیه اروپا (EURES)", url: "https://eures.europa.eu/" });
  }

  return links;
}

function getCountrySpecificStudyLinks(countryCode: string) {
  const links = [
    { labelFa: "پرتال دانشگاه‌های اروپایی (Study in Europe)", url: "https://studyineurope.org/" },
    { labelFa: "جستجوی مقاطع کارشناسی و ارشد (Mastersportal)", url: "https://www.mastersportal.com/" },
  ];

  if (countryCode === "DE") {
    links.unshift(
      { labelFa: "سامانه رسمی بورسیه و دانشگاه‌های آلمان (DAAD)", url: "https://www.daad.de/en/studying-in-germany/" },
      { labelFa: "پرتال ارزیابی و پذیرش مرکزی یونی‌اسیست (Uni-Assist)", url: "https://www.uni-assist.de/" }
    );
  } else if (countryCode === "FR") {
    links.unshift({ labelFa: "پرتال رسمی کامپوس فرانس (Campus France)", url: "https://www.campusfrance.org/en" });
  } else if (countryCode === "IT") {
    links.unshift({ labelFa: "سامانه رسمی دانشجویان بین‌المللی ایتالیا (Universitaly)", url: "https://www.universitaly.it/" });
  } else if (countryCode === "CA") {
    links.unshift({ labelFa: "فهرست موسسات آموزشی مجاز کانادا (DLI List)", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/prepare/designated-learning-institutions-list.html" });
  }

  return links;
}

function buildNextActionsForRoute(
  route: RouteDefinition,
  profile: UserAssessmentProfile,
  cost: any,
  languageGapStatus: string
): NextActionStep[] {
  const isWorkRoute = route.routeType === "work_job_offer" || route.routeType === "skilled_pr" || route.routeType === "job_seeker";
  const isStudyRoute = route.routeType === "study" || route.routeType === "research_phd";

  if (isWorkRoute) {
    return [
      {
        id: "act_work_1",
        titleFa: "آزادسازی، ترجمه رسمی و معادل‌سازی مدرک تحصیلی و سوابق (ECA / ZAB / Anabin)",
        descriptionFa: "ترجمه رسمی دانشنامه، ریزنمرات و گواهی سوابق کاری و بیمه با مهرهای دادگستری و امور خارجه (لگالایز)، و ثبت درخواست معادل‌سازی مدرک در سازمان رسمی کشور مقصد (نظیر WES کانادا، ZAB آلمان، یا ارزیابی مهارت وت‌اسس/کامپیوتر استرالیا).",
        responsibleParty: "user",
        priority: "high",
        estimatedCostFa: "حدود ۴ تا ۸ میلیون تومان + عوارض ارزیاب رسمی",
        deadlineFa: "ظرف ۳۰ تا ۴۵ روز آینده",
        outputDocumentFa: "پلمپ ترجمه رسمی دادگستری و گزارش مثبت تطبیق مدرک (ECA Report)"
      },
      {
        id: "act_work_2",
        titleFa: "ساخت رزومه بین‌المللی هماهنگ با ATS و بهینه‌سازی پروفایل لینکدین",
        descriptionFa: "نگارش رزومه استاندارد تک‌ستونه به زبان انگلیسی بدون اطلاعات اضافه، درج کلمات کلیدی شرح شغل‌های خارجی جهت عبور موفق از فیلترهای نرم‌افزارهای غربالگری (ATS)، و تکمیل بخش‌های تجربیات، مهارت‌ها و فعال‌سازی گزینه Open to Work در لینکدین.",
        responsibleParty: "user",
        priority: "high",
        estimatedCostFa: "رایگان / اقدام شخصی",
        deadlineFa: "ظرف ۱۵ تا ۲۰ روز آینده",
        outputDocumentFa: "فایل PDF رزومه استاندارد بین‌المللی + پروفایل لینکدین با رتبه All-Star",
        links: [
          { labelFa: "پروفایل و شبکه کاریابی لینکدین (LinkedIn)", url: "https://www.linkedin.com/" }
        ]
      },
      {
        id: "act_work_3",
        titleFa: "ثبت‌نام در پرتال‌های کاریابی بین‌المللی، جستجوی جاب‌آفر و ارسال کاورلتر سفارشی",
        descriptionFa: "عضویت در پرتال‌های رسمی استخدامی کشور مقصد و موتورهای کاریابی جهانی، تنظیم هشدار آگهی‌های اسپانسر ویزا (Visa Sponsorship / LMIA / Blue Card)، و ارسال روزانه حداقل ۳ تا ۵ رزومه همراه با کاورلتر (Cover Letter) شخصی‌سازی‌شده برای هر موقعیت شغلی.",
        responsibleParty: "user",
        priority: "high",
        estimatedCostFa: "رایگان",
        deadlineFa: "روزانه و پیوسته (ظرف ۶۰ تا ۱۲۰ روز)",
        outputDocumentFa: "ارسال حداقل ۵۰ تا ۱۰۰ اپلیکیشن هدفمند شغلی و دریافت دعوت‌نامه‌های مصاحبه اولیه",
        links: getCountrySpecificWorkLinks(route.countryCode)
      },
      {
        id: "act_work_4",
        titleFa: "آمادگی و موفقیت در مصاحبه‌های استخدامی با کارفرما و عقد قرارداد کاری (Job Offer)",
        descriptionFa: "شبیه‌سازی و تمرین مصاحبه‌های منابع انسانی (HR Screen) و مصاحبه‌های فنی تخصصی به زبان انگلیسی، پاسخ‌دهی به متد STAR برای سوالات رفتاری، مذاکره بر سر حداقل حقوق مصوب اداره کار مقصد، و در نهایت اخذ قرارداد کاری رسمی امضاشده (Employment Contract).",
        responsibleParty: "employer",
        priority: "high",
        estimatedCostFa: "رایگان",
        deadlineFa: "ظرف ۹۰ تا ۱۸۰ روز آینده",
        outputDocumentFa: "قرارداد رسمی استخدام (Signed Job Offer) و نامه تاییدیه اسپانسرشیپ ویزا"
      },
      {
        id: "act_work_5",
        titleFa: "تثبیت تمکن مالی پشتیبان، گواهی عدم سوءپیشینه و مدارک تکمیلی",
        descriptionFa: `فراهم‌آوری مبلغ مصوب (${cost.officialLivingFundFa}) در حساب بانکی معتبر، ترجمه گواهی عدم سوءپیشینه و تهیه بیمه مسافرتی/کاری معتبر برای ورود به کشور مقصد.`,
        responsibleParty: "user",
        priority: "high",
        estimatedCostFa: cost.officialLivingFundFa,
        deadlineFa: "حداقل ۳۰ روز قبل از مراجعه به سفارت",
        outputDocumentFa: "گواهی تمکن بانکی لاتین و گواهی عدم سوءپیشینه رسمی"
      },
      {
        id: "act_work_6",
        titleFa: "رزرو وقت سفارت/کارگزاری، بیومتریک و اخذ استیکر ویزای کار",
        descriptionFa: "ثبت نوبت در کارگزاری رسمی سفارت (VFS / Visametric / TLScontact)، تکمیل فرم آنلاین ویزای کار، تحویل قرارداد کاری و مدارک معادل‌سازی، انجام انگشت‌نگاری و تحویل پاسپورت حاوی ویزای کاری.",
        responsibleParty: "official_body",
        priority: "high",
        estimatedCostFa: "حدود ۱۰۰ تا ۲۵۰ یورو/دلار هزینه بررسی ویزا در سفارت",
        deadlineFa: "متناسب با وقت‌های خالی سفارت",
        outputDocumentFa: "برچسب ویزای رسمی کار در پاسپورت (Work Visa Stamp)"
      }
    ];
  }

  if (isStudyRoute) {
    return [
      {
        id: "act_study_1",
        titleFa: "آزادسازی دانشنامه، ترجمه رسمی و لگالایز (تایید دادگستری، امور خارجه و سفارت)",
        descriptionFa: "لغو تعهد آموزش رایگان و تسویه‌حساب با دانشگاه، دریافت اصل دانشنامه و ریزنمرات رسمی، ترجمه رسمی به زبان انگلیسی یا زبان مقصد، و اخذ مهرهای تاییدیه دادگستری، وزارت امور خارجه و در صورت نیاز لگالایز سفارت (مانند تاییدات ویزامتریک آلمان یا سفارت ایتالیا).",
        responsibleParty: "user",
        priority: "high",
        estimatedCostFa: "حدود ۴ تا ۸ میلیون تومان",
        deadlineFa: "ظرف ۳۰ تا ۴۵ روز آینده",
        outputDocumentFa: "مدارک پلمپ‌شده با مهرهای رسمی و تاییدیه لگالایز"
      },
      {
        id: "act_study_2",
        titleFa: "نگارش رزومه آکادمیک (Academic CV)، انگیزه‌نامه (SOP) و توصیه‌نامه‌ها (LOR)",
        descriptionFa: "نوشتن انگیزه‌نامه شخصی‌سازی‌شده و مستدل (Statement of Purpose / Motivation Letter) با توجیه منطقی گپ تحصیلی و رشته انتخابی، دریافت ۲ تا ۳ توصیه‌نامه از اساتید با سربرگ و ایمیل دانشگاهی، و آماده‌سازی پروپوزال، سمپل رایتینگ یا مقالات علمی (در صورت وجود برای مقاطع ارشد پژوهش‌محور یا دکترا).",
        responsibleParty: "user",
        priority: "high",
        estimatedCostFa: "رایگان / اقدام شخصی",
        deadlineFa: "ظرف ۳۰ روز آینده",
        outputDocumentFa: "پکیج کامل مدارک متنی اپلای (SOP، CV، توصیه‌نامه‌ها و پروپوزال)"
      },
      {
        id: "act_study_3",
        titleFa: "انتخاب رشته‌ها، مکاتبه با اساتید (Cold Emailing) و اپلای رسمی در دانشگاه‌ها",
        descriptionFa: "جست‌وجوی پروگرم‌های متناسب در پرتال‌های رسمی دانشگاهی، ارسال ایمیل‌های حرفه‌ای و هدفمند به اساتید راهنما (Supervisors) برای مقاطع تز‌محور/دکترا جهت دریافت فاند و بورسیه، و در نهایت ثبت اپلیکیشن در پرتال رسمی دانشگاه یا سامانه‌های مرکزی پذیرش (نظیر Uni-assist آلمان یا Campus France).",
        responsibleParty: "university",
        priority: "high",
        estimatedCostFa: "حدود ۵۰ تا ۱۵۰ یورو/دلار Application Fee دانشگاه",
        deadlineFa: "ظرف ۶۰ تا ۹۰ روز (قبل از ددلاین دانشگاه‌ها)",
        outputDocumentFa: "رسید ثبت اپلیکیشن و پرداخت اپلیکیشن فی دپارتمان",
        links: getCountrySpecificStudyLinks(route.countryCode)
      },
      {
        id: "act_study_4",
        titleFa: "شرکت در آزمون زبان استاندارد رسمی (آیلتس، تافل، PTE یا زبان مقصد)",
        descriptionFa: `کسب نمره هدف در آزمون بین‌المللی متناسب با حدنصاب دپارتمان (${route.practicalLanguageTargetFa}) و دریافت کارنامه رسمی جهت بارگذاری در پرتال دانشگاه و ارائه به سفارت.`,
        responsibleParty: "user",
        priority: languageGapStatus === "satisfied" ? "medium" : "high",
        estimatedCostFa: "حدود ۲۸۰ دلار (هزینه سنتر آزمون)",
        deadlineFa: "ظرف ۹۰ روز آینده",
        outputDocumentFa: "کارنامه رسمی آزمون بین‌المللی زبان (TRF)"
      },
      {
        id: "act_study_5",
        titleFa: "اخذ پذیرش رسمی و تامین تمکن مالی (حساب مسدود / فاند / اسپانسر)",
        descriptionFa: `دریافت نامه پذیرش قطعی (Admission Offer)، افتتاح حساب مسدود بانکی (Blocked Account / Sperrkonto مانند Fintiba/Expatrio برای آلمان با مبلغ مصوب ۱۱,۹۰۴ یورو، یا حساب بانکی معتبر با مبلغ ${cost.officialLivingFundFa}) و آماده‌سازی اسناد حامی مالی و منبع وجوه.`,
        responsibleParty: "user",
        priority: "high",
        estimatedCostFa: cost.officialLivingFundFa,
        deadlineFa: "بلافاصله پس از دریافت پذیرش دانشگاه",
        outputDocumentFa: "نامه پذیرش قطعی دانشگاه + گواهی حساب مسدود یا تمکن بانکی لاتین"
      },
      {
        id: "act_study_6",
        titleFa: "رزرو وقت سفارت/کارگزاری، بیمه دانشجویی و مصاحبه ویزا",
        descriptionFa: "ثبت نوبت در کارگزاری رسمی سفارت (Visametric / VFS Global)، تهیه بیمه درمانی دانشجویی معتبر، مرتب‌سازی فیزیکی مدارک طبق چک‌لیست سفارت و شرکت در مصاحبه ویزای دانشجویی.",
        responsibleParty: "official_body",
        priority: "high",
        estimatedCostFa: "حدود ۷۵ تا ۱۶۰ یورو هزینه پرونده ویزای دانشجویی",
        deadlineFa: "حداقل ۲ تا ۳ ماه پیش از شروع ترم تحصیلی",
        outputDocumentFa: "استیکر ویزای دانشجویی در پاسپورت (Student Visa)"
      }
    ];
  }

  // Fallback for investment / nomad / general
  return [
    {
      id: "act_gen_1",
      titleFa: "آزادسازی و ترجمه رسمی مدارک هویتی، شغلی و تمکن مالی",
      descriptionFa: "ترجمه رسمی ریزنمرات، اسناد ملکی و گواهی‌های شغلی با مهرهای دادگستری و امور خارجه جهت بارگذاری در سامانه‌های ارزیابی.",
      responsibleParty: "user",
      priority: "high",
      estimatedCostFa: "حدود ۴ تا ۷ میلیون تومان",
      deadlineFa: "ظرف ۳۰ روز آینده",
      outputDocumentFa: "پلمپ ترجمه رسمی دادگستری"
    },
    {
      id: "act_gen_2",
      titleFa: "تثبیت و دوره نگهداری تمکن مالی در حساب بانکی",
      descriptionFa: `فراهم‌آوری مبلغ مصوب (${cost.officialLivingFundFa}) در حساب بانکی معتبر با منبع وجوه روشن و قابل ردیابی (سند ملکی یا شغلی).`,
      responsibleParty: "user",
      priority: "high",
      estimatedCostFa: cost.officialLivingFundFa,
      deadlineFa: "حداقل ۳۰ تا ۶۰ روز قبل از ارسال مدارک ویزا",
      outputDocumentFa: "گواهی تمکن بانکی لاتین و گردش حساب"
    },
    {
      id: "act_gen_3",
      titleFa: "احراز مدرک زبان استاندارد متناسب با مسیر قانونی",
      descriptionFa: `کسب نمره هدف در آزمون آیلتس، تافل یا زبان محلی جهت احراز شرط قطعی ویزا (${route.practicalLanguageTargetFa}).`,
      responsibleParty: "user",
      priority: languageGapStatus === "satisfied" ? "medium" : "high",
      estimatedCostFa: "حدود ۲۸۰ دلار (هزینه ثبت‌نام سنتر)",
      deadlineFa: "ظرف ۹۰ روز آینده",
      outputDocumentFa: "کارنامه رسمی آزمون (TRF)"
    },
    {
      id: "act_gen_4",
      titleFa: "رزرو وقت سفارت/کارگزاری، بیومتریک و اخذ ویزا",
      descriptionFa: "ثبت وقت سفارت در کارگزاری رسمی، تحویل اصل مدارک مالی و هویتی و پاسخ به مصاحبه آفیسر.",
      responsibleParty: "official_body",
      priority: "high",
      estimatedCostFa: "حدود ۱۰۰ تا ۲۰۰ یورو هزینه بررسی ویزا",
      deadlineFa: "متناسب با وقت‌های خالی سفارت",
      outputDocumentFa: "استیکر ویزای رسمی در پاسپورت"
    }
  ];
}

  // Next Action Steps tailored to Work vs Study
  const nextActions: NextActionStep[] = buildNextActionsForRoute(route, profile, cost, languageGapStatus);

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
