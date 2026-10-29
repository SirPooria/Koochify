import React, { useState, useEffect } from "react";
import { 
  X, 
  Phone, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  User as UserIcon,
  ShieldCheck
} from "lucide-react";
import { sendOtp, verifyOtp, AuthUser } from "../services/authService";

const toEnglishDigits = (str: string): string => {
  return str
    .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString())
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());
};

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [devCode, setDevCode] = useState<string | null>(null);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setStep("phone");
      setOtpCode("");
      setErrorMessage(null);
      setSuccessMessage(null);
      setDevCode(null);
    }
  }, [isOpen]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: any;
    if (step === "otp" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanPhone = phoneNumber.trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage("لطفاً یک شماره تلفن همراه معتبر (مثلاً ۰۹۱۲۳۴۵۶۷۸۹) وارد کنید.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await sendOtp(cleanPhone);
      setSuccessMessage(res.message);
      if (res.devCode) {
        setDevCode(res.devCode);
      }
      setStep("otp");
      setCountdown(60);
    } catch (err: any) {
      setErrorMessage(err.message || "خطا در ارسال کد تأیید. لطفاً مجدداً تلاش کنید.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const cleanCode = otpCode.trim();
    if (!cleanCode || cleanCode.length < 4) {
      setErrorMessage("لطفاً کد تأیید ۵ رقمی دریافتی را وارد کنید.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await verifyOtp(phoneNumber, cleanCode, fullName);
      onLoginSuccess(res.user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "کد تأیید نادرست است یا منقضی شده است.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in" dir="rtl">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-slate-900 transition-all">
        {/* Header background accent */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-md">
              <Phone className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">ورود و ثبت‌نام در کوچیفای</h3>
              <p className="text-xs text-emerald-100/80 font-medium">ذخیره امن پرونده مهاجرت و نتایج ارزیابی</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {step === "phone" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  شماره تلفن همراه
                </label>
                <div 
                  dir="ltr" 
                  className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent transition-all"
                >
                  <div className="flex items-center gap-1.5 px-3.5 py-3 bg-slate-100/90 border-r border-slate-200 text-slate-600 text-xs font-mono font-bold select-none shrink-0">
                    <span className="text-base leading-none">🇮🇷</span>
                    <span>+98</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    dir="ltr"
                    placeholder="09123456789"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(toEnglishDigits(e.target.value))}
                    className="w-full text-left font-mono tracking-wider px-3.5 py-3 bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none text-sm"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  کد یک‌بارمصرف ۵ رقمی برای احراز هویت بدون نیاز به رمز عبور ارسال می‌شود.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-2xl font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>در حال ارسال پیامک...</span>
                    </>
                  ) : (
                    <>
                      <span>ارسال کد تأیید ورود</span>
                      <ArrowRight className="w-4 h-4 rotate-180" />
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-start gap-2.5 mt-4">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  شماره شما با استاندارد رمزنگاری ذخیره می‌شود و هیچ‌گونه پیامک تبلیغاتی یا مزاحمتی ارسال نخواهد شد.
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center gap-2 text-xs text-emerald-900 mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="leading-snug">کد تأیید ورود به شماره {phoneNumber} پیامک شد.</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    کد تأیید پیامک‌شده به {phoneNumber}
                  </label>
                  <button
                    type="button"
                    onClick={() => setStep("phone")}
                    className="text-[11px] text-emerald-600 hover:underline font-semibold"
                  >
                    ویرایش شماره
                  </button>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  dir="ltr"
                  maxLength={6}
                  placeholder="12345"
                  value={otpCode}
                  onChange={(e) => setOtpCode(toEnglishDigits(e.target.value))}
                  className="w-full text-center tracking-widest font-mono text-xl py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  نام و نام‌خانوادگی (اختیاری)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="مثال: محمد محمدی"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  />
                  <UserIcon className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-2xl font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>در حال تأیید ورود...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>تأیید و ورود به پنل کاربری</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                {countdown > 0 ? (
                  <span className="text-slate-500 text-[11px]">
                    امکان ارسال مجدد کد تا {countdown} ثانیه دیگر
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    className="text-emerald-700 font-bold hover:underline"
                  >
                    ارسال مجدد پیامک کد تأیید
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
