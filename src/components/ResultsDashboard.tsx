import React, { useState } from "react";
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowLeft, 
  Layers, 
  Calendar, 
  Coins, 
  Languages, 
  FileText, 
  ExternalLink, 
  ShieldCheck, 
  Download, 
  Printer, 
  Compass, 
  Briefcase,
  GraduationCap,
  Scale,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronUp,
  Award,
  CloudUpload,
  Phone,
  BookmarkCheck,
  Lock
} from "lucide-react";
import { RecommendationSummary, RecommendedRouteResult, UserAssessmentProfile } from "../types";
import { AuthUser } from "../services/authService";

interface ResultsDashboardProps {
  summary: RecommendationSummary;
  profile: UserAssessmentProfile;
  onSelectRouteForDossier: (route: RecommendedRouteResult) => void;
  onOpenComparison: () => void;
  onEditProfile: () => void;
  onDownloadReport: () => void;
  user?: AuthUser | null;
  onOpenAuth?: () => void;
  onSaveToCloud?: () => void;
  isSavedToCloud?: boolean;
  onOpenUserPanel?: () => void;
  onOpenPayment?: () => void;
}

export default function ResultsDashboard({
  summary,
  profile,
  onSelectRouteForDossier,
  onOpenComparison,
  onEditProfile,
  onDownloadReport,
  user,
  onOpenAuth,
  onSaveToCloud,
  isSavedToCloud,
  onOpenUserPanel,
  onOpenPayment
}: ResultsDashboardProps) {
  const isPaid = Boolean(user?.isPaid);
  const [primaryChoiceCode, setPrimaryChoiceCode] = useState<string>(
    summary.primaryDestinations[0]?.countryCode || ""
  );
  const [backupChoiceCode, setBackupChoiceCode] = useState<string>(
    summary.primaryDestinations[1]?.countryCode || ""
  );
  const [expandedCardId, setExpandedCardId] = useState<string | null>(
    summary.primaryDestinations[0]?.routeId || null
  );

  const toggleExpand = (routeId: string) => {
    setExpandedCardId(prev => prev === routeId ? null : routeId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-right space-y-8">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>نتیجه رسمی تحلیل هوشمند پرونده شما</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              سه مقصد برتر و متمایز متناسب با شرایط شما
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
              ارزیابی‌شده بر مبنای قوانین و مبالغ تمکن مصوب سال ۲۰۲۶. هر مقصد دارای مسیر قانونی مشخص، شروط احراز، مبالغ تمکن و برنامه اقدام اختصاصی است.
            </p>
          </div>

          {/* Quick Action buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {user ? (
              <button
                onClick={onSaveToCloud}
                className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isSavedToCloud
                    ? "bg-emerald-500/25 text-emerald-300 border-emerald-400/40"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-md"
                }`}
                title="ذخیره همیشگی ارزیابی در حساب کاربری"
              >
                {isSavedToCloud ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 text-emerald-300" />
                    <span>ذخیره‌شده در پنل شما</span>
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-4 h-4" />
                    <span>ذخیره در پنل کاربری</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                title="ورود با شماره موبایل برای ذخیره نتایج"
              >
                <Phone className="w-4 h-4" />
                <span>ورود و ذخیره نتیجه</span>
              </button>
            )}

            <button
              onClick={onOpenComparison}
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Scale className="w-4 h-4" />
              <span>مقایسه هم‌زمان ۳ مقصد</span>
            </button>

            <button
              onClick={onDownloadReport}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="خروجی فایل مکتوب پرونده"
            >
              <Download className="w-4 h-4" />
              <span>دانلود گزارش</span>
            </button>

            <button
              onClick={onEditProfile}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="تغییر پاسخ‌ها و محاسبه مجدد"
            >
              <RefreshCw className="w-4 h-4" />
              <span>ویرایش فرم</span>
            </button>
          </div>
        </div>

        {/* Selected Primary & Backup Bar */}
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="flex items-center gap-2 bg-white/5 p-3 rounded-2xl border border-white/10">
            <span className="text-amber-400 font-bold">★ مقصد اصلی منتخب شما:</span>
            <select
              value={primaryChoiceCode}
              onChange={(e) => setPrimaryChoiceCode(e.target.value)}
              className="bg-slate-800 text-white px-2.5 py-1 rounded-lg border border-slate-600 focus:outline-hidden text-xs"
            >
              {summary.primaryDestinations.map(d => (
                <option key={d.countryCode} value={d.countryCode}>
                  {d.flagEmoji} {d.countryNameFa} ({d.routeNameFa})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white/5 p-3 rounded-2xl border border-white/10">
            <span className="text-emerald-400 font-bold">🛡 مقصد پشتیبان (Backup):</span>
            <select
              value={backupChoiceCode}
              onChange={(e) => setBackupChoiceCode(e.target.value)}
              className="bg-slate-800 text-white px-2.5 py-1 rounded-lg border border-slate-600 focus:outline-hidden text-xs"
            >
              {summary.primaryDestinations.map(d => (
                <option key={d.countryCode} value={d.countryCode}>
                  {d.flagEmoji} {d.countryNameFa} ({d.routeNameFa})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Phone Login CTA or Active Account Bar */}
      {!user ? (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200/90 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-900 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900">
                می‌خواهید بعداً به این پرونده ارزیابی در پنل کاربری دسترسی داشته باشید؟
              </h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                با شماره همراه خود وارد شوید تا این ۳ مقصد و جزئیات پرونده برای همیشه در حساب کاربری شما ذخیره شود و در هر زمان به آن دسترسی داشته باشید.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenAuth}
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl text-xs font-bold shrink-0 transition-all shadow-md shadow-emerald-600/20"
          >
            ورود با شماره تماس و ذخیره در پنل
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-700 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${isPaid ? "bg-amber-500" : "bg-emerald-500"} animate-pulse`}></span>
            <span>
              این ارزیابی متصل به حساب <strong>{user.phoneNumber}</strong> ({user.fullName || "کاربر کوچیفای"}) است.
            </span>
            {isPaid ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[11px]">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>اشتراک طلایی فعال</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-bold text-[11px]">
                <span>دسترسی اولیه</span>
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!isPaid && (
              <button
                onClick={onOpenPayment}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>باز کردن کامل ۳ کشور (۴۹۹,۰۰۰ ت)</span>
              </button>
            )}
            {!isSavedToCloud && (
              <button
                onClick={onSaveToCloud}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                ذخیره در پرونده‌های من
              </button>
            )}
            <button
              onClick={onOpenUserPanel}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors cursor-pointer"
            >
              مشاهده سوابق در پنل ←
            </button>
          </div>
        </div>
      )}

      {/* Profile Overview (Strengths vs Gaps) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-3xl p-5">
          <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>نقاط قوت برجسته در شرایط اعلام‌شده شما:</span>
          </div>
          <ul className="space-y-2 text-xs text-emerald-950 leading-relaxed">
            {summary.profileStrengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0"></span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Gaps */}
        <div className="bg-amber-50/60 border border-amber-200/80 rounded-3xl p-5">
          <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm mb-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <span>شکاف‌های نیازمند اقدام و ارتقاء (Action Items):</span>
          </div>
          <ul className="space-y-2 text-xs text-amber-950 leading-relaxed">
            {summary.profileGaps.map((gap, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0"></span>
                <span>{gap}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* SPECIFIC TARGET COUNTRY ANALYSIS CARD (If user chose a specific country) */}
      {summary.specificTargetCountryResult && (
        <div className={`rounded-3xl border-2 p-6 sm:p-7 shadow-lg transition-all text-right ${
          summary.specificTargetCountryResult.isInTop3
            ? "bg-gradient-to-br from-emerald-500/10 via-white to-teal-500/10 border-emerald-300 shadow-emerald-500/10"
            : "bg-gradient-to-br from-indigo-500/10 via-white to-cyan-500/10 border-indigo-200 shadow-indigo-500/10"
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-200/80">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-xs ${
                summary.specificTargetCountryResult.isInTop3
                  ? "bg-emerald-600 text-white"
                  : "bg-indigo-600 text-white"
              }`}>
                {summary.specificTargetCountryResult.isInTop3 ? "🎯" : "📍"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    وضعیت بررسی کشور مدنظر شما: {summary.specificTargetCountryResult.countryName}
                  </h3>
                  {summary.specificTargetCountryResult.isInTop3 ? (
                    <span className="text-[11px] font-black bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300">
                      ✓ در جمع ۳ مقصد برتر
                    </span>
                  ) : (
                    <span className="text-[11px] font-black bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
                      نیازمند تقویت پرونده
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed font-medium">
                  {summary.specificTargetCountryResult.summaryFa}
                </p>
              </div>
            </div>
          </div>

          {!summary.specificTargetCountryResult.isInTop3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-500 block mb-1">
                  شکاف‌ها و شرایط مورد نیاز:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-800 font-semibold">
                  {summary.specificTargetCountryResult.qualificationGapsFa.map((gap, gIdx) => (
                    <li key={gIdx} className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-500 block mb-1">
                  حداقل تمکن و زبان مورد نیاز:
                </span>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-600 block">تمکن مالی سال اول (ارزی):</span>
                    <strong className="text-emerald-800 font-black block mt-0.5">
                      {summary.specificTargetCountryResult.budgetRequirementFa}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-600 block">حد مورد نیاز زبان:</span>
                    <strong className="text-slate-900 font-bold block mt-0.5">
                      {summary.specificTargetCountryResult.languageRequirementFa}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                <span className="text-xs font-bold text-emerald-900 block mb-1">
                  اقدامات لازم برای رسیدن به {summary.specificTargetCountryResult.countryName}:
                </span>
                <ul className="space-y-1.5 text-xs text-emerald-950 font-bold">
                  {summary.specificTargetCountryResult.requiredActionsFa.map((action, aIdx) => (
                    <li key={aIdx} className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TOP 3 DESTINATION CARDS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <span>کارت تفصیلی ۳ مسیر پیشنهادی</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              دقیقاً ۳ کشور متمایز با بالاترین تناسب
            </span>
          </h2>
          <span className="text-xs text-slate-400">
            برای مشاهده همه جزئیات، روی هر کارت کلیک کنید
          </span>
        </div>

        <div className="space-y-6">
          {summary.primaryDestinations.map((dest, index) => {
            const isExpanded = expandedCardId === dest.routeId;
            const isPrimary = primaryChoiceCode === dest.countryCode;
            const isBackup = backupChoiceCode === dest.countryCode;

            return (
              <div 
                key={dest.routeId}
                className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden ${
                  isPrimary
                    ? "border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                    : isBackup
                    ? "border-teal-400 shadow-xs ring-1 ring-teal-400/20"
                    : "border-slate-200 shadow-2xs hover:border-slate-300"
                }`}
              >
                {/* Card Top Header */}
                <div className="p-6 sm:p-7 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl select-none shrink-0 mt-0.5">
                        {dest.flagEmoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
                            پیشنهاد #{index + 1}
                          </span>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {dest.routeTypeBadgeFa}
                          </span>
                          {isPrimary && (
                            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                              ★ مقصد اصلی شما
                            </span>
                          )}
                          {isBackup && !isPrimary && (
                            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 border border-teal-300">
                              🛡 مقصد پشتیبان
                            </span>
                          )}
                        </div>

                        <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                          {dest.countryNameFa} — {dest.routeNameFa}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {dest.routeNameEn}
                        </p>
                      </div>
                    </div>

                    {/* Fit Score Badge */}
                    <div className="flex items-center gap-3 sm:flex-col sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200">
                      <div className="text-right sm:text-left">
                        <span className="text-[11px] font-bold text-slate-500 block">
                          تناسب با شرایط اعلام‌شده:
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-emerald-700">
                            {dest.fitScore}
                          </span>
                          <span className="text-xs font-semibold text-slate-400">/ ۱۰۰</span>
                        </div>
                      </div>

                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        dest.verdictStatus === "eligible_after_final_check"
                          ? "bg-emerald-100 text-emerald-800"
                          : dest.verdictStatus === "achievable_with_gaps"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}>
                        {dest.verdictLabelFa}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Main Summary Grid or Paywall Lock for Destinations 2 & 3 */}
                {!isPaid && index > 0 ? (
                  <div className="relative p-6 sm:p-10 min-h-[300px] flex flex-col items-center justify-center text-center overflow-hidden">
                    {/* Blurred Background Mockup */}
                    <div className="absolute inset-0 p-6 space-y-4 filter blur-md opacity-30 select-none pointer-events-none">
                      <div className="h-4 bg-slate-400 rounded-md w-3/4"></div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="h-16 bg-slate-300 rounded-xl"></div>
                        <div className="h-16 bg-slate-300 rounded-xl"></div>
                        <div className="h-16 bg-slate-300 rounded-xl"></div>
                      </div>
                      <div className="h-4 bg-slate-400 rounded-md w-1/2"></div>
                      <div className="h-20 bg-slate-300 rounded-xl"></div>
                    </div>

                    {/* Lock CTA Card */}
                    <div className="relative z-10 max-w-md mx-auto flex flex-col items-center bg-white/95 backdrop-blur-md p-6 sm:p-7 rounded-3xl border border-amber-200/90 shadow-xl text-center">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center mb-3 shadow-md shadow-amber-500/25">
                        <Lock className="w-6 h-6" />
                      </div>
                      <h4 className="font-black text-base text-slate-900 mb-1">
                        قفل اشتراک: مقصد #{index + 1} ({dest.countryNameFa})
                      </h4>
                      <p className="text-xs text-slate-600 mb-5 leading-relaxed font-medium">
                        ریز هزینه‌های تمکن ۲۰۲۶، شروط ویزا، چک‌لیست مدارک سفارتی و برنامه اقدام گام‌به‌گام این مقصد در اشتراک جامع ۴۹۹ هزار تومانی باز است.
                      </p>
                      <button
                        onClick={onOpenPayment}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>باز کردن قفل این مقصد با ۴۹۹,۰۰۰ تومان</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 sm:p-7 space-y-6">
                    {/* Why this option for you */}
                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 text-xs text-emerald-950 leading-relaxed">
                      <strong className="font-extrabold text-emerald-900 ml-1">
                        چرا این گزینه برای شما پیشنهاد شده؟
                      </strong>
                      {dest.whyThisOptionFa}
                    </div>

                    {/* Financial & Language Specs Highlights */}
                    <div>
                      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${!isPaid ? "filter blur-[2px] select-none pointer-events-none" : ""}`}>
                        {/* Minimum Official Funds */}
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold mb-1">
                            <Coins className="w-3.5 h-3.5 text-emerald-600" />
                            <span>حداقل تمکن رسمی مصوب:</span>
                          </div>
                          <div className="font-black text-sm text-slate-900">
                            {dest.financialBreakdown.officialLivingFundFa}
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            نرخ معتبر از {dest.financialBreakdown.rateEffectiveDate}
                          </span>
                        </div>

                        {/* Annual Tuition */}
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold mb-1">
                            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                            <span>شهریه سال اول تحصیلی:</span>
                          </div>
                          <div className="font-black text-sm text-slate-900">
                            {dest.financialBreakdown.annualTuitionEstimateFa}
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            مستقل از تمکن زندگی محاسبه می‌شود
                          </span>
                        </div>

                        {/* Language Gate */}
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold mb-1">
                            <Languages className="w-3.5 h-3.5 text-purple-600" />
                            <span>شرط زبان قانونی ویزا:</span>
                          </div>
                          <div className="font-black text-xs text-slate-900 line-clamp-1">
                            {dest.languageRequirement.legalMinimumFa}
                          </div>
                          <span className="text-[10px] text-emerald-700 block mt-0.5">
                            سطح شما: {dest.languageRequirement.userLevelFa}
                          </span>
                        </div>
                      </div>

                      {!isPaid && (
                        <div className="mt-2.5 p-3 rounded-2xl bg-amber-50 border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2 text-amber-900">
                            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                            <span className="font-bold">
                              ریز مبالغ مصوب تمکن ۲۰۲۶ و حساب مسدود نیازمند فعال‌سازی اشتراک است.
                            </span>
                          </div>
                          <button
                            onClick={onOpenPayment}
                            className="text-emerald-700 hover:text-emerald-800 font-extrabold text-xs underline underline-offset-4 cursor-pointer shrink-0"
                          >
                            باز کردن با ۴۹۹,۰۰۰ ت ←
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Hard Gate & Conditions Summary */}
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 mb-2">
                        وضعیت شروط قانونی ویزا در این مسیر:
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {dest.conditions.map(cond => (
                          <div 
                            key={cond.id}
                            className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-100 bg-slate-50 text-xs"
                          >
                            {cond.status === "passed" && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            )}
                            {cond.status === "failed" && (
                              <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            )}
                            {cond.status === "unknown" && (
                              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <div className="font-bold text-slate-900">
                                {cond.titleFa}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                {cond.explanationFa}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Expandable Details Section */}
                    {isExpanded && (
                      <div className="space-y-6 pt-4 border-t border-slate-200">
                        {/* 7-Dimension Score Breakdown */}
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                          <h5 className="font-bold text-xs text-slate-800 mb-3">
                            تفکیک امتیاز تناسب بر اساس ۷ معیار مانیفست رسمی:
                          </h5>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                            <div className="p-2 bg-white rounded-xl border border-slate-100">
                              <span className="text-[10px] text-slate-500 block">واقع‌بینی مسیر (از ۲۵)</span>
                              <span className="font-black text-sm text-emerald-700">
                                {dest.scoreBreakdown.realismAndRouteSuitability}
                              </span>
                            </div>
                            <div className="p-2 bg-white rounded-xl border border-slate-100">
                              <span className="text-[10px] text-slate-500 block">تناسب شغل/رشته (از ۲۰)</span>
                              <span className="font-black text-sm text-emerald-700">
                                {dest.scoreBreakdown.fieldOrOccupationFit}
                              </span>
                            </div>
                            <div className="p-2 bg-white rounded-xl border border-slate-100">
                              <span className="text-[10px] text-slate-500 block">زبان مقصد (از ۱۵)</span>
                              <span className="font-black text-sm text-emerald-700">
                                {dest.scoreBreakdown.languageFit}
                              </span>
                            </div>
                            <div className="p-2 bg-white rounded-xl border border-slate-100">
                              <span className="text-[10px] text-slate-500 block">استطاعت مالی (از ۱۵)</span>
                              <span className="font-black text-sm text-emerald-700">
                                {dest.scoreBreakdown.financialAffordability}
                              </span>
                            </div>
                            <div className="p-2 bg-white rounded-xl border border-slate-100">
                              <span className="text-[10px] text-slate-500 block">کیفیت مدارک (از ۱۰)</span>
                              <span className="font-black text-sm text-emerald-700">
                                {dest.scoreBreakdown.degreeAndExperienceQuality}
                              </span>
                            </div>
                            <div className="p-2 bg-white rounded-xl border border-slate-100">
                              <span className="text-[10px] text-slate-500 block">ترجیحات کاربر (از ۱۰)</span>
                              <span className="font-black text-sm text-emerald-700">
                                {dest.scoreBreakdown.preferencesFit}
                              </span>
                            </div>
                            <div className="p-2 bg-white rounded-xl border border-slate-100">
                              <span className="text-[10px] text-slate-500 block">آمادگی و زمان (از ۵)</span>
                              <span className="font-black text-sm text-emerald-700">
                                {dest.scoreBreakdown.readinessAndTiming}
                              </span>
                            </div>
                            <div className="p-2 bg-emerald-600 text-white rounded-xl">
                              <span className="text-[10px] text-emerald-200 block">مجموع تناسب</span>
                              <span className="font-black text-sm">{dest.fitScore} از ۱۰۰</span>
                            </div>
                          </div>
                        </div>

                        {/* Documents distinction: Translation vs Legalization */}
                        <div>
                          <h5 className="font-bold text-xs text-slate-800 mb-2">
                            مدارک کلیدی و تفکیک ترجمه از تأییدات دادگستری/کنسولی:
                          </h5>
                          <div className="space-y-2">
                            {dest.documents.map(doc => (
                              <div 
                                key={doc.id}
                                className="p-3 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                              >
                                <div>
                                  <span className="font-bold text-slate-900 block">{doc.titleFa}</span>
                                  <span className="text-[11px] text-slate-500">{doc.notesFa}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 text-[10px] font-semibold border border-blue-200">
                                    {doc.translationRule}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 text-[10px] font-semibold border border-purple-200">
                                    {doc.legalisationRule}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Official Audited Sources */}
                        <div>
                          <h5 className="font-bold text-xs text-slate-800 mb-2">
                            منابع رسمی قابل استعلام دولتی و تاریخ اعتبار:
                          </h5>
                          <div className="space-y-1.5">
                            {dest.citations.map(cit => (
                              <a
                                key={cit.sourceId}
                                href={cit.canonicalUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 bg-slate-50 hover:bg-emerald-50/50 flex items-center justify-between text-xs transition-colors group"
                              >
                                <div>
                                  <span className="font-bold text-slate-800 group-hover:text-emerald-900 block">
                                    {cit.publisher} — {cit.title}
                                  </span>
                                  <span className="text-[11px] text-slate-500">
                                    {cit.summaryFa} (آخرین بازبینی: {cit.checkedAt})
                                  </span>
                                </div>
                                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Card Action Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => {
                            if (!isPaid) {
                              onOpenPayment?.();
                            } else {
                              onSelectRouteForDossier(dest);
                            }
                          }}
                          className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                            !isPaid
                              ? "bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
                              : "bg-slate-900 hover:bg-slate-800 text-white"
                          }`}
                        >
                          {!isPaid ? (
                            <>
                              <Lock className="w-3.5 h-3.5" />
                              <span>باز کردن پرونده کامل و اقدامات (اشتراک)</span>
                            </>
                          ) : (
                            <>
                              <FileText className="w-3.5 h-3.5 text-emerald-400" />
                              <span>پرونده کامل و برنامه اقدام</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => toggleExpand(dest.routeId)}
                          className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>{isExpanded ? "بستن جزئیات" : "مشاهده تمام شروط و منابع"}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <button
                          onClick={() => setPrimaryChoiceCode(dest.countryCode)}
                          className={`px-3 py-1.5 rounded-lg border font-semibold transition-colors cursor-pointer ${
                            isPrimary
                              ? "bg-amber-100 text-amber-900 border-amber-300"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {isPrimary ? "✓ مقصد اصلی شماست" : "انتخاب به عنوان مقصد اصلی"}
                        </button>

                        <button
                          onClick={() => setBackupChoiceCode(dest.countryCode)}
                          className={`px-3 py-1.5 rounded-lg border font-semibold transition-colors cursor-pointer ${
                            isBackup
                              ? "bg-teal-100 text-teal-900 border-teal-300"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {isBackup ? "✓ مقصد پشتیبان شماست" : "انتخاب به عنوان پشتیبان"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Bottom Paywall Bar */}
      {!isPaid && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-xl z-40 animate-in fade-in slide-in-from-bottom duration-300">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 border-2 border-emerald-500/80 shadow-2xl rounded-3xl p-4 text-white relative overflow-hidden ring-4 ring-emerald-500/10">
            <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
              <div className="text-right">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black mb-1 border border-amber-400/30">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>تخفیف ویژه راه‌اندازی ۲۰۲۶</span>
                </div>
                <h4 className="text-xs sm:text-sm font-black text-white leading-tight">
                  باز کردن کامل پرونده مهاجرتی ۳ کشور + رزومه‌ساز ATS
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-emerald-400 font-black text-sm sm:text-base font-mono">
                    ۴۹۹,۰۰۰ تومان
                  </span>
                  <span className="text-[11px] text-slate-400 line-through font-mono">
                    ۹۹۰,۰۰۰ تومان
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-rose-500/80 text-white text-[9px] font-bold">
                    ۵۰٪ تخفیف
                  </span>
                </div>
              </div>

              <button
                onClick={onOpenPayment}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:scale-105 active:scale-95 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Lock className="w-4 h-4 text-slate-950" />
                <span>فعال‌سازی آنی پرونده</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
