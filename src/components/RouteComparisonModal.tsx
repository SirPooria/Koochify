import React from "react";
import { X, Scale, CheckCircle2, AlertTriangle, Coins, GraduationCap, Languages, Clock, ShieldCheck } from "lucide-react";
import { RecommendedRouteResult } from "../types";

interface RouteComparisonModalProps {
  routes: RecommendedRouteResult[];
  isOpen?: boolean;
  onClose: () => void;
  onSelectDossier: (route: RecommendedRouteResult) => void;
}

export default function RouteComparisonModal({
  routes,
  isOpen = true,
  onClose,
  onSelectDossier
}: RouteComparisonModalProps) {
  if (!isOpen || !routes || routes.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-right">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900">
                جدول مقایسه هم‌زمان ۳ مقصد برتر شما
              </h3>
              <p className="text-xs text-slate-500">
                بررسی موازی پارامترهای قانونی، تمکن مالی، زبان، مدارک و زمان‌بندی
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Table (Horizontal Scroll on Mobile) */}
        <div className="p-5 sm:p-6 overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="p-3 text-right font-extrabold text-slate-600 bg-slate-50/70 w-1/4 rounded-r-xl">
                  شاخص مقایسه
                </th>
                {routes.map(r => (
                  <th key={r.routeId} className="p-3 text-center font-black text-slate-900 bg-slate-50/70 min-w-[200px]">
                    <div className="text-2xl mb-1">{r.flagEmoji}</div>
                    <div className="text-sm font-extrabold">{r.countryNameFa}</div>
                    <div className="text-[11px] font-semibold text-emerald-700">{r.routeNameFa}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Type */}
              <tr>
                <td className="p-3 font-bold text-slate-700 bg-slate-50/40">نوع مهاجرت</td>
                {routes.map(r => (
                  <td key={r.routeId} className="p-3 text-center font-semibold">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px]">
                      {r.routeTypeBadgeFa}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Fit Score */}
              <tr>
                <td className="p-3 font-bold text-slate-700 bg-slate-50/40">امتیاز تناسب مانیفست</td>
                {routes.map(r => (
                  <td key={r.routeId} className="p-3 text-center">
                    <span className="text-lg font-black text-emerald-700">{r.fitScore}</span>
                    <span className="text-slate-400 text-[10px]"> / ۱۰۰</span>
                  </td>
                ))}
              </tr>

              {/* Official Living Funds */}
              <tr>
                <td className="p-3 font-bold text-slate-700 bg-slate-50/40">تمکن زندگی مصوب سفارت</td>
                {routes.map(r => (
                  <td key={r.routeId} className="p-3 text-center font-bold text-slate-900">
                    {r.financialBreakdown.officialLivingFundFa}
                  </td>
                ))}
              </tr>

              {/* Annual Tuition */}
              <tr>
                <td className="p-3 font-bold text-slate-700 bg-slate-50/40">شهریه سال اول دانشگاه</td>
                {routes.map(r => (
                  <td key={r.routeId} className="p-3 text-center font-medium text-slate-700">
                    {r.financialBreakdown.annualTuitionEstimateFa}
                  </td>
                ))}
              </tr>

              {/* Total Estimated Cost */}
              <tr>
                <td className="p-3 font-bold text-slate-700 bg-slate-50/40">کل برآورد سال اول</td>
                {routes.map(r => (
                  <td key={r.routeId} className="p-3 text-center font-black text-emerald-800 bg-emerald-50/40">
                    <div>{r.financialBreakdown.estimatedFirstYearTotalFa}</div>
                    <div className="text-[10px] text-slate-500 font-normal">{r.financialBreakdown.approximateTotalFa || `~${r.financialBreakdown.approximateTotalUsd.toLocaleString()} $`}</div>
                  </td>
                ))}
              </tr>

              {/* Legal Language Rule */}
              <tr>
                <td className="p-3 font-bold text-slate-700 bg-slate-50/40">حداقل قانونی زبان ویزا</td>
                {routes.map(r => (
                  <td key={r.routeId} className="p-3 text-center text-slate-700">
                    {r.languageRequirement.legalMinimumFa}
                  </td>
                ))}
              </tr>

              {/* Practical Language Target */}
              <tr>
                <td className="p-3 font-bold text-slate-700 bg-slate-50/40">زبان کاربردی استخدام/کلاس</td>
                {routes.map(r => (
                  <td key={r.routeId} className="p-3 text-center text-slate-700">
                    {r.languageRequirement.practicalTargetFa}
                  </td>
                ))}
              </tr>

              {/* Process Timeline */}
              <tr>
                <td className="p-3 font-bold text-slate-700 bg-slate-50/40">طول فرآیند تخمینی</td>
                {routes.map(r => (
                  <td key={r.routeId} className="p-3 text-center text-slate-700">
                    {r.timelineEstFa}
                  </td>
                ))}
              </tr>

              {/* Main Risk */}
              <tr>
                <td className="p-3 font-bold text-slate-700 bg-slate-50/40">مهم‌ترین ریسک یا چالش</td>
                {routes.map(r => (
                  <td key={r.routeId} className="p-3 text-center text-slate-600 text-[11px] leading-relaxed">
                    {r.keyRisksFa[0] || "نیاز به بررسی دقیق مدارک"}
                  </td>
                ))}
              </tr>

              {/* Action Buttons */}
              <tr>
                <td className="p-3 bg-slate-50/40"></td>
                {routes.map(r => (
                  <td key={r.routeId} className="p-3 text-center">
                    <button
                      onClick={() => {
                        onClose();
                        onSelectDossier(r);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer w-full"
                    >
                      پرونده و برنامه اقدام
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
