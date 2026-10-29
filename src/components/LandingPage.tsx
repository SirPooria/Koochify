import React, { useState, useEffect } from "react";
import {
  Compass,
  ArrowLeft,
  Lock,
  Globe,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock,
  ShieldCheck,
  Users,
  Sparkles,
  Award,
  ChevronRight,
  MapPin,
  TrendingUp,
  Cpu,
  Target
} from "lucide-react";
import { MigrationGoal } from "../types";

interface LandingPageProps {
  selectedGoal?: MigrationGoal;
  onSelectGoal?: (goal: MigrationGoal) => void;
  onStartAssessment: () => void;
  onViewCatalog?: () => void;
  onOpenResume?: () => void;
}

// --- Vector Illustrations for European Landmarks ---
function EiffelTowerVector({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 140" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M50 8L48 20H52L50 8Z" fill="currentColor" />
      <line x1="50" y1="2" x2="50" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M48 20L45 42H55L52 20H48Z" stroke="currentColor" strokeWidth="2" />
      <rect x="43" y="42" width="14" height="4" rx="1" fill="currentColor" />
      <path d="M44 46L38 82H62L56 46H44Z" stroke="currentColor" strokeWidth="2" />
      <line x1="40" y1="64" x2="60" y2="64" stroke="currentColor" strokeWidth="1.5" />
      <line x1="44" y1="46" x2="56" y2="64" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="56" y1="46" x2="44" y2="64" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="41" y1="64" x2="59" y2="82" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="59" y1="64" x2="41" y2="82" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
      <rect x="34" y="82" width="32" height="6" rx="2" fill="currentColor" />
      <path d="M36 88L24 136H35L42 106C44 98 56 98 58 106L65 136H76L64 88H36Z" stroke="currentColor" strokeWidth="2.5" />
      <path d="M38 106C44 96 56 96 62 106" stroke="currentColor" strokeWidth="2" fill="none" />
      <line x1="20" y1="136" x2="80" y2="136" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function ColosseumVector({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 90" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <ellipse cx="70" cy="80" rx="60" ry="8" stroke="currentColor" strokeWidth="2" />
      <path d="M15 80V45C15 32 38 20 70 20C102 20 125 32 125 45V80" stroke="currentColor" strokeWidth="2.5" />
      <path d="M22 42C35 34 52 30 70 30C88 30 105 34 118 42" stroke="currentColor" strokeWidth="1.5" />
      <path d="M18 58C32 50 50 46 70 46C90 46 108 50 122 58" stroke="currentColor" strokeWidth="1.5" />
      {/* Tier 1 Arches */}
      <path d="M30 78V66C30 63 34 63 34 66V78" stroke="currentColor" strokeWidth="1.8" />
      <path d="M42 78V65C42 62 46 62 46 65V78" stroke="currentColor" strokeWidth="1.8" />
      <path d="M54 78V64C54 61 58 61 58 64V78" stroke="currentColor" strokeWidth="1.8" />
      <path d="M66 78V63C66 60 70 60 70 63V78" stroke="currentColor" strokeWidth="1.8" />
      <path d="M78 78V63C78 60 82 60 82 63V78" stroke="currentColor" strokeWidth="1.8" />
      <path d="M90 78V64C90 61 94 61 94 64V78" stroke="currentColor" strokeWidth="1.8" />
      <path d="M102 78V65C102 62 106 62 106 65V78" stroke="currentColor" strokeWidth="1.8" />
      {/* Tier 2 Arches */}
      <path d="M32 56V48C32 45 36 45 36 48V56" stroke="currentColor" strokeWidth="1.5" />
      <path d="M46 54V46C46 43 50 43 50 46V54" stroke="currentColor" strokeWidth="1.5" />
      <path d="M60 52V44C60 41 64 41 64 44V52" stroke="currentColor" strokeWidth="1.5" />
      <path d="M74 52V44C74 41 78 41 78 44V52" stroke="currentColor" strokeWidth="1.5" />
      <path d="M88 54V46C88 43 92 43 92 46V54" stroke="currentColor" strokeWidth="1.5" />
      <path d="M102 56V48C102 45 106 45 106 48V56" stroke="currentColor" strokeWidth="1.5" />
      {/* Broken wall side */}
      <path d="M15 45L22 34L28 36L34 26L42 28L48 22" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function BrandenburgGateVector({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 130 90" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Quadriga on top */}
      <circle cx="65" cy="18" r="4" fill="currentColor" />
      <path d="M61 22L65 14L69 22H61Z" fill="currentColor" />
      <line x1="55" y1="22" x2="75" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="65" y1="12" x2="65" y2="4" stroke="currentColor" strokeWidth="1.5" />
      {/* Entablature roof */}
      <rect x="18" y="24" width="94" height="6" rx="1" fill="currentColor" />
      <rect x="22" y="30" width="86" height="5" fill="currentColor" opacity="0.6" />
      {/* Columns */}
      <rect x="24" y="35" width="6" height="45" rx="1" fill="currentColor" />
      <rect x="38" y="35" width="6" height="45" rx="1" fill="currentColor" />
      <rect x="52" y="35" width="6" height="45" rx="1" fill="currentColor" />
      <rect x="72" y="35" width="6" height="45" rx="1" fill="currentColor" />
      <rect x="86" y="35" width="6" height="45" rx="1" fill="currentColor" />
      <rect x="100" y="35" width="6" height="45" rx="1" fill="currentColor" />
      {/* Plinth */}
      <rect x="14" y="80" width="102" height="6" rx="1" fill="currentColor" />
    </svg>
  );
}

function EuropeanSkylineHorizon({ className = "w-full h-24" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 160"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M0 160V140H40V120H60V140H90V90H110V140H140V105H170V140H210V80H218L220 30L222 80H230V140H260V110H290V140H320V70H335L340 50L345 70H360V140H410V95H430V75H445V95H460V140H500V60H515L520 20L525 60H540V140H580V110H600V140H640V85H660V140H700V50H715L720 15L725 50H740V140H780V100H810V140H850V75H870V140H900V115H930V140H970V65H985L990 35L995 65H1010V140H1060V90H1090V140H1130V105H1160V140H1200V160H0Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function LandingPage({
  onStartAssessment,
  onViewCatalog,
  onOpenResume,
}: LandingPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeSlide, setActiveSlide] = useState<number>(0);

  // Punchy hero headlines showcasing what Koochify does (Strictly <= 10 words each)
  const HERO_SLIDES = [
    {
      title: "ارزیابی هوشمند شانس قبولی در ۳۰ کشور دنیا",
      subtitle: "بررسی الگوریتمی بر مبنای جدیدترین قوانین رسمی سال ۲۰۲۶",
      badge: "دقت الگوریتمی بدون خطا",
    },
    {
      title: "انتخاب ۳ مقصد طلایی متناسب با شرایط شما",
      subtitle: "استخراج بهترین گزینه‌ها بر اساس سن، بودجه، زبان و سوابق",
      badge: "سازگارترین گزینه‌ها",
    },
    {
      title: "محاسبه دقیق کف تمکن مالی و هزینه‌های واقعی",
      subtitle: "شفاف‌سازی مخارج زندگی و حداقل مبالغ واریزی قانونی سفارت",
      badge: "شفافیت ۱۰۰٪ مالی",
    },
    {
      title: "تحلیل بدون تعصب، بدون پورسانت دفاتر مهاجرتی",
      subtitle: "بدون منافع تجاری و پنهان‌کاری؛ فقط حقیقت پرونده شما",
      badge: "بی‌طرفی کامل",
    },
    {
      title: "شناسایی ریسک‌های پنهان ریجکتی و راهکارهای قانونی",
      subtitle: "تشخیص نقاط ضعف پرونده و ارائه چک‌لیست اقدامات جبرانی",
      badge: "پیشگیری از ریجکتی",
    },
  ];

  // Auto-rotate hero slider every 3.8s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [HERO_SLIDES.length]);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: "آیا برای شروع ارزیابی، مدرک رسمی زبان (آیلتس، تافل یا گوته) یا پاسپورت لازم است؟",
      a: "خیر، به هیچ وجه! در مرحله ارزیابی اولیه فقط سطح تقریبی یا نمره تخمینی خود را مشخص می‌کنید. کوچیفای دقیقاً به شما می‌گوید هر مقصد چه نمره‌ای می‌خواهد و برای رساندن زبانتان به سطح مورد نیاز چقدر فرصت دارید.",
    },
    {
      q: "اطلاعات من چگونه نگهداری می‌شود و آیا نیاز به ارسال مدارک هویتی یا بانکی است؟",
      a: "حریم خصوصی شما خط قرمز ماست. کوچیفای هرگز اطلاعات حساسی مانند شماره گذرنامه، کد ملی، اسناد ملکی یا صورت‌حساب بانکی از شما نمی‌خواهد. پرونده شما صرفاً با شماره همراهتان به صورت کاملاً رمزنگاری‌شده و محرمانه ثبت می‌شود.",
    },
    {
      q: "چرا به جای مشاوره‌های گران‌قیمت چند میلیونی به کوچیفای اعتماد کنم؟",
      a: "دفاتر مهاجرتی سنتی معمولاً کشورهایی را پیشنهاد می‌دهند که با دانشگاه‌ها یا وکلای آن قرارداد کمیسیونی دارند. کوچیفای یک موتور الگوریتمی مستقل و بی‌طرف است که شرایط شما را با قوانین رسمی ۳۰ کشور بدون تعصب تجاری مقایسه می‌کند.",
    },
    {
      q: "هزینه ارزیابی و گزارش نهایی چقدر است و چه مواردی را شامل می‌شود؟",
      a: "شروع ارزیابی و پر کردن فرم کاملاً در دسترس است. پس از تکمیل، گزارش جامع شامل ۳ مقصد با بالاترین شانس قبولی، کف تمکن مالی رسمی سال ۲۰۲۶، بررسی ریسک‌های پنهان ریجکتی، چک‌لیست گام‌به‌گام و ابزار رزومه‌یار با یک بار پرداخت شفاف فعال می‌شود.",
    },
    {
      q: "بعد از دریافت ۳ مقصد برتر، چطور باید برای اخذ ویزا اقدام کنم؟",
      a: "گزارش تحلیلی کوچیفای همراه با چک‌لیست اقدامات ماه به ماه و مانیفست مدارک ارائه می‌شود تا هم خودتان بتوانید مستقیماً اقدام (Apply) کنید و هم در صورت تمایل به وکیل، با چشم کاملاً باز و بدون ریسک کلاهبرداری قرارداد ببندید.",
    },
  ];

  // Showcase popular European destinations
  const europeanDestinations = [
    {
      city: "پاریس و فرانسه",
      country: "فرانسه",
      highlights: "ویزای تلنت پاسپورت، قطب فناوری و تحصیل کم‌هزینه",
      icon: EiffelTowerVector,
      accent: "from-blue-500/20 to-indigo-500/20 border-blue-400/30 text-blue-400",
    },
    {
      city: "برلین و مونیخ",
      country: "آلمان",
      highlights: "کارت شانس ۲۰۲۶، بلوکارت اروپا و دانشگاه‌های رایگان",
      icon: BrandenburgGateVector,
      accent: "from-amber-500/20 to-yellow-500/20 border-amber-400/30 text-amber-400",
    },
    {
      city: "رم و میلان",
      country: "ایتالیا",
      highlights: "بورسیه استانی DSU، هزینه تحصیل فوق‌العاده و تبدیل به کار",
      icon: ColosseumVector,
      accent: "from-emerald-500/20 to-teal-500/20 border-emerald-400/30 text-emerald-400",
    },
  ];

  return (
    <div className="space-y-16 pb-12 overflow-hidden bg-slate-950 text-slate-100" dir="rtl">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (DYNAMIC TEXT SLIDER + DIRECT CTA + EUROPEAN VECTORS)      */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950/70 pt-10 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        {/* Glow ambient orbs */}
        <div className="absolute top-0 right-1/4 -z-10 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/4 -z-10 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 -z-10 w-[700px] h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Subtle background landmark vector silhouettes */}
        <div className="absolute top-8 left-8 text-slate-800/40 pointer-events-none hidden md:block">
          <EiffelTowerVector className="w-28 h-28 transform -rotate-6 opacity-30" />
        </div>
        <div className="absolute top-12 right-12 text-slate-800/40 pointer-events-none hidden md:block">
          <BrandenburgGateVector className="w-32 h-32 opacity-25" />
        </div>
        <div className="absolute bottom-6 right-1/4 text-slate-800/30 pointer-events-none hidden lg:block">
          <ColosseumVector className="w-28 h-28 opacity-25" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Top Micro-Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-6 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>سامانه رسمی تصمیم‌یار مهاجرت | منطبق بر آخرین قوانین ویزای ۲۰۲۶</span>
          </div>

          {/* DYNAMIC TEXT SLIDER (Punchy titles <= 10 words) */}
          <div className="min-h-[170px] sm:min-h-[190px] flex flex-col items-center justify-center mb-6">
            <div className="inline-block mb-3 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-xs font-bold text-teal-300">
              {HERO_SLIDES[activeSlide].badge}
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight sm:leading-snug font-sans transition-all duration-500">
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                {HERO_SLIDES[activeSlide].title}
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 mt-3 font-medium transition-opacity duration-300">
              {HERO_SLIDES[activeSlide].subtitle}
            </p>
          </div>

          {/* Slider Dots */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                aria-label={`اسلاید ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  activeSlide === idx
                    ? "w-8 bg-gradient-to-r from-emerald-400 to-teal-400 shadow-md shadow-emerald-500/40"
                    : "w-2.5 bg-slate-700 hover:bg-slate-600"
                }`}
              />
            ))}
          </div>

          {/* DIRECT HERO CTA BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
            <button
              onClick={onStartAssessment}
              className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-3 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
            >
              <span>شروع ارزیابی هوشمند و دریافت ۳ مقصد برتر</span>
              <ArrowLeft className="w-5 h-5 text-slate-950" />
            </button>

            {onViewCatalog && (
              <button
                onClick={onViewCatalog}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>کاتالوگ و قوانین ۳۰ کشور</span>
              </button>
            )}

            {onOpenResume && (
              <button
                onClick={onOpenResume}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>رزومه‌یار بین‌المللی ATS</span>
              </button>
            )}
          </div>

          {/* Quick Stats Bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400 font-medium pt-4 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>بیش از ۱۲,۰۰۰ ارزیابی تخصصی ثبت‌شده</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-teal-400" />
              <span>تحلیل ۳۰ مقصد مهاجرپذیر (کانادا، اروپا، استرالیا)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>۱۰۰٪ الگوریتمی، مستقل و بدون ذی‌نفعی تجاری</span>
            </div>
          </div>
        </div>

        {/* European Skyline Horizon at Hero Bottom */}
        <div className="mt-12 text-slate-900/80 opacity-60">
          <EuropeanSkylineHorizon className="w-full h-16 sm:h-20" />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. EUROPEAN DESTINATIONS SHOWCASE STRIP (VISUAL & LANDMARKS)             */}
      {/* ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-extrabold text-teal-400 bg-teal-950/70 border border-teal-800/70 px-3 py-1 rounded-full uppercase">
            مقصدهای محبوب اروپایی
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
            شرایط شما با کدام شهرهای اروپایی سازگارتر است؟
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {europeanDestinations.map((dest, idx) => {
            const Icon = dest.icon;
            return (
              <div
                key={idx}
                className={`relative bg-gradient-to-b from-slate-900 to-slate-900/90 rounded-3xl p-6 border ${dest.accent} transition-all duration-300 hover:scale-[1.02] shadow-lg flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      {dest.country}
                    </span>
                    <div className="p-2 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-slate-300">
                      <Icon className="w-9 h-9" />
                    </div>
                  </div>
                  <h3 className="text-lg font-black text-white mb-2">{dest.city}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{dest.highlights}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-emerald-400">
                  <span>بررسی شانس در فرم ارزیابی</span>
                  <ArrowLeft className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. CORE EXPLANATION & PILLARS SECTION (THE MOVED DETAILED DESCRIPTIONS)   */}
      {/* ========================================================================= */}
      <section className="relative bg-gradient-to-b from-indigo-950/90 via-slate-900 to-slate-950 py-16 px-4 sm:px-6 lg:px-8 border-y border-indigo-900/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-extrabold text-cyan-400 bg-cyan-950/80 border border-cyan-800/80 px-3.5 py-1 rounded-full uppercase">
              شفافیت به جای سردرگمی
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white mt-3 mb-4">
              چرا کوچیفای را ساختیم و چگونه به شما کمک می‌کند؟
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              به جای ماه‌ها جستجوی فرسایشی در گروه‌های مجازی و شنیدن ادعاهای سلیقه‌ای دفاتر سنتی، سن،
              سوابق تحصیلی، شغلی، سطح زبان و بودجه‌تان را با مقررات رسمی ۳۰ کشور برتر جهان می‌سنجیم تا در
              کمتر از ۵ دقیقه بهترین مسیر زندگی‌تان را پیدا کنید.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1 */}
            <div className="bg-slate-900/80 rounded-3xl p-6 border border-slate-800 hover:border-emerald-500/50 transition-all shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-white mb-2">موتور تطبیق الگوریتمی</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                رزومه شما را در ماتریس داده‌ای ۳۰ کشور می‌چرخانیم تا کشورهایی که بیشترین شانس اخذ ویزا را در
                سال ۲۰۲۶ دارند، بدون خطا مشخص شوند.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="bg-slate-900/80 rounded-3xl p-6 border border-slate-800 hover:border-teal-500/50 transition-all shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-white mb-2">محاسبه واقعی تمکن مالی</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                کف تمکن مالی رسمی سفارت و هزینه واقعی ۶ تا ۱۲ ماه اول زندگی در مقصد، تفکیک‌شده و با نرخ روز
                ارز در اختیارتان قرار می‌گیرد.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="bg-slate-900/80 rounded-3xl p-6 border border-slate-800 hover:border-cyan-500/50 transition-all shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-white mb-2">شناسایی ریسک‌های ریجکتی</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                گپ تحصیلی، سن حساس، عدم تطابق رشته با شغل و کسری نمره زبان شناسایی شده و راهکار قانونی رفع
                آن‌ها در گزارش ثبت می‌شود.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="bg-slate-900/80 rounded-3xl p-6 border border-slate-800 hover:border-amber-500/50 transition-all shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-white mb-2">چک‌لیست مکتوب اقدامات</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                نقشه راه ماه به ماه از آماده‌سازی مدارک و آزمون زبان تا مکاتبه، اخذ پذیرش یا جاب‌آفر و مصاحبه
                سفارت، گام‌به‌گام ترسیم می‌شود.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. STEP-BY-STEP ROADMAP (فرآیند ۳ گام شفاف)                             */}
      {/* ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-extrabold text-amber-400 bg-amber-950/80 border border-amber-800/80 px-3 py-1 rounded-full uppercase tracking-wider">
            فرآیند ساده و سریع
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-3 mb-2">
            مسیر رسیدن به پرونده مهاجرتی مستند؛ در ۳ گام شفاف
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            بدون فرم‌های اداری پیچیده و بدون فوت وقت، از نقطه ابهام به نقشه راه عملیاتی برسید
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Step 1 */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl p-6 border border-slate-800 shadow-md relative flex flex-col justify-between hover:border-amber-500/40 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-black text-lg mb-4">
                ۱
              </div>
              <h3 className="text-base font-extrabold text-white mb-2">
                ورود آنی فقط با شماره موبایل
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                پرونده شما در یک چشم‌به‌هم‌زدن با پیامک تایید ایجاد می‌شود؛ بدون نیاز به ثبت‌نام‌های طولانی یا
                سپردن اطلاعات هویتی و بانکی حساس.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-2 text-[11px] text-amber-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>احراز هویت پیامکی امن و محرمانه</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl p-6 border border-slate-800 shadow-md relative flex flex-col justify-between hover:border-teal-500/40 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center font-black text-lg mb-4">
                ۲
              </div>
              <h3 className="text-base font-extrabold text-white mb-2">
                پاسخ به ۷ شاخص کلیدی پرونده
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                سن، آخرین مدرک تحصیلی، سوابق شغلی، سطح حدودی زبان و بازه بودجه مالی را مشخص کنید. اگر مدرک
                زبان ندارید، نمره تخمینی کفایت می‌کند.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-2 text-[11px] text-teal-400 font-bold">
              <Clock className="w-4 h-4" />
              <span>مدت زمان: حدود ۳ تا ۵ دقیقه</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl p-6 border border-slate-800 shadow-md relative flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-black text-lg mb-4">
                ۳
              </div>
              <h3 className="text-base font-extrabold text-white mb-2">
                تحلیل ۳ مقصد طلایی و گزارش جامع
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                موتور هوشمند تطبیق، سازگارترین کشورها را بر مبنای قوانین ۲۰۲۶ استخراج کرده و شانس ویزا،
                هزینه‌های واقعی زندگی و چک‌لیست ماه به ماه را تحویل می‌دهد.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-2 text-[11px] text-emerald-400 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>ارائه گزارش مکتوب، شفاف و قابل استناد</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. COMPARISON SECTION (کوچیفای در برابر روش‌های سنتی)                     */}
      {/* ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-extrabold text-rose-400 bg-rose-950/80 border border-rose-800/80 px-3 py-1 rounded-full uppercase">
              چرا کوچیفای متفاوت است؟
            </span>
            <h2 className="text-xl sm:text-3xl font-black mt-3 mb-2">
              پایان عصر مشاوره‌های سلیقه‌ای و ادعاهای واهی مهاجرتی
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              تفاوت رویکرد علمی داده‌محور با دفاتر واسطه‌ای که به نفع خودشان مشاوره می‌دهند:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Traditional Offices (Rose Accent) */}
            <div className="bg-rose-950/20 p-6 rounded-2xl border border-rose-800/40">
              <h4 className="text-sm font-bold text-rose-400 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>روش‌های سنتی و دفاتر تجاری:</span>
              </h4>
              <ul className="space-y-3 text-xs text-rose-200/80 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>
                    اصرار بر کشورهایی که خود دفتر در آن نماینده دارد یا کمیسیون سودآور دریافت می‌کند (نه
                    لزوماً بهترین مقصد شما).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>
                    ادعاهای وسوسه‌انگیز و غیرواقعی «ویزای ۱۰۰٪ تضمینی» و پنهان‌سازی شرایط سفت‌وسخت ریجکتی
                    سفارت‌ها.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>
                    دریافت هزینه‌های سنگین چند میلیونی برای یک جلسه مشاوره شفاهی و کلی، بدون ارائه برنامه مکتوب و
                    مسئولانه.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>
                    اطلاعات تاریخ‌گذشته و بی‌اطلاعی از دگرگونی‌های سخت‌گیرانه سال ۲۰۲۶ در پذیرش مهاجران.
                  </span>
                </li>
              </ul>
            </div>

            {/* Koochify (Emerald Accent) */}
            <div className="bg-emerald-950/30 p-6 rounded-2xl border border-emerald-500/40">
              <h4 className="text-sm font-bold text-emerald-400 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>سامانه تصمیم‌یار هوشمند کوچیفای:</span>
              </h4>
              <ul className="space-y-3 text-xs text-emerald-100 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>
                    مقایسه بی‌طرفانه و همزمان بین ۳۰ کشور دنیا فقط بر اساس تطابق رزومه با آیین‌نامه‌های رسمی
                    سفارت‌ها.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>
                    شفاف‌سازی شجاعانه نقاط ضعف پرونده، ریسک‌های پنهان ریجکتی و کف تمکن مالی بدون سانسور.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>
                    دسترسی به برنامه ماه به ماه اقدامات، چک‌لیست جمع‌آوری مدارک و ابزار رزومه‌یار بین‌المللی ATS.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>
                    گزارش تحلیلی کامل با یک بار پرداخت کاملاً منصفانه و شفاف بدون تعهدات میلیونی اجباری.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. FAQ ACCORDION SECTION                                                 */}
      {/* ========================================================================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-white mb-2">پرسش‌های پرتکرار متقاضیان</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            پاسخ شفاف به مهم‌ترین دغدغه‌هایی که پیش از شروع ارزیابی ممکن است داشته باشید
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xs transition-all hover:border-slate-700"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-4.5 text-right flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-200 hover:text-emerald-400 transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-4.5 pb-4.5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. BOTTOM HERO CTA BANNER (WITH LANDMARK SILHOUETTES & GLOW)            */}
      {/* ========================================================================= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden border border-emerald-500/30">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-8 left-10 text-white/15 pointer-events-none">
            <EiffelTowerVector className="w-32 h-32" />
          </div>
          <div className="absolute -bottom-4 right-10 text-white/15 pointer-events-none">
            <ColosseumVector className="w-32 h-32" />
          </div>

          <div className="relative z-10">
            <h2 className="text-2xl sm:text-4xl font-black mb-4">
              آینده شما مهم‌تر از آن است که به حدس و گمان سپرده شود!
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl mx-auto leading-relaxed mb-8">
              همین حالا در کمتر از ۵ دقیقه شرایط خود را بسنجید و مطمئن‌ترین نقشه راه مهاجرتی را بر مبنای
              قوانین ۲۰۲۶ تحویل بگیرید.
            </p>

            <button
              onClick={onStartAssessment}
              className="px-9 py-4 bg-white hover:bg-emerald-50 text-emerald-950 rounded-2xl font-black text-sm sm:text-base shadow-xl transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-2.5 cursor-pointer"
            >
              <span>شروع ارزیابی هوشمند و دریافت نقشه راه</span>
              <ArrowLeft className="w-5 h-5 text-emerald-700" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
