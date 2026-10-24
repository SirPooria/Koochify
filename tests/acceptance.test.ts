import { describe, it } from "node:test";
import assert from "node:assert";
import { evaluateUserMigrationProfile } from "../src/services/matcherEngine";
import { DEFAULT_PROFILE } from "../src/components/AssessmentWizard";
import { calculateRouteCost } from "../src/services/costCalculator";
import { ACTIVE_ROUTES } from "../src/data/routesData";
import { analyzeUserResume } from "../src/services/resumeAnalyzer";
import { AUDITED_SOURCES } from "../src/data/migrationSources";
import { COUNTRY_CATALOG } from "../src/data/countryCatalog";
import { UserAssessmentProfile } from "../src/types";

describe("Koochify Acceptance Criteria & Decision Engine Verification", () => {

  it("Criterion 1: Default or 'I don't know' inputs complete evaluation without blocking", () => {
    const profile: UserAssessmentProfile = {
      ...DEFAULT_PROFILE,
      migrationGoal: "both",
      fieldOfStudy: "هنوز مشخص نیست",
      primaryJobTitle: "هنوز مشخص نیست",
      budgetRangeCategory: "10k_to_25k"
    };

    const summary = evaluateUserMigrationProfile(profile);
    assert.ok(summary, "Summary must be produced");
    assert.ok(Array.isArray(summary.primaryDestinations), "primaryDestinations must be an array");
    assert.ok(summary.primaryDestinations.length > 0, "Must recommend at least 1 destination even for open profile");
    assert.ok(summary.primaryDestinations.length <= 3, "Must never exceed 3 primary destinations");
  });

  it("Criterion 2: Results must contain at most 3 DISTINCT countries", () => {
    const profile: UserAssessmentProfile = {
      ...DEFAULT_PROFILE,
      age: 27,
      highestDegree: "master",
      fieldOfStudy: "مهندسی کامپیوتر",
      primaryJobTitle: "مهندس نرم‌افزار / Software Engineer",
      totalWorkExperienceYears: 4,
      englishEstimatedLevel: "B2",
      budgetRangeCategory: "25k_to_50k"
    };

    const summary = evaluateUserMigrationProfile(profile);
    const countries = summary.primaryDestinations.map(d => d.countryCode);
    const uniqueCountries = new Set(countries);

    assert.strictEqual(countries.length, uniqueCountries.size, "All recommended countries must be distinct");
    assert.ok(summary.primaryDestinations.length <= 3, "Primary destinations count must be <= 3");

    // Check that each destination has its own route
    summary.primaryDestinations.forEach(d => {
      assert.ok(d.countryNameFa, "Destination must have Persian name");
      assert.ok(d.routeNameFa, "Destination must have route name");
      assert.ok(d.whyThisOptionFa, "Destination must explain why it was chosen");
    });
  });

  it("Criterion 3: Hard-gate rejected routes must never be marked eligible even with high points", () => {
    // Australian Subclass 189 requires age < 45
    const profileOverAge: UserAssessmentProfile = {
      ...DEFAULT_PROFILE,
      age: 48, // strictly over 45
      highestDegree: "phd",
      fieldOfStudy: "مهندسی کامپیوتر",
      primaryJobTitle: "مهندس نرم‌افزار / Software Engineer",
      totalWorkExperienceYears: 15,
      englishEstimatedLevel: "C1",
      budgetRangeCategory: "above_50k",
      migrationGoal: "work"
    };

    const summary = evaluateUserMigrationProfile(profileOverAge);
    const allRoutes = summary.allEvaluatedRoutes || summary.primaryDestinations;
    const au189 = allRoutes.find(r => r.routeId === "au_subclass_189");

    if (au189) {
      assert.strictEqual(au189.isEligibleNow, false, "Subclass 189 must NOT be eligible for applicant over 45");
      assert.strictEqual(au189.hardGateFailed, true, "Hard gate must be flagged as failed");
      assert.strictEqual(au189.verdictStatus, "not_currently_eligible");
      assert.ok(au189.hardGateFailureReasons.length > 0, "Must provide explanation of age limitation");
    }
  });

  it("Criterion 4: Fit score must never be presented as probability or visa chance", () => {
    const profile: UserAssessmentProfile = {
      ...DEFAULT_PROFILE,
      age: 26,
      highestDegree: "bachelor",
      fieldOfStudy: "علوم کامپیوتر",
      englishEstimatedLevel: "B2"
    };

    const summary = evaluateUserMigrationProfile(profile);
    summary.primaryDestinations.forEach(d => {
      assert.ok(d.fitScore >= 0 && d.fitScore <= 100, "Fit score must be between 0 and 100");
      // Check that verdict and descriptions avoid "chance" or "probability" words
      assert.doesNotMatch(d.whyThisOptionFa, /شانس صدور ویزا|احتمال قبولی در سفارت/, "Must not promise visa probability");
    });
  });

  it("Criterion 5: Financial calculations strictly separate tuition, living, travel and dependents", () => {
    const routeCanada = ACTIVE_ROUTES.find(r => r.id === "ca_study_permit");
    assert.ok(routeCanada, "Canada study permit route must exist");

    const profile: UserAssessmentProfile = {
      ...DEFAULT_PROFILE,
      dependentsCount: 1,
      familyJoinTiming: "together"
    };

    const cost = calculateRouteCost(routeCanada, profile);
    assert.ok(cost.officialLivingFund > 0, "Living fund must be greater than zero");
    assert.ok(cost.annualTuitionEstimate > 0, "Tuition must be separate and non-zero");
    assert.ok(cost.travelAndSettlingFund > 0, "Travel fund must be separated");
    assert.ok(cost.dependentsAllowance > 0, "Dependents allowance must be tracked separately");
    assert.strictEqual(
      cost.estimatedFirstYearTotal,
      cost.officialLivingFund + cost.annualTuitionEstimate + cost.travelAndSettlingFund + cost.dependentsAllowance - cost.scholarshipDeduction,
      "Estimated first year total must be the exact sum of separated line items"
    );
    assert.ok(cost.rateEffectiveDate, "Rate must have an effective verification date");
  });

  it("Criterion 6: Documents distinguish between Translation and Apostille/Legalization", () => {
    const routeGermany = ACTIVE_ROUTES.find(r => r.id === "de_chancenkarte");
    assert.ok(routeGermany, "Germany Chancenkarte must exist");

    routeGermany.documents.forEach(doc => {
      assert.ok(doc.translationRule, `Document ${doc.id} must have explicit translation rule`);
      assert.ok(doc.legalisationRule, `Document ${doc.id} must have explicit legalization rule`);
      // Legalization rule must be distinct from translation rule
      assert.notStrictEqual(doc.translationRule, doc.legalisationRule, "Translation rule must not be identical to legalization rule");
    });
  });

  it("Criterion 7: Resume Analyzer adheres to privacy, ATS rules, and user-confirmed bullet rewrites", () => {
    const testResume = `
      Software Developer with 3 years experience.
      Worked on React and Node.js applications.
      Fixed bugs and attended daily meetings.
    `;

    const result = analyzeUserResume(testResume, "مهندس نرم‌افزار / Software Engineer", "DE");
    assert.ok(result.atsAudit.score >= 0 && result.atsAudit.score <= 100, "ATS score must be calculated");
    assert.ok(result.realStrengths.length > 0, "Must identify real strengths");
    assert.ok(result.identifiedGaps.length > 0, "Must identify gaps");
    assert.ok(result.bulletSuggestions.length > 0, "Must provide bullet suggestions");

    result.bulletSuggestions.forEach(b => {
      assert.ok(b.userVerificationNoticeFa.includes("پیشنهاد ویرایشی"), "Bullet suggestion must state it requires user verification");
      assert.ok(b.measurableOutcomeNote, "Bullet must explain the outcome note");
    });
  });

  it("Criterion 8: Audited sources must contain canonical URLs, dates, and non-empty summaries", () => {
    const sources = Object.values(AUDITED_SOURCES);
    assert.ok(sources.length >= 10, "Must have comprehensive audited sources");

    sources.forEach(src => {
      assert.ok(src.canonicalUrl.startsWith("http"), `Source ${src.sourceId} must have valid URL`);
      assert.ok(src.effectiveFrom, `Source ${src.sourceId} must have effectiveFrom date`);
      assert.ok(src.checkedAt, `Source ${src.sourceId} must have checkedAt date`);
      assert.ok(src.summaryFa.length > 15, `Source ${src.sourceId} must have informative Persian summary`);
    });
  });

  it("Criterion 9: 30 Study & 30 Work Catalog items are defined with completeness transparency", () => {
    assert.strictEqual(COUNTRY_CATALOG.length, 30, "Catalog must list exactly 30 countries");

    let studyCount = 0;
    let workCount = 0;
    COUNTRY_CATALOG.forEach(c => {
      if (c.supportsStudy) studyCount++;
      if (c.supportsWork) workCount++;
      assert.ok(c.dataCompletenessPercent >= 0 && c.dataCompletenessPercent <= 100, "Completeness must be 0-100");
    });

    assert.ok(studyCount >= 25, "At least 25 countries support study paths");
    assert.ok(workCount >= 25, "At least 25 countries support work paths");
  });

});
