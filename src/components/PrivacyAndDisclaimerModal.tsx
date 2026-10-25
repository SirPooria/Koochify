import React, { useState } from "react";
import { UserAssessmentProfile } from "../types";
import { 
  ShieldCheck, 
  AlertTriangle, 
  Trash2, 
  Download, 
  Upload, 
  X, 
  CheckCircle2, 
  Lock,
  FileText
} from "lucide-react";

interface PrivacyAndDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserAssessmentProfile | null;
  onProfileImport: (imported: UserAssessmentProfile) => void;
  onPurgeData: () => void;
}

export const PrivacyAndDisclaimerModal: React.FC<PrivacyAndDisclaimerModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onProfileImport,
  onPurgeData,
}) => {
  const [activeTab, setActiveTab] = useState<"disclaimer" | "privacy" | "data_management">("disclaimer");
  const [purgeConfirmOpen, setPurgeConfirmOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    if (!userProfile) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userProfile, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `kochify_profile_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(false);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.goal || !parsed.citizenship) {
          setImportError("ساختار فایل پشتیبان معتبر نیست؛ فیلدهای ضروری پروفایل کوچیفای یافت نشد.");
          return;
        }
        onProfileImport(parsed as UserAssessmentProfile);
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 3000);
      } catch {
        setImportError("خطا در خواندن فایل JSON؛ لطفاً فایل معتبر انتخاب کنید.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                حریم خصوصی، سلب مسئولیت حقوقی و مدیریت داده‌ها
              </h2>
              <p className="text-xs text-slate-400">
                قوانین شفاف، عدم جمع‌آوری داده‌های حساس و کنترل کامل روی اطلاعات
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab("disclaimer")}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "disclaimer"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-300"
            }`}
          >
            سلب مسئولیت حقوقی (Disclaimer)
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "privacy"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-300"
            }`}
          >
            سیاست حریم خصوصی و امنیت داده
          </button>
          <button
            onClick={() => setActiveTab("data_management")}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "data_management"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-300"
            }`}
          >
            خروجی، پشتیبان‌گیری و پاک‌سازی داده
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300 leading-relaxed flex-1">
          {activeTab === "disclaimer" && (
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-200/90 leading-relaxed space-y-1">
                  <strong className="block text-amber-300 font-bold text-sm">
                    توجه بسیار مهم حقوقی (Legal Disclaimer):
                  </strong>
                  کوچیفای یک سامانه تصمیم‌یار و تحلیل‌گر قوانین مهاجرتی است و جایگزین وکیل دادگستری یا مشاوره رسمی حقوقی مهاجرت نیست.
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                  <h4 className="font-bold text-slate-200 mb-1">۱. عدم تضمین نتیجه یا ویزا:</h4>
                  <p>
                    کوچیفای هیچ‌گونه تضمینی در خصوص صدور قطعی ویزا، پذیرش دانشگاهی، تایید مدرک توسط ارزیابان حرفه‌ای یا استخدام قطعی توسط کارفرمایان ارائه نمی‌دهد. تصمیم نهایی منحصراً در صلاحیت افسر اداره مهاجرت، سفارتخانه مربوطه و دانشگاه پذیرنده‌کننده است.
                  </p>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                  <h4 className="font-bold text-slate-200 mb-1">۲. ماهیت امتیازهای تناسب:</h4>
                  <p>
                    شاخص‌های درصدی یا امتیازی منحصراً نشان‌دهنده «میزان تطابق شرایط خوداظهاری متقاضی با شروط مصوب و ثبت‌شده هر مسیر» است. این امتیازات شانس آماری، بخت آزمایی یا احتمال صدور ویزا نیستند.
                  </p>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                  <h4 className="font-bold text-slate-200 mb-1">۳. خط مشی عدم همکاری با روش‌های متقلبانه:</h4>
                  <p>
                    کوچیفای هیچ روش مبتنی بر ارائه مدارک ساختگی، ازدواج صوری، پنهان‌سازی سوابق واقعی، گواهی‌های بانکی غیرواقعی یا فرار از قوانین بین‌المللی را پشتیبانی نمی‌کند و در صورت مشاهده تناقضات آشکار متعهد به هشدار قانونی به کاربر است.
                  </p>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                  <h4 className="font-bold text-slate-200 mb-1">۴. پویایی قوانین مهاجرتی:</h4>
                  <p>
                    قوانین کشورها همواره در معرض تغییر توسط پارلمان‌ها و وزارتخانه‌ها هستند. مقادیر تمکن و سن به همراه تاریخ آخرین بازبینی ارائه شده‌اند و همواره تطبیق آن با درگاه رسمی دولتی پیش از هرگونه پرداخت وجه الزامی است.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="space-y-4 text-xs">
              <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3">
                <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-emerald-200/90 leading-relaxed">
                  <strong className="block text-emerald-300 font-bold text-sm mb-1">
                    اصل حداقل‌سازی داده‌ها (Privacy by Design):
                  </strong>
                  تمامی ارزیابی‌ها به طور کاملاً امن و محرمانه پردازش می‌شوند. ما داده‌های مالی، هویتی و رزومه شما را در اختیار هیچ شخص یا نهاد ثالثی قرار نمی‌دهیم.
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-slate-200">اطلاعاتی که کوچیفای هرگز از شما نمی‌خواهد:</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-400">
                    <li>شماره حساب بانکی، اطلاعات کارت یا موجودی‌های دقیق ریالی/ارزی</li>
                    <li>شماره شناسنامه، کد ملی، شماره گذرنامه یا فایل‌های اسکن شناسایی هویتی</li>
                    <li>نشانی دقیق محل سکونت در ایران یا جزئیات پرونده‌های پزشکی محرمانه</li>
                  </ul>
                </div>

                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-slate-200">چگونگی نگهداری رزومه:</h4>
                  <p className="text-slate-400 leading-relaxed">
                    متن و سوابق رزومه واردشده صرفاً جهت بررسی و تطبیق استاندارد ATS برای موقعیت‌های شغلی خارجی استفاده شده و تحت هیچ شرایطی ذخیره عمومی یا افشا نمی‌گردد.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "data_management" && (
            <div className="space-y-5">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">وضعیت پروفایل فعلی:</h4>
                    <p className="text-[11px] text-slate-400">
                      {userProfile ? `آخرین به‌روزرسانی: ${userProfile.updatedAt}` : "هنوز پروفایلی ذخیره نشده است."}
                    </p>
                  </div>
                  {userProfile && (
                    <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-400 font-medium">
                      ذخیره امن روی دستگاه
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={handleExportJSON}
                    disabled={!userProfile}
                    className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    دانلود فایل پشتیبان (JSON)
                  </button>

                  <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    بازیابی پروفایل از فایل JSON
                    <input 
                      type="file" 
                      accept=".json" 
                      onChange={handleFileUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>

                {importSuccess && (
                  <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    پروفایل شما با موفقیت بارگذاری و اعمال شد!
                  </div>
                )}

                {importError && (
                  <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {importError}
                  </div>
                )}
              </div>

              {/* Purge section */}
              <div className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                  <Trash2 className="w-4 h-4" />
                  حذف کامل تمام اطلاعات ارزیابی و رزومه از دستگاه
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  با این کار، تمامی پاسخ‌های فرم ارزیابی، مقاصد ذخیره‌شده و تحلیل رزومه به صورت کامل از دستگاه شما پاک شده و سامانه به حالت اولیه بازمی‌گردد.
                </p>

                {!purgeConfirmOpen ? (
                  <button
                    onClick={() => setPurgeConfirmOpen(true)}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    پاک‌سازی قطعی داده‌ها
                  </button>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-rose-950/40 rounded-lg border border-rose-500/40">
                    <span className="text-xs text-rose-200">آیا مطمئن هستید؟</span>
                    <button
                      onClick={() => {
                        onPurgeData();
                        setPurgeConfirmOpen(false);
                        onClose();
                      }}
                      className="px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded hover:bg-rose-500"
                    >
                      بله، پاک کن
                    </button>
                    <button
                      onClick={() => setPurgeConfirmOpen(false)}
                      className="px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded hover:bg-slate-700"
                    >
                      انصراف
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-between items-center text-xs">
          <span className="text-slate-400 flex items-center gap-1 font-mono">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            Kochify Compliance v2.6.1
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold transition-colors"
          >
            بستن پنجره
          </button>
        </div>
      </div>
    </div>
  );
};
