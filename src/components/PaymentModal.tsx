import React, { useState, useEffect } from "react";
import {
  X,
  CreditCard,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Copy,
  AlertCircle,
  Loader2,
  Lock,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Check
} from "lucide-react";
import {
  AuthUser,
  fetchPaymentConfig,
  submitCardToCardPayment,
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
  const [activeTab, setActiveTab] = useState<"card" | "online">("card");
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [cardDigits, setCardDigits] = useState("");
  const [refCode, setRefCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSuccessMessage(null);
      fetchPaymentConfig().then((cfg) => setConfig(cfg)).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyCard = () => {
    if (!config?.cardNumber) return;
    const cleanNum = config.cardNumber.replace(/\D/g, "");
    navigator.clipboard.writeText(cleanNum);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!user) {
      onOpenAuth();
      return;
    }

    if (!cardDigits || cardDigits.trim().length < 4) {
      setErrorMessage("لطفاً حداقل ۴ رقم آخر کارت یا شماره پیگیری واریز را وارد نمایید.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await submitCardToCardPayment(cardDigits, refCode);
      setSuccessMessage(res.message);
      onPaymentSuccess(res.user);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.message || "خطا در ثبت پرداخت");
    } finally {
      setIsLoading(false);
    }
  };

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
      setErrorMessage(err.message || "خطا در اتصال به درگاه پرداخت");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in" dir="rtl">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-slate-900 transition-all">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute left-4 top-4 p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-emerald-100 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>اشتراک کامل پرونده مهاجرتی ۲۰۲۶</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            باز کردن کامل پرونده ۳ کشور + رزومه‌ساز ATS
          </h3>

          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
              ۴۹۹,۰۰۰
            </span>
            <span className="text-xs font-semibold text-emerald-100">تومان</span>
            <span className="text-xs text-emerald-200/70 line-through mr-2 font-mono">
              ۹۹۰,۰۰۰ تومان
            </span>
            <span className="px-2 py-0.5 rounded-md bg-rose-500/80 text-white text-[10px] font-bold">
              ۵۰٪ تخفیف
            </span>
          </div>
        </div>

        {/* Value Proposition bullets */}
        <div className="bg-emerald-50/70 px-6 py-3.5 border-b border-emerald-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-emerald-950 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>گام‌به‌گام اقدامات و ریز هزینه‌های رسمی ۲۰۲۶</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>باز شدن پرونده کامل مقصدهای دوم و سوم</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>تحلیل ATS رزومه و بازنویسی بولت‌ها</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>دسترسی همیشگی و ذخیره در دیتابیس</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="p-6 space-y-5">
          {!user && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>برای اتصال اشتراک به حسابتان، ابتدا با شماره تماس وارد شوید.</span>
              </div>
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-3 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700"
              >
                ورود با شماره موبایل
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Payment Method Switcher */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab("card")}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "card"
                  ? "bg-white text-emerald-800 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>کارت به کارت (فوری)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 hidden sm:inline">
                بدون اینماد
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("online")}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "online"
                  ? "bg-white text-emerald-800 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>درگاه شتابی آنلاین</span>
            </button>
          </div>

          {/* Tab 1: Card-to-Card */}
          {activeTab === "card" && (
            <div className="space-y-4">
              {/* Card visual container */}
              <div className="bg-gradient-to-tr from-slate-900 via-slate-800 to-emerald-950 p-5 rounded-2xl text-white shadow-md border border-slate-700/60 relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {config?.bankName || "بانک ملی ایران"}
                    </span>
                    <h5 className="font-bold text-sm text-slate-100 mt-0.5">
                      {config?.cardHolder || "به نام مدیریت سامانه کوچیفای"}
                    </h5>
                  </div>
                  <CreditCard className="w-6 h-6 text-emerald-400" />
                </div>

                <div className="flex items-center justify-between bg-black/40 px-3.5 py-2.5 rounded-xl border border-white/10 font-mono tracking-widest text-base sm:text-lg">
                  <span dir="ltr">{config?.cardNumber || "6037-9979-1234-5678"}</span>
                  <button
                    onClick={handleCopyCard}
                    type="button"
                    className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors flex items-center gap-1 text-xs"
                    title="کپی شماره کارت"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px] text-emerald-300 font-sans font-bold">کپی شد</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-sans">کپی</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-300 mt-3 pt-2 border-t border-white/10">
                  <span>مبلغ دقیق قابل واریز:</span>
                  <span className="font-bold text-amber-300 font-mono text-sm">۴۹۹,۰۰۰ تومان</span>
                </div>
              </div>

              {/* Form to submit card verification */}
              <form onSubmit={handleCardSubmit} className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ۴ رقم آخر کارت واریزکننده یا کد پیگیری فیش:
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="مثال: ۱۲۳۴ یا کد پیگیری"
                    value={cardDigits}
                    onChange={(e) => setCardDigits(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
                    required
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    به محض ثبت شماره کارت یا کد رهگیری، پرونده شما به صورت خودکار فوراً فعال می‌گردد.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>در حال فعال‌سازی پرونده...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>واریز کردم — فعال‌سازی فوری پرونده</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Tab 2: Online Gateway */}
          {activeTab === "online" && (
            <div className="space-y-4 text-center py-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
                <Zap className="w-7 h-7" />
              </div>

              <div>
                <h4 className="font-extrabold text-base text-slate-900">
                  پرداخت امن با کلیه کارت‌های عضو شتاب
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  هدایت به درگاه رسمی شاپرک (زیبال). به محض تکمیل و بازگشت از بانک، دسترسی طلایی شما فوراً فعال خواهد شد.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between font-medium max-w-md mx-auto">
                <span className="text-slate-600">مبلغ نهایی:</span>
                <span className="font-mono font-bold text-emerald-800 text-base">۴۹۹,۰۰۰ تومان</span>
              </div>

              <button
                onClick={handleOnlinePayment}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>در حال اتصال به درگاه شاپرک...</span>
                  </>
                ) : (
                  <>
                    <span>ورود به درگاه پرداخت آنلاین</span>
                    <ExternalLink className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

        </div>

        {/* Footer Guarantee */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-500 text-[11px]">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>پشتیبانی اختصاصی پرونده در واتساپ و تلگرام پس از فعال‌سازی</span>
        </div>

      </div>
    </div>
  );
}
