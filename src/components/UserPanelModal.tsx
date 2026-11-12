import React, { useState, useEffect } from "react";
import {
  X,
  User as UserIcon,
  Phone,
  Calendar,
  LogOut,
  FolderOpen,
  Trash2,
  ExternalLink,
  Sparkles,
  Clock,
  Edit2,
  Save,
  FileText,
  AlertCircle,
  Loader2,
  Lock,
  PlusCircle,
  CheckCircle2,
  ListChecks
} from "lucide-react";
import {
  AuthUser,
  SavedAssessmentSummary,
  SavedAssessmentRecord,
  fetchUserAssessments,
  fetchUserAssessmentById,
  updateAssessmentActionProgress,
  deleteAssessment,
  updateProfile,
  logout
} from "../services/authService";
import { UserAssessmentProfile, RecommendationSummary } from "../types";

interface UserPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser;
  onLogout: () => void;
  onLoadAssessment: (profile: UserAssessmentProfile, results: RecommendationSummary) => void;
  onOpenPayment?: () => void;
  onStartNewAssessment?: () => void;
  // Kept as optional for backwards compatibility
  currentProfile?: UserAssessmentProfile;
  currentResults?: RecommendationSummary | null;
  isSavedToCloud?: boolean;
  onAssessmentSaved?: () => void;
}

export default function UserPanelModal({
  isOpen,
  onClose,
  user,
  onLogout,
  onLoadAssessment,
  onOpenPayment,
  onStartNewAssessment
}: UserPanelModalProps) {
  const [assessments, setAssessments] = useState<SavedAssessmentSummary[]>([]);
  const [activeRecord, setActiveRecord] = useState<SavedAssessmentRecord | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadingAssessmentId, setLoadingAssessmentId] = useState<string | null>(null);
  const [savingActionKey, setSavingActionKey] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user.fullName || "");
  const [isSavingName, setIsSavingName] = useState(false);
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
      const current = data[0];
      if (current && user.isPaid) {
        const record = await fetchUserAssessmentById(current.id);
        setActiveRecord(record);
        setSelectedRouteId(record.resultsData.primaryDestinations[0]?.routeId || "");
      } else {
        setActiveRecord(null);
        setSelectedRouteId("");
      }
    } catch (e: any) {
      console.error("Error loading user assessments:", e);
      setStatusMessage({ text: "خطا در دریافت اطلاعات پرونده", type: "error" });
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
    const confirmed = window.confirm(
      "شما در حال حاضر یک پرونده فعال دارید.\n\n" +
      "طبق قوانین کوچیفای، هر کاربر فقط یک پرونده فعال دارد و برای ارزیابی جدید، پرونده قبلی حذف شده و هزینه ارزیابی مجدداً پرداخت می‌شود.\n\n" +
      "آیا از حذف این پرونده و شروع ارزیابی جدید اطمینان دارید؟"
    );
    if (!confirmed) return;

    try {
      await deleteAssessment(id);
      setAssessments([]);
      setActiveRecord(null);
      setStatusMessage({ text: "پرونده قبلی حذف شد. اکنون می‌توانید ارزیابی جدید را آغاز فرمایید.", type: "success" });
      if (onStartNewAssessment) {
        setTimeout(() => {
          onStartNewAssessment();
        }, 800);
      }
    } catch (e: any) {
      setStatusMessage({ text: "خطا در حذف پرونده", type: "error" });
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

  const activeAssessment = assessments[0] || null;
  const availableRoutes = activeRecord?.resultsData.primaryDestinations || [];
  const activeRoute =
    availableRoutes.find((route) => route.routeId === selectedRouteId) || availableRoutes[0] || null;
  const actionProgress = activeRecord?.resultsData.actionProgress || {};
  const routeActions = activeRoute?.nextActions || [];
  const completedActionCount = activeRoute
    ? routeActions.filter((action) => actionProgress[`${activeRoute.routeId}:${action.id}`]).length
    : 0;
  const actionCompletionPercent = routeActions.length
    ? Math.round((completedActionCount / routeActions.length) * 100)
    : 0;

  const handleToggleAction = async (actionId: string) => {
    if (!activeAssessment || !activeRoute || !activeRecord || savingActionKey) return;

    const progressKey = `${activeRoute.routeId}:${actionId}`;
    const completed = !Boolean(activeRecord.resultsData.actionProgress?.[progressKey]);
    setSavingActionKey(progressKey);
    setActiveRecord((current) => current ? {
      ...current,
      resultsData: {
        ...current.resultsData,
        actionProgress: {
          ...(current.resultsData.actionProgress || {}),
          [progressKey]: completed,
        },
      },
    } : current);

    try {
      const savedProgress = await updateAssessmentActionProgress(
        activeAssessment.id,
        activeRoute.routeId,
        actionId,
        completed
      );
      setActiveRecord((current) => current ? {
        ...current,
        resultsData: { ...current.resultsData, actionProgress: savedProgress },
      } : current);
      setStatusMessage({ text: "پیشرفت اقدام در پرونده ذخیره شد.", type: "success" });
    } catch (error: any) {
      setActiveRecord((current) => current ? {
        ...current,
        resultsData: {
          ...current.resultsData,
          actionProgress: {
            ...(current.resultsData.actionProgress || {}),
            [progressKey]: !completed,
          },
        },
      } : current);
      setStatusMessage({ text: error.message || "ذخیره وضعیت اقدام ناموفق بود.", type: "error" });
    } finally {
      setSavingActionKey(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in" dir="rtl">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-slate-900 flex flex-col max-h-[90vh]">
        
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
                      className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 border border-slate-600 text-white focus:outline-hidden focus:border-emerald-400"
                      placeholder="نام و نام خانوادگی"
                      autoFocus
                    />
                    <button
                      onClick={handleUpdateName}
                      disabled={isSavingName}
                      className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                      title="ذخیره نام"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsEditingName(false)}
                      className="p-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 cursor-pointer"
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
                      className="p-1 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
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
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              title="خروج از حساب"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">خروج</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div
            className={`px-6 py-2.5 text-xs font-bold flex items-center justify-between transition-all ${
              statusMessage.type === "success"
                ? "bg-emerald-50 text-emerald-900 border-b border-emerald-200"
                : "bg-rose-50 text-rose-900 border-b border-rose-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === "success" ? (
                <Sparkles className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Dossier section header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-emerald-600" />
              <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                پرونده ارزیابی مهاجرتی شما
              </h4>
            </div>
            <button
              onClick={loadAssessments}
              className="text-xs text-emerald-700 hover:underline font-semibold cursor-pointer"
            >
              به‌روزرسانی
            </button>
          </div>

          {/* Dossier Content */}
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <span className="text-xs font-medium">در حال فراخوانی پرونده شما...</span>
            </div>
          ) : !activeAssessment ? (
            <div className="py-12 text-center bg-slate-50 border border-slate-200/80 rounded-2xl p-6">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h5 className="font-bold text-sm text-slate-700 mb-1">
                هنوز پرونده ارزیابی فعالی ندارید
              </h5>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed mb-4">
                فرم ارزیابی هوشمند را تکمیل کنید تا تحلیل ۳ مقصد برتر و نقشه راه اختصاصی مستقیماً در این بخش قرار گیرد.
              </p>
              <button
                onClick={() => {
                  onClose();
                  if (onStartNewAssessment) onStartNewAssessment();
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>شروع فرم ارزیابی</span>
              </button>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h5 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <span>{activeAssessment.title}</span>
                  </h5>
                  <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono mt-0.5">
                    <Clock className="w-3 h-3" />
                    تاریخ ایجاد: {formatDateFa(activeAssessment.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => {
                      if (!user.isPaid) {
                        onClose();
                        onOpenPayment?.();
                      } else {
                        handleOpenAssessment(activeAssessment.id);
                      }
                    }}
                    disabled={loadingAssessmentId === activeAssessment.id}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs border transition-colors cursor-pointer ${
                      !user.isPaid
                        ? "bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400 shadow-sm"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-xs"
                    }`}
                  >
                    {loadingAssessmentId === activeAssessment.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : !user.isPaid ? (
                      <Lock className="w-3.5 h-3.5" />
                    ) : (
                      <ExternalLink className="w-3.5 h-3.5" />
                    )}
                    <span>{!user.isPaid ? "پرداخت و باز کردن نتایج" : "مشاهده نتیجه کامل پرونده"}</span>
                  </button>

                  <button
                    onClick={() => handleDelete(activeAssessment.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="حذف این پرونده و شروع مجدد"
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
                      نتایج این ارزیابی قفل است. برای مشاهده ۳ مقصد برتر و نقشه راه، هزینه ارزیابی را پرداخت فرمایید.
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
                    <span>پرداخت و مشاهده</span>
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-[11px] font-bold text-slate-500 mb-2">
                    مقصدهای پیشنهادی محاسبه‌شده:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {activeAssessment.primaryDestinations.map((dest, i) => (
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

              {user.isPaid && activeRecord && activeRoute && (
                <section className="border-t border-slate-100 pt-4 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <ListChecks className="w-5 h-5 text-emerald-700" />
                      <div>
                        <h5 className="font-extrabold text-sm text-slate-900">اقدامات پرونده</h5>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {completedActionCount} از {routeActions.length} اقدام انجام شده
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-emerald-800 tabular-nums">
                      {actionCompletionPercent}٪
                    </span>
                  </div>

                  <div
                    role="progressbar"
                    aria-label="پیشرفت اقدامات مسیر"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={actionCompletionPercent}
                    className="h-2 overflow-hidden rounded-full bg-slate-100"
                  >
                    <div
                      className="h-full rounded-full bg-emerald-600 transition-[width] duration-300"
                      style={{ width: `${actionCompletionPercent}%` }}
                    />
                  </div>

                  {availableRoutes.length > 1 && (
                    <label className="flex flex-col gap-1.5 text-xs font-bold text-slate-600">
                      مقصد و مسیر
                      <select
                        value={activeRoute.routeId}
                        onChange={(event) => setSelectedRouteId(event.target.value)}
                        className="w-full sm:max-w-md rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                      >
                        {availableRoutes.map((route) => (
                          <option key={route.routeId} value={route.routeId}>
                            {route.flagEmoji} {route.countryNameFa}، {route.routeNameFa}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  {routeActions.length === 0 ? (
                    <p className="py-5 text-center text-xs text-slate-500">
                      برای این مسیر اقدامی ثبت نشده است.
                    </p>
                  ) : (
                    <ol className="divide-y divide-slate-200 border-y border-slate-200">
                      {routeActions.map((action) => {
                        const progressKey = `${activeRoute.routeId}:${action.id}`;
                        const completed = Boolean(actionProgress[progressKey]);
                        const isSaving = savingActionKey === progressKey;
                        const priorityLabel = action.priority === "high"
                          ? "اولویت بالا"
                          : action.priority === "medium"
                            ? "اولویت متوسط"
                            : "اولویت عادی";
                        const responsibleLabel = {
                          user: "مسئول: شما",
                          university: "مسئول: دانشگاه",
                          employer: "مسئول: کارفرما",
                          official_body: "مسئول: مرجع رسمی",
                          translator: "مسئول: مترجم",
                        }[action.responsibleParty];

                        return (
                          <li key={progressKey} className="py-4 first:pt-4 last:pb-4">
                            <div className="flex items-start gap-3">
                              <label className="mt-0.5 flex shrink-0 items-center">
                                <input
                                  type="checkbox"
                                  checked={completed}
                                  disabled={savingActionKey !== null}
                                  onChange={() => void handleToggleAction(action.id)}
                                  aria-label={`علامت‌گذاری اقدام: ${action.titleFa}`}
                                  className="h-5 w-5 cursor-pointer accent-emerald-700 disabled:cursor-wait"
                                />
                              </label>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h6 className={`text-sm font-extrabold leading-relaxed ${completed ? "text-slate-500 line-through" : "text-slate-900"}`}>
                                    {action.titleFa}
                                  </h6>
                                  {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-700" />}
                                  {completed && <CheckCircle2 className="h-4 w-4 text-emerald-700" />}
                                </div>
                                <p className="mt-1.5 text-xs leading-6 text-slate-600">
                                  {action.descriptionFa}
                                </p>
                                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-slate-500">
                                  <span className={action.priority === "high" ? "font-bold text-rose-700" : ""}>
                                    {priorityLabel}
                                  </span>
                                  <span>{responsibleLabel}</span>
                                  <span>مهلت: {action.deadlineFa}</span>
                                  <span>هزینه: {action.estimatedCostFa}</span>
                                </div>
                                {action.outputDocumentFa && (
                                  <p className="mt-2 text-[11px] leading-5 text-slate-600">
                                    <span className="font-bold text-slate-700">خروجی مورد انتظار: </span>
                                    {action.outputDocumentFa}
                                  </p>
                                )}
                                {action.links && action.links.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                                    {action.links.map((link) => (
                                      <a
                                        key={link.url}
                                        href={link.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[11px] font-bold text-emerald-800 underline decoration-emerald-300 underline-offset-2 hover:text-emerald-950"
                                      >
                                        {link.labelFa}
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </section>
              )}

              {/* Start new assessment notice */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>هر حساب کاربری دارای ۱ پرونده فعال است.</span>
                <button
                  onClick={() => handleDelete(activeAssessment.id)}
                  className="text-rose-600 hover:underline font-semibold cursor-pointer"
                >
                  حذف پرونده برای ثبت ارزیابی جدید ←
                </button>
              </div>
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
            className="px-4 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            بستن پنل
          </button>
        </div>

      </div>
    </div>
  );
}
