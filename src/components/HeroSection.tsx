import React from "react";
import { 
  GraduationCap, 
  Briefcase, 
  Sparkles, 
  HelpCircle, 
  ShieldCheck, 
  Clock, 
  ArrowLeft, 
  Lock, 
  Globe,
  FileText,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { MigrationGoal } from "../types";

interface HeroSectionProps {
  selectedGoal: MigrationGoal;
  onSelectGoal: (goal: MigrationGoal) => void;
  onStartAssessment: () => void;
  onViewCatalog: () => void;
  onOpenResume: () => void;
}

export default function HeroSection({
  selectedGoal,
  onSelectGoal,
  onStartAssessment,
  onViewCatalog,
  onOpenResume
}: HeroSectionProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 via-slate-50 to-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200/60">
      {/* Decorative blurred background shapes */}
      <div className="absolute top-0 right-1/4 -z-10 w-96 h-96 bg-emerald-300/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 left-1/4 -z-10 w-80 h-80 bg-teal-200/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-5xl mx-auto text-center">
        {/* Release & Compliance Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/70 border border-emerald-300/60 text-emerald-900 text-xs font-semibold mb-6 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>منطبق با مانیفست‌های مهاجرتی رسمی سال ۲۰۲۶ و داده‌های معتبر بین‌المللی</span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight sm:leading-snug mb-4 font-sans">
          از سردرگمی اولیه تا یک برنامه{" "}
          <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
            مهاجرتی شفاف و مستند
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8">
          کوچیفای شرایط، سوابق تحصیلی، شغلی، بودجه و زبان شما را با مقررات رسمی ۳۰ کشور ارزیابی می‌کند 
          تا به جای شعارهای تبلیغاتی، <strong>۳ مقصد برتر با مسیرهای ویزای مشخص، شروط واقعی و چک‌لیست دقیق</strong> دریافت کنید.
        </p>

        {/* Legal Disclaimer Box */}
        <div className="max-w-2xl mx-auto bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed mb-10 flex items-start gap-3 text-right">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-amber-950">شفافیت و حدود مسئولیت: </strong>
            کوچیفای یک سامانه تصمیم‌یار و تحلیل داده است؛ نه وکیل مهاجرتی است و نه ویزایی را صادر یا تضمین می‌کند. 
            هیچ مسیر غیرقانونی یا ادعای شانس قبولی ساختگی در این سامانه وجود ندارد.
          </div>
        </div>

        {/* Goal Selector Cards */}
        <div className="max-w-3xl mx-auto mb-10 text-right">
          <label className="block text-sm font-bold text-slate-800 mb-3 text-center">
            گام اول: هدف یا گرایش اولیه شما برای مهاجرت چیست؟
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Study */}
            <div
              onClick={() => onSelectGoal("study")}
              className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                selectedGoal === "study"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 scale-[1.02]"
                  : "bg-white text-slate-800 border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  selectedGoal === "study" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700"
                }`}>
                  <GraduationCap className="w-5 h-5" />
                </div>
                {selectedGoal === "study" && <CheckCircle2 className="w-5 h-5 text-white" />}
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1">مهاجرت تحصیلی</h4>
                <p className={`text-xs leading-relaxed ${selectedGoal === "study" ? "text-emerald-100" : "text-slate-500"}`}>
                  دانشگاه‌ها، دوره‌های ارشد و دکترا، بورسیه‌ها و اقامت پس از تحصیل
                </p>
              </div>
            </div>

            {/* Work */}
            <div
              onClick={() => onSelectGoal("work")}
              className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                selectedGoal === "work"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 scale-[1.02]"
                  : "bg-white text-slate-800 border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  selectedGoal === "work" ? "bg-white/20 text-white" : "bg-blue-100 text-blue-700"
                }`}>
                  <Briefcase className="w-5 h-5" />
                </div>
                {selectedGoal === "work" && <CheckCircle2 className="w-5 h-5 text-white" />}
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1">مهاجرت کاری</h4>
                <p className={`text-xs leading-relaxed ${selectedGoal === "work" ? "text-emerald-100" : "text-slate-500"}`}>
                  جاب‌آفر کارفرمایی، ویزاهای امتیازی، کارت شانس و بلوکارت
                </p>
              </div>
            </div>

            {/* Both */}
            <div
              onClick={() => onSelectGoal("both")}
              className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                selectedGoal === "both"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 scale-[1.02]"
                  : "bg-white text-slate-800 border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  selectedGoal === "both" ? "bg-white/20 text-white" : "bg-purple-100 text-purple-700"
                }`}>
                  <Sparkles className="w-5 h-5" />
                </div>
                {selectedGoal === "both" && <CheckCircle2 className="w-5 h-5 text-white" />}
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1">هر دو مسیر</h4>
                <p className={`text-xs leading-relaxed ${selectedGoal === "both" ? "text-emerald-100" : "text-slate-500"}`}>
                  بررسی و مقایسه همزمان مسیرهای تحصیلی و کاری برای یافتن بهینه‌ترین راه
                </p>
              </div>
            </div>

            {/* Unsure */}
            <div
              onClick={() => onSelectGoal("unsure")}
              className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                selectedGoal === "unsure"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 scale-[1.02]"
                  : "bg-white text-slate-800 border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  selectedGoal === "unsure" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-700"
                }`}>
                  <HelpCircle className="w-5 h-5" />
                </div>
                {selectedGoal === "unsure" && <CheckCircle2 className="w-5 h-5 text-white" />}
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1">هنوز مطمئن نیستم</h4>
                <p className={`text-xs leading-relaxed ${selectedGoal === "unsure" ? "text-emerald-100" : "text-slate-500"}`}>
                  راهنمایی هوشمند گام‌به‌گام برای کشف مسیر متناسب با شرایط شخصی
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <button
            onClick={onStartAssessment}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>شروع ارزیابی هوشمند من</span>
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            onClick={onViewCatalog}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Globe className="w-4 h-4 text-slate-500" />
            <span>کاتالوگ و شرایط ۳۰ کشور</span>
          </button>

          <button
            onClick={onOpenResume}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>تحلیل و بهینه‌سازی رزومه</span>
          </button>
        </div>

        {/* Trust & Transparency Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-6 border-t border-slate-200/80 text-right">
          <div className="flex items-center gap-3 p-3 bg-white/70 rounded-xl border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h5 className="font-bold text-xs text-slate-800">تکمیل سریع در ۳ الی ۵ دقیقه</h5>
              <p className="text-[11px] text-slate-500">پاسخ با بازه‌های تقریبی بدون نیاز به آماده بودن مدارک</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white/70 rounded-xl border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h5 className="font-bold text-xs text-slate-800">۱۰۰٪ خصوصی و بدون دریافت سند</h5>
              <p className="text-[11px] text-slate-500">عدم درخواست کد ملی، گذرنامه یا اطلاعات حساس بانکی</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white/70 rounded-xl border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h5 className="font-bold text-xs text-slate-800">پشتیبانی از گزینه «نمی‌دانم»</h5>
              <p className="text-[11px] text-slate-500">بدون ایجاد بن‌بست در فرم؛ همراه با راهنمایی شفاف</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
