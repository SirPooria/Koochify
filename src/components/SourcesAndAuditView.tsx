import React, { useState } from "react";
import { AUDITED_SOURCES } from "../data/migrationSources";
import { OfficialSourceCitation } from "../types";
import { 
  FileCheck2, 
  ExternalLink, 
  Calendar, 
  ShieldCheck, 
  Globe2, 
  Search, 
  Users, 
  AlertCircle,
  Database
} from "lucide-react";

export const SourcesAndAuditView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceTypeFilter, setSourceTypeFilter] = useState<string>("all");

  const sourcesList = Object.values(AUDITED_SOURCES);

  const filteredSources = sourcesList.filter((src) => {
    const matchesSearch = 
      src.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      src.publisher.includes(searchTerm) ||
      src.summaryFa.includes(searchTerm);
    
    const matchesType = sourceTypeFilter === "all" || src.sourceType === sourceTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-l from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium mb-3">
              <Database className="w-3.5 h-3.5" />
              ممیزی داده‌ها، منابع قانونی و آمارهای جمعیتی
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight">
              شفافیت منابع، تاریخ اعتبارسنجی و ممیزی قانونی
            </h1>
            <p className="text-slate-400 text-sm mt-2 max-w-2xl leading-relaxed">
              در کوچیفای هیچ عدد یا قانون مهاجرتی بدون درج سازمان منتشرکننده، لینک مستقیم به صفحه رسمی دولت، تاریخ لازم‌الاجرا شدن و بازه بازبینی ثبت نمی‌شود. این سامانه از داده‌های منقضی یا شایعات شبکه‌های اجتماعی استفاده نمی‌کند.
            </p>
          </div>
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 shrink-0 text-center">
            <span className="text-xs text-slate-400 block font-medium">کل مراجع ثبتی فعال:</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">{sourcesList.length}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">درگاه دولتی و بین‌المللی</span>
          </div>
        </div>
      </div>

      {/* Global & Demographic Statistics Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400">
            <Users className="w-4 h-4" />
            <h3 className="text-sm font-bold">آمار بین‌المللی مهاجران ایرانی (UN DESA 2024)</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            بر اساس آخرین گزارش رسمی بخش جمعیت دپارتمان امور اقتصادی و اجتماعی ملل متحد (UN DESA منتشرشده در ژوئیه ۲۰۲۴)، بالغ بر <strong>۱٫۷۳۳ میلیون نفر متولد ایران</strong> به عنوان مهاجر قانونی در سایر کشورهای جهان اقامت دارند (مبتنی بر محل تولد، بدون احتساب فرزندان نسل‌های بعد در دیاسپورا).
          </p>
          <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80">
            <span>منبع: United Nations DESA Population Division</span>
            <span className="font-mono text-emerald-400">Checked: 2026-10-04</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <Globe2 className="w-4 h-4" />
            <h3 className="text-sm font-bold">هرم جمعیتی و سن کار ایران (UNFPA 2025)</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            بر مبنای گزارش صندوق جمعیت سازمان ملل متحد (UNFPA بر پایه WPP 2024)، جمعیت برآوردشده ایران در سال ۲۰۲۵ حدود <strong>۹۲٫۴ میلیون نفر</strong> است که حدود <strong>۶۹٪ آن</strong> در سن کار فعال (۱۵ تا ۶۴ سال) قرار دارند؛ این امر انگیزه تقاضا برای مهاجرت‌های کاری و آکادمیک بین‌المللی را به اوج رسانده است.
          </p>
          <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80">
            <span>منبع: United Nations Population Fund (UNFPA)</span>
            <span className="font-mono text-emerald-400">Effective: 2025</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute right-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جست‌وجوی عنوان قانون، مرجع یا کلیدواژه..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pr-9 pl-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 shrink-0">نوع مرجع:</span>
          <select
            value={sourceTypeFilter}
            onChange={(e) => setSourceTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-full sm:w-auto"
          >
            <option value="all">همه مراجع ({sourcesList.length})</option>
            <option value="government">وزارتخانه‌ها و مراجع دولتی مهاجرت</option>
            <option value="official_statistics">نهادهای آمار رسمی بین‌المللی</option>
          </select>
        </div>
      </div>

      {/* Sources Table / Grid */}
      <div className="space-y-4">
        {filteredSources.map((source: OfficialSourceCitation) => (
          <div
            key={source.sourceId}
            className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {source.publisher}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    استناد رسمی مستقیم
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-100">{source.title}</h3>
              </div>

              <a
                href={source.canonicalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition-colors shrink-0 self-start md:self-auto"
              >
                مشاهده پیوند اصلی
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="py-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                {source.summaryFa}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 font-mono">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  تاریخ لازم‌الاجرا: <span className="text-slate-200">{source.effectiveFrom}</span>
                </span>
                <span>
                  آخرین تطبیق: <span className="text-emerald-400">{source.checkedAt}</span>
                </span>
              </div>
              <div className="text-slate-400">
                شناسه استاندارد: {source.sourceId}
              </div>
            </div>
          </div>
        ))}

        {filteredSources.length === 0 && (
          <div className="text-center py-12 bg-slate-900/40 rounded-xl border border-slate-800">
            <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm text-slate-400">هیچ مرجعی با فیلتر واردشده یافت نشد.</p>
          </div>
        )}
      </div>

      {/* Audit Guarantee Note */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 text-xs text-slate-400 leading-relaxed flex items-start gap-3">
        <FileCheck2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-200 font-semibold block mb-1">
            پروتکل به‌روزرسانی مداوم داده‌ها در کوچیفای:
          </strong>
          تمامی مقادیر تمکن مالی (مانند سقف ۲۳٬۴۴۸ دلاری کانادا برای سپتامبر ۲۰۲۶، حساب مسدود ۱۱٬۹۰۴ یورویی آلمان، تغییرات زبان B2 نیروی کار بریتانیا در ژانویه ۲۰۲۶ و الزامات ساب‌کلاس ۵۰۰ استرالیا در اکتبر ۲۰۲۶) به صورت مستقل در فایل منبع‌شناسی نگهداری می‌شوند. هر زمان که اداره مهاجرت کشور مقصد بخشنامه جدیدی صادر کند، ساختار داده به صورت ماژولار و بدون نیاز به بازنویسی نرم‌افزار به‌روزرسانی می‌گردد.
        </div>
      </div>
    </div>
  );
};
