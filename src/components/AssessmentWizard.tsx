import React, { useState, useEffect } from "react";
import { 
  User, 
  GraduationCap, 
  Briefcase, 
  Languages, 
  Coins, 
  Heart, 
  Compass, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle, 
  Save, 
  Sparkles,
  Info,
  Shield,
  Layers
} from "lucide-react";
import { UserAssessmentProfile, MigrationGoal, DegreeLevel, EnglishExamType, CEFRLevel, MilitaryStatus } from "../types";
import { STUDY_FIELDS } from "../data/studyFieldsData";
import { OCCUPATIONS_CATALOG } from "../data/occupationsData";
import { AuthUser, updateProfile } from "../services/authService";

interface AssessmentWizardProps {
  initialGoal?: MigrationGoal;
  onSubmit: (profile: UserAssessmentProfile) => void;
  isLoading: boolean;
  user?: AuthUser | null;
  onUpdateUser?: (updated: AuthUser) => void;
}

export const DEFAULT_PROFILE: UserAssessmentProfile = {
  migrationGoal: "both",
  targetTimeline: "6_to_12m",
  acceptedCountries: [],
  excludedCountries: [],
  relocationFlexibility: "high",
  destinationScope: "any",
  targetSpecificCountry: "",

  fullName: "",
  age: 28,
  citizenships: ["IR"],
  currentResidenceCountry: "ایران",
  currentCityOrProvince: "تهران",
  passportValidityMonths: 18,
  hasExitRestrictions: "no",
  militaryStatus: "completed",
  maritalStatus: "single",
  dependentsCount: 0,
  dependentsAges: [],
  familyJoinTiming: "no_dependents",
  spouseEducation: "bachelor",
  spouseLanguageLevel: "B1",
  spouseWorkExperienceYears: 2,
  spouseOccupation: "",
  childrenSchoolAgeCount: 0,

  highestDegree: "bachelor",
  fieldOfStudy: "مهندسی کامپیوتر",
  subFieldOrMajor: "نرم‌افزار",
  universityName: "دانشگاه دولتی",
  universityType: "state_regular",
  gpa: 16.5,
  gpaScale: "20",
  graduationYear: 1400,
  studyGapYears: 3,
  studyGapReason: "working_with_insurance",
  hasOfficialDegreeInHand: "yes",
  thesisOrCapstoneCompleted: true,
  taughtInEnglish: false,
  academicPublicationsCount: 0,
  recommendationLettersAvailable: "can_get",

  targetDegreeLevel: "master",
  hasAdmissionOrOffer: "none",
  supervisorSecured: false,
  needsScholarship: "partial_helpful",
  preferredStudyCities: [],

  primaryJobTitle: "توسعه‌دهنده و مهندس نرم‌افزار",
  jobDutiesSummary: "توسعه و نگهداری سرویس‌های بک‌اند و فرانت‌اند، طراحی دیتابیس و تست نرم‌افزار",
  occupationCode: "2512",
  totalWorkExperienceYears: 3,
  relevantExperienceYears: 3,
  currentWorkStatus: "full_time",
  hasDocumentedInsuranceOrTaxes: "full_official",
  industrySector: "فناوری اطلاعات و نرم‌افزار",
  toolsAndTechStack: ["Python", "TypeScript", "SQL", "Docker", "Git"],
  hasProfessionalLicense: "not_regulated_or_no",
  hasJobOfferOrSponsor: "none",

  englishExam: "ielts_academic",
  englishScores: {
    listening: 6.5,
    reading: 6.5,
    writing: 6.0,
    speaking: 6.5,
    overall: 6.5
  },
  englishEstimatedLevel: "B2",
  secondLanguage: "none",
  secondLanguageLevel: "none",
  willingnessToLearnLocalLanguage: "moderate",

  budgetCurrency: "USD",
  liquidBudgetAmount: 20000,
  budgetRangeCategory: "10k_to_25k",
  primaryFundingSource: "personal_savings",
  debtTolerance: "medium",

  climatePreference: "any",
  citySizePreference: "medium_city",
  prTrackImportance: "essential",
  iranianCommunityNearby: "not_important",

  lastUpdated: new Date().toISOString()
};

const STEPS = [
  { id: 1, title: "هدف و زمان‌بندی", icon: Compass },
  { id: 2, title: "هویت و خانواده", icon: User },
  { id: 3, title: "سوابق تحصیلی", icon: GraduationCap },
  { id: 4, title: "شغل و تخصص", icon: Briefcase },
  { id: 5, title: "مهارت زبان", icon: Languages },
  { id: 6, title: "بودجه و تمکن", icon: Coins },
  { id: 7, title: "ترجیحات مقصد", icon: Heart }
];

function getFirstName(fullName?: string): string {
  if (!fullName) return "";
  const cleaned = fullName.trim();
  if (!cleaned) return "";

  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return cleaned;

  // Handle common Persian compound first names (e.g. محمد رضا, امیر علی, سید علی)
  const compoundPrefixes = ["محمد", "امیر", "سید", "سیده", "نازنین", "میر"];
  if (parts.length >= 3 && compoundPrefixes.includes(parts[0])) {
    return `${parts[0]} ${parts[1]}`;
  }

  if (parts.length === 2) {
    const commonCompoundSecond = ["رضا", "علی", "حسین", "محمد", "مهدی", "جواد", "حسن", "صادق", "باقر", "هادی", "امیر"];
    if (compoundPrefixes.includes(parts[0]) && commonCompoundSecond.includes(parts[1])) {
      return `${parts[0]} ${parts[1]}`;
    }
    return parts[0];
  }

  return parts[0];
}

export default function AssessmentWizard({
  initialGoal,
  onSubmit,
  isLoading,
  user,
  onUpdateUser
}: AssessmentWizardProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [profile, setProfile] = useState<UserAssessmentProfile>(() => {
    try {
      const saved = localStorage.getItem("kochify_profile_draft");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (initialGoal) parsed.migrationGoal = initialGoal;
        if (user?.fullName && !parsed.fullName) parsed.fullName = user.fullName;
        return { ...DEFAULT_PROFILE, ...parsed };
      }
    } catch (e) {
      console.warn("Could not read saved profile", e);
    }
    return {
      ...DEFAULT_PROFILE,
      fullName: user?.fullName || DEFAULT_PROFILE.fullName,
      migrationGoal: initialGoal || DEFAULT_PROFILE.migrationGoal
    };
  });

  // Assistant introduction state (always greets the user first)
  const [isIntroduced, setIsIntroduced] = useState<boolean>(false);

  const [inputFirstName, setInputFirstName] = useState("");
  const [inputLastName, setInputLastName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  // Sync user fullName if it becomes available
  useEffect(() => {
    if (user?.fullName && !profile.fullName) {
      setProfile(prev => ({ ...prev, fullName: user.fullName || "" }));
    }
  }, [user?.fullName]);

  const [activeHelpMessage, setActiveHelpMessage] = useState<string | null>(null);

  // Auto-save on change
  useEffect(() => {
    try {
      localStorage.setItem("kochify_profile_draft", JSON.stringify(profile));
    } catch (e) {
      console.warn("Storage save error", e);
    }
  }, [profile]);

  const updateField = <K extends keyof UserAssessmentProfile>(field: K, value: UserAssessmentProfile[K]) => {
    setProfile(prev => ({
      ...prev,
      [field]: value,
      lastUpdated: new Date().toISOString()
    }));
  };

  const handleNext = () => {
    setActiveHelpMessage(null);
    if (currentStep < 7) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      onSubmit(profile);
    }
  };

  const handlePrev = () => {
    setActiveHelpMessage(null);
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const currentFullName = profile.fullName?.trim() || user?.fullName?.trim() || "";
  const firstName = inputFirstName.trim() || getFirstName(currentFullName);
  const assistantGreetingName = firstName || "همراه عزیز";
  const displayName = firstName || "همراه";

  // If user hasn't passed assistant greeting, show introduction card first
  if (!isIntroduced) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-right">
        <div className="bg-white rounded-3xl border-2 border-slate-200/90 shadow-xl p-6 sm:p-10 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-emerald-100 rounded-full blur-3xl opacity-70 pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-teal-100 rounded-full blur-3xl opacity-70 pointer-events-none" />

          {/* Assistant Avatar Header */}
          <div className="flex flex-col items-center text-center mb-6 relative z-10">
            <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-1 shadow-lg shadow-emerald-600/25 mb-3 flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center text-emerald-400">
                <Sparkles className="w-8 h-8 animate-pulse" />
              </div>
            </div>
            <span className="inline-block bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black px-3 py-1 rounded-full">
              دستیار هوشمند مهاجرتی کوچیفای
            </span>
          </div>

          {currentFullName ? (
            /* User ALREADY has a full name */
            <div className="space-y-6 text-center relative z-10">
              <div className="bg-emerald-50/80 border-2 border-emerald-200 rounded-2xl p-6 shadow-2xs">
                <p className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed">
                  « سلام <span className="text-emerald-700 font-black">{assistantGreetingName}</span> ! من دستیار مهاجرتی کوچیفای هستم، سوالاتی که ازت می‌پرسم رو صادقانه و با دقت جواب بده تا منم بهتر بتونم کمکت کنم، آماده‌ای ؟ »
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsIntroduced(true);
                  try {
                    localStorage.setItem("kochify_wizard_introduced", "true");
                  } catch {}
                }}
                className="w-full sm:w-auto min-w-[200px] py-3.5 px-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-black text-base shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>بزن بریم</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* User does NOT have a full name */
            <div className="space-y-6 text-center relative z-10">
              <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 shadow-2xs">
                <p className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed">
                  « سلام رفیق، من دستیار مهاجرتی کوچیفای هستم، قبل از اینکه شروع کنیم، لطفاً نام و نام خانوادگیت رو برام بنویس تا بدونم به چه اسمی باید صدات کنم »
                </p>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const combined = `${inputFirstName.trim()} ${inputLastName.trim()}`.trim();
                  if (!combined) return;
                  setIsSavingName(true);
                  updateField("fullName", combined);
                  if (user) {
                    try {
                      const updated = await updateProfile(combined);
                      if (onUpdateUser) onUpdateUser(updated);
                    } catch (err) {
                      console.warn("Could not save profile name to backend:", err);
                    }
                  }
                  setIsSavingName(false);
                  setIsIntroduced(true);
                  try {
                    localStorage.setItem("kochify_wizard_introduced", "true");
                  } catch {}
                }}
                className="space-y-4 max-w-md mx-auto"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-right">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      نام:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="پوریا"
                      value={inputFirstName}
                      onChange={(e) => setInputFirstName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 text-sm font-bold focus:border-emerald-500 focus:bg-white focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      نام خانوادگی:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="رفوسه"
                      value={inputLastName}
                      onChange={(e) => setInputLastName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 text-sm font-bold focus:border-emerald-500 focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingName || (!inputFirstName.trim() && !inputLastName.trim())}
                  className="w-full sm:w-auto min-w-[200px] py-3.5 px-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {isSavingName ? (
                    <span>در حال ثبت...</span>
                  ) : (
                    <>
                      <span>بزن بریم</span>
                      <ArrowLeft className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Stepper Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              مرحله {currentStep} از ۷: {STEPS[currentStep - 1].title}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              فرم ارزیابی هوشمند کوچیفای
            </h2>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
            <Save className="w-3.5 h-3.5 text-emerald-500" />
            <span>ذخیره خودکار پیش‌نویس</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-6">
          <div 
            className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 7) * 100}%` }}
          ></div>
        </div>

        {/* Step Icons Strip */}
        <div className="hidden sm:flex items-center justify-between">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isCompleted = s.id < currentStep;
            const isCurrent = s.id === currentStep;

            return (
              <button
                key={s.id}
                onClick={() => setCurrentStep(s.id)}
                className={`flex flex-col items-center gap-1.5 transition-all text-center group cursor-pointer ${
                  isCurrent 
                    ? "text-emerald-800 font-extrabold scale-105" 
                    : isCompleted 
                    ? "text-slate-800 font-bold" 
                    : "text-slate-700 font-semibold"
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  isCurrent 
                    ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/30 ring-2 ring-emerald-500" 
                    : isCompleted 
                    ? "bg-emerald-100 text-emerald-800 border-2 border-emerald-400 font-bold" 
                    : "bg-slate-200 text-slate-800 border-2 border-slate-300 group-hover:bg-slate-300 font-bold"
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5 text-emerald-700" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-xs whitespace-nowrap ${isCurrent ? "text-emerald-900 font-black" : isCompleted ? "text-slate-900 font-bold" : "text-slate-700 font-bold"}`}>
                  {s.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Helper Notification Banner if active */}
      {activeHelpMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-cyan-50 border-2 border-cyan-300 text-cyan-950 text-xs font-semibold leading-relaxed flex items-start gap-3 shadow-xs">
          <Info className="w-5 h-5 text-cyan-700 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="font-extrabold text-cyan-950">راهنمایی کوچیفای: </strong>
            {activeHelpMessage}
          </div>
          <button 
            onClick={() => setActiveHelpMessage(null)}
            className="text-cyan-800 hover:text-cyan-950 font-extrabold text-xs px-2 py-1 rounded-lg bg-cyan-100 border border-cyan-300"
          >
            متوجه شدم
          </button>
        </div>
      )}

      {/* Main Step Cards */}
      <div className="bg-white rounded-3xl border-2 border-slate-300 shadow-sm p-6 sm:p-8 text-right">
        {/* STEP 1: GOAL & TIMELINE */}
        {currentStep === 1 && (
          <div className="space-y-7">
            {/* Question 1: Goal */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center">
                  ۱
                </span>
                <label className="block text-sm sm:text-base font-black text-slate-900">
                  {displayName} عزیز، لطفاً بهم بگو ترجیحت اینه که به چه روشی مهاجرت کنی؟
                </label>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {[
                  { id: "study", label: "مهاجرت تحصیلی" },
                  { id: "work", label: "مهاجرت کاری" },
                  { id: "both", label: "هر دو مسیر (مقایسه)" },
                  { id: "unsure", label: "هنوز مطمئن نیستم" }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => updateField("migrationGoal", item.id as MigrationGoal)}
                    className={`p-4 rounded-2xl border-2 text-sm font-black transition-all text-center cursor-pointer ${
                      profile.migrationGoal === item.id
                        ? "bg-emerald-700 text-white border-emerald-800 shadow-md scale-[1.02]"
                        : "bg-white text-slate-900 border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-xs"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2: Timeline */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center">
                  ۲
                </span>
                <label className="block text-sm sm:text-base font-black text-slate-900">
                  افق زمانی که برای مهاجرتت مدنظرت هست، چقدره؟
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                {[
                  { id: "immediate_6m", label: "فوری (زیر ۶ ماه)" },
                  { id: "6_to_12m", label: "بین ۶ ماه تا ۱ سال" },
                  { id: "1_to_2y", label: "بین ۱ تا ۲ سال" },
                  { id: "exploring_unsure", label: "عجله‌ای ندارم / بیش از ۲ سال" }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => updateField("targetTimeline", item.id as any)}
                    className={`p-4 rounded-2xl border-2 text-sm font-black transition-all cursor-pointer ${
                      profile.targetTimeline === item.id
                        ? "bg-emerald-700 text-white border-emerald-800 shadow-md scale-[1.02]"
                        : "bg-white text-slate-900 border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-xs"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 3: Destination Scope & Specific Country */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center">
                  ۳
                </span>
                <label className="block text-sm sm:text-base font-black text-slate-900">
                  شرایط خاصی برای کشور مقصد مدنظرته؟
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {[
                  { id: "any", label: "هر شهر یا کشوری اوکی هستم" },
                  { id: "top_tier", label: "فقط کشورهای سطح بالا" },
                  { id: "specific", label: "فقط یه کشور خاص مدنظرم هست" }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      updateField("destinationScope", item.id as any);
                      if (item.id === "any") updateField("relocationFlexibility", "high");
                      if (item.id === "top_tier") updateField("relocationFlexibility", "medium");
                      if (item.id === "specific") updateField("relocationFlexibility", "low");
                    }}
                    className={`p-4 rounded-2xl border-2 text-sm font-black transition-all cursor-pointer ${
                      (profile.destinationScope || "any") === item.id
                        ? "bg-emerald-700 text-white border-emerald-800 shadow-md scale-[1.02]"
                        : "bg-white text-slate-900 border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-xs"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Dynamic input field when specific country is chosen */}
              {profile.destinationScope === "specific" && (
                <div className="mt-4 p-5 rounded-2xl bg-emerald-50/90 border-2 border-emerald-300 animate-fade-in text-right">
                  <label className="block text-sm font-black text-emerald-950 mb-2">
                    🎯 اسم کشور مدنظرت رو برام بنویس:
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: کانادا، آلمان، ایتالیا، هلند، استرالیا، سوئد..."
                    value={profile.targetSpecificCountry || ""}
                    onChange={(e) => updateField("targetSpecificCountry", e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-emerald-400 rounded-xl text-slate-900 font-bold text-sm focus:border-emerald-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <p className="text-xs text-emerald-800 font-bold mt-2.5 leading-relaxed">
                    💡 خیالت راحت! پرونده شما رو همزمان برای این کشور اختصاصی شبیه‌سازی می‌کنم. اگه تو نتایج برترت بود تمام شرایطش رو اعلام می‌کنم و اگه نبود، دقیق بهت می‌گم چقدر زبان، چقدر بودجه یا سابقه کار اضافه نیاز داری تا بهش برسی.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: IDENTITY & HOUSEHOLD */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-extrabold text-slate-900 mb-2">
                  نام و نام خانوادگی یا نام مستعار:
                </label>
                <input
                  type="text"
                  placeholder="مثال: سارا محمدی"
                  value={profile.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-extrabold text-slate-900">
                    سن شناسنامه‌ای: ({profile.age} سال)
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveHelpMessage("سن در بسیاری از برنامه‌های کاری مانند اکسپرس اینتری یا ویزای مهارتی استرالیا امتیاز متفاوتی دارد. برای مسیرهای تحصیلی یا بلوکارت معمولاً سقف سنی وجود ندارد.")}
                    className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-lg hover:bg-emerald-100 flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>چرا سن مهم است؟</span>
                  </button>
                </div>
                <input
                  type="range"
                  min="16"
                  max="65"
                  value={profile.age}
                  onChange={(e) => updateField("age", parseInt(e.target.value))}
                  className="w-full accent-emerald-600 h-2.5 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-xs font-bold text-slate-700 mt-1.5">
                  <span>۱۶ سال</span>
                  <span className="text-emerald-800 font-extrabold">۳۰ سال (طلایی)</span>
                  <span>۶۵ سال</span>
                </div>
                {/* Dynamic Age Impact Guidance */}
                <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  {profile.age <= 32 ? (
                    <span className="text-emerald-800 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>بازه سنی طلایی ({profile.age} سال):</strong> حداکثر امتیاز مهاجرت کاری (کانادا، استرالیا، آلمان) و کمترین ریسک در صدور ویزای تحصیلی.</span>
                    </span>
                  ) : profile.age <= 40 ? (
                    <span className="text-teal-800 font-bold flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-teal-600 shrink-0" />
                      <span><strong>بازه سنی میانی ({profile.age} سال):</strong> امتیاز کاری متعادل؛ در صورت اقدام تحصیلی ارشد، توجیه سوابق کاری در SOP برای متقاعدسازی آفیسر ضروری است.</span>
                    </span>
                  ) : profile.age <= 45 ? (
                    <span className="text-amber-900 font-bold flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span><strong>بازه سنی حساس ({profile.age} سال):</strong> افت امتیاز سنی در سیستم‌های فدرال؛ اولویت جدی با جاب‌آفر، کارت شانس آلمان، مقطع دکترا یا استارتاپ است.</span>
                    </span>
                  ) : (
                    <span className="text-rose-900 font-bold flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-rose-600 shrink-0" />
                      <span><strong>بازه سنی ویژه ({profile.age} سال):</strong> اکثر مسیرهای امتیازی عمومی فدرال بسته است؛ تمرکز بر جاب‌آفر شرکتی، بلوکارت، ثبت شرکت یا تمکن مالی شخصی.</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-extrabold text-slate-900 mb-2">
                  کشور و شهر/استان محل سکونت فعلی:
                </label>
                <input
                  type="text"
                  placeholder="ایران، تهران"
                  value={profile.currentCityOrProvince}
                  onChange={(e) => updateField("currentCityOrProvince", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-extrabold text-slate-900 mb-2">
                  اعتبار تقریبی گذرنامه:
                </label>
                <select
                  value={profile.passportValidityMonths}
                  onChange={(e) => updateField("passportValidityMonths", parseInt(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value={24}>بیش از ۲ سال اعتبار دارد</option>
                  <option value={12}>بین ۱ تا ۲ سال اعتبار دارد</option>
                  <option value={6}>زیر ۶ ماه اعتبار دارد (نیازمند تمدید فوری)</option>
                  <option value={0}>هنوز پاسپورت نگرفته‌ام یا منقضی است</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-extrabold text-slate-900">
                  وضعیت نظام وظیفه (برای آقایان):
                </label>
                <button
                  type="button"
                  onClick={() => setActiveHelpMessage("کوچیفای وارد پرونده‌های حساس نمی‌شود؛ این فیلد صرفاً جهت راستی‌آزمایی امکان قانونی خروج از کشور و تخمین نیاز به وثیقه ملکی یا نقدی در نظر گرفته شده است.")}
                  className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-lg hover:bg-emerald-100 flex items-center gap-1"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>حفظ حریم خصوصی</span>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: "completed", label: "کارت پایان خدمت دارم" },
                  { id: "permanent_exemption_or_female", label: "معافیت دائم دارم / متقاضی خانم" },
                  { id: "educational_exemption", label: "معافیت تحصیلی فعال دارم" },
                  { id: "not_completed_needs_guarantee", label: "مشمول هستم (نیازمند وثیقه خروج)" },
                  { id: "unsure", label: "هنوز وضعیت نامشخص است / نمی‌دانم" }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => updateField("militaryStatus", item.id as MilitaryStatus)}
                    className={`p-3 rounded-xl border-2 text-xs font-extrabold text-right transition-all ${
                      profile.militaryStatus === item.id
                        ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                        : "bg-white text-slate-900 border-slate-300 hover:bg-slate-100 hover:border-slate-400 shadow-xs"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t-2 border-slate-200">
              <div>
                <label className="block text-sm font-extrabold text-slate-900 mb-2">
                  وضعیت تأهل و همراهان:
                </label>
                <select
                  value={profile.maritalStatus}
                  onChange={(e) => updateField("maritalStatus", e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="single">مجرد (بدون همراه)</option>
                  <option value="married_together">متأهل - سفر هم‌زمان با همسر</option>
                  <option value="married_solo">متأهل - سفر ابتدا انفرادی و الحاق بعدی همسر</option>
                  <option value="divorced_or_other">سایر وضعیت‌ها</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-extrabold text-slate-900 mb-2">
                  تعداد فرزندان همراه:
                </label>
                <select
                  value={profile.dependentsCount}
                  onChange={(e) => updateField("dependentsCount", parseInt(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value={0}>بدون فرزند</option>
                  <option value={1}>۱ فرزند</option>
                  <option value={2}>۲ فرزند</option>
                  <option value={3}>۳ فرزند یا بیشتر</option>
                </select>
              </div>
            </div>

            {/* CONDITIONAL SPOUSE DETAILS BLOCK (When Married) */}
            {(profile.maritalStatus === "married_together" || profile.maritalStatus === "married_solo") && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/90 to-teal-50/90 border-2 border-indigo-200 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-950 font-black text-sm">
                    <User className="w-5 h-5 text-indigo-700" />
                    <span>مشخصات و پتانسیل‌های همسر (افزایش امتیاز و بررسی ویزای کار باز):</span>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-800 bg-indigo-100 px-2.5 py-0.5 rounded-full border border-indigo-200">
                    تاثیرگذار در تمکن و امتیاز
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 mb-1.5">
                      آخرین مدرک تحصیلی همسر:
                    </label>
                    <select
                      value={profile.spouseEducation || "bachelor"}
                      onChange={(e) => updateField("spouseEducation", e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-hidden focus:border-indigo-600"
                    >
                      <option value="diploma">دیپلم یا کاردانی</option>
                      <option value="bachelor">کارشناسی (لیسانس)</option>
                      <option value="master">کارشناسی ارشد (فوق‌لیسانس)</option>
                      <option value="phd">دکتری تخصصی</option>
                      <option value="none">بدون مدرک دانشگاهی</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 mb-1.5">
                      سطح زبان خارجی همسر:
                    </label>
                    <select
                      value={profile.spouseLanguageLevel || "B1"}
                      onChange={(e) => updateField("spouseLanguageLevel", e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-hidden focus:border-indigo-600"
                    >
                      <option value="none">بدون تسلط بر زبان خارجی</option>
                      <option value="A2">مقدماتی (A2)</option>
                      <option value="B1">متوسط مکالمه روزمره (B1 / آیلتس ۵)</option>
                      <option value="B2">خوب و کاربردی (B2 / آیلتس ۶ الی ۶.۵)</option>
                      <option value="C1">پیشرفته مسلط (C1 / آیلتس ۷+)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 mb-1.5">
                      سابقه کار شغلی همسر:
                    </label>
                    <select
                      value={profile.spouseWorkExperienceYears || 2}
                      onChange={(e) => updateField("spouseWorkExperienceYears", parseInt(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-hidden focus:border-indigo-600"
                    >
                      <option value={0}>بدون سابقه کار رسمی</option>
                      <option value={1}>۱ تا ۲ سال سابقه کار</option>
                      <option value={3}>۳ تا ۵ سال سابقه کار</option>
                      <option value={6}>بیش از ۵ سال سابقه کار</option>
                    </select>
                  </div>
                </div>

                <div className="bg-white/80 p-3 rounded-xl border border-indigo-200 text-xs text-indigo-950 font-medium leading-relaxed">
                  💡 <strong>نکته حقوقی بسیار مهم:</strong> در مقاصد پیشرو مانند آلمان، کانادا و فرانسه، همسر متقاضی می‌تواند با ویزای کار باز (Open Work Permit) تمام‌وقت در هر صنعتی مشغول به کار شود. همچنین تحصیلات و زبان همسر در پرونده‌های اکسپرس اینتری و اسکیل‌ورکر استرالیا تا ۲۰+ امتیاز حیاتی مستقیم به پرونده شما تزریق می‌کند.
                </div>
              </div>
            )}

            {/* CONDITIONAL CHILDREN DETAILS (When Dependents > 0) */}
            {profile.dependentsCount > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 text-xs text-amber-950 space-y-2 animate-fade-in">
                <div className="font-extrabold flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>بررسی وضعیت فرزندان ({profile.dependentsCount} فرزند):</span>
                </div>
                <p className="leading-relaxed">
                  در آلمان، فرانسه، کانادا و عموم کشورهای اروپایی، فرزندان متقاضیان ویزای کار یا تحصیل به صورت <strong>کاملاً رایگان در مدارس دولتی</strong> ثبت‌نام می‌شوند و نیازی به شهریه مدارس بین‌المللی گران‌قیمت ندارید. البته کف تمکن مالی مسدود در حساب بانکی به ازای هر فرزند افزایش می‌یابد که کوچیفای آن را در بخش مالی دقیق محاسبه می‌کند.
                </p>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: EDUCATION */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-extrabold text-slate-900 mb-2">
                  آخرین مدرک تحصیلی تکمیل‌شده:
                </label>
                <select
                  value={profile.highestDegree}
                  onChange={(e) => updateField("highestDegree", e.target.value as DegreeLevel)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="diploma">دیپلم متوسطه</option>
                  <option value="associate">کاردانی (فوق دیپلم)</option>
                  <option value="bachelor">کارشناسی (لیسانس)</option>
                  <option value="master">کارشناسی ارشد (فوق لیسانس)</option>
                  <option value="phd">دکتری تخصصی (Ph.D)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-extrabold text-slate-900 mb-2">
                  رشته و گرایش تحصیلی:
                </label>
                <select
                  value={profile.fieldOfStudy}
                  onChange={(e) => updateField("fieldOfStudy", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                >
                  {STUDY_FIELDS.map(f => (
                    <option key={f.id} value={f.nameFa}>
                      {f.nameFa} {f.isRegulatedProfession ? "(مجوزدار)" : ""}
                    </option>
                  ))}
                  <option value="سایر رشته‌ها">سایر رشته‌ها / عنوان آزاد</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-extrabold text-slate-900 mb-2">
                  نوع دانشگاه:
                </label>
                <select
                  value={profile.universityType}
                  onChange={(e) => updateField("universityType", e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="state_top">دانشگاه دولتی سطح یک (تهران، شریف و...)</option>
                  <option value="state_regular">دانشگاه دولتی سراسری</option>
                  <option value="azad">دانشگاه آزاد اسلامی</option>
                  <option value="payam_noor_applied">پیام نور / علمی کاربردی / غیرانتفاعی</option>
                  <option value="foreign">دانشگاه خارج از ایران</option>
                  <option value="unsure">نمی‌دانم / نیازمند بررسی Anabin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-extrabold text-slate-900 mb-2">
                  معدل کل (GPA از ۲۰):
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="10"
                  max="20"
                  value={profile.gpa}
                  onChange={(e) => updateField("gpa", parseFloat(e.target.value) || 15)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-extrabold text-slate-900 mb-2">
                  وضعیت فیزیکی مدرک و ریزنمرات:
                </label>
                <select
                  value={profile.hasOfficialDegreeInHand}
                  onChange={(e) => updateField("hasOfficialDegreeInHand", e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="yes">دانشنامه و ریزنمرات رسمی را آزاد کرده‌ام</option>
                  <option value="unofficial_only">فعلاً فقط گواهی موقت دارم</option>
                  <option value="in_progress">هنوز دانشجو هستم (ترم‌های آخر)</option>
                  <option value="no">هنوز مدرک را نگرفته‌ام</option>
                </select>
              </div>
            </div>

            {/* STUDY GAP & GRADUATION YEAR SECTION (CRITICAL FOR VISA) */}
            <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-300 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-emerald-700" />
                  <span>سال فارغ‌التحصیلی و تحلیل گپ تحصیلی (Study Gap):</span>
                </span>
                <span className="text-xs font-bold text-slate-600 bg-slate-200 px-2.5 py-0.5 rounded-full">
                  معیار اصلی آفیسر ویزا
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-900 mb-1.5">
                    سال اخذ آخرین مدرک (فارغ‌التحصیلی):
                  </label>
                  <select
                    value={profile.graduationYear || 1400}
                    onChange={(e) => {
                      const yr = parseInt(e.target.value);
                      updateField("graduationYear", yr);
                      const estimatedGap = Math.max(0, 1404 - yr);
                      updateField("studyGapYears", estimatedGap);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-hidden focus:border-emerald-600"
                  >
                    {[1404, 1403, 1402, 1401, 1400, 1399, 1398, 1397, 1396, 1395, 1394, 1393, 1392, 1391, 1390, 1385, 1380].map(y => (
                      <option key={y} value={y}>سال {y} {y >= 1402 ? "(فارغ‌التحصیل تازه)" : ""}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-900 mb-1.5">
                    طول گپ تحصیلی (فاصله تا امروز):
                  </label>
                  <select
                    value={profile.studyGapYears ?? 2}
                    onChange={(e) => updateField("studyGapYears", parseInt(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-hidden focus:border-emerald-600"
                  >
                    <option value={0}>بدون گپ / هنوز دانشجو هستم</option>
                    <option value={1}>زیر ۲ سال (بدون ریسک ویزا)</option>
                    <option value={3}>۲ تا ۴ سال (گپ معمول و قابل توجیه)</option>
                    <option value={6}>۵ تا ۸ سال (گپ حساس)</option>
                    <option value={10}>بیش از ۸ سال (گپ طولانی)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-900 mb-1.5">
                    نحوه گذراندن فاصله تحصیلی (پوشش گپ):
                  </label>
                  <select
                    value={profile.studyGapReason || "working_with_insurance"}
                    onChange={(e) => updateField("studyGapReason", e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-hidden focus:border-emerald-600"
                  >
                    <option value="working_with_insurance">اشتغال تمام‌وقت با سابقه بیمه رسمی تأمین اجتماعی</option>
                    <option value="working_freelance">کار شرکتی بدون بیمه / پروژه‌ای و فریلنسری</option>
                    <option value="military_service">خدمت وظیفه سربازی</option>
                    <option value="language_study">آموزش فشرده زبان و اخذ مدرک بین‌المللی</option>
                    <option value="family_or_other">امور شخصی، خانوادگی یا فترت شغلی</option>
                  </select>
                </div>
              </div>

              {/* Legal explanation box on Study Gap */}
              <div className="p-3.5 rounded-xl bg-cyan-50/80 border border-cyan-300 text-xs text-cyan-950 space-y-1.5">
                <div className="font-extrabold flex items-center gap-1.5 text-cyan-900">
                  <Info className="w-4 h-4 text-cyan-700 shrink-0" />
                  <span>آیا گپ تحصیلی در صدور ویزا تاثیر دارد؟ (تحلیل خط قرمز سفارت‌ها):</span>
                </div>
                <p className="leading-relaxed">
                  <strong>بله، کاملاً!</strong> سفارت‌های سخت‌گیر نظیر <strong>کانادا، استرالیا و آلمان</strong> به گپ‌های تحصیلی بالای ۳ تا ۵ سال که فاقد دلیل مستند باشند، به عنوان عدم قصد واقعی تحصیل (Lack of bona fide intent) برچسب زده و پرونده را ریجکت می‌کنند. اما اگر در این فاصله <strong>سابقه کار با بیمه</strong> داشته‌اید، گپ شما کاملاً موجه و حتی یک مزیت تجربی تلقی می‌شود. همچنین برای <strong>مهاجرت کاری</strong>، گپ تحصیلی اصلاً ضعف نیست بلکه نشانه سال‌ها سابقه کار است!
                </p>
              </div>
            </div>

            {/* Conditional Study Questions */}
            {(profile.migrationGoal === "study" || profile.migrationGoal === "both" || profile.migrationGoal === "unsure") && (
              <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 text-emerald-950 font-extrabold text-sm">
                  <GraduationCap className="w-5 h-5 text-emerald-700" />
                  <span>پرسش‌های ویژه متقاضیان تحصیل در خارج از کشور:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 mb-1.5">
                      مقطع تحصیلی هدف:
                    </label>
                    <select
                      value={profile.targetDegreeLevel}
                      onChange={(e) => updateField("targetDegreeLevel", e.target.value as DegreeLevel)}
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-hidden focus:border-emerald-600"
                    >
                      <option value="bachelor">کارشناسی (لیسانس)</option>
                      <option value="master">کارشناسی ارشد (Master)</option>
                      <option value="phd">دکتری تخصصی (Ph.D / با حقوق)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 mb-1.5">
                      وضعیت پذیرش دانشگاهی:
                    </label>
                    <select
                      value={profile.hasAdmissionOrOffer}
                      onChange={(e) => updateField("hasAdmissionOrOffer", e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-hidden focus:border-emerald-600"
                    >
                      <option value="none">هنوز اپلای نکرده‌ام</option>
                      <option value="applied_waiting">اپلای کرده و منتظر نتیجه‌ام</option>
                      <option value="accepted_conditional">پذیرش مشروط دارم</option>
                      <option value="accepted_unconditional">پذیرش قطعی (I-20/CAS/CoE) دارم</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 mb-1.5">
                      نیاز به بورسیه و فاند تحصیلی:
                    </label>
                    <select
                      value={profile.needsScholarship}
                      onChange={(e) => updateField("needsScholarship", e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-hidden focus:border-emerald-600"
                    >
                      <option value="full_essential">بورسیه کامل ضروری است (بدون فاند نمی‌توانم)</option>
                      <option value="partial_helpful">بورسیه جزئی کمک‌کننده است</option>
                      <option value="self_funded">شهریه را شخصاً پرداخت می‌کنم</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: WORK EXPERIENCE & SKILLS */}
        {currentStep === 4 && (
          <div className="space-y-6">
            {profile.migrationGoal === "study" && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  <strong>نکته برای متقاضیان تحصیلی:</strong> در صورتی که دانشجو یا فارغ‌التحصیل تازه هستید و هنوز سابقه کار رسمی ندارید، سابقه کار را ۰ سال انتخاب کنید؛ برای پذیرش تحصیلی فقدان سابقه کار مانع ویزا نخواهد بود.
                </span>
              </div>
            )}
            {profile.migrationGoal === "work" && (
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-300 text-xs text-blue-950 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-700 shrink-0" />
                <span>
                  <strong>نکته برای متقاضیان کاری:</strong> سابقه بیمه رسمی، انطباق کد شغلی با لیست‌های تقاضای اروپا (کارت شانس آلمان) یا کانادا، مهم‌ترین اهرم ویزای کار هستند.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-extrabold text-slate-900 mb-2">
                  عنوان شغلی اصلی یا تخصص فعلی:
                </label>
                <select
                  value={profile.primaryJobTitle}
                  onChange={(e) => {
                    const occ = OCCUPATIONS_CATALOG.find(o => o.titleFa === e.target.value);
                    updateField("primaryJobTitle", e.target.value);
                    if (occ) {
                      updateField("occupationCode", occ.iscoCode);
                      updateField("hasProfessionalLicense", occ.isRegulated ? "yes_regulated" : "not_regulated_or_no");
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                >
                  {OCCUPATIONS_CATALOG.map(o => (
                    <option key={o.id} value={o.titleFa}>
                      {o.titleFa} {o.isRegulated ? "(دارای پروانه/مجوز)" : ""}
                    </option>
                  ))}
                  <option value="سایر تخصص‌ها">سایر مشاغل / عنوان آزاد</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-extrabold text-slate-900">
                    سابقه کاری مستند: ({profile.totalWorkExperienceYears} سال)
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveHelpMessage("سوابق کاری دارای سابقه بیمه تأمین اجتماعی یا قرارداد شرکتی رسمی، در ارزیابی ویزاهای کاری نظیر استرالیا، کانادا و آلمان اهمیت بالایی دارند.")}
                    className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-lg hover:bg-emerald-100 flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>راهنمای سابقه کار</span>
                  </button>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={profile.totalWorkExperienceYears}
                  onChange={(e) => updateField("totalWorkExperienceYears", parseInt(e.target.value))}
                  className="w-full accent-emerald-600 h-2.5 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-xs font-bold text-slate-700 mt-1.5">
                  <span>بدون سابقه</span>
                  <span className="text-emerald-800 font-extrabold">۳ تا ۵ سال</span>
                  <span>۲۵+ سال</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-extrabold text-slate-900 mb-2">
                شرح وظایف واقعی شغلی شما (متن آزاد):
              </label>
              <textarea
                rows={3}
                placeholder="وظایف روزمره، مسئولیت‌ها، ابزارها و خروجی‌هایی که در شغل خود ارائه می‌دهید..."
                value={profile.jobDutiesSummary}
                onChange={(e) => updateField("jobDutiesSummary", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 leading-relaxed"
              ></textarea>
              <p className="text-xs font-semibold text-slate-700 mt-1.5">
                نکته مهم: سازمان‌های ارزیابی مهاجرتی وظایف واقعی را با کدهای استاندارد (ISCO/NOC) تطبیق می‌دهند، نه صرفاً عنوان قرارداد.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-extrabold text-slate-900 mb-2">
                  مدارک سوابق کاری و بیمه در دسترس:
                </label>
                <select
                  value={profile.hasDocumentedInsuranceOrTaxes}
                  onChange={(e) => updateField("hasDocumentedInsuranceOrTaxes", e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="full_official">سابقه بیمه تأمین اجتماعی کامل + نامه رسمی شرکت</option>
                  <option value="contract_only">فقط قرارداد کاری شرکتی و فیش حقوقی (بدون بیمه)</option>
                  <option value="partial">بخشی با بیمه و بخشی به صورت فریلنس یا بدون بیمه</option>
                  <option value="no_documentation">مستندات رسمی ندارم / کار شخصی</option>
                  <option value="unsure">نمی‌دانم / نیازمند راهنمایی</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-extrabold text-slate-900 mb-2">
                  وضعیت جاب‌آفر یا اسپانسر کاری در خارج:
                </label>
                <select
                  value={profile.hasJobOfferOrSponsor}
                  onChange={(e) => updateField("hasJobOfferOrSponsor", e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="none">هنوز جاب‌آفر ندارم</option>
                  <option value="interviewing">در مرحله مصاحبه کاری هستم</option>
                  <option value="verbal_offer">پیشنهاد شفاهی دارم اما قرارداد رسمی نشده</option>
                  <option value="written_sponsor_offer">قرارداد کاری مکتوب و اسپانسر تاییدشده دارم</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: LANGUAGES */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-extrabold text-slate-900 mb-2">
                  نوع آزمون یا مهارت زبان انگلیسی:
                </label>
                <select
                  value={profile.englishExam}
                  onChange={(e) => updateField("englishExam", e.target.value as EnglishExamType)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="ielts_academic">آزمون آیلتس آکادمیک (IELTS Academic)</option>
                  <option value="ielts_general">آزمون آیلتس جنرال (IELTS General)</option>
                  <option value="toefl_ibt">آزمون تافل اینترنتی (TOEFL iBT)</option>
                  <option value="pte_academic">آزمون پی‌تی‌ئی آکادمیک (PTE Academic)</option>
                  <option value="duolingo">آزمون دولینگو (Duolingo English Test)</option>
                  <option value="self_estimated">هنوز آزمون نداده‌ام (خودارزیابی تخمینی)</option>
                  <option value="none">در حال حاضر زبان انگلیسی بلد نیستم</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-extrabold text-slate-900 mb-2">
                  سطح برآورد شده زبان انگلیسی (استاندارد CEFR):
                </label>
                <select
                  value={profile.englishEstimatedLevel}
                  onChange={(e) => updateField("englishEstimatedLevel", e.target.value as CEFRLevel)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="C2">C2 — تسلط در حد زبان مادری (Native-like)</option>
                  <option value="C1">C1 — پیشرفته مسلط (آیلتس ۷.۵ الی ۸)</option>
                  <option value="B2">B2 — متوسط رو به بالا (آیلتس ۶.۰ الی ۶.۵)</option>
                  <option value="B1">B1 — متوسط مقدماتی (آیلتس ۵.۰ الی ۵.۵)</option>
                  <option value="A2">A2 — ابتدایی پایه (آیلتس ۴.۰)</option>
                  <option value="none">هنوز تعیین سطح نکرده‌ام / نمی‌دانم</option>
                </select>
              </div>
            </div>

            {/* 4 Skills Breakdown */}
            <div className="p-5 rounded-2xl bg-slate-100 border-2 border-slate-300 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-slate-900">
                  نمره چهار مهارت اصلی (مقیاس آیلتس از ۹ یا نمره تخمینی):
                </span>
                <span className="text-sm font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-300">
                  نمره کل میانگین: {profile.englishScores.overall}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(["listening", "reading", "writing", "speaking"] as const).map(skill => {
                  const labels = {
                    listening: "شنیدار (Listening)",
                    reading: "خواندن (Reading)",
                    writing: "نگارش (Writing)",
                    speaking: "گفتار (Speaking)"
                  };
                  return (
                    <div key={skill} className="bg-white p-3 rounded-xl border-2 border-slate-300 shadow-2xs">
                      <label className="block text-xs font-extrabold text-slate-900 mb-1.5 text-center">
                        {labels[skill]}
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="9"
                        value={profile.englishScores[skill]}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          const newScores = { ...profile.englishScores, [skill]: val };
                          const avg = Math.round(((newScores.listening + newScores.reading + newScores.writing + newScores.speaking) / 4) * 2) / 2;
                          newScores.overall = avg;
                          updateField("englishScores", newScores);
                        }}
                        className="w-full px-2 py-2 rounded-lg border-2 border-slate-300 text-sm font-black text-center text-slate-900 bg-white focus:border-emerald-600"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-extrabold text-slate-900 mb-2">
                  زبان دوم خارجی (آلمانی، فرانسوی، ایتالیایی و...):
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={profile.secondLanguage}
                    onChange={(e) => updateField("secondLanguage", e.target.value as any)}
                    className="px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-hidden focus:border-emerald-600"
                  >
                    <option value="none">زبان دومی بلد نیستم</option>
                    <option value="german">آلمانی (Deutsch)</option>
                    <option value="french">فرانسوی (Français)</option>
                    <option value="italian">ایتالیایی (Italiano)</option>
                    <option value="spanish">اسپانیایی (Español)</option>
                  </select>

                  <select
                    value={profile.secondLanguageLevel}
                    onChange={(e) => updateField("secondLanguageLevel", e.target.value as any)}
                    className="px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-hidden focus:border-emerald-600"
                  >
                    <option value="none">بدون سطح</option>
                    <option value="A1">سطح A1 (مقدماتی)</option>
                    <option value="A2">سطح A2</option>
                    <option value="B1">سطح B1 (کاربردی)</option>
                    <option value="B2">سطح B2 (پیشرفته)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-extrabold text-slate-900 mb-2">
                  تمایل شما برای یادگیری زبان کشور مقصد:
                </label>
                <select
                  value={profile.willingnessToLearnLocalLanguage}
                  onChange={(e) => updateField("willingnessToLearnLocalLanguage", e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="high">بالا (حاضرم آلمانی، فرانسوی یا زبان محلی را کامل یاد بگیرم)</option>
                  <option value="moderate">متوسط (در حد مکالمات روزمره مشکلی ندارم)</option>
                  <option value="prefer_english_only">ترجیح می‌دهم فقط با زبان انگلیسی کار و زندگی کنم</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: BUDGET & PROOF OF FUNDS */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-sm font-extrabold text-slate-900">
                  بازه بودجه و تمکن نقدشونده در دسترس شما:
                </label>
                <button
                  type="button"
                  onClick={() => setActiveHelpMessage("پاسخ‌های مالی در مرحله ارزیابی اولیه کاملاً به صورت بازه‌های تقریبی دریافت می‌شوند. کوچیفای هرگز شماره حساب بانکی، اطلاعات کارت یا اسناد مالی محرمانه را مطالبه نمی‌کند.")}
                  className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-lg hover:bg-emerald-100 flex items-center gap-1"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>امنیت داده‌های مالی</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  {
                    id: "under_10k",
                    title: "زیر ۱۰ هزار دلار",
                    subtitle: "تا ۹,۰۰۰ یورو (Under $10k)",
                    desc: "مناسب دوره‌های با بورسیه ۱۰۰٪ استانی (مثل ایتالیا) یا مقاصد تحصیلی کم‌هزینه"
                  },
                  {
                    id: "10k_to_25k",
                    title: "۱۰ تا ۲۵ هزار دلار",
                    subtitle: "۹,۰۰۰ تا ۲۳,۰۰۰ یورو ($10k - $25k)",
                    desc: "پوشش تمکن قانونی حساب مسدود آلمان، کارت فرصت یا پذیرش دانشگاه‌های اروپایی"
                  },
                  {
                    id: "25k_to_50k",
                    title: "۲۵ تا ۵۰ هزار دلار",
                    subtitle: "۲۳,۰۰۰ تا ۴۶,۰۰۰ یورو ($25k - $50k)",
                    desc: "مناسب تحصیل در کانادا، بریتانیا، استرالیا و مسیرهای نیازمند شهریه سال اول"
                  },
                  {
                    id: "above_50k",
                    title: "بالای ۵۰ هزار دلار",
                    subtitle: "بیش از ۴۶,۰۰۰ یورو (+50k $)",
                    desc: "توانایی پوشش خانوادگی کامل، دانشگاه‌های آمریکا یا سرمایه‌گذاری‌های مهارتی"
                  }
                ].map(b => (
                  <div
                    key={b.id}
                    onClick={() => updateField("budgetRangeCategory", b.id as any)}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all ${
                      profile.budgetRangeCategory === b.id
                        ? "bg-emerald-700 text-white border-emerald-800 shadow-md scale-[1.01]"
                        : "bg-white text-slate-900 border-slate-300 hover:border-slate-400 hover:bg-slate-50 shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`font-black text-base ${profile.budgetRangeCategory === b.id ? "text-white" : "text-slate-900"}`}>
                        {b.title}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        profile.budgetRangeCategory === b.id 
                          ? "bg-white/20 text-white border border-white/30" 
                          : "bg-slate-100 text-slate-800 border border-slate-200"
                      }`}>
                        {b.subtitle}
                      </span>
                    </div>
                    <p className={`text-xs font-medium leading-relaxed mt-2 ${
                      profile.budgetRangeCategory === b.id ? "text-emerald-50" : "text-slate-700"
                    }`}>
                      {b.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-extrabold text-slate-900 mb-2">
                  منبع اصلی تأمین بودجه مهاجرت:
                </label>
                <select
                  value={profile.primaryFundingSource}
                  onChange={(e) => updateField("primaryFundingSource", e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="personal_savings">پس‌انداز و سرمایه شخصی انباشته</option>
                  <option value="family_sponsor">اسپانسرشیپ خانوادگی (والدین یا همسر)</option>
                  <option value="property_sale">فروش دارایی یا ملک در شرف اقدام</option>
                  <option value="loan_or_third_party">وام یا قرض از بستگان</option>
                  <option value="scholarship_only">منحصراً بورسیه تحصیلی کامل دانشگاهی</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-extrabold text-slate-900 mb-2">
                  میزان حساسیت یا تمایل به وام و بدهی:
                </label>
                <select
                  value={profile.debtTolerance}
                  onChange={(e) => updateField("debtTolerance", e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="low">حساسیت بالا (ترجیح می‌دهم هیچ بدهی یا وامی نداشته باشم)</option>
                  <option value="medium">متوسط (وام‌های منطقی دانشجویی را می‌پذیرم)</option>
                  <option value="high">پایین (استفاده از تمام اهرم‌های مالی ممکن را می‌پذیرم)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: PREFERENCES */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-extrabold text-slate-900 mb-2">
                  ترجیح شرایط آب‌وهوایی مقصد:
                </label>
                <select
                  value={profile.climatePreference}
                  onChange={(e) => updateField("climatePreference", e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="any">فرقی ندارد (سازگاری با هر شرایطی)</option>
                  <option value="mild_temperate">معتدل اروپایی (آلمان، هلند، بریتانیا)</option>
                  <option value="cold_winter_ok">زمستان سرد و برفی مشکلی ندارد (کانادا، سوئد)</option>
                  <option value="warm_mediterranean">گرم و آفتابی مدیترانه‌ای (اسپانیا، ایتالیا)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-extrabold text-slate-900 mb-2">
                  ترجیح مقیاس و اندازه شهر مقصد:
                </label>
                <select
                  value={profile.citySizePreference}
                  onChange={(e) => updateField("citySizePreference", e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="no_preference">فرقی ندارد</option>
                  <option value="large_metropolis">کلان‌شهر بزرگ با امکانات کامل (تورنتو، برلین، لندن)</option>
                  <option value="medium_city">شهرهای متوسط آرام با ترافیک و هزینه کمتر</option>
                  <option value="college_town">شهرهای دانشجویی کوچک با پیوند دانشگاهی قوی</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-extrabold text-slate-900 mb-2">
                  اهمیت دستیابی به اقامت دائم (PR):
                </label>
                <select
                  value={profile.prTrackImportance}
                  onChange={(e) => updateField("prTrackImportance", e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="essential">بسیار حیاتی (هدف اصلی من گرفتن اقامت دائم و پاسپورت است)</option>
                  <option value="nice_to_have">مزیت خوب است اما هدف اولیه تحصیل یا کار موقت است</option>
                  <option value="not_important">صرفاً تجربه کاری یا تحصیلی موقت مد نظر است</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-extrabold text-slate-900 mb-2">
                  حضور جامعه و دیاسپورای ایرانی در مقصد:
                </label>
                <select
                  value={profile.iranianCommunityNearby}
                  onChange={(e) => updateField("iranianCommunityNearby", e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="not_important">تفاوتی ندارد / تمرکز بر پیشرفت شخصی</option>
                  <option value="prefer_large_community">ترجیح می‌دهم جامعه ایرانی فعال و پرجمعیتی در دسترس باشد</option>
                  <option value="prefer_integration">ترجیح می‌دهم سریعاً در فرهنگ و جامعه بومی مقصد ادغام شوم</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between pt-8 mt-8 border-t-2 border-slate-200">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-6 py-3 rounded-xl border-2 border-slate-300 text-slate-800 font-extrabold text-sm hover:bg-slate-100 transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>گام قبلی</span>
            </button>
          ) : (
            <div></div>
          )}

          <button
            type="button"
            onClick={handleNext}
            disabled={isLoading}
            className="px-8 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm shadow-md shadow-emerald-700/25 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <span>در حال ارزیابی قوانین و مقاصد...</span>
            ) : currentStep === 7 ? (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>محاسبه و استخراج ۳ مقصد برتر</span>
              </>
            ) : (
              <>
                <span>مرحله بعد</span>
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
