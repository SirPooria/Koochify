import React, { useState } from "react";
import { 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Download, 
  Wand2, 
  Briefcase, 
  Globe,
  Info,
  Layers,
  HelpCircle,
  Lock
} from "lucide-react";
import { analyzeUserResume, ResumeAnalysisOutput } from "../services/resumeAnalyzer";
import { UserAssessmentProfile } from "../types";
import { OCCUPATIONS_CATALOG } from "../data/occupationsData";

interface ResumeOptimizerSectionProps {
  profile?: UserAssessmentProfile;
  isPaid?: boolean;
  onOpenPayment?: () => void;
}

export default function ResumeOptimizerSection({ 
  profile,
  isPaid = false,
  onOpenPayment
}: ResumeOptimizerSectionProps) {
  const [resumeText, setResumeText] = useState<string>(() => {
    return profile?.jobDutiesSummary 
      ? `Senior ${profile.primaryJobTitle || "Engineer"}
Email: candidate@email.com | Location: ${profile.currentCityOrProvince || "Tehran, Iran"}

Summary:
Experienced specialist with ${profile.totalWorkExperienceYears || 3} years in ${profile.industrySector || "engineering"}.

Experience:
${profile.primaryJobTitle || "Engineer"} (2022 - Present)
- ${profile.jobDutiesSummary}
- Collaborated with cross-functional teams to deliver software modules on time.
- Implemented unit testing and resolved critical production bugs.

Skills:
${(profile.toolsAndTechStack || ["Python", "TypeScript", "SQL"]).join(", ")}`
      : "";
  });

  const [targetJobTitle, setTargetJobTitle] = useState<string>(
    profile?.primaryJobTitle || "توسعه‌دهنده و مهندس نرم‌افزار"
  );
  const [targetCountryCode, setTargetCountryCode] = useState<string>("CA");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isPrivacyConsentGiven, setIsPrivacyConsentGiven] = useState<boolean>(true);
  const [showWizardOutput, setShowWizardOutput] = useState<boolean>(false);

  const analysis: ResumeAnalysisOutput = analyzeUserResume(
    resumeText,
    targetJobTitle,
    targetCountryCode,
    profile
  );

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setResumeText(content);
      };
      reader.readAsText(file);
    } else {
      // In browser without binary parser, read text or notify user to paste
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content === "string") {
          setResumeText(content);
        } else {
          alert("لطفاً برای تحلیل دقیق، متن رزومه را مستقیماً در کادر متنی کپی و پیست کنید.");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-right space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
          <FileText className="w-3.5 h-3.5" />
          <span>رزومه‌یار بین‌المللی و بهینه‌ساز ATS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          تحلیل و ارتقای هدفمند رزومه برای مقصد و شغل انتخابی
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed">
          هدف رزومه‌یار کوچیفای صرفاً غلط‌گیری متن نیست؛ بلکه انطباق سوابق با استانداردهای کارفرمایی کشور مقصد، حذف ریسک‌های رد شدن در ATS و پیشنهاد بازنویسی دستاوردها با فرمول‌های اثبات‌شده است.
        </p>
      </div>

      {/* Pre-upload Privacy & Safety Guarantee */}
      <div className="p-4 rounded-2xl bg-cyan-50/70 border border-cyan-200/80 text-cyan-950 text-xs leading-relaxed flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-cyan-700 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold text-cyan-950">تضمین محرمانگی و حریم خصوصی: </strong>
          اطلاعات و سوابق شغلی شما کاملاً محرمانه بررسی می‌شود و با هیچ شخص یا نهاد ثالثی به اشتراک گذاشته نخواهد شد. شما می‌توانید در هر لحظه اطلاعات خود را پاکسازی نمایید.
        </div>
      </div>

      {/* Inputs Strip (Job title, Target Country, Upload/Paste) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-white p-6 rounded-3xl border-2 border-slate-300 shadow-sm">
        <div>
          <label className="block text-sm font-extrabold text-slate-900 mb-2">
            عنوان شغلی هدف (Job Title):
          </label>
          <select
            value={targetJobTitle}
            onChange={(e) => setTargetJobTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
          >
            {OCCUPATIONS_CATALOG.map(o => (
              <option key={o.id} value={o.titleFa}>
                {o.titleFa} ({o.titleEn})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-extrabold text-slate-900 mb-2">
            کشور و حوزه مقصد (Regional Norms):
          </label>
          <select
            value={targetCountryCode}
            onChange={(e) => setTargetCountryCode(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="CA">🇨🇦 کانادا (قوانین ضد تبعیض / بدون عکس)</option>
            <option value="DE">🇩🇪 آلمان (Lebenslauf استاندارد)</option>
            <option value="AU">🇦🇺 استرالیا (رزومه مهارتی تفصیلی)</option>
            <option value="GB">🇬🇧 بریتانیا (۲ صفحه استاندارد)</option>
            <option value="NL">🇳🇱 هلند (انگلیسی بین‌المللی)</option>
            <option value="US">🇺🇸 آمریکا (قالب Resume یک تا دو صفحه)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-extrabold text-slate-900 mb-2">
            بارگذاری فایل (TXT / Markdown):
          </label>
          <label className="w-full px-4 py-2.5 rounded-xl border-2 border-dashed border-emerald-500 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-900 text-sm font-black flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs">
            <Upload className="w-4 h-4 text-emerald-700" />
            <span>انتخاب فایل رزومه</span>
            <input 
              type="file" 
              accept=".txt,.md,.pdf,.docx" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </label>
        </div>
      </div>

      {/* Editor & Live ATS Score Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Resume Text Area & Wizard Option */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border-2 border-slate-300 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-extrabold text-slate-900">
                متن رزومه خود را در کادر زیر وارد کنید یا اصلاح نمایید:
              </label>
              <button
                onClick={() => setShowWizardOutput(prev => !prev)}
                className="text-xs font-black text-emerald-900 bg-emerald-100 hover:bg-emerald-200 px-3.5 py-1.5 rounded-xl border border-emerald-300 flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                <Wand2 className="w-4 h-4 text-emerald-700" />
                <span>{showWizardOutput ? "بازگشت به متن من" : "ساخت رزومه خودکار از اطلاعات فرم"}</span>
              </button>
            </div>

            {showWizardOutput ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-300 text-xs font-bold text-slate-800">
                  این رزومه بر اساس اطلاعات واردشده شما در فرم ارزیابی با فرمت استاندارد و سازگار با سیستم‌های ATS بین‌المللی تولید شده است:
                </div>
                <textarea
                  rows={14}
                  value={analysis.generatedAtsResumeMarkdown || ""}
                  readOnly
                  className="w-full p-4 rounded-2xl border-2 border-slate-300 text-sm font-mono bg-slate-50 text-slate-950 font-bold leading-relaxed focus:outline-hidden"
                ></textarea>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleCopy(analysis.generatedAtsResumeMarkdown || "", "wizard_resume")}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black flex items-center gap-2 cursor-pointer hover:bg-slate-800 shadow-xs"
                  >
                    {copiedKey === "wizard_resume" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>کپی کل متن رزومه</span>
                  </button>
                </div>
              </div>
            ) : (
              <textarea
                rows={12}
                placeholder="متن رزومه خود را به زبان انگلیسی یا فارسی اینجا پیست کنید..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="w-full p-4 rounded-2xl border-2 border-slate-300 text-sm font-mono text-slate-900 font-semibold leading-relaxed focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
              ></textarea>
            )}
          </div>

          {!isPaid && (
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 border-2 border-emerald-500/80 rounded-3xl p-6 text-white text-center shadow-xl relative overflow-hidden">
              <div className="max-w-xl mx-auto flex flex-col items-center relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center mb-3 shadow-lg">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-black mb-1.5 text-white">
                  بخش بهینه‌سازی پیشرفته ATS و کاورلتر سفارشی
                </h3>
                <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                  بازنویسی هوشمند دستاوردها بر مبنای فرمول اقدام+ابزار+نتیجه، نامه‌های رسمی به کارشناسان استخدام و استانداردهای ضدتبعیض کشور مقصد با اشتراک ۴۹۹,۰۰۰ تومانی (با ۵۰٪ تخفیف به جای ۹۹۰,۰۰۰ تومان) باز می‌شوند.
                </p>
                <button
                  onClick={onOpenPayment}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:scale-105 active:scale-95 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/30 flex items-center gap-2 cursor-pointer transition-transform"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-950" />
                  <span>باز کردن دسترسی کامل رزومه‌یار (۴۹۹,۰۰۰ تومان)</span>
                </button>
              </div>
            </div>
          )}

          {/* Bullet Point Rewriter with Formula */}
          <div className={`bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-4 ${!isPaid ? "filter blur-[2px] opacity-40 select-none pointer-events-none" : ""}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>پیشنهاد بازنویسی دستاوردها با فرمول «اقدام + ابزار + نتیجه عددی»:</span>
              </h3>
              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                نیازمند تأیید واقعیت توسط کاربر
              </span>
            </div>

            <div className="space-y-3">
              {analysis.bulletSuggestions.map((sug, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="text-slate-400 line-through text-[11px]">
                    نگارش اولیه: {sug.originalBullet}
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 text-emerald-950 font-medium leading-relaxed">
                    <strong>نگارش پیشنهادی: </strong>
                    {sug.improvedBullet}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 pt-1">
                    <span>فعل کنشی: <strong>{sug.actionVerb}</strong></span>
                    <span>•</span>
                    <span>دامنه/ابزار: <strong>{sug.scopeOrTool}</strong></span>
                    <span>•</span>
                    <span className="text-amber-800">⚠️ {sug.userVerificationNoticeFa}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Live ATS Audit & Regional Advice */}
        <div className="space-y-4">
          {/* ATS Score Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs text-center">
            <span className="text-xs font-bold text-slate-500 block mb-1">
              نمره تطبیق اولیه با استانداردهای ATS
            </span>
            <div className="text-4xl font-black text-emerald-700 my-2">
              {analysis.atsAudit.score} <span className="text-sm font-normal text-slate-400">/ ۱۰۰</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              این نمره یک سنجش فنی از ساختار و کلمات کلیدی است و تضمین‌کننده استخدام یا تصمیم کارفرما نیست.
            </p>

            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-right text-xs">
              {analysis.atsAudit.passedChecks.map((chk, i) => (
                <div key={i} className="flex items-start gap-2 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{chk}</span>
                </div>
              ))}

              {analysis.atsAudit.warningChecks.map((chk, i) => (
                <div key={i} className="flex items-start gap-2 text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{chk}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Regional Standards Advice */}
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-5 text-xs space-y-3">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>قواعد منطقه‌ای کشور {analysis.targetCountryFa}:</span>
            </h4>
            <ul className="space-y-2 text-slate-600 leading-relaxed pr-2 list-disc">
              {analysis.atsAudit.regionalAdviceFa.map((adv, i) => (
                <li key={i}>{adv}</li>
              ))}
            </ul>
          </div>

          {/* Academic CV vs Industry Note */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-5 text-xs text-amber-950 leading-relaxed">
            <strong className="font-bold block mb-1 text-amber-900">
              تفاوت رزومه صنعتی با CV پژوهشی:
            </strong>
            {analysis.academicVsIndustryNotesFa}
          </div>
        </div>
      </div>

      {/* Generated Assets: Headline, Cover Letter, Recruiter Outreach */}
      <div className={`bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 ${!isPaid ? "filter blur-[2px] opacity-40 select-none pointer-events-none" : ""}`}>
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-600" />
          <span>بسته‌های ارتباطی و نامه‌های هدفمند تولیدشده برای موقعیت شغلی:</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Headline & Summary */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">تیتر حرفه‌ای لینکدین (Headline):</span>
              <button
                onClick={() => handleCopy(analysis.suggestedHeadlineFa, "headline")}
                className="text-emerald-700 hover:text-emerald-900 flex items-center gap-1 font-semibold cursor-pointer"
              >
                {copiedKey === "headline" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>کپی</span>
              </button>
            </div>
            <p className="p-3 bg-white rounded-xl border border-slate-200 text-slate-700 font-medium">
              {analysis.suggestedHeadlineFa}
            </p>

            <div className="flex items-center justify-between pt-2">
              <span className="font-bold text-slate-800">خلاصه ابتدای رزومه (Professional Summary):</span>
              <button
                onClick={() => handleCopy(analysis.suggestedSummaryFa, "summary")}
                className="text-emerald-700 hover:text-emerald-900 flex items-center gap-1 font-semibold cursor-pointer"
              >
                {copiedKey === "summary" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>کپی</span>
              </button>
            </div>
            <p className="p-3 bg-white rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
              {analysis.suggestedSummaryFa}
            </p>
          </div>

          {/* Cover Letter & Recruiter Outreach */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">انگیزه‌نامه / Cover Letter هدفمند:</span>
              <button
                onClick={() => handleCopy(analysis.suggestedCoverLetterFa, "cover")}
                className="text-emerald-700 hover:text-emerald-900 flex items-center gap-1 font-semibold cursor-pointer"
              >
                {copiedKey === "cover" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>کپی متن</span>
              </button>
            </div>
            <pre className="p-3 bg-white rounded-xl border border-slate-200 text-slate-700 font-sans text-xs whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
              {analysis.suggestedCoverLetterFa}
            </pre>

            <div className="flex items-center justify-between pt-2">
              <span className="font-bold text-slate-800">پیام کوتاه ارتباط با کارشناس استخدام (Recruiter Message):</span>
              <button
                onClick={() => handleCopy(analysis.recruiterOutreachMessageFa, "recruiter")}
                className="text-emerald-700 hover:text-emerald-900 flex items-center gap-1 font-semibold cursor-pointer"
              >
                {copiedKey === "recruiter" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>کپی متن انگلیسی</span>
              </button>
            </div>
            <pre className="p-3 bg-white rounded-xl border border-slate-200 text-slate-700 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
              {analysis.recruiterOutreachMessageFa}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
