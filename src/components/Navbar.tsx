import React from "react";
import { 
  Compass, 
  FileText, 
  Sparkles, 
  Trash2,
  User as UserIcon,
  Phone
} from "lucide-react";
import { AuthUser } from "../services/authService";

export type NavTab = "home" | "assessment" | "results" | "payment" | "resume" | "catalog" | "opportunities" | "sources";

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  hasResults: boolean;
  onOpenPrivacy?: () => void;
  onResetData: () => void;
  user: AuthUser | null;
  onOpenAuth: () => void;
  onOpenUserPanel: () => void;
  onOpenPayment?: () => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  hasResults,
  onResetData,
  user,
  onOpenAuth,
  onOpenUserPanel,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab("home")}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <Compass className="w-6 h-6 animate-pulse-subtle" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 font-sans">
                  کوچیفای
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ۲۰۲۶
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                سامانه تصمیم‌یار و نقشه راه مهاجرت ایرانیان
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setActiveTab("home")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "home"
                  ? "bg-white text-emerald-800 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <span>صفحه اصلی</span>
            </button>

            <button
              onClick={() => setActiveTab("assessment")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "assessment"
                  ? "bg-white text-emerald-800 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>فرم ارزیابی</span>
            </button>

            {hasResults && (
              <button
                onClick={() => setActiveTab("results")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "results"
                    ? "bg-white text-emerald-800 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>نتایج پرونده من</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              </button>
            )}

            <button
              onClick={() => setActiveTab("catalog")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "catalog"
                  ? "bg-white text-emerald-800 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <span>کاتالوگ ۳۰ کشور</span>
            </button>

            <button
              onClick={() => setActiveTab("resume")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "resume"
                  ? "bg-white text-emerald-800 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>رزومه‌یار و ATS</span>
            </button>
          </nav>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {user?.isPaid && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>اشتراک طلایی</span>
              </div>
            )}

            {user ? (
              <button
                onClick={onOpenUserPanel}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all shadow-xs"
                title="مشاهده پنل کاربری و سوابق پرونده‌ها"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-[11px] shadow-xs">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
                <span className="max-w-[110px] truncate hidden sm:inline">
                  {user.fullName || user.phoneNumber}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-200/80 text-emerald-900 font-semibold hidden md:inline">
                  پنل کاربری
                </span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>ورود / ثبت‌نام</span>
              </button>
            )}

            <button
              onClick={onResetData}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="پاکسازی داده‌های فرم و شروع مجدد"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center justify-between overflow-x-auto py-2 border-t border-slate-100 gap-1 text-[11px] font-medium no-scrollbar">
          <button
            onClick={() => setActiveTab("home")}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap cursor-pointer ${
              activeTab === "home" ? "bg-emerald-600 text-white font-bold" : "text-slate-600"
            }`}
          >
            صفحه اصلی
          </button>
          <button
            onClick={() => setActiveTab("assessment")}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap cursor-pointer ${
              activeTab === "assessment" ? "bg-emerald-600 text-white font-bold" : "text-slate-600"
            }`}
          >
            فرم ارزیابی
          </button>
          {hasResults && (
            <button
              onClick={() => setActiveTab("results")}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap cursor-pointer ${
                activeTab === "results" ? "bg-emerald-600 text-white font-bold" : "text-slate-600"
              }`}
            >
              نتایج من
            </button>
          )}
          <button
            onClick={() => setActiveTab("resume")}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap cursor-pointer ${
              activeTab === "resume" ? "bg-emerald-600 text-white font-bold" : "text-slate-600"
            }`}
          >
            رزومه‌یار
          </button>
          {user ? (
            <button
              onClick={onOpenUserPanel}
              className="px-2.5 py-1 rounded-md whitespace-nowrap bg-emerald-100 text-emerald-900 font-bold cursor-pointer"
            >
              پنل من
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-2.5 py-1 rounded-md whitespace-nowrap bg-emerald-600 text-white font-bold cursor-pointer"
            >
              ورود
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
