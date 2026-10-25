import React, { useState } from "react";
import { 
  X, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Layers, 
  Coins, 
  Languages, 
  ShieldCheck, 
  AlertTriangle,
  ArrowRight,
  UserCheck,
  Building,
  Plane,
  ChevronDown
} from "lucide-react";
import { RecommendedRouteResult, DocumentItem } from "../types";

interface DestinationDossierModalProps {
  route: RecommendedRouteResult;
  onClose: () => void;
}

export default function DestinationDossierModal({
  route,
  onClose
}: DestinationDossierModalProps) {
  const [docStatuses, setDocStatuses] = useState<Record<string, DocumentItem["status"]>>(() => {
    const init: Record<string, DocumentItem["status"]> = {};
    route.documents.forEach(d => {
      init[d.id] = d.status;
    });
    return init;
  });

  const handleDocStatusChange = (id: string, newStatus: DocumentItem["status"]) => {
    setDocStatuses(prev => ({
      ...prev,
      [id]: newStatus
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-right">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <span className="text-3xl select-none">{route.flagEmoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {route.routeTypeBadgeFa}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  امتیاز تناسب: {route.fitScore} / ۱۰۰
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">
                پرونده جامع اقدام: {route.countryNameFa} ({route.routeNameFa})
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1">
          {/* Section 1: Application Dependency Chain */}
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>ترتیب واقعی زنجیره اقدام و وابستگی‌های اداری (Dependency Chain):</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              برای جلوگیری از اتلاف هزینه و زمان، مراحل زیر باید با ترتیب منطقی طی شوند. تفکیک مراجع دانشگاهی، ارزیابی، کارفرما و سفارت الزامی است:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs mb-2">
                  ۱
                </div>
                <div className="font-bold text-slate-900 mb-1">
                  {route.routeType === "study" ? "آزادسازی و ارزشیابی مدرک" : "ارزیابی مهارت شغلی"}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  ترجمه رسمی ریزنمرات و تأیید در سامانه ارزیابی کشور مقصد (WES, ZAB یا Engineers Australia).
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs mb-2">
                  ۲
                </div>
                <div className="font-bold text-slate-900 mb-1">
                  {route.routeType === "study" ? "پذیرش دانشگاهی (Offer/CAS)" : "قرارداد یا اسپانسر کاری"}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  دریافت تأییدیه رسمی دانشگاه (CoE/I-20) یا قرارداد کاری تاییدشده از کارفرمای مجاز.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs mb-2">
                  ۳
                </div>
                <div className="font-bold text-slate-900 mb-1">
                  تکمیل تمکن بانکی و بیمه
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  دوره نگهداری مصوب در حساب بانکی، گواهی عدم سوءپیشینه و آزمایش‌های پزشکی (TB Test).
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs mb-2">
                  ۴
                </div>
                <div className="font-bold text-slate-900 mb-1">
                  سابمیت ویزا و بیومتریک
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  ثبت پرونده آنلاین در پورتال دولت مقصد، پرداخت هزینه‌های دولتی و ثبت بیومتریک در مرکز VAC.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Detailed Financial Budget */}
          <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-600" />
                <span>جدول شفاف تمکن مالی و برآورد بودجه سال اول:</span>
              </h3>
              <span className="text-[11px] font-semibold text-slate-500">
                مبنای مصوب {route.financialBreakdown.rateEffectiveDate}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-white rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">تمکن رسمی زندگی (مصوب سفارت)</span>
                <span className="font-black text-sm text-slate-900">
                  {route.financialBreakdown.officialLivingFundFa}
                </span>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">شهریه سال اول دانشگاه</span>
                <span className="font-black text-sm text-slate-900">
                  {route.financialBreakdown.annualTuitionEstimateFa}
                </span>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">هزینه سفر و استقرار اولیه</span>
                <span className="font-black text-sm text-slate-900">
                  {route.financialBreakdown.travelAndSettlingFundFa}
                </span>
              </div>

              <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-xs">
                <span className="text-[10px] text-emerald-200 block">مجموع برآورد سال اول</span>
                <span className="font-black text-sm">
                  {route.financialBreakdown.estimatedFirstYearTotalFa}
                </span>
                <span className="text-[9px] text-emerald-200 block mt-0.5">
                  ({route.financialBreakdown.approximateTotalFa || `~${route.financialBreakdown.approximateTotalUsd.toLocaleString()} $`})
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              {route.financialBreakdown.formulaNotesFa}
            </p>
          </div>

          {/* Section 3: Interactive Document Checklist */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>چک‌لیست مدارک با تفکیک ترجمه از تأییدات دادگستری/کنسولی:</span>
              </h3>
              <span className="text-[11px] text-slate-400">
                وضعیت هر مدرک را می‌توانید تغییر دهید
              </span>
            </div>

            <div className="space-y-2.5">
              {route.documents.map(doc => {
                const currentStatus = docStatuses[doc.id] || doc.status;

                return (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{doc.titleFa}</span>
                        {doc.isMandatory && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200">
                            الزامی
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        {doc.notesFa}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 font-semibold">
                          قاعده ترجمه: {doc.translationRule}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 font-semibold">
                          قاعده قانونی‌سازی: {doc.legalisationRule}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <select
                        value={currentStatus}
                        onChange={(e) => handleDocStatusChange(doc.id, e.target.value as any)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold focus:outline-hidden ${
                          currentStatus === "have"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : currentStatus === "need_to_get"
                            ? "bg-amber-50 text-amber-800 border-amber-300"
                            : currentStatus === "needs_translation"
                            ? "bg-blue-50 text-blue-800 border-blue-300"
                            : "bg-slate-50 text-slate-700 border-slate-200"
                        }`}
                      >
                        <option value="have">✓ مدرک را در اختیار دارم</option>
                        <option value="need_to_get">باید تهیه کنم</option>
                        <option value="needs_translation">نیازمند ترجمه رسمی</option>
                        <option value="needs_legalization">نیازمند مهر دادگستری/امور خارجه</option>
                        <option value="not_required">برای این مسیر لازم نیست</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Prioritized Next Steps */}
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>برنامه اقدام و مراحل گام‌به‌گام بعدی (Next Action Steps):</span>
            </h3>

            <div className="space-y-3">
              {route.nextActions.map((act, index) => (
                <div 
                  key={act.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-start gap-3.5 text-xs"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 text-sm">{act.titleFa}</span>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        مهلت: {act.deadlineFa}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      {act.descriptionFa}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                      <span>مدرک خروجی: <strong>{act.outputDocumentFa}</strong></span>
                      <span>•</span>
                      <span>هزینه برآورد: {act.estimatedCostFa}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Legal Risks & Official Sources */}
          <div className="p-5 rounded-3xl bg-amber-50/60 border border-amber-200 text-xs text-amber-950 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>مهم‌ترین ریسک‌ها و نکات ویژه این مسیر:</span>
            </div>
            <ul className="space-y-1.5 pr-4 list-disc leading-relaxed">
              {route.keyRisksFa.map((risk, idx) => (
                <li key={idx}>{risk}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
