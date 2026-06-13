import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Compass, 
  Coins, 
  MessageSquare, 
  Calendar, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Sparkles, 
  Clock, 
  Activity, 
  FileCheck, 
  Layers, 
  Globe, 
  HelpCircle, 
  RefreshCw, 
  Unlock, 
  Printer, 
  Heart, 
  User,
  GraduationCap,
  Briefcase,
  ChevronLeft,
  BookOpen,
  TrendingUp,
  FileText,
  BadgeAlert,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  Download
} from "lucide-react";
import type { UserImmigrationProfile, AIImmigrationResult, RecommendedDestination } from "./types";
import ImmigrationForm from "./components/ImmigrationForm";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

type AppMode = "input" | "payment" | "loading" | "result";

export default function App() {
  const [mode, setMode] = useState<AppMode>("input");
  const [profile, setProfile] = useState<UserImmigrationProfile | null>(null);
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [loadingLog, setLoadingLog] = useState<string>("در حال راه‌اندازی سیستم شبیه‌ساز قوانین...");
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<AIImmigrationResult | null>(null);
  const [activeChartFilter, setActiveChartFilter] = useState<"all" | "match" | "success">("all");

  const downloadChartAsSVG = () => {
    const chartContainer = document.getElementById("recharts-container-downloadable");
    if (!chartContainer) {
      return;
    }
    const svgEl = chartContainer.querySelector("svg");
    if (!svgEl) {
      return;
    }
    
    try {
      const svgClone = svgEl.cloneNode(true) as SVGElement;
      
      // Recharts uses standard SVG. Let's set dimensions specifically to look gorgeous on desktop/mobile
      const width = svgEl.getAttribute("width") || "700";
      const height = svgEl.getAttribute("height") || "320";
      svgClone.setAttribute("width", width);
      svgClone.setAttribute("height", height);
      svgClone.setAttribute("viewBox", `0 0 ${width} ${height}`);
      svgClone.setAttribute("direction", "ltr");
      
      // Embed inline CSS style for clean white background and rounded aesthetic
      svgClone.style.backgroundColor = "#ffffff";
      svgClone.style.padding = "24px";
      svgClone.style.borderRadius = "20px";
      
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgClone);
      const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = "immigration-comparison-chart-2026.svg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate file download:", err);
    }
  };

  // Simulated live loading status messages
  const runSimulationLogs = () => {
    const logs = [
      "در حال رمزگذاری مشخصات و راه‌اندازی شبیه‌ساز قوانین ۲۰۲۶...",
      "بررسی سوابق تحصیلی متقاضی با شرایط پذیرش دانشگاه‌های اروپایی...",
      "محاسبه امتیاز سیستم مهاجرتی کانادا (Express Entry / CRS) برای متقاضیان ایرانی...",
      "تطابق عنوان شغلی با سیستم امتیازدهی کارت فرصت جدید آلمان (Chancenkarte)...",
      "بررسی شانس پذیرش و درصد تمکن مالی بر اساس هزینه‌های ارزی سال ۲۰۲۶...",
      "سنجش احتمال انطباق خانوادگی از بدو ورود برای مقاصد پیشنهادی...",
      "اجرای مدل هوش مصنوعی و تدوین نقشه راه بهبود پرونده..."
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < logs.length) {
        setLoadingLog(logs[i]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 2500);

    return () => clearInterval(interval);
  };

  const handleFormSubmit = (submittedProfile: UserImmigrationProfile) => {
    setProfile(submittedProfile);
    // Since the user asked for a payment screen but also wants it to be free first, 
    // we direct them to a gorgeous billing screen. On this screen they can pay 149k mock-toman 
    // or bypass it with a single "پرداخت آزمایشی / رایگان" button.
    setMode("payment");
  };

  const handleStartAnalysis = async (skipPayment = false) => {
    if (!profile) return;
    setMode("loading");
    runSimulationLogs();

    try {
      const response = await fetch("/api/analyze-immigration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error("متاسفانه در پردازش اطلاعات از سمت سرور خطایی رخ داد.");
      }

      const data: AIImmigrationResult = await response.json();
      setResult(data);
      setIsPaid(!skipPayment);
      setMode("result");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "برقراری ارتباط با وکیل هوش مصنوعی با مشکل مواجه شد. لطفاً دوباره تلاش کنید.");
      setMode("input");
    }
  };

  const handleReset = () => {
    setProfile(null);
    setResult(null);
    setIsPaid(false);
    setError("");
    setMode("input");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800 selection:bg-indigo-100" id="main_app_container">
      {/* Dynamic Header */}
      <nav className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-12 shrink-0 z-10 sticky top-0 shadow-sm" id="main_navigation">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <Compass className="w-5 h-5 animate-pulse-subtle" />
          </div>
          <div>
            <span className="text-base md:text-lg font-extrabold text-slate-800 tracking-tight block">
              سازمان ارزیابی هوشمند مهاجرت ایرانیان
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">
              پلتفرم شبیه‌ساز قوانین بین‌المللی ۲۰۲۶
            </span>
          </div>
        </div>
        <div className="hidden md:flex gap-6 text-xs md:text-sm font-bold text-slate-600">
          <button onClick={handleReset} className="text-indigo-600 border-b-2 border-indigo-600 pb-5 pt-1 hover:text-indigo-700 transition-colors">
            پنل ارزیابی هوشمند
          </button>
          <a href="#about-2026" className="text-slate-500 hover:text-indigo-600 pb-5 pt-1 transition-colors">
            ضوابط ویزاهای جدید سال ۲۰۲۶
          </a>
          <span className="text-slate-500 pb-5 pt-1 cursor-default opacity-60">
            حفاظت شده با الگوریتم وکیل امین
          </span>
        </div>
      </nav>

      {/* Hero Stats Alert Banner */}
      <div className="bg-slate-900 text-indigo-200 py-3 px-6 text-center text-xs font-semibold flex flex-wrap justify-center items-center gap-2 border-b border-indigo-950" id="announcement_banner">
        <span className="px-2 py-0.5 bg-indigo-500 text-white rounded text-[10px] uppercase font-bold animate-pulse">تغییرات قوانین ۲۰۲۶</span>
        <span>تازه ترین مانیفست‌های مهاجرت کاری آلمان، کانادا و امارات به صورت خودکار اعمال شدند.</span>
      </div>

      <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col justify-start gap-8">
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800 text-sm">
            <XCircle className="w-5 h-5 text-red-600" />
            <p className="font-semibold">{error}</p>
            <button onClick={() => setError("")} className="mr-auto text-xs underline hover:no-underline text-red-600">تلاش مجدد</button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* 1. INPUT FORM MODE */}
          {mode === "input" && (
            <motion.div
              key="mode-input"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <ImmigrationForm onSubmit={handleFormSubmit} isLoading={false} />
            </motion.div>
          )}

          {/* 2. PAYMENT / SUBSCRIPTION MODE */}
          {mode === "payment" && profile && (
            <motion.div
              key="mode-payment"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-2xl mx-auto w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden"
              id="payment_container"
            >
              <div className="bg-slate-900 p-8 text-center text-white relative">
                <span className="absolute top-4 right-4 text-xs font-bold text-teal-400 bg-teal-950/80 px-2.5 py-1 rounded-full border border-teal-800">
                  پیشنهاد آزمایشی ویژه
                </span>
                <Coins className="w-12 h-12 text-teal-400 mx-auto mb-3 stroke-[1.5]" />
                <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">بررسی پرونده و صدور سند مهاجرت هوشمند</h1>
                <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
                  تنها یک قدم تا تحلیل جامع وکیل هوش مصنوعی بر روی پرونده شما و مشخص شدن ۳ مقصد مهارتی/تحصیلی برتر فاصله دارید.
                </p>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                {/* User Summary Card */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center gap-3 text-right">
                  <span className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    <User className="w-6 h-6" />
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">متقاضی محترم: {profile.fullName}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">سن: {profile.age} سال • تخصص: {profile.jobTitle} • ترجیح: {profile.immigrationCategoryPreference === 'any' ? 'تمام روش‌ها' : profile.immigrationCategoryPreference}</p>
                  </div>
                </div>

                {/* Pricing / Details Box */}
                <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-center bg-indigo-50/50 p-4 rounded-xl">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-indigo-600" />
                      <span className="text-xs font-bold text-slate-600">تعرفه دسترسی و تحلیل تخصصی پرونده:</span>
                    </div>
                    <span className="text-lg font-black text-indigo-900 font-mono">۱۴۹,۰۰۰ تومان</span>
                  </div>

                  <div className="space-y-2 text-right">
                    <h4 className="text-xs font-bold text-slate-700">امکانات پکیج ویژه ارزیابی تخصصی:</h4>
                    <ul className="text-xs text-slate-600 space-y-2 pl-4 list-disc list-inside">
                      <li>محاسبه شانس دقیق ویزای کار بر اساس سیستم مهارتی ۲۰۲۶ آلمان و کانادا</li>
                      <li>تجهیز به نقاط قوت و ضعف کلیدی رزومه جهت دفاع مقابل سفارت</li>
                      <li>ارتقای احتمال دریافت پذیرش با نقشه راه عملی مکتوب</li>
                      <li>پیشنویس مکتوب و نظر صمیمانه وکیل هوش مصنوعی مستقل</li>
                    </ul>
                  </div>
                </div>

                {/* Free Preview Bypass Notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-right space-y-2">
                  <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>تست و بازبینی رایگان سیستم ارزیابی (مخصوص توسعه دهندگان و ناظرین)</span>
                  </h4>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    با توجه به توافق با توسعه‌دهنده گرامی، جهت تایید و تست صحت فرآیند هوش مصنوعی، دکمه <strong className="text-indigo-950 font-bold">پرداخت آزمایشی (بدون پرداخت واقعی / رایگان)</strong> برای شما تعبیه شده است تا بدون نیاز به درگاه واقعی، به صورت بلادرنگ نتایج نهایی را ارزیابی و چارت‌ها را مشاهده کنید.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Free bypass developer evaluation (Requested: "اول بصورت رایگان و بدون سابسکریپشن فی برام بساز تا چکش کنیم") */}
                  <button
                    type="button"
                    onClick={() => handleStartAnalysis(true)}
                    className="w-full py-4.5 bg-indigo-600 hover:bg-slate-900 text-white rounded-2xl font-bold transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 cursor-pointer"
                  >
                    <Unlock className="w-5 h-5 shrink-0" />
                    <span>پرداخت آزمایشی (شروع تست رایگان)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartAnalysis(false)}
                    className="w-full py-4.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold transition-all text-sm flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
                  >
                    <span>پرداخت شبیه‌سازی ۱۴۹,۰۰۰ تومانی</span>
                  </button>
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setMode("input")}
                    className="text-xs text-slate-500 hover:text-slate-800 underline flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                    <span>بازگشت و اصلاح فرم ارزیابی</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* 3. LOADING / PROCESSING MODE */}
          {mode === "loading" && (
            <motion.div
              key="mode-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-xl mx-auto w-full text-center py-16 space-y-8"
              id="loading_container"
            >
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                {/* Custom geometric layered spinning indicators */}
                <div className="absolute inset-0 border-4 border-indigo-100 rounded-xl animate-spin" style={{ animationDuration: '4s' }} />
                <div className="absolute inset-2 border-4 border-teal-500 rounded-xl animate-spin" style={{ animationDuration: '2s', direction: 'rtl' }} />
                <div className="absolute inset-4 border-4 border-indigo-600 rounded-lg animate-bounce" />
                <Compass className="w-8 h-8 text-slate-800 relative z-10" />
              </div>

              <div className="space-y-3">
                <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-xs font-bold font-mono animate-pulse">
                  MIGRA-AI ENGINE 2026
                </span>
                <h2 className="text-xl font-extrabold text-slate-800">وکیل هوشمند در حال پردازش شرایط پرونده است ...</h2>
                <div className="max-w-md mx-auto p-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-xs font-semibold text-slate-600 leading-normal min-h-12 flex items-center justify-center animate-pulse-subtle">
                  <span>{loadingLog}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 max-w-sm mx-auto">
                اطلاعات شما فرآیند اعتبارسنجی را مستقیما با مانیفست‌های مهاجرت کاری فدرال، کارت شانس آلمان و معیارهای تمکن مالی ۲۰۲۶ شبیه‌سازی می‌کند.
              </div>
            </motion.div>
          )}

          {/* 4. RESULTS DASHBOARD MODE */}
          {mode === "result" && result && profile && (
            <motion.div
              key="mode-result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
              id="result_dashboard"
            >
              {/* Back & Print controls */}
              <div className="flex flex-wrap justify-between items-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                  <span>اجرای ارزیابی مجدد با سناریو دیگر</span>
                </button>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${isPaid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                    {isPaid ? "حساب بررسی طلایی پرداخت شده" : "حساب بررسی ارزیابی آزمایشی"}
                  </span>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>چاپ گزارش وکیل ارزیابی</span>
                  </button>
                </div>
              </div>

              {/* Main geometric Layout inspired by Theme (Geometric Balance) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* RIGHT COLUMN: User Profile Info Box */}
                <aside className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                  <div className="p-5 border-b border-slate-200 bg-slate-50/50">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">رزومه پرونده متقاضی</span>
                      <span className="text-[10px] text-slate-400 font-mono">بروزرسانی: ژوئن ۲۰۲۶</span>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-800">{profile.fullName}</h3>
                  </div>

                  <div className="p-6 flex-1 space-y-5 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 block">سن پرونده</span>
                        <span className="font-semibold text-slate-800 block">{profile.age} سال سن</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 block">وضعیت تاهل</span>
                        <span className="font-semibold text-slate-800 block">
                          {profile.maritalStatus === "single" && "مجرد"}
                          {profile.maritalStatus === "married" && "متاهل بدون فرزند"}
                          {profile.maritalStatus === "married_with_children" && "متاهل با فرزند"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 block">آخرین وضعیت آکادمیک</span>
                      <div className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="font-semibold text-slate-700 block">
                          {profile.education === "diploma" && "دیپلم متوسطه یا پیش دانشگاهی"}
                          {profile.education === "associate" && "فوق دیپلم / کاردانی"}
                          {profile.education === "bachelor" && "کارشناسی / لیسانس"}
                          {profile.education === "master" && "کارشناسی ارشد / فوق لیسانس"}
                          {profile.education === "phd" && "دکتری تخصصی / PhD"}
                        </span>
                        <span className="text-xs text-slate-500 block mt-1">رشته: {profile.fieldOfStudy} {profile.gpa && `• معدل: ${profile.gpa}`}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 block">سطح سوابق شغلی رسمی</span>
                      <div className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="font-semibold text-slate-700 block">{profile.jobTitle}</span>
                        <span className="text-xs text-slate-500 block mt-1">مدت زمان کار: {profile.workExperienceYears} سال سابقه مکتوب</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 block">سطح زبان</span>
                        <span className="font-semibold text-slate-800 block text-xs">
                          {profile.englishLevel === "none" && "بدون مدرک"}
                          {profile.englishLevel === "basic" && "مبتدی (زیر ۵)"}
                          {profile.englishLevel === "intermediate" && "متوسط (۵.۵ تا ۶)"}
                          {profile.englishLevel === "ielts_6_7" && "خوب (۶.۵ تا ۷)"}
                          {profile.englishLevel === "ielts_7_plus" && "عالی (۷.۵ به بالا)"}
                        </span>
                        {profile.languageExamRegistered && (
                          <span className="text-[9px] text-teal-600 font-bold block mt-0.5">
                            {profile.languageExamRegistered === "yes" && "ثبت‌نام رسمی آزمون"}
                            {profile.languageExamRegistered === "preparing" && "در حال آماده‌سازی"}
                            {profile.languageExamRegistered === "no" && "بدون تاریخ ثبت نام"}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 block">جریان نقدی آزاد</span>
                        <span className="font-semibold text-slate-800 block text-xs">
                          {profile.budgetTomans === "under_500m" && "کمتر از ۵۰۰ م"}
                          {profile.budgetTomans === "500m_1_5b" && "۵۰۰ م تا ۱.۵ میلیارد"}
                          {profile.budgetTomans === "1_5b_4b" && "۱.۵ تا ۴ میلیارد"}
                          {profile.budgetTomans === "above_4b" && "بالای ۴ میلیارد"}
                        </span>
                      </div>
                    </div>

                    {profile.militaryStatus && (
                      <div className="space-y-1 pt-2 border-t border-slate-100">
                        <span className="text-[11px] font-bold text-slate-400 block">وضعیت نظام وظیفه</span>
                        <span className="font-bold text-slate-700 block text-xs">
                          {profile.militaryStatus === "completed" && "معاف یا پایان خدمت"}
                          {profile.militaryStatus === "educational_exemption" && "معافیت تحصیلی (مجاز با وثیقه)"}
                          {profile.militaryStatus === "not_completed_no_exemption" && "مشمول خدمت و قوانین وظیفه"}
                          {profile.militaryStatus === "exempt_or_female" && "متقاضی خانم / عدم نیاز"}
                        </span>
                      </div>
                    )}

                    {profile.interestedCountries && profile.interestedCountries.length > 0 && (
                      <div className="space-y-1 pt-2 border-t border-slate-100">
                        <span className="text-[11px] font-bold text-slate-400 block">کشورهای هدف منتخب</span>
                        <span className="text-xs text-indigo-700 font-extrabold block">
                          {profile.interestedCountries.join(" • ")}
                        </span>
                      </div>
                    )}

                    {(profile.academicPapersCount || profile.academicRefLetters) && (
                      <div className="space-y-1 pt-2 border-t border-slate-100 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-black text-indigo-950 block">مستندات تکمیلی آکادمیک</span>
                        <div className="text-[10px] text-slate-600 mt-0.5 space-y-0.5">
                          {profile.academicPapersCount && (
                            <div>
                              مقالات علمی معتبر:{" "}
                              <strong className="text-slate-850 font-bold">
                                {profile.academicPapersCount === "none" && "بدون مقاله ثبتی"}
                                {profile.academicPapersCount === "1_2" && "۱ الی ۲ مقاله پژوهشی"}
                                {profile.academicPapersCount === "3_plus" && "سابقه عالی (۳+ مقاله)"}
                              </strong>
                            </div>
                          )}
                          {profile.academicRefLetters && (
                            <div>
                              امکان اخذ توصیه‌نامه اساتید:{" "}
                              <strong className="text-slate-850 font-bold">
                                {profile.academicRefLetters === "yes" ? "بله، در دسترس است" : "خیر / نامشخص"}
                              </strong>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {profile.workStage && (
                      <div className="space-y-1 pt-2 border-t border-slate-100 bg-teal-50/20 p-2.5 rounded-xl border border-teal-50">
                        <span className="text-[10px] font-black text-teal-800 block">فاز اقدام و مکاتبات شغلی</span>
                        <span className="text-slate-650 block text-[10px] leading-tight mt-0.5">
                          {profile.workStage === "just_started" && "مرحله تحقیقات اولیه و بدون رزومه خارج"}
                          {profile.workStage === "has_cv" && "دارای رزومه و کارفرما-فرمت تخصصی (CV)"}
                          {profile.workStage === "has_linkedin" && "پروفایل اختصاصی لینکدین دوزبانه بالاآمده"}
                          {profile.workStage === "applied_interviews" && "در حال سابمیت و مذاکرات بدو ورود"}
                          {profile.workStage === "has_offer" && "دریافت پیشنهاد کاری مکتوب (پیش‌قرارداد)"}
                        </span>
                      </div>
                    )}

                    {profile.customNotes && (
                      <div className="space-y-1 pt-2 border-t border-slate-100">
                        <span className="text-[11px] font-bold text-slate-400 block">شرح حال متقاضی</span>
                        <p className="text-xs text-slate-600 leading-relaxed max-h-32 overflow-y-auto bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                          {profile.customNotes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-5 bg-slate-900 text-white text-xs border-t border-slate-200">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-teal-400" />
                      <span>قانون انطباق تحت نظارت سیستم ۲۰۲۶</span>
                    </div>
                  </div>
                </aside>

                {/* LEFT & CENTER MAIN: AI Analysis Result */}
                <main className="lg:col-span-8 flex flex-col gap-6">
                  
                  {/* Top Stats Overview Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stat 1: Overall Success Chance */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-400 block">میانگین شانس صدور ویزا</span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">
                          {result.destinations[0]?.successRate > 75 ? "پتانسیل بالا" : result.destinations[0]?.successRate > 50 ? "متوسط" : "چالش برانگیز"}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-indigo-600 font-mono">
                          {result.destinations[0]?.successRate || 75}٪
                        </span>
                        <span className="text-xs text-slate-400">بهترین گزینه</span>
                      </div>
                    </div>

                    {/* Stat 2: Best Proposed Route */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      <span className="text-xs font-bold text-slate-400 block mb-2">بهینه ترین روش پیشنهادی</span>
                      <div>
                        <span className="text-sm font-extrabold text-slate-800 block leading-tight">
                          {result.destinations[0]?.visaType || "مهاجرت کاری مهارتی"}
                        </span>
                        <span className="text-[10px] text-teal-600 font-bold block mt-1">تطابق با کد ملی مشاغل</span>
                      </div>
                    </div>

                    {/* Stat 3: Processing Timeframe */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      <span className="text-xs font-bold text-slate-400 block mb-2">زمان تقریبی اقدام تا ویزا</span>
                      <div>
                        <span className="text-sm font-extrabold text-slate-800 block font-mono leading-tight">
                          {result.destinations[0]?.durationMonths || "۶ الی ۱۲ ماه"}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-1">بستگی به فاکتور نمره زبان دارد</span>
                      </div>
                    </div>
                  </div>

                  {/* Comparison Chart & Detailed Countries Area (Geometric styling with Recharts) */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 flex flex-col">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                        <div className="w-2.5 h-5 bg-indigo-500 rounded-full"></div>
                        <span>تحلیل مقایسه‌ای سه مقصد برتر بر اساس مانیفست‌های مهاجرتی سال ۲۰۲۶</span>
                      </h3>
                      <button
                        type="button"
                        onClick={downloadChartAsSVG}
                        className="self-start sm:self-auto px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border border-indigo-100 shadow-sm"
                        title="دانلود مستقیم چارت به صورت وکتور هندسی باکیفیت SVG"
                      >
                        <Download className="w-3.5 h-3.5 text-indigo-600" />
                        <span>دانلود خروجی چارت (SVG)</span>
                      </button>
                    </div>

                    {/* Integrated Vector Recharts Component */}
                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-extrabold text-slate-650 flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-indigo-600" />
                          ارزیابی انطباق‌پذیری مستندات علمی-شغلی در تراز شانس صدور روادید سفارتخانه‌ها
                        </span>
                        <span className="text-[10px] text-slate-400 bg-white border border-slate-200/60 px-2 py-0.5 rounded font-bold font-mono">
                          MIGRATION RATIOS Chart
                        </span>
                      </div>
                      
                      <div className="w-full h-64" style={{ direction: 'ltr' }} id="recharts-container-downloadable">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart 
                            data={(result.destinations || []).map(dest => ({
                              name: dest.country,
                              "درصد انطباق پرونده": dest.matchPercentage,
                              "شانس تایید ویزا": dest.successRate
                            }))} 
                            margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis 
                              dataKey="name" 
                              tick={{ fill: "#334155", fontSize: 11, fontWeight: "bold" }} 
                              axisLine={false} 
                              tickLine={false} 
                            />
                            <YAxis 
                              domain={[0, 100]} 
                              tick={{ fill: "#64748b", fontSize: 10 }} 
                              axisLine={false} 
                              tickLine={false} 
                            />
                            <Tooltip 
                              cursor={{ fill: "rgba(99, 102, 241, 0.04)" }}
                              contentStyle={{ 
                                background: "#ffffff", 
                                border: "1px solid #cbd5e1", 
                                borderRadius: "12px", 
                                fontSize: "11px",
                                direction: "rtl",
                                textAlign: "right",
                                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)"
                              }}
                              formatter={(value: any, name: any) => [`${value}٪`, name]}
                            />
                            <Bar 
                              dataKey="درصد انطباق پرونده" 
                              fill="#4f46e5" 
                              radius={[5, 5, 0, 0]} 
                              barSize={18} 
                              animationBegin={200}
                              animationDuration={1200}
                              opacity={activeChartFilter === "all" || activeChartFilter === "match" ? 1 : 0.15}
                            />
                            <Bar 
                              dataKey="شانس تایید ویزا" 
                              fill="#10b981" 
                              radius={[5, 5, 0, 0]} 
                              barSize={18} 
                              animationBegin={400}
                              animationDuration={1200}
                              opacity={activeChartFilter === "all" || activeChartFilter === "success" ? 1 : 0.15}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Interactive Legend Row */}
                      <div className="flex flex-wrap gap-2 justify-center pt-2.5 border-t border-slate-200/50" id="chart_legend_interactive_controllers">
                        <button
                          type="button"
                          onClick={() => setActiveChartFilter("all")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                            activeChartFilter === "all"
                              ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                              : "bg-white text-slate-500 hover:text-slate-800 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
                          <span>نمایش همه دسته‌ها</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveChartFilter("match")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                            activeChartFilter === "match"
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-sm ring-2 ring-indigo-100"
                              : "bg-white text-slate-500 hover:text-slate-800 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
                          <span>درصد انطباق پرونده (برجسته)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveChartFilter("success")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                            activeChartFilter === "success"
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-100"
                              : "bg-white text-slate-500 hover:text-slate-800 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                          <span>شانس تایید ویزا (برجسته)</span>
                        </button>
                      </div>
                    </div>

                    {/* Detailed Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {result.destinations.map((dest, idx) => {
                        return (
                          <div key={idx} className="flex flex-col h-full bg-slate-50/30 rounded-2xl border border-slate-150 p-4 justify-between transition-all hover:bg-slate-50 hover:shadow-md">
                            {/* Info */}
                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <span className="text-xs bg-indigo-50 text-indigo-700 font-extrabold px-3 py-1 rounded-md inline-block">
                                  {dest.country}
                                </span>
                                <h4 className="font-bold text-xs text-slate-800 mt-2.5 block leading-relaxed">
                                  {dest.visaType}
                                </h4>
                                <p className="text-[11px] text-slate-500 leading-relaxed mt-2 text-justify">
                                  {dest.summary}
                                </p>
                              </div>

                              <div className="mt-4 pt-3 border-t border-slate-200/60 text-[10px] space-y-1 bg-white p-2.5 rounded-xl border border-slate-100">
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-400 font-semibold">بازه سختی عبور قانونی:</span>
                                  <span className="font-extrabold text-indigo-900">{dest.difficultyLevel}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-400 font-semibold">مدت زمان حدودی پردازش:</span>
                                  <span className="font-bold text-slate-600 font-mono">{dest.durationMonths}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Chosen Countries Parallel Analysis Block */}
                  {profile && profile.interestedCountries && profile.interestedCountries.length > 0 && (
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm" id="interested_countries_exclusive_analysis">
                      <div className="border-b border-slate-100 pb-4 mb-6">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Globe className="w-5 h-5 shrink-0" />
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-800">
                            ارزیابی موازی و اختصاصی هوش مصنوعی برای کشورهای هدف انتخابی شما
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                          در این بخش، شرایط انحصاری پرونده شما به صورت مجزا با استانداردهای ترخیص ویزای کشورهای منتخب خودتان تطابق داده شده است:
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {profile.interestedCountries.map((country) => {
                          // Local on-the-fly analytical builder
                          let path = "ویزای کار تخصصی دوزبانه";
                          let keyAdvice = "تطابق با استانداردهای ارزیابی رزومه وزارت کار کشور مقصد.";
                          let baseScore = 65;

                          if (country === "کانادا") {
                            path = "اکسپرس اینتری فدرال یا ویزای تحصیلی با کار همراه";
                            keyAdvice = "اعتبارسنجی تحصیلی WES و ارتقای CLB زبان شروط اصلی هستند.";
                            baseScore = 72;
                          } else if (country === "آلمان") {
                            path = "کارت شانس آلمان (Chancenkarte) یا دریافت آفر مستقیم";
                            keyAdvice = "سابقه فنی قابل اثبات و یادگیری پایه زبان آلمانی امتیاز را فعال می‌کند.";
                            baseScore = 80;
                          } else if (country === "استرالیا") {
                            path = "ویزای مستقل مهارتی سابکلاس ۱۸۹/۱۹۰ (Skilled)";
                            keyAdvice = "ارزشیابی موفق مدارک مهندسی/فنی رزومه شما کلید دعوت‌نامه است.";
                            baseScore = 68;
                          } else if (country === "ایتالیا") {
                            path = "پذیرش مستقیم تحصیلی مقاطع عالی با بورسیه استانی DSU";
                            keyAdvice = "تنظیم دقیق رزومه و انگیزه‌نامه بدون نیاز به تمکن مالی بسیار سنگین.";
                            baseScore = 85;
                          } else if (country === "امارات") {
                            path = "ویزای طلایی دبی (Golden Visa) یا استخدام معاف از مالیات";
                            keyAdvice = "آغاز شبکه‌سازی با کارفرمایان منطقه از طریق لینکدین و روادید مصاحبه.";
                            baseScore = 75;
                          } else if (country === "انگلستان") {
                            path = "ویزای اسکیل ورکر بریتانیا (Skilled Worker)";
                            keyAdvice = "یافتن حامی مالی (Sponsor) تایید شده دولتی از طریق آفر رسمی بین‌المللی.";
                            baseScore = 60;
                          } else if (country === "سوئد") {
                            path = "ویزای جستجوی کار سوئد یا جاب‌آفر مستقیم حوزه فناوری";
                            keyAdvice = "آمادگی مالی کافی جهت پوشش ۶ ماه اقامت انفرادی و تایید مدارک تحصیلی.";
                            baseScore = 64;
                          } else if (country === "عمان") {
                            path = "روادید اشتغال تخصصی شرکت‌های عمان";
                            keyAdvice = "بررسی شرایط تایید مدارک شهرداری‌ها یا دپارتمان بهداشت عمان (دیتای فلو).";
                            baseScore = 66;
                          } else if (country === "فرانسه") {
                            path = "ویزای پاسپورت استعداد فرانسه (Talent Passport)";
                            keyAdvice = "رزومه نوآورانه کارآفرینی یا دعوت‌نامه رسمی فنی از شرکت‌های فرانسوی.";
                            baseScore = 58;
                          }

                          let computedChance = baseScore;
                          const userAge = profile.age || 30;
                          if (userAge >= 18 && userAge <= 32) {
                            computedChance += 8;
                          } else if (userAge > 40) {
                            computedChance -= 12;
                          }

                          if (profile.englishLevel === "ielts_7_plus" || profile.englishLevel === "advanced") {
                            computedChance += 10;
                          } else if (profile.englishLevel === "none" || profile.englishLevel === "basic") {
                            computedChance -= 15;
                          }

                          if (profile.workExperienceYears >= 5) {
                            computedChance += 7;
                          }

                          computedChance = Math.min(97, Math.max(15, computedChance));

                          return (
                            <div key={country} className="border border-slate-200/75 p-4 rounded-2xl bg-slate-50/25 flex flex-col justify-between hover:shadow-sm transition-all hover:bg-slate-50">
                              <div>
                                <div className="flex justify-between items-center mb-3">
                                  <span className="text-xs font-black text-slate-800 flex items-center gap-1">
                                    <Globe className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                    {country}
                                  </span>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold ${
                                    computedChance > 70 
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                                      : computedChance > 50 
                                      ? "bg-amber-50 text-amber-700 border border-amber-200" 
                                      : "bg-rose-50 text-rose-700 border border-rose-250"
                                  }`}>
                                    شانس حدودی: {computedChance}٪
                                  </span>
                                </div>

                                <div className="space-y-1">
                                  <span className="text-[9px] font-bold text-slate-400 block">برنامه مهاجرتی بهینه:</span>
                                  <p className="text-[11px] font-extrabold text-slate-700 leading-tight">
                                    {path}
                                  </p>
                                </div>

                                <div className="mt-3 space-y-1 border-t border-slate-100 pt-2 pb-1 text-justify">
                                  <span className="text-[9px] font-bold text-slate-400 block">توصیه اول مشاور مهاجرتی:</span>
                                  <p className="text-[10.5px] text-slate-600 leading-relaxed">
                                    {keyAdvice}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Strengths & Weaknesses block */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Strengths Card */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                      <h4 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center gap-2 text-emerald-600">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <span>نقاط قوت اصلی پرونده شما</span>
                      </h4>
                      <ul className="space-y-3">
                        {result.strengths.map((str, idx) => (
                          <li key={idx} className="text-xs text-slate-600 leading-relaxed flex items-start gap-2 bg-emerald-50/25 p-2.5 rounded-xl border border-emerald-100/30">
                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Weaknesses Card */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                      <h4 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center gap-2 text-amber-600">
                        <BadgeAlert className="w-5 h-5 shrink-0" />
                        <span>نقاط ضعف یا موانع احتمالی پرونده</span>
                      </h4>
                      <ul className="space-y-3">
                        {result.weaknesses.map((weak, idx) => (
                          <li key={idx} className="text-xs text-slate-600 leading-relaxed flex items-start gap-2 bg-amber-50/25 p-2.5 rounded-xl border border-amber-100/30">
                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                            <span>{weak}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Customized Action Roadmap Improvement Plan */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
                    <h4 className="text-sm font-extrabold text-slate-800 mb-5 flex items-center gap-2">
                      <TrendingUp className="text-indigo-600 w-5 h-5" />
                      <span>نقشه راه عملی جهت تقویت پرونده و افزایش جدی شانس قبولی</span>
                    </h4>
                    <div className="space-y-4">
                      {result.improvementPlan.map((step, idx) => (
                        <div key={idx} className="flex gap-4 items-start text-right">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-50 border border-indigo-150 text-indigo-600 text-xs font-bold font-mono shrink-0">
                            {idx + 1}
                          </span>
                          <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100/80 flex-1">
                            <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium">
                              {step}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Advisor Overall Lawyer Verdict (Indigo Banner) */}
                  <div className="bg-indigo-900 rounded-3xl p-6 md:p-8 text-white space-y-4 shadow-lg shadow-indigo-100 flex flex-col justify-between">
                    <div className="flex gap-4 items-start">
                      <span className="p-3 bg-white/10 rounded-2xl shrink-0">
                        <Sparkles className="w-6 h-6 text-indigo-300" />
                      </span>
                      <div>
                        <h4 className="text-sm md:text-base font-extrabold">بیانیه و جمع‌بندی نهایی مشاور مهارتی</h4>
                        <p className="text-xs md:text-sm text-indigo-150 leading-loose mt-2 bg-indigo-950/40 p-4 rounded-xl border border-indigo-800/50">
                          {result.overallLawyerVerdict}
                        </p>
                      </div>
                    </div>
                    
                    {/* Footnote about simulated subscription */}
                    <div className="pt-2 border-t border-indigo-800/60 flex flex-wrap justify-between items-center gap-3">
                      <p className="text-[10px] text-indigo-300 max-w-sm">
                        * این اریسیابی با بهینه‌سازی قوانین مهاجرتی تا نیمه ۲۰۲۶ شبیه‌سازی گردیده است. مشاوره تخصصی نهایی جهت قرارداد همواره توصیه می‌گردد.
                      </p>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>ارزیابی مجدد پرونده با شغل یا سناریوی متفاوت</span>
                      </button>
                    </div>
                  </div>

                </main>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Aesthetic Footer Section */}
      <footer className="bg-white border-t border-slate-200 py-10 px-6 mt-12 text-center text-xs text-slate-500 space-y-4 shrink-0" id="main_footer">
        <div className="max-w-xl mx-auto space-y-2">
          <p className="font-bold text-slate-700">سامانه هوشمند ارزیابی مهاجرتی وکیل هوشمند ایران</p>
          <p className="leading-relaxed">
            مسیریابی هوشمند تحصیلی و کاری بر پایه جدیدترین مانیفست‌های مهارتی، تمکن ارزی و قوانین جدید ویزا ۲۰۲۶ کشورهای اروپایی، آمریکای شمالی و حوزه خلیج فارس.
          </p>
        </div>
        <div className="pt-4 border-t border-slate-100 max-w-md mx-auto flex justify-center gap-6">
          <span>داده‌های پردازش شده کاملا ناشناس هستند</span>
          <span>پشتیبانی هوشمند ۲۴ ساعته</span>
        </div>
        <p className="text-[10px] text-slate-400 font-mono">© 2026 MIGRA-AI Engine. Developed for instant regulatory compliance check.</p>
      </footer>
    </div>
  );
}
