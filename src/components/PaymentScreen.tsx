import React, { useState, useEffect } from "react";
import {
  CreditCard,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Lock,
  ArrowLeft,
  FileText,
  Compass,
  Download
} from "lucide-react";
import {
  AuthUser,
  fetchPaymentConfig,
  submitCardToCardPayment,
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
  const [activeMethod, setActiveMethod] = useState<"online" | "card">("online");
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [cardDigits, setCardDigits] = useState("");
  const [refCode, setRefCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentConfig()
      .then((cfg) => setConfig(cfg))
      .catch((err) => console.error("Payment config fetch error:", err));
  }, []);

  const handleCopyCard = () => {
    if (!config?.cardNumber) return;
    const cleanNum = config.cardNumber.replace(/\D/g, "");
    navigator.clipboard.writeText(cleanNum);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleInstantOnlinePay = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (config?.hasOnlineGateway) {
        const res = await requestOnlinePayment();
        if (res.paymentUrl) {
          window.location.href = res.paymentUrl;
          return;
        }
      }
      const res = await instantUnlockPayment();
      setSuccessMessage(res.message);
      onPaymentSuccess(res.user);
    } catch (err: any) {
      setErrorMessage(err.message || "خطا در برقراری ارتباط با درگاه پرداخت.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!cardDigits || cardDigits.trim().length < 4) {
      setErrorMessage("لطفاً حداقل ۴ رقم آخر کارت یا شماره پیگیری واریز را وارد نمایید.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await submitCardToCardPayment(cardDigits, refCode);
      setSuccessMessage(res.message);
      onPaymentSuccess(res.user);
    } catch (err: any) {
      setErrorMessage(err.message || "خطا در ثبت پرداخت کارت‌به‌کارت.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8" dir="rtl">
      {/* Top Notification Banner */}
      <div className="mb-6 p-4 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 shadow-xs">
        <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-extrabold text-sm text-emerald-950 mb-1">
            اطلاعات فرم شما با موفقیت در پایگاه داده ثبت و تحلیل شد!
          </h4>
          <p className="text-xs text-emerald-800 leading-relaxed">
            برای مشاهده ۳ مقصد برتر بهینه، ریز تمکن رسمی سال ۲۰۲۶، بررسی شانس قبولی و دریافت برنامه عملیاتی گام‌به‌گام، لطفاً اشتراک کامل ارزیابی را فعال فرمایید.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 p-6 sm:p-8 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-emerald-100 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>اشتراک کامل پرونده مهاجرتی ۲۰۲۶</span>
            </div>

            {user && (
              <span className="text-xs text-emerald-200 font-mono bg-white/10 px-3 py-1 rounded-full">
                کاربر: {user.fullName || user.phoneNumber}
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">
            فعال‌سازی و مشاهده نتایج اختصاصی پرونده
          </h2>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-amber-300 font-mono">
              ۴۹۹,۰۰۰
            </span>
            <span className="text-sm font-bold text-emerald-100">تومان</span>
            <span className="text-sm text-emerald-200/70 line-through mr-3 font-mono">
              ۹۹۰,۰۰۰ تومان
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-xs font-extrabold">
              ۵۰٪ تخفیف
            </span>
          </div>
        </div>

        {/* Feature Unlocks Grid */}
        <div className="bg-slate-50/80 p-6 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-800 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>۳ مقصد و مسیر برتر متناسب با بودجه و شرایط شما</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>ریز هزینه‌های رسمی، تمکن بانکی و شهریه سال ۲۰۲۶</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>تحلیل موانع پنهان، گپ تحصیلی و شرط‌های ویزا</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>چک‌لیست گام‌به‌گام و زمان‌بندی اقدامات بعدی</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>دسترسی به ماژول رزومه‌یار بین‌المللی و بهینه‌ساز ATS</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>امکان دانلود و پرینت کامل گزارش تحلیلی پرونده</span>
          </div>
        </div>

        {/* Payment Methods Content */}
        <div className="p-6 sm:p-8">
          {/* Method Selector Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 mb-6">
            <button
              onClick={() => setActiveMethod("online")}
              className={`flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeMethod === "online"
                  ? "bg-white text-emerald-800 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>پرداخت آنلاین (شبیه‌ساز آنی)</span>
            </button>

            <button
              onClick={() => setActiveMethod("card")}
              className={`flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeMethod === "card"
                  ? "bg-white text-emerald-800 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CreditCard className="w-4 h-4 text-teal-600" />
              <span>کارت به کارت شتابی</span>
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {activeMethod === "online" ? (
            <div className="space-y-6 text-center">
              <div className="max-w-md mx-auto p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-right">
                <h4 className="font-extrabold text-sm text-emerald-950 mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>تأیید فوری و بدون اتلاف وقت</span>
                </h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  با کلیک بر روی دکمه زیر، پرداخت ۴۹۹,۰۰۰ تومانی با موفقیت در پایگاه داده ثبت شده و داشبورد نتایج بلافاصله برای شما باز می‌شود.
                </p>
              </div>

              <div className="pt-2 max-w-md mx-auto">
                <button
                  onClick={handleInstantOnlinePay}
                  disabled={isLoading}
                  className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-2xl font-black text-base shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>در حال ثبت پرداخت و آزادسازی نتایج...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 text-amber-300" />
                      <span>پرداخت ۴۹۹,۰۰۰ تومان و مشاهده آنی نتایج</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>اتصال امن و رمزنگاری‌شده با گواهی SSL</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCardSubmit} className="space-y-5">
              {/* Card info box */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-xs text-slate-500 font-bold">شماره کارت مقصد (بانک ملی ایران):</span>
                  <button
                    type="button"
                    onClick={handleCopyCard}
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>کپی شد!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>کپی شماره کارت</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center py-2 bg-white rounded-xl border border-slate-200 text-slate-900 font-mono text-lg sm:text-xl font-bold tracking-widest" dir="ltr">
                  {config?.cardNumber || "6037-9979-1234-5678"}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 mt-2 font-medium">
                  <span>نام صاحب حساب: {config?.cardHolder || "مدیریت سامانه کوچیفای"}</span>
                  <span className="font-bold text-emerald-800">مبلغ: ۴۹۹,۰۰۰ تومان</span>
                </div>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    ۴ رقم آخر کارت واریزکننده:
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    dir="ltr"
                    placeholder="1234"
                    value={cardDigits}
                    onChange={(e) => setCardDigits(e.target.value.replace(/\D/g, ""))}
                    className="w-full text-center font-mono text-base py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    شماره پیگیری تراکنش (اختیاری):
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="مثال: 987654"
                    value={refCode}
                    onChange={(e) => setRefCode(e.target.value)}
                    className="w-full text-center font-mono text-sm py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-2xl font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>در حال بررسی فیش و ثبت...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>ثبت واریز کارت‌به‌کارت و فعال‌سازی فوری نتایج</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {onBackToEditForm && (
            <div className="mt-8 pt-4 border-t border-slate-200 text-center">
              <button
                onClick={onBackToEditForm}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
              >
                ← بازگشت و ویرایش مجدد فرم ارزیابی
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
