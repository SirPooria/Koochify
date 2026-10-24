import React, { useState } from "react";
import { 
  OFFICIAL_JOB_PORTALS, 
  SCHOLARSHIP_AND_RESEARCH_PROGRAMS, 
  STAR_INTERVIEW_GUIDELINES, 
  SCAM_WARNINGS,
  JobPortalItem,
  ScholarshipPortalItem 
} from "../data/opportunitiesData";
import { 
  Briefcase, 
  GraduationCap, 
  MessageSquare, 
  AlertTriangle, 
  ExternalLink, 
  CheckCircle2, 
  ShieldCheck, 
  Search,
  Sparkles,
  Award
} from "lucide-react";

export const OpportunitiesAndInterview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"jobs" | "scholarships" | "interview" | "scams">("jobs");
  const [jobSearch, setJobSearch] = useState("");
  const [scholarshipFilter, setScholarshipFilter] = useState<"all" | "full" | "partial">("all");

  const filteredJobs = OFFICIAL_JOB_PORTALS.filter((job) =>
    job.countryNameFa.includes(jobSearch) ||
    job.portalName.toLowerCase().includes(jobSearch.toLowerCase()) ||
    job.descriptionFa.includes(jobSearch)
  );

  const filteredScholarships = SCHOLARSHIP_AND_RESEARCH_PROGRAMS.filter((s) => {
    if (scholarshipFilter === "full") return s.coverage === "full_tuition_and_stipend";
    if (scholarshipFilter === "partial") return s.coverage === "partial_or_variable";
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-gradient-to-l from-emerald-950/40 via-slate-900/60 to-slate-900/40 border border-emerald-500/20 rounded-2xl p-6 md:p-8 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              مرکز فرصت‌های رسمی و آمادگی پذیرش/استخدام
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight">
              درگاه فرصت‌های شغلی، بورسیه‌ها و شبیه‌ساز مصاحبه
            </h1>
            <p className="text-slate-400 text-sm mt-2 max-w-2xl leading-relaxed">
              دست‌یابی به پرتال‌های استخدامی مستقیم دولتی، بورسیه‌های تحصیلی تاییدشده برای متقاضیان ایرانی، چارچوب پاسخگویی حرفه‌ای به مصاحبه‌ها بر مبنای متدولوژی STAR و آگاهی از تله‌های حقوقی و جعل مدارک.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto bg-slate-900/80 p-1.5 rounded-xl border border-slate-700/50">
            <span className="text-xs text-slate-400 px-2 font-medium">وضعیت منابع:</span>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">
              دولتی و دانشگاهی مستقیم
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-slate-800">
          <button
            onClick={() => setActiveTab("jobs")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "jobs"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/30"
                : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            پرتال‌های رسمی کاریابی مستقیم ({OFFICIAL_JOB_PORTALS.length})
          </button>
          <button
            onClick={() => setActiveTab("scholarships")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "scholarships"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/30"
                : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            بورسیه‌ها و پوزیشن‌های دکترا ({SCHOLARSHIP_AND_RESEARCH_PROGRAMS.length})
          </button>
          <button
            onClick={() => setActiveTab("interview")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "interview"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/30"
                : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            تکنیک مصاحبه شایستگی‌محور (STAR)
          </button>
          <button
            onClick={() => setActiveTab("scams")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "scams"
                ? "bg-rose-600 text-white shadow-lg shadow-rose-950/30"
                : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-300" />
            هشدارهای امنیتی و ضد تقلب
          </button>
        </div>
      </div>

      {/* Tab Content: Jobs */}
      {activeTab === "jobs" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute right-3 top-3 text-slate-500" />
              <input
                type="text"
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
                placeholder="جست‌وجوی کشور یا عنوان پرتال..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pr-9 pl-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="text-xs text-slate-400">
              توجه: تنها پرتال‌های کاریابی دارای امکان فیلتر <span className="text-emerald-400 font-semibold">اسپانسرشیپ ویزا یا پلتفرم‌های رسمی دولتی</span> معرفی شده‌اند.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredJobs.map((job, idx) => (
              <div 
                key={idx}
                className="bg-slate-900/70 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-5 flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {job.countryNameFa}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {job.type === "official_government" ? "دولتی رسمی" : "عمومی منتخب"}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                    {job.portalName}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {job.descriptionFa}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-3">
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-2.5 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-200/90 leading-normal">
                      <strong className="font-semibold text-amber-300">راستی‌آزمایی کارفرما: </strong>
                      {job.sponsorVerificationAdviceFa}
                    </p>
                  </div>

                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2 bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    ورود به پایگاه رسمی
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Scholarships */}
      {activeTab === "scholarships" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">فیلتر پوشش مالی:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setScholarshipFilter("all")}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                    scholarshipFilter === "all" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  همه ({SCHOLARSHIP_AND_RESEARCH_PROGRAMS.length})
                </button>
                <button
                  onClick={() => setScholarshipFilter("full")}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                    scholarshipFilter === "full" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  فول فاند و حقوق کامل
                </button>
              </div>
            </div>
            <div className="text-xs text-slate-400">
              پوزیشن‌های دکترای اروپایی (EURAXESS / AcademicTransfer) به عنوان <span className="text-emerald-400 font-semibold">قرارداد کاری و استخدامی با بیمه</span> محسوب می‌شوند.
            </div>
          </div>

          <div className="space-y-4">
            {filteredScholarships.map((sch) => (
              <div
                key={sch.id}
                className="bg-slate-900/70 border border-slate-800 hover:border-emerald-500/30 rounded-xl p-5 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400">
                        {sch.hostCountryOrOrgFa}
                      </span>
                      {sch.coverage === "full_tuition_and_stipend" && (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          پوشش کامل شهریه + کمک‌هزینه ماهانه زندگی
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-100">{sch.nameFa}</h3>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">{sch.nameEn}</div>
                  </div>

                  <a
                    href={sch.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600/90 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-colors shrink-0"
                  >
                    صفحه رسمی فراخوان
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs">
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block font-medium mb-1">وضعیت پذیرش متقاضیان ایرانی:</span>
                    <p className="text-slate-200 leading-relaxed">{sch.eligibilityIranianNoticeFa}</p>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block font-medium mb-1">بازه زمانی و ددلاین معمول:</span>
                    <p className="text-slate-200 leading-relaxed">{sch.deadlineOverviewFa}</p>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block font-medium mb-1">الزامات کلیدی سنجش:</span>
                    <p className="text-slate-200 leading-relaxed">{sch.keyRequirementsFa}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: STAR Interview */}
      {activeTab === "interview" && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-800">
            <h2 className="text-lg font-bold text-slate-100 mb-2">
              متدولوژی رفتاری STAR در مصاحبه‌های مهاجرتی و بین‌المللی
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              کارفرمایان در آمریکای شمالی و اروپا در مصاحبه‌های رفتاری و شایستگی‌محور (Behavioral / Competency Interviews) از شما می‌خواهند نمونه‌هایی از عملکرد گذشته خود را بازگو کنید. مدل STAR تضمین می‌کند پاسخ شما ساختاریافته، فشرده و متمرکز بر ارزش افزوده باشد.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {STAR_INTERVIEW_GUIDELINES.map((step, idx) => (
              <div 
                key={idx}
                className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-emerald-400">{step.titleFa}</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                    گام {idx + 1}
                  </span>
                </div>

                <div>
                  <div className="text-xs text-slate-400 font-medium mb-1">توضیح هدف:</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{step.explanationFa}</p>
                </div>

                <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-3">
                  <div className="text-xs font-semibold text-emerald-300 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    نمونه پاسخ استاندارد واقعی:
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">{step.exampleFa}</p>
                </div>

                <div className="bg-rose-950/20 border border-rose-500/20 rounded-lg p-3">
                  <div className="text-xs font-semibold text-rose-300 mb-1 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    اشتباه متداول متقاضیان:
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{step.commonPitfallFa}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-slate-200">نکات حیاتی برای جلسه مصاحبه آنلاین از ایران:</h4>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
              <li>
                <strong>محاسبه اختلاف ساعت:</strong> توجه به تایم‌زون کارفرما (EST, GMT, CET) و تغییر ساعت فصلی (Daylight Saving) در تقویم کشور مقصد.
              </li>
              <li>
                <strong>اینترنت پایدار و ابزار جلسه:</strong> تست قبلی روی نرم‌افزارهای Teams، Zoom یا Google Meet به همراه هدست استاندارد و محیط با نور مناسب و بی‌صدا.
              </li>
              <li>
                <strong>پرسش هوشمندانه متقاضی در انتهای مصاحبه:</strong> پرسیدن سوالاتی مانند «معیارهای سنجش موفقیت در ۹۰ روز اول این شغل چیست؟» به جای سوالات کلیشه‌ای.
              </li>
              <li>
                <strong>پاسخ صادقانه درباره اسپانسرشیپ ویزا:</strong> شفاف باشید که به ویزای کاری نیاز دارید، اما نشان دهید دقیقاً روند اخذ آن و شروط کارفرما را می‌شناسید.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab Content: Scams */}
      {activeTab === "scams" && (
        <div className="space-y-6">
          <div className="bg-rose-950/30 border border-rose-500/30 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-rose-200">
                  منشور صیانت حقوقی: هشدارهای پیشگیری از فریب، پرونده‌سازی ساختگی و کلاهبرداری مهاجرتی
                </h2>
                <p className="text-xs text-rose-200/80 mt-1 leading-relaxed">
                  قوانین بین‌المللی مهاجرت بر مدار راستی‌آزمایی دقیق اسناد و اظهارات صادقانه استوار است. هرگونه جعل، مدارک خریداری‌شده یا دور زدن قوانین رسمی، به رد صلاحیت دائمی (Inadmissibility) متقاضی و همراهان وی در پایگاه‌های اطلاعاتی مشترک (Five Eyes و شنگن) می‌انجامد.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {SCAM_WARNINGS.map((warning, idx) => (
              <div
                key={idx}
                className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-start gap-3.5 hover:border-slate-700 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{warning}</p>
              </div>
            ))}
          </div>

          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
            <h3 className="text-sm font-bold text-slate-200 mb-2">
              کوچیفای چه کاری انجام می‌دهد و چه کاری را هرگز انجام نمی‌دهد؟
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-3">
              <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-3 text-slate-300 space-y-1.5">
                <span className="font-bold text-emerald-400 block mb-1">تعهدات و استانداردهای کوچیفای:</span>
                <p>✓ ارائه قوانین رسمی، فرمول‌های ریاضی و ارقام مصوب دولتی</p>
                <p>✓ شفاف‌سازی شروط نامعلوم و جلوگیری از تصمیم‌گیری‌های پرریسک</p>
                <p>✓ تحلیل فنی رزومه بدون دخل و تصرف یا ساخت دستاورد غیرواقعی</p>
                <p>✓ راهنمایی متقاضی برای ارسال مستقیم پرونده به کارفرما و دانشگاه</p>
              </div>
              <div className="bg-rose-950/20 border border-rose-500/20 rounded-lg p-3 text-slate-300 space-y-1.5">
                <span className="font-bold text-rose-400 block mb-1">خطوط قرمز قانونی:</span>
                <p>✕ عدم ارائه ادعاهای پوچ نظیر ویزای تضمینی یا کار بدون تخصص</p>
                <p>✕ عدم فروش جاب‌آفر، مدارک مالی صوری یا رزومه‌های دروغین</p>
                <p>✕ عدم اخذ ویزا به عنوان وکیل یا دخالت در تصمیم افسر کنسولی</p>
                <p>✕ عدم دریافت کارمزد از معرفی موسسات نامعتبر یا قراردادهای غیرقانونی</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
