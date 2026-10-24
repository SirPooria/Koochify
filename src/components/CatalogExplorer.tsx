import React, { useState } from "react";
import { 
  Globe, 
  Search, 
  Filter, 
  ExternalLink, 
  GraduationCap, 
  Briefcase, 
  CheckCircle2, 
  AlertCircle, 
  Languages, 
  Coins, 
  Clock 
} from "lucide-react";
import { COUNTRY_CATALOG, CountryCatalogItem } from "../data/countryCatalog";

export default function CatalogExplorer() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedType, setSelectedType] = useState<"all" | "study" | "work">("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");

  const filteredCountries = COUNTRY_CATALOG.filter(c => {
    // Search filter
    const matchesSearch = 
      c.nameFa.includes(searchTerm) || 
      c.nameEn.toLowerCase().includes(searchTerm.toLowerCase());

    // Type filter
    let matchesType = true;
    if (selectedType === "study") matchesType = c.supportsStudy;
    if (selectedType === "work") matchesType = c.supportsWork;

    // Region filter
    let matchesRegion = true;
    if (selectedRegion !== "all") matchesRegion = c.region === selectedRegion;

    return matchesSearch && matchesType && matchesRegion;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-right space-y-6">
      {/* Title & Introduction */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
          <Globe className="w-3.5 h-3.5" />
          <span>کاتالوگ ۳۰ کشور مهاجرتی مانیفست کوچیفای</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          بانک اطلاعات و راهنمای ۳۰ مقصد تحصیلی و کاری
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed">
          تمامی مقاصد بر اساس داده‌های حقوقی رسمی و بازبینی اکتبر ۲۰۲۶ تنظیم شده‌اند. مقاصد ناقص یا در حال تکمیل، با برچسب شفاف درصد پوشش داده مشخص شده‌اند تا از جعل قوانین جلوگیری شود.
        </p>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-5 rounded-3xl border-2 border-slate-300 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="جست‌وجوی نام کشور (فارسی یا انگلیسی)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-11 py-2.5 rounded-2xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
          />
          <Search className="w-5 h-5 text-slate-500 absolute right-3.5 top-3" />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Type Filter */}
          <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs border border-slate-300">
            <button
              onClick={() => setSelectedType("all")}
              className={`px-3.5 py-1.5 rounded-lg font-black transition-all cursor-pointer ${
                selectedType === "all" ? "bg-emerald-700 text-white shadow-xs" : "text-slate-800 hover:text-slate-950"
              }`}
            >
              همه ({COUNTRY_CATALOG.length})
            </button>
            <button
              onClick={() => setSelectedType("study")}
              className={`px-3.5 py-1.5 rounded-lg font-black transition-all cursor-pointer ${
                selectedType === "study" ? "bg-emerald-700 text-white shadow-xs" : "text-slate-800 hover:text-slate-950"
              }`}
            >
              ۳۰ مقصد تحصیلی
            </button>
            <button
              onClick={() => setSelectedType("work")}
              className={`px-3.5 py-1.5 rounded-lg font-black transition-all cursor-pointer ${
                selectedType === "work" ? "bg-emerald-700 text-white shadow-xs" : "text-slate-800 hover:text-slate-950"
              }`}
            >
              ۳۰ مقصد کاری
            </button>
          </div>

          {/* Region Filter */}
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-3.5 py-2 rounded-xl border-2 border-slate-300 text-xs font-black bg-white text-slate-900 focus:outline-hidden focus:border-emerald-600 cursor-pointer shadow-2xs"
          >
            <option value="all">همه قاره‌ها</option>
            <option value="europe">اروپا</option>
            <option value="north_america">آمریکای شمالی</option>
            <option value="oceania">اقیانوسیه</option>
            <option value="asia">آسیا</option>
            <option value="middle_east">خاورمیانه</option>
          </select>
        </div>
      </div>

      {/* Country Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCountries.map(country => (
          <div
            key={country.code}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl select-none">{country.flag}</span>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">
                      {country.nameFa}
                    </h3>
                    <span className="text-xs text-slate-400 font-medium">
                      {country.nameEn}
                    </span>
                  </div>
                </div>

                <div className="text-left shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    country.confidenceLevel === "fully_verified"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}>
                    {country.dataCompletenessPercent}% تکمیل داده
                  </span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-1.5 mb-4">
                {country.supportsStudy && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    <span>تحصیلی</span>
                  </span>
                )}
                {country.supportsWork && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    <span>کاری</span>
                  </span>
                )}
              </div>

              {/* Details List */}
              <div className="space-y-2.5 text-xs text-slate-600 mb-4">
                <div className="flex items-start gap-1.5">
                  <Languages className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>زبان: <strong>{country.dominantLanguageFa}</strong></span>
                </div>

                <div className="flex items-start gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>تمکن ماهانه: {country.typicalMonthlyLivingFa}</span>
                </div>

                <div className="flex items-start gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>کار پس از تحصیل: {country.postStudyWorkStatusFa}</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] leading-relaxed">
                  <strong className="text-slate-800 block mb-0.5">مسیر کاری اصلی:</strong>
                  {country.primaryWorkRouteFa}
                </div>
              </div>
            </div>

            {/* Portal Link */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">مرجع رسمی:</span>
              <a
                href={country.officialPortalUrl}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 text-[11px]"
              >
                <span>{country.officialPortalNameFa}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
