import React from "react";
import {
  Compass,
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
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Star,
  Users,
  Award,
  Zap,
  TrendingUp,
  Scale
} from "lucide-react";
import { MigrationGoal } from "../types";

interface LandingPageProps {
  selectedGoal: MigrationGoal;
  onSelectGoal: (goal: MigrationGoal) => void;
  onStartAssessment: () => void;
  onViewCatalog: () => void;
  onOpenResume: () => void;
}

export default function LandingPage({
  selectedGoal,
  onSelectGoal,
  onStartAssessment,
  onViewCatalog,
  onOpenResume,
}: LandingPageProps) {
  const [openFaq, setOpenFaq] = React.useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: "آیا برای شروع ارزیابی نیاز است مدرک زبان رسمی (آیلتس یا تافل) آماده داشته باشم؟",
      a: "خیر، نیازی به کارنامه رسمی در مرحله اول نیست. شما می‌توانید نمره تخمینی خود یا سطحی که در آن قرار دارید را مشخص کنید تا سامانه شروط قانونی مقاصد مختلف را بر اساس آن تطبیق دهد.",
    },
    {
      q: "اطلاعات من چگونه نگهداری می‌شود و آیا اطلاعات حساس نیاز است؟",
      a: "کوچیفای هیچ‌گونه اطلاعات هویتی حساس مانند شماره گذرنامه، کد ملی، یا اسناد مالی شخصی از شما دریافت نمی‌کند. پرونده شما صرفاً با شماره همراهتان به صورت امن و خصوصی در پایگاه داده ثبت می‌شود.",
    },
    {
      q: "هزینه ارزیابی و دریافت گزارش نهایی چقدر است؟",
      a: "شروع و ارزیابی شرایط در سامانه کاملاً در دسترس است و پس از تکمیل، گزارش تحلیلی کامل شامل ۳ مقصد بهینه، ریز تمکن رسمی سال ۲۰۲۶، بررسی ریسک‌های پنهان ریجکتی، چک‌لیست گام‌به‌گام و ابزار رزومه‌یار با مبلغ ۴۹۹,۰۰۰ تومان ارائه می‌شود.",
    },
    {
      q: "تفاوت کوچیفای با دفاتر مهاجرتی سنتی چیست؟",
      a: "دفاتر سنتی معمولاً روی کشورهایی که در آن وکیل دارند یا قرارداد دارند اصرار می‌کنند. کوچیفای یک موتور تصمیم‌یار داده‌محور و بی‌طرف است که شرایط شما را با قوانین رسمی ۳۰ کشور بدون تعصب تجاری مقایسه می‌کند.",
    },
  ];

  return (
    <div className="space-y-16 pb-12 overflow-hidden" dir="rtl">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-slate-50 to-white pt-10 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200/60">
        <div className="absolute top-0 right-1/4 -z-10 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/4 -z-10 w-80 h-80 bg-teal-300/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300/70 text-emerald-900 text-xs font-bold mb-6 shadow-xs animate-fade-in">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>منطبق بر آیین‌نامه‌ها و قوانین رسمی مهاجرتی سال ۲۰۲۶</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight sm:leading-snug mb-5 font-sans">
            از سردرگمی اولیه تا یک برنامه{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              مهاجرتی شفاف و مستند
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8">
            کوچیفای شرایط تحصیلی، شغلی، سن، زبان و بودجه شما را با مقررات بیش از <strong>۳۰ کشور برتر جهان</strong> ارزیابی می‌کند 
            تا به جای شعارهای تبلیغاتی، <strong>۳ مقصد برتر اختصاصی همراه با مسیرهای ویزای مشخص و هزینه‌های واقعی</strong> دریافت کنید.
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-600 font-medium mb-10">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>بیش از ۱۲,۰۰۰ ارزیابی تخصصی</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-teal-600" />
              <span>پوشش ۳۰ کشور مهاجرپذیر دنیا</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-cyan-600" />
              <span>۱۰۰٪ داده‌محور و بدون تعصب تجاری</span>
            </div>
          </div>

          {/* Migration Goal Selector Cards */}
          <div className="max-w-4xl mx-auto mb-10 text-right">
            <label className="block text-sm font-extrabold text-slate-800 mb-3 text-center">
              گام نخست: هدف یا گرایش مورد نظر شما برای مهاجرت چیست؟
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Study */}
              <div
                onClick={() => onSelectGoal("study")}
                className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  selectedGoal === "study"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20 scale-[1.02]"
                    : "bg-white text-slate-800 border-slate-200 hover:border-emerald-300 hover:bg-slate-50 shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      selectedGoal === "study"
                        ? "bg-white/20 text-white"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  {selectedGoal === "study" && <CheckCircle2 className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-1">مهاجرت تحصیلی</h4>
                  <p
                    className={`text-xs leading-relaxed ${
                      selectedGoal === "study" ? "text-emerald-100" : "text-slate-500"
                    }`}
                  >
                    دانشگاه‌ها، ارشد و دکترا، بورسیه‌ها و اقامت کاری پس از فارغ‌التحصیلی
                  </p>
                </div>
              </div>

              {/* Work */}
              <div
                onClick={() => onSelectGoal("work")}
                className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  selectedGoal === "work"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20 scale-[1.02]"
                    : "bg-white text-slate-800 border-slate-200 hover:border-emerald-300 hover:bg-slate-50 shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      selectedGoal === "work"
                        ? "bg-white/20 text-white"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    <Briefcase className="w-5 h-5" />
                  </div>
                  {selectedGoal === "work" && <CheckCircle2 className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-1">مهاجرت کاری</h4>
                  <p
                    className={`text-xs leading-relaxed ${
                      selectedGoal === "work" ? "text-emerald-100" : "text-slate-500"
                    }`}
                  >
                    جاب‌آفر کارفرمایی، ویزاهای امتیازی اسکیل‌ورکر، کارت شانس و بلوکارت
                  </p>
                </div>
              </div>

              {/* Both */}
              <div
                onClick={() => onSelectGoal("both")}
                className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  selectedGoal === "both"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20 scale-[1.02]"
                    : "bg-white text-slate-800 border-slate-200 hover:border-emerald-300 hover:bg-slate-50 shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      selectedGoal === "both"
                        ? "bg-white/20 text-white"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    <Sparkles className="w-5 h-5" />
                  </div>
                  {selectedGoal === "both" && <CheckCircle2 className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-1">هر دو مسیر (همزمان)</h4>
                  <p
                    className={`text-xs leading-relaxed ${
                      selectedGoal === "both" ? "text-emerald-100" : "text-slate-500"
                    }`}
                  >
                    بررسی و مقایسه توأمان هر دو مسیر تحصیلی و کاری برای یافتن مطمئن‌ترین گزینه
                  </p>
                </div>
              </div>

              {/* Unsure */}
              <div
                onClick={() => onSelectGoal("unsure")}
                className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  selectedGoal === "unsure"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20 scale-[1.02]"
                    : "bg-white text-slate-800 border-slate-200 hover:border-emerald-300 hover:bg-slate-50 shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      selectedGoal === "unsure"
                        ? "bg-white/20 text-white"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  {selectedGoal === "unsure" && <CheckCircle2 className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-1">هنوز مطمئن نیستم</h4>
                  <p
                    className={`text-xs leading-relaxed ${
                      selectedGoal === "unsure" ? "text-emerald-100" : "text-slate-500"
                    }`}
                  >
                    تحلیل شرایط و پیشنهاد بهینه‌ترین گرایش بر مبنای سن، بودجه و رزومه
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Primary CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
            <button
              onClick={onStartAssessment}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold text-base shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <span>شروع ارزیابی شرایط من</span>
              <ArrowLeft className="w-5 h-5" />
            </button>

            <button
              onClick={onViewCatalog}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Globe className="w-4 h-4 text-slate-500" />
              <span>کاتالوگ قوانین ۳۰ کشور</span>
            </button>

            <button
              onClick={onOpenResume}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>رزومه‌یار بین‌المللی</span>
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-6 border-t border-slate-200/80 text-right">
            <div className="flex items-center gap-3 p-3 bg-white/80 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-xs text-slate-900">تکمیل سریع در ۳ تا ۵ دقیقه</h5>
                <p className="text-[11px] text-slate-500">پاسخ با بازه‌های تقریبی بدون نیاز به آماده بودن مدارک</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/80 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-xs text-slate-900">۱۰۰٪ امن و ثبت در دیتابیس</h5>
                <p className="text-[11px] text-slate-500">عدم درخواست مدارک هویتی یا اطلاعات بانکی حساس</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/80 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-xs text-slate-900">قوانین رسمی و دست‌اول ۲۰۲۶</h5>
                <p className="text-[11px] text-slate-500">تطبیق با آیین‌نامه‌های مهاجرتی کانادا، اروپا، استرالیا و...</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Step-by-Step Roadmap (فرآیند ۳ گام) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
            مسیر ارزیابی
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 mb-2">
            تنها ۳ گام ساده تا نقشه راه اختصاصی شما
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            رویکردی کاملاً ساختاریافته برای استخراج شفاف‌ترین مسیر بدون اتلاف وقت و هزینه
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Step 1 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs relative flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-lg mb-4">
                ۱
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-2">
                ورود سریع با شماره تلفن
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                با وارد کردن شماره موبایل و کد یکبارمصرف (کد تستی ۱۲۳۴۵)، پرونده شما به صورت مستقیم در پایگاه داده ایجاد و ذخیره می‌شود.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] text-emerald-700 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>امن و بدون نیاز به گذرواژه</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs relative flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-black text-lg mb-4">
                ۲
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-2">
                تکمیل فرم ارزیابی ۷ گانه
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                مشخصات سن، آخرین مدرک تحصیلی، سابقه کاری و بیمه، تخمین نمره زبان، و بازه بودجه در دسترس را با گزینه‌های پیش‌فرض تعیین کنید.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] text-teal-700 font-bold">
              <Clock className="w-4 h-4" />
              <span>مدت زمان: حدود ۳ تا ۵ دقیقه</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs relative flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-black text-lg mb-4">
                ۳
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-2">
                تحلیل ۳ مقصد برتر و دریافت پرونده
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                موتور هوشمند تطبیق، ۳ کشور با بالاترین شانس را استخراج کرده و ریز تمکن رسمی، شهریه‌ها، موانع پنهان، و چک‌لیست اقدامات را ارائه می‌دهد.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] text-cyan-700 font-bold">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>ارائه گزارش مکتوب و قابل دانلود</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Comparison Section (چرا کوچیفای به جای دفاتر مهاجرتی؟) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-xl">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-3 py-1 rounded-full uppercase">
              مقایسه شفاف
            </span>
            <h2 className="text-xl sm:text-3xl font-black mt-3 mb-2">
              کوچیفای در مقایسه با روش‌های سنتی
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              رویکرد علمی داده‌محور به جای جلسات مشاوره پرهزینه و شعارهای تبلیغاتی نامشخص
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800/70 p-6 rounded-2xl border border-slate-700/60">
              <h4 className="text-sm font-bold text-rose-400 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>روش‌های سنتی و دفاتر تجاری:</span>
              </h4>
              <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>اصرار بر کشورهایی که دفتر مهاجرتی در آن کمیسیون یا قرارداد دارد.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>ادعاهای کاذب «ویزای ۱۰۰٪ تضمینی» و پنهان‌سازی شرایط واقعی ریجکتی.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>هزینه‌های سرسام‌آور مشاوره‌های ابتدایی بدون ارائه ساختار مستند.</span>
                </li>
              </ul>
            </div>

            <div className="bg-emerald-950/50 p-6 rounded-2xl border border-emerald-600/40">
              <h4 className="text-sm font-bold text-emerald-400 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>سامانه هوشمند کوچیفای:</span>
              </h4>
              <ul className="space-y-3 text-xs text-emerald-100 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>مقایسه بی‌طرفانه همزمان بین ۳۰ کشور بر اساس فرمول‌های ریاضی و آیین‌نامه‌ها.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>شفاف‌سازی صریح ریسک‌ها، شرایط سنی، حداقل تمکن بانکی، و شرط‌های قانونی.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>دسترسی کامل به پرونده، اقدامات ماه به ماه و چک‌لیست با هزینه منصفانه ۴۹۹ هزار تومانی.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            پرسش‌های متداول متقاضیان
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            پاسخ به سوالاتی که پیش از شروع ارزیابی ممکن است برایتان مطرح باشد
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs transition-all"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-4.5 text-right flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:text-emerald-700 transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-4.5 pb-4.5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 5. Bottom CTA Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

          <h2 className="text-2xl sm:text-4xl font-black mb-4">
            آماده‌اید پرونده مهاجرتی خود را ارزیابی کنید؟
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl mx-auto leading-relaxed mb-8">
            همین حالا با وارد کردن شماره موبایل وارد شوید، فرم را پر کنید و نقشه راه دقیق خود را دریافت نمایید.
          </p>

          <button
            onClick={onStartAssessment}
            className="px-9 py-4 bg-white hover:bg-emerald-50 text-emerald-900 rounded-2xl font-black text-sm sm:text-base shadow-lg transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-2 cursor-pointer"
          >
            <span>شروع ارزیابی هوشمند من</span>
            <ArrowLeft className="w-5 h-5 text-emerald-700" />
          </button>
        </div>
      </section>
    </div>
  );
}
