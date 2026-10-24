import React, { useState, useEffect } from "react";
import {
  Lock,
  Phone,
  CheckCircle2,
  Clock,
  Search,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Users,
  DollarSign,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  Calendar,
  LogOut,
  SlidersHorizontal,
  Loader2
} from "lucide-react";
import {
  AdminLeadItem,
  adminLogin,
  fetchAdminLeads,
  adminUnlockUser
} from "../services/authService";

interface AdminLeadsViewProps {
  onBackToApp: () => void;
}

export default function AdminLeadsView({ onBackToApp }: AdminLeadsViewProps) {
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return sessionStorage.getItem("koochify_admin_token");
  });
  const [passwordInput, setPasswordInput] = useState("");
  const [leads, setLeads] = useState<AdminLeadItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "pending" | "free">("all");
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (adminToken) {
      loadLeads(adminToken);
    }
  }, [adminToken]);

  const loadLeads = async (token: string) => {
    setIsLoading(true);
    try {
      const data = await fetchAdminLeads(token);
      setLeads(data);
    } catch (err: any) {
      if (err.message?.includes("دسترسی غیرمجاز") || err.message?.includes("رمز عبور")) {
        setAdminToken(null);
        sessionStorage.removeItem("koochify_admin_token");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoading(true);
    try {
      const res = await adminLogin(passwordInput);
      setAdminToken(res.token);
      sessionStorage.setItem("koochify_admin_token", res.token);
    } catch (err: any) {
      setLoginError(err.message || "رمز عبور مدیریت صحیح نیست.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setAdminToken(null);
    sessionStorage.removeItem("koochify_admin_token");
    setLeads([]);
  };

  const handleToggleUnlock = async (userId: string, currentStatus: boolean) => {
    if (!adminToken) return;
    try {
      const res = await adminUnlockUser(userId, !currentStatus, adminToken);
      setLeads((prev) =>
        prev.map((l) =>
          l.id === userId
            ? { ...l, isPaid: !currentStatus, paymentStatus: !currentStatus ? "paid" : "none" }
            : l
        )
      );
      setActionSuccess(res.message);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message || "خطا در تغییر وضعیت دسترسی کاربر");
    }
  };

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const formatDateFa = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  // Stats
  const totalLeads = leads.length;
  const paidLeads = leads.filter((l) => l.isPaid).length;
  const pendingLeads = leads.filter((l) => l.paymentStatus === "pending_verification").length;
  const totalRevenueTomans = paidLeads * 499000;

  // Filtered Leads
  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.phoneNumber.includes(searchTerm) ||
      (l.fullName && l.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.cardLastDigits && l.cardLastDigits.includes(searchTerm));

    if (!matchesSearch) return false;

    if (filterStatus === "paid") return l.isPaid;
    if (filterStatus === "pending") return l.paymentStatus === "pending_verification";
    if (filterStatus === "free") return !l.isPaid && l.paymentStatus !== "pending_verification";

    return true;
  });

  // Password Protection Gate
  if (!adminToken) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4" dir="rtl">
        <div className="w-full max-w-md bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl text-white">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
            <Lock className="w-6 h-6" />
          </div>

          <h3 className="text-xl font-extrabold text-center mb-1">
            ورود به پنل سرنخ‌ها و مدیریت فروش
          </h3>
          <p className="text-xs text-slate-400 text-center mb-6">
            کوچیفای ۲۰۲۶ — دسترسی فقط با رمز عبور سرپرست
          </p>

          {loginError && (
            <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                رمز عبور مدیریت (ADMIN_PASSWORD):
              </label>
              <input
                type="password"
                dir="ltr"
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-mono"
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>در حال بررسی...</span>
                </>
              ) : (
                <span>ورود به داشبورد فروش</span>
              )}
            </button>

            <button
              type="button"
              onClick={onBackToApp}
              className="w-full py-2.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              بازگشت به سایت اصلی
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans" dir="rtl">
      {/* Admin Top Navigation */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
            >
              <ChevronLeft className="w-4 h-4 rotate-180" />
              <span>بازگشت به سایت</span>
            </button>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight">داشبورد سرنخ‌ها و فروش کوچیفای</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[11px] font-mono font-bold border border-emerald-500/30">
                ADMIN
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => adminToken && loadLeads(adminToken)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="به‌روزرسانی داده‌ها"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-400" : ""}`} />
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج مدیریت</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {actionSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs flex items-center gap-2 animate-fade-in font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Sales KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 block mb-1">کل سرنخ‌ها (کاربران فرم/OTP)</span>
              <span className="text-2xl font-black text-slate-900 font-mono">{totalLeads}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 block mb-1">اشتراک‌های فعال (پرداخت‌شده)</span>
              <span className="text-2xl font-black text-emerald-600 font-mono">{paidLeads}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 block mb-1">در انتظار بررسی فیش کارت</span>
              <span className="text-2xl font-black text-amber-600 font-mono">{pendingLeads}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-gradient-to-tr from-emerald-600 to-teal-700 p-5 rounded-3xl text-white shadow-md flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-100 block mb-1">مجموع فروش حاصله</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white font-mono">
                  {totalRevenueTomans.toLocaleString("fa-IR")}
                </span>
                <span className="text-xs text-emerald-100 font-semibold">تومان</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="جستجو با شماره موبایل، نام یا کد کارت..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                filterStatus === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              همه ({totalLeads})
            </button>
            <button
              onClick={() => setFilterStatus("paid")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                filterStatus === "paid" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              پرداخت‌شده ({paidLeads})
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                filterStatus === "pending" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              در انتظار کارت ({pendingLeads})
            </button>
            <button
              onClick={() => setFilterStatus("free")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                filterStatus === "free" ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              رایگان / قفل
            </button>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold">
                <tr>
                  <th className="py-3.5 px-4">کاربر و شماره تماس</th>
                  <th className="py-3.5 px-4">مقصد برتر پرونده</th>
                  <th className="py-3.5 px-4">وضعیت پرداخت</th>
                  <th className="py-3.5 px-4">کد کارت / تراکنش</th>
                  <th className="py-3.5 px-4">تاریخ ثبت</th>
                  <th className="py-3.5 px-4 text-center">اقدام سرپرست</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      موردی یافت نشد.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Phone & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {lead.fullName || "کاربر ناشناس"}
                            </span>
                            <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px] mt-0.5">
                              <span dir="ltr">{lead.phoneNumber}</span>
                              <button
                                onClick={() => handleCopyPhone(lead.phoneNumber)}
                                className="p-1 rounded-md text-slate-400 hover:text-emerald-700 hover:bg-slate-100 transition-colors"
                                title="کپی شماره برای تماس یا ارسال پیامک"
                              >
                                {copiedPhone === lead.phoneNumber ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <a
                                href={`https://wa.me/98${lead.phoneNumber.replace(/^0/, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-emerald-700 hover:underline font-sans"
                                title="ارسال پیام در واتساپ"
                              >
                                واتساپ
                              </a>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Destination */}
                      <td className="py-3.5 px-4">
                        {lead.latestDestination ? (
                          <div>
                            <span className="font-bold text-slate-800">{lead.latestDestination}</span>
                            <span className="text-[10px] text-slate-500 block truncate max-w-[150px]">
                              {lead.latestRoute} (امتیاز: {lead.latestScore}٪)
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">هنوز فرم را کامل نکرده</span>
                        )}
                      </td>

                      {/* Payment Status Badge */}
                      <td className="py-3.5 px-4">
                        {lead.isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            پرداخت‌شده
                          </span>
                        ) : lead.paymentStatus === "pending_verification" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                            <Clock className="w-3.5 h-3.5" />
                            در انتظار تأیید کارت
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
                            رایگان / قفل
                          </span>
                        )}
                      </td>

                      {/* Card Tracking Code */}
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {lead.cardLastDigits ? (
                          <span className="bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 text-xs font-bold text-emerald-900">
                            {lead.cardLastDigits}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-500 text-[11px] font-mono">
                        {formatDateFa(lead.createdAt)}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleUnlock(lead.id, lead.isPaid)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors shadow-xs ${
                            lead.isPaid
                              ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                              : "bg-emerald-600 text-white hover:bg-emerald-700"
                          }`}
                        >
                          {lead.isPaid ? "لغو اشتراک" : "تأیید دستی و باز کردن"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
