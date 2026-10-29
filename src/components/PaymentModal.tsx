import React, { useState, useEffect } from "react";
import {
  X,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  ArrowLeft,
  Sparkles,
  Flame,
  Globe,
  Award,
  Scale
} from "lucide-react";
import {
  AuthUser,
  fetchPaymentConfig,
  requestOnlinePayment,
  PaymentConfig
} from "../services/authService";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser | null;
  onOpenAuth: () => void;
  onPaymentSuccess: (user: AuthUser) => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  user,
  onOpenAuth,
  onPaymentSuccess,
}: PaymentModalProps) {
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      fetchPaymentConfig()
        .then((cfg) => setConfig(cfg))
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOnlinePayment = async () => {
    setErrorMessage(null);

    if (!user) {
      onOpenAuth();
      return;
    }

    setIsLoading(true);
    try {
      const res = await requestOnlinePayment();
      if (res.paymentUrl) {
        window.location.href = res.paymentUrl;
      }
    } catch (err: any) {
      setErrorMessage(err.message || "خطا در برقراری ارتباط با درگاه پرداخت شاپرک.");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in" dir="rtl">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 transition-all max-h-[92vh] flex flex-col">
        
        {/* Header Hero Section */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 p-6 sm:p-7 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute left-4 top-4 p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="بستن"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-emerald-100 text-xs font-bold mb-2.5 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>فعال‌سازی پرونده طلایی مهاجرتی ۲۰۲۶</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-snug">
            بازگشایی ۳ مقصد برتر + ریز تمکن رسمی ۲۰۲۶
          </h3>

          <div className="flex flex-wrap items-baseline gap-2.5 mt-3 pt-2 border-t border-white/10">
            <span className="text-3xl sm:text-4xl font-black text-amber-300 font-mono tracking-tight">
              {config ? config.amountTomans.toLocaleString("fa-IR") : "۴۹۹,۰۰۰"}
            </span>
            <span className="text-xs font-bold text-emerald-100">تومان</span>

            <span className="text-xs text-slate-300/80 line-through decoration-rose-500 decoration-[2.5px] font-bold font-mono mr-3">
              ۱,۲۰۰,۰۰۰ تومان
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[11px] font-black shadow-xs">
              <Flame className="w-3 h-3 text-amber-200" />
              تخفیف ویژه
            </span>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Auth requirement reminder if not logged in */}
          {!user && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-950">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>برای اتصال اشتراک به حسابتان، لطفاً ابتدا با شماره همراه وارد شوید.</span>
              </div>
              <button
                type="button"
                onClick={onOpenAuth}
                className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 text-center"
              >
                ورود با شماره موبایل
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick Value Proposition Card */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-950 space-y-2">
            <h4 className="font-extrabold text-xs text-emerald-900 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>چرا این ارزیابی باارزش‌ترین گام مهاجرت شماست؟</span>
            </h4>
            <p className="text-[11.5px] text-emerald-900/90 leading-relaxed">
              هزینه یک جلسه مشاوره سنتی مهاجرتی بیش از ۲ میلیون تومان است؛ کوچیفای با یک‌چهارم این مبلغ و بدون تعصب روی کشوری خاص، کم‌ریسک‌ترین مقصدها و راهکارهای قانونی رفع گپ تحصیلی یا شغلی پرونده شما را مشخص می‌کند.
            </p>
          </div>

          {/* What Unlocks Feature List */}
          <div className="space-y-2.5 text-xs text-slate-800">
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>تحلیل کامل ۳ مقصد با بالاترین شانس قبولی متناسب با بودجه و شرایط شما</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>ریز تمکن مالی، حداقل مانده حساب سفارت و شهریه رسمی سال ۲۰۲۶</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>نقشه راه گام‌به‌گام و چک‌لیست اقدامات ماهانه تا اخذ ویزا</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>بهینه‌ساز هوشمند رزومه بین‌المللی (ATS) برای جاب‌آفر</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>امکان دانلود گزارش پرونده و دسترسی دائمی بدون انقضا</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 space-y-3">
            <button
              onClick={handleOnlinePayment}
              disabled={isLoading}
              className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] text-white rounded-2xl font-black text-sm sm:text-base shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>در حال انتقال به درگاه شاپرک...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 text-amber-300" />
                  <span>
                    {config?.amountTomans === 0
                      ? "فعال‌سازی فوری و رایگان ارزیابی"
                      : `ورود به درگاه پرداخت امن شاپرک (${config ? config.amountTomans.toLocaleString("fa-IR") : "۴۹۹,۰۰۰"} تومان)`}
                  </span>
                  <ArrowLeft className="w-4 h-4 mr-1" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-3 text-slate-500 text-[11px] font-medium">
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>درگاه رسمی شاپرک (زیبال)</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>فعال‌سازی فوری بدون تأخیر</span>
              </span>
            </div>
          </div>

        </div>

        {/* Footer Guarantee */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-center gap-2 text-slate-500 text-[11px] shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>پشتیبانی پرونده و تضمین بررسی داده‌ها بر اساس قوانین رسمی سال ۲۰۲۶</span>
        </div>

      </div>
    </div>
  );
}
