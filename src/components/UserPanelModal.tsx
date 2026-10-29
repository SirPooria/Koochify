import React, { useState, useEffect } from "react";
import {
  X,
  User as UserIcon,
  Phone,
  Calendar,
  LogOut,
  FolderOpen,
  Download,
  Trash2,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Edit2,
  Save,
  PlusCircle,
  FileText,
  AlertCircle,
  Loader2,
  Lock
} from "lucide-react";
import {
  AuthUser,
  SavedAssessmentSummary,
  fetchUserAssessments,
  fetchUserAssessmentById,
  deleteAssessment,
  updateProfile,
  logout,
  saveAssessmentToCloud
} from "../services/authService";
import { UserAssessmentProfile, RecommendationSummary } from "../types";

interface UserPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser;
  onLogout: () => void;
  onLoadAssessment: (profile: UserAssessmentProfile, results: RecommendationSummary) => void;
  currentProfile?: UserAssessmentProfile;
  currentResults?: RecommendationSummary | null;
  onAssessmentSaved?: () => void;
  onOpenPayment?: () => void;
}

export default function UserPanelModal({
  isOpen,
  onClose,
  user,
  onLogout,
  onLoadAssessment,
  currentProfile,
  currentResults,
  onAssessmentSaved,
  onOpenPayment
}: UserPanelModalProps) {
  const [assessments, setAssessments] = useState<SavedAssessmentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingAssessmentId, setLoadingAssessmentId] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user.fullName || "");
  const [isSavingName, setIsSavingName] = useState(false);
  const [isSavingCurrent, setIsSavingCurrent] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAssessments();
      setNewName(user.fullName || "");
      setStatusMessage(null);
    }
  }, [isOpen, user]);

  const loadAssessments = async () => {
    setIsLoading(true);
    try {
      const data = await fetchUserAssessments();
      setAssessments(data);
    } catch (e: any) {
      console.error("Error loading user assessments:", e);
      setStatusMessage({ text: "خطا در دریافت لیست پرونده‌ها", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleUpdateName = async () => {
    if (!newName.trim()) return;
    setIsSavingName(true);
    try {
      await updateProfile(newName.trim());
      setIsEditingName(false);
      setStatusMessage({ text: "نام شما با موفقیت به‌روزرسانی شد.", type: "success" });
    } catch (e: any) {
      setStatusMessage({ text: e.message || "خطا در ویرایش نام", type: "error" });
    } finally {
      setIsSavingName(false);
    }
  };

  const handleOpenAssessment = async (id: string) => {
    setLoadingAssessmentId(id);
    try {
      const fullRecord = await fetchUserAssessmentById(id);
      onLoadAssessment(fullRecord.profileData, fullRecord.resultsData);
      onClose();
    } catch (e: any) {
      setStatusMessage({ text: "خطا در بارگذاری پرونده ارزیابی", type: "error" });
    } finally {
      setLoadingAssessmentId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("آیا از حذف این پرونده ارزیابی اطمینان دارید؟ با حذف این پرونده، برای انجام ارزیابی جدید باید هزینه ارزیابی مجدداً پرداخت شود.")) {
      return;
    }

    try {
      await deleteAssessment(id);
      setAssessments((prev) => prev.filter((a) => a.id !== id));
      setStatusMessage({ text: "پرونده ارزیابی با موفقیت حذف شد. اکنون می‌توانید یک ارزیابی جدید ثبت فرمایید.", type: "success" });
    } catch (e: any) {
      setStatusMessage({ text: "خطا در حذف پرونده", type: "error" });
    }
  };

  const handleSaveCurrentDossier = async () => {
    if (!currentProfile || !currentResults) return;
    setIsSavingCurrent(true);
    try {
      await saveAssessmentToCloud(currentProfile, currentResults);
      await loadAssessments();
      setStatusMessage({ text: "ارزیابی جاری با موفقیت در حساب کاربری شما ذخیره شد.", type: "success" });
      if (onAssessmentSaved) onAssessmentSaved();
    } catch (e: any) {
      setStatusMessage({ text: e.message || "خطا در ذخیره‌سازی", type: "error" });
    } finally {
      setIsSavingCurrent(false);
    }
  };

  const formatDateFa = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in" dir="rtl">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-slate-900 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/30">
              <UserIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="px-2 py-1 text-sm bg-slate-800 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      placeholder="نام و نام خانوادگی"
                      autoFocus
                    />
                    <button
                      onClick={handleUpdateName}
                      disabled={isSavingName}
                      className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                      title="ذخیره نام"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsEditingName(false)}
                      className="p-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="font-extrabold text-base sm:text-lg">
                      {user.fullName || "کاربر کوچیفای"}
                    </h3>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
                      title="ویرایش نام"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300 font-mono mt-0.5">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-400" />
                  {user.phoneNumber}
                </span>
                <span className="text-slate-500">•</span>
                <span className="flex items-center gap-1 font-sans text-slate-400 text-[11px]">
                  <Calendar className="w-3 h-3" />
                  عضویت: {formatDateFa(user.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                logout();
                onLogout();
                onClose();
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 border border-slate-700 text-xs font-semibold transition-colors"
              title="خروج از حساب"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">خروج</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div
            className={`px-4 py-2.5 text-xs flex items-center justify-between border-b ${
              statusMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                : "bg-rose-50 text-rose-800 border-rose-100"
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button onClick={() => setStatusMessage(null)}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Quick save banner if current unsaved assessment exists */}
          {currentResults && (
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 p-4 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">
                    یک ارزیابی آماده ذخیره در حساب شماست
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    برای اینکه همیشه به این ارزیابی و ۳ مقصد منتخب دسترسی داشته باشید، آن را به پرونده‌های خود اضافه کنید.
                  </p>
                </div>
              </div>
              <button
                onClick={handleSaveCurrentDossier}
                disabled={isSavingCurrent}
                className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors shrink-0 disabled:opacity-50"
              >
                {isSavingCurrent ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>در حال ذخیره...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>ذخیره ارزیابی فعلی</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Dossiers section header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-emerald-600" />
              <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                پرونده‌های ارزیابی ذخیره‌شده شما ({assessments.length})
              </h4>
            </div>
            <button
              onClick={loadAssessments}
              className="text-xs text-emerald-700 hover:underline font-semibold"
            >
              به‌روزرسانی لیست
            </button>
          </div>

          {/* List of Dossiers */}
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <span className="text-xs font-medium">در حال فراخوانی پرونده‌های شما...</span>
            </div>
          ) : assessments.length === 0 ? (
            <div className="py-12 text-center bg-slate-50 border border-slate-200/80 rounded-2xl p-6">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h5 className="font-bold text-sm text-slate-700 mb-1">
                هنوز پرونده ارزیابی در حساب شما ذخیره نشده است
              </h5>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed mb-4">
                فرم ارزیابی هوشمند را تکمیل کنید تا تحلیل ۳ مقصد برتر و نقشه راه اختصاصی همیشه در حساب شما محفوظ بماند.
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                تکمیل فرم ارزیابی
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {assessments.map((asmt) => (
                <div
                  key={asmt.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col gap-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h5 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                        <span>{asmt.title}</span>
                      </h5>
                      <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono mt-0.5">
                        <Clock className="w-3 h-3" />
                        {formatDateFa(asmt.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        onClick={() => {
                          if (!user.isPaid) {
                            onClose();
                            onOpenPayment?.();
                          } else {
                            handleOpenAssessment(asmt.id);
                          }
                        }}
                        disabled={loadingAssessmentId === asmt.id}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs border transition-colors cursor-pointer ${
                          !user.isPaid
                            ? "bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400 shadow-sm"
                            : "bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border-emerald-200 hover:border-emerald-600"
                        }`}
                        title={!user.isPaid ? "پرداخت هزینه و باز کردن نتایج" : "مشاهده و بارگذاری در پنل نتایج"}
                      >
                        {loadingAssessmentId === asmt.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : !user.isPaid ? (
                          <Lock className="w-3.5 h-3.5" />
                        ) : (
                          <ExternalLink className="w-3.5 h-3.5" />
                        )}
                        <span>{!user.isPaid ? "پرداخت و مشاهده نتایج" : "مشاهده نتیجه کامل"}</span>
                      </button>

                      <button
                        onClick={() => handleDelete(asmt.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="حذف این پرونده"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Destinations summary chips or Locked State */}
                  {!user.isPaid ? (
                    <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 text-amber-950">
                        <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="font-bold">
                          نتایج این ارزیابی قفل است. برای مشاهده ۳ مقصد برتر و نقشه راه اختصاصی، هزینه این ارزیابی را پرداخت فرمایید.
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          onClose();
                          onOpenPayment?.();
                        }}
                        className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-black text-xs shrink-0 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>پرداخت و آزادسازی</span>
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 mb-2">
                        مقصدهای پیشنهادی محاسبه‌شده:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {asmt.primaryDestinations.map((dest, i) => (
                          <div
                            key={i}
                            className="bg-slate-50 border border-slate-200/70 rounded-xl p-2.5 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span className="text-lg shrink-0">{dest.flagEmoji || "🌐"}</span>
                              <div className="truncate">
                                <span className="font-bold text-slate-900 block truncate">
                                  {dest.countryNameFa}
                                </span>
                                <span className="text-[10px] text-slate-500 block truncate">
                                  {dest.routeNameFa}
                                </span>
                              </div>
                            </div>
                            <span className="shrink-0 font-extrabold text-[11px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                              {dest.fitScore}٪
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200/70 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            حساب کاربری شما فعال و امن است
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition-colors"
          >
            بستن پنل
          </button>
        </div>

      </div>
    </div>
  );
}
