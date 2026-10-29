import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  Lock,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Scale,
  TrendingUp,
  FileText,
  Flame,
  Check,
  Award,
  Globe
} from "lucide-react";
import {
  AuthUser,
  fetchPaymentConfig,
  instantUnlockPayment,
  requestOnlinePayment,
  PaymentConfig
} from "../services/authService";

interface PaymentScreenProps {
  user: AuthUser | null;
  onPaymentSuccess: (user: AuthUser) => void;
  onBackToEditForm?: () => void;
}

export default function PaymentScreen({
  user,
  onPaymentSuccess,
  onBackToEditForm,
}: PaymentScreenProps) {
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentConfig()
      .then((cfg) => setConfig(cfg))
      .catch((err) => console.error("Payment config fetch error:", err));
  }, []);

  const handleInstantOnlinePay = async () => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await requestOnlinePayment();
      if (res.paymentUrl) {
        window.location.href = res.paymentUrl;
        return;
      }
      // Instant unlock fallback if gateway returns direct success
      const unlockRes = await instantUnlockPayment();
      onPaymentSuccess(unlockRes.user);
    } catch (err: any) {
      setErrorMessage(err.message || "خطا در برقراری ارتباط با درگاه پرداخت. لطفاً دوباره تلاش نمایید.");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8" dir="rtl">
      {/* Top Notification Banner */}
      <div className="mb-6 p-4 rounded-3xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-3 shadow-xs">
        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-extrabold text-sm text-emerald-950 mb-0.5">
            تحلیل اولیه پرونده شما با موفقیت انجام شد!
          </h4>
          <p className="text-xs text-emerald-800 leading-relaxed">
            اطلاعات سن، سوابق تحصیلی، شغلی و تمکن مالی شما ارزیابی گردید. برای مشاهده ۳ مقصد طلایی، ریز تمکن رسمی سفارت‌ها در سال ۲۰۲۶ و دریافت نقشه راه اختصاصی، دسترسی کامل را فعال نمایید.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden">
        {/* Header Hero Section */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 p-6 sm:p-9 text-white relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -left-12 -top-12 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 border border-white/20 text-emerald-100 text-xs font-bold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>اشتراک دسترسی طلایی پرونده مهاجرتی ۲۰۲۶</span>
              </div>

              {user && (
                <span className="text-xs text-emerald-200 font-mono bg-white/10 px-3.5 py-1 rounded-full border border-white/10">
                  پرونده: {user.fullName || user.phoneNumber}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight mb-3 leading-snug">
              بازگشایی ۳ مقصد برتر + نقشه راه و ریز تمکن ۲۰۲۶
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
              تحلیل اختصاصی، هوشمند و کاملاً بی‌طرف پرونده شما بر اساس آخرین قوانین رسمی مهاجرت و تغییرات ویزایی سال ۲۰۲۶
            </p>

            {/* Price Box with Striking Visuals */}
            <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-slate-950/40 border border-white/15 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-emerald-200/80 block mb-1 font-medium">مبلغ هزینه ارزیابی این فرم:</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-5xl font-black text-amber-300 font-mono tracking-tight">
                    {config ? config.amountTomans.toLocaleString("fa-IR") : "۴۹۹,۰۰۰"}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-emerald-100">تومان</span>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-300/80 line-through decoration-rose-500 decoration-[2.5px] font-bold font-mono text-sm sm:text-base">
                    ۱,۲۰۰,۰۰۰ تومان
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[11px] font-black shadow-sm">
                    <Flame className="w-3 h-3 text-amber-200" />
                    تخفیف ویژه
                  </span>
                </div>
                <span className="text-[11px] text-emerald-200/70">
                  پرداخت یک‌باره بابت این ارزیابی — دسترسی در پنل
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Why This Payment Matters: High Stakes Comparison Card */}
        <div className="p-6 sm:p-8 border-b border-slate-200/90 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold mb-2">
                <Scale className="w-3.5 h-3.5 text-amber-600" />
                <span>مقایسه هوشمندانه هزینه و ارزش</span>
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                چرا پرداخت هزینه ارزیابی، ارزان‌ترین بیمه برای آینده شماست؟
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Conventional Lawyer */}
              <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/70 border border-rose-200/80 text-rose-950 space-y-2.5">
                <div className="flex items-center gap-2 font-bold text-rose-800 text-sm">
                  <span className="w-6 h-6 rounded-lg bg-rose-200/80 text-rose-800 flex items-center justify-center text-xs shrink-0 font-mono">✕</span>
                  <span>مشاوره سنتی با دفاتر مهاجرتی:</span>
                </div>
                <p className="text-rose-900/90 leading-relaxed text-[11.5px]">
                  حداقل <strong>۲ تا ۵ میلیون تومان</strong> صرفاً برای یک جلسه ۴۵ دقیقه‌ای از شما دریافت می‌کنند و در اکثر موارد پرونده شما را فقط به سمت کشورهایی هدایت می‌کنند که خودشان از آن‌ها پورسانت قرارداد می‌گیرند.
                </p>
                <p className="text-rose-900/80 text-[11px] leading-relaxed">
                  یک اشتباه کوچک در انتخاب مقصد، ندانستن قانون تمکن ۲۰۲۶ یا گپ سنی، می‌تواند منجر به <strong>ریجکتی قطعی ویزا و هدر رفتن صدها میلیون تومان</strong> شود.
                </p>
              </div>

              {/* Koochify Smart Platform */}
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 border border-emerald-300 text-emerald-950 space-y-2.5 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs shrink-0">✓</span>
                  <span>ارزیابی هوشمند کوچیفای ({config ? config.amountTomans.toLocaleString("fa-IR") : "۴۹۹,۰۰۰"} تومان):</span>
                </div>
                <p className="text-emerald-900/90 leading-relaxed text-[11.5px]">
                  شرایط شما کاملاً <strong>بی‌طرفانه و بر اساس داده‌های دقیق ۲۰۲۶</strong> با بیش از ۵۰ برنامه فعال در آلمان، کانادا، ایتالیا، فرانسه، استرالیا و... تطبیق داده می‌شود؛ بدون هیچ‌گونه تعصب یا پورسانت پنهان.
                </p>
                <p className="text-emerald-900/80 text-[11px] leading-relaxed">
                  ریز هزینه‌های رسمی، تمکن بانکی، نقشه راه گام‌به‌گام و ابزار بهینه‌ساز رزومه بین‌المللی با استانداردهای کارفرمایان خارجی در اختیارتان قرار می‌گیرد.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Unlocks Grid */}
        <div className="p-6 sm:p-8 bg-white border-b border-slate-200">
          <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>با فعال‌سازی اشتراک طلایی، به این بخش‌ها دسترسی نامحدود پیدا می‌کنید:</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-slate-800">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 font-bold mb-0.5">۳ مقصد طلایی پرونده شما:</strong>
                <span className="text-slate-600 leading-relaxed">تحلیل کامل و رتبه‌بندی ۳ کشور برتر با بیشترین درصد شانس قبولی متناسب با شرایط شما.</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 font-bold mb-0.5">ریز تمکن مالی و شهریه رسمی ۲۰۲۶:</strong>
                <span className="text-slate-600 leading-relaxed">تفکیک دقیق بودجه ارزی و ریالی مورد نیاز سفارت، هزینه سال اول و حداقل مانده حساب.</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 font-bold mb-0.5">تحلیل موانع پنهان و گپ تحصیلی/کاری:</strong>
                <span className="text-slate-600 leading-relaxed">بررسی شروط سخت‌گیرانه سفارت‌ها، سن، سابقه بیمه و راه‌حل‌های قانونی رفع چالش‌ها.</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 font-bold mb-0.5">نقشه راه و چک‌لیست گام‌به‌گام اقدامات:</strong>
                <span className="text-slate-600 leading-relaxed">برنامه زمان‌بندی ماه به ماه از آماده‌سازی مدارک و زبان تا روز پرواز و دریافت ویزا.</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 font-bold mb-0.5">ماژول رزومه‌یار بین‌المللی (ATS Optimizer):</strong>
                <span className="text-slate-600 leading-relaxed">بهینه‌سازی رزومه انگلیسی مطابق سیستم‌های فیلترینگ کارفرمایان خارجی برای دریافت جاب‌آفر.</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 font-bold mb-0.5">دانلود رسمی پرونده + دسترسی همیشگی:</strong>
                <span className="text-slate-600 leading-relaxed">امکان دانلود فایل گزارش و دسترسی دائمی از طریق شماره موبایل در هر زمان.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Action Section */}
        <div className="p-6 sm:p-10 bg-slate-50/60">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 max-w-xl mx-auto">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="max-w-xl mx-auto space-y-5">
            {/* Direct Online Payment Button */}
            <button
              onClick={handleInstantOnlinePay}
              disabled={isLoading}
              className="w-full py-4 sm:py-5 px-6 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] text-white rounded-2xl font-black text-base sm:text-lg shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>در حال انتقال به درگاه امن شاپرک...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-6 h-6 text-amber-300" />
                  <span>
                    {config?.amountTomans === 0
                      ? "فعال‌سازی فوری و رایگان ارزیابی"
                      : `ورود به درگاه پرداخت امن شاپرک — ${config ? config.amountTomans.toLocaleString("fa-IR") : "۴۹۹,۰۰۰"} تومان`}
                  </span>
                  <ArrowLeft className="w-5 h-5 mr-1" />
                </>
              )}
            </button>

            {/* Trust and Security Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-slate-500 text-[11px] pt-1 font-medium">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>اتصال امن و رمزنگاری‌شده شاپرک (SSL)</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>فعال‌سازی آنی پرونده بلافاصله پس از پرداخت</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-teal-600" />
                <span>کلیه کارت‌های عضو شتاب</span>
              </div>
            </div>

            {/* Back to Edit Form */}
            {onBackToEditForm && (
              <div className="pt-4 border-t border-slate-200/80 text-center">
                <button
                  onClick={onBackToEditForm}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer transition-colors"
                >
                  ← بازگشت و ویرایش مجدد گزینه‌های فرم ارزیابی
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
