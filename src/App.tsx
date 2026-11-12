import React, { useState, useEffect } from "react";
import Navbar, { NavTab } from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import PaymentScreen from "./components/PaymentScreen";
import AssessmentWizard, { DEFAULT_PROFILE } from "./components/AssessmentWizard";
import ResultsDashboard from "./components/ResultsDashboard";
import RouteComparisonModal from "./components/RouteComparisonModal";
import DestinationDossierModal from "./components/DestinationDossierModal";
import ResumeOptimizerSection from "./components/ResumeOptimizerSection";
import CatalogExplorer from "./components/CatalogExplorer";
import { OpportunitiesAndInterview } from "./components/OpportunitiesAndInterview";
import { SourcesAndAuditView } from "./components/SourcesAndAuditView";
import { PrivacyAndDisclaimerModal } from "./components/PrivacyAndDisclaimerModal";
import AuthModal from "./components/AuthModal";
import UserPanelModal from "./components/UserPanelModal";
import PaymentModal from "./components/PaymentModal";
import AdminLeadsView from "./components/AdminLeadsView";
import { evaluateUserMigrationProfile } from "./services/matcherEngine";
import {
  AuthUser,
  fetchCurrentUser,
  getStoredUser,
  saveAssessmentToCloud,
  fetchUserAssessments,
  fetchUserAssessmentById,
  deleteAssessment,
  fetchGroqEvaluation,
  reconcileOnlinePayment
} from "./services/authService";
import {
  UserAssessmentProfile,
  RecommendationSummary,
  RecommendedRouteResult,
  MigrationGoal
} from "./types";
import {
  ShieldCheck,
  FileText,
  Compass,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Printer,
  Download,
  Lock,
  Phone
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [selectedGoal, setSelectedGoal] = useState<MigrationGoal>("both");
  const [pendingStartAssessment, setPendingStartAssessment] = useState(false);

  // User Profile State (Direct in-memory & database, no localStorage)
  const [userProfile, setUserProfile] = useState<UserAssessmentProfile>(DEFAULT_PROFILE);

  // Results State (Direct in-memory & database, no localStorage)
  const [results, setResults] = useState<RecommendationSummary | null>(null);

  // Auth & User Panel State
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserPanelOpen, setIsUserPanelOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [showAdminView, setShowAdminView] = useState(() => {
    if (typeof window !== "undefined") {
      return window.location.hash === "#admin" || window.location.pathname.startsWith("/admin");
    }
    return false;
  });
  const [isSavedToCloud, setIsSavedToCloud] = useState(false);
  const [paymentTrackId, setPaymentTrackId] = useState<string | null>(null);
  const [isPaymentVerificationPending, setIsPaymentVerificationPending] = useState(false);
  const [isRecheckingPayment, setIsRecheckingPayment] = useState(false);
  const [isSavingToCloud, setIsSavingToCloud] = useState(false);
  const [cloudSaveMessage, setCloudSaveMessage] = useState<string | null>(null);

  const clearAssessmentDraft = () => {
    localStorage.removeItem("koochify_pending_profile");
    localStorage.removeItem("koochify_pending_results");
    localStorage.removeItem("kochify_profile_draft");
    localStorage.removeItem("koochify_pending_payment_track_id");
  };

  const restorePaidAssessment = async (freshUser: AuthUser) => {
    setUser(freshUser);
    const profileRaw =
      localStorage.getItem("koochify_pending_profile") ||
      localStorage.getItem("kochify_profile_draft");
    const resultsRaw = localStorage.getItem("koochify_pending_results");

    try {
      const restoredProfile = profileRaw ? JSON.parse(profileRaw) as UserAssessmentProfile : null;
      const restoredResults = resultsRaw
        ? JSON.parse(resultsRaw) as RecommendationSummary
        : restoredProfile
          ? evaluateUserMigrationProfile(restoredProfile)
          : results;

      if (restoredProfile && restoredResults) {
        setUserProfile(restoredProfile);
        setResults(restoredResults);
        setIsSavedToCloud(false);
        try {
          await saveAssessmentToCloud(restoredProfile, restoredResults);
          setIsSavedToCloud(true);
          setCloudSaveMessage(null);
          clearAssessmentDraft();
        } catch (err) {
          console.warn("Could not save recovered assessment:", err);
          setCloudSaveMessage("پرداخت تأیید شده و نتیجه نمایش داده می‌شود، اما ذخیره در پرونده ابری کامل نشد. این صفحه را نبندید؛ ذخیره را دوباره امتحان کنید.");
        }
      } else if (results) {
        setIsSavedToCloud(false);
        setCloudSaveMessage("نتیجه در این مرورگر موجود است، اما پیش‌نویس پرونده پیدا نشد و در حساب ذخیره نشده است.");
      }

      setActiveTab("results");
      setIsPaymentVerificationPending(false);
      setPaymentTrackId(null);
      localStorage.removeItem("koochify_pending_payment_track_id");
    } catch (err) {
      console.error("Could not restore the paid assessment:", err);
      setActiveTab("results");
    }
  };

  const verifyPendingPayment = async (trackId: string | null) => {
    setPaymentTrackId(trackId);
    setIsPaymentVerificationPending(Boolean(trackId));
    setIsRecheckingPayment(true);
    setActiveTab("payment");
    let paymentRecovered = false;

    try {
      for (let attempt = 0; attempt < 4; attempt++) {
        const freshUser = await fetchCurrentUser();
        if (freshUser?.isPaid) {
          paymentRecovered = true;
          await restorePaidAssessment(freshUser);
          return;
        }

        if (trackId && freshUser) {
          try {
            const reconciliation = await reconcileOnlinePayment(trackId);
            if (reconciliation.success && reconciliation.user?.isPaid) {
              paymentRecovered = true;
              await restorePaidAssessment(reconciliation.user);
              return;
            }
          } catch (err) {
            console.warn("Payment verification retry failed:", err);
          }
        }

        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      }
    } finally {
      setIsRecheckingPayment(false);
      if (!paymentRecovered) {
        setIsPaymentVerificationPending(Boolean(trackId));
        setActiveTab("payment");
      }
    }
  };

  // Check and refresh user session on mount + handle payment callbacks and admin routing
  useEffect(() => {
    // Sync user state and load appropriate dossier on session change
    const syncUserState = async (freshUser: AuthUser | null) => {
      setUser(freshUser);
      if (!freshUser) {
        setUserProfile(DEFAULT_PROFILE);
        setResults(null);
        setIsSavedToCloud(false);
        return;
      }

      // Check if this specific logged-in user has a saved assessment dossier in Supabase
      try {
        const cloudAssessments = await fetchUserAssessments();
        if (cloudAssessments && cloudAssessments.length > 0) {
          const fullRecord = await fetchUserAssessmentById(cloudAssessments[0].id);
          if (fullRecord?.profileData && fullRecord?.resultsData) {
            setUserProfile(fullRecord.profileData);
            setResults(fullRecord.resultsData);
            setIsSavedToCloud(true);
            setCloudSaveMessage(null);
            return;
          }
        }
      } catch (err) {
        console.warn("Could not check user assessments on login:", err);
      }

      // If user is marked paid in DB, check if there's a pending draft to auto-save
      if (freshUser.isPaid) {
        const draftRaw =
          localStorage.getItem("koochify_pending_profile") ||
          localStorage.getItem("kochify_profile_draft");
        if (draftRaw) {
          try {
            const restoredProfile: UserAssessmentProfile = JSON.parse(draftRaw);
            const resultsRaw = localStorage.getItem("koochify_pending_results");
            const computedResults = evaluateUserMigrationProfile(restoredProfile);
            const restoredResults = resultsRaw ? JSON.parse(resultsRaw) as RecommendationSummary : computedResults;
            setUserProfile(restoredProfile);
            setResults(restoredResults);
            setIsSavedToCloud(false);
            await saveAssessmentToCloud(restoredProfile, restoredResults);
            setIsSavedToCloud(true);
            setCloudSaveMessage(null);
            clearAssessmentDraft();
            setActiveTab("results");
            return;
          } catch (saveErr) {
            console.warn("خطا در ذخیره خودکار پرونده بازیابی‌شده:", saveErr);
            setCloudSaveMessage("پرداخت شما ثبت شده، اما ذخیره پرونده کامل نشد. نتیجه موقتاً نمایش داده می‌شود؛ برای نگهداری در پنل، ذخیره را دوباره امتحان کنید.");
            setActiveTab("results");
            return;
          }
        }
      }

      // If this user has no saved dossier, reset to clean DEFAULT_PROFILE with user's name
      setUserProfile({
        ...DEFAULT_PROFILE,
        fullName: freshUser.fullName || "",
      });
      setResults(null);
      setIsSavedToCloud(false);
    };

    const handleUserUpdated = (e: any) => {
      if (e?.detail) {
        syncUserState(e.detail);
      } else if (e?.detail === null) {
        syncUserState(null);
      } else {
        fetchCurrentUser().then(syncUserState);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("koochify_user_updated", handleUserUpdated);

      const params = new URLSearchParams(window.location.search);
      const paymentStatus = params.get("payment");
      const isPaymentReturn = ["success", "failed", "error", "cancelled"].includes(paymentStatus || "");

      if (!isPaymentReturn) {
        fetchCurrentUser().then(syncUserState);
      }

      // Handle return from payment gateway (Zibal redirect back)
      if (isPaymentReturn) {
        // Always try to restore pending assessment from localStorage after gateway redirect
        try {
          const pendingProfileRaw =
            localStorage.getItem("koochify_pending_profile") ||
            localStorage.getItem("kochify_profile_draft");
          const pendingResultsRaw = localStorage.getItem("koochify_pending_results");

          let restoredProfile: UserAssessmentProfile | null = null;
          let restoredResults: RecommendationSummary | null = null;

          if (pendingProfileRaw) {
            restoredProfile = JSON.parse(pendingProfileRaw);
            restoredResults = pendingResultsRaw
              ? JSON.parse(pendingResultsRaw)
              : evaluateUserMigrationProfile(restoredProfile!);

            setUserProfile(restoredProfile!);
            setResults(restoredResults!);
            console.log("[RESTORE] پرونده ارزیابی از حافظه موقت با موفقیت بازیابی شد.");
          }

          const trackId =
            params.get("trackId") ||
            localStorage.getItem("koochify_pending_payment_track_id");
          void verifyPendingPayment(trackId);
        } catch (err) {
          console.warn("خطا در بازیابی پرونده از localStorage:", err);
        }

        // Clean URL parameters
        window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
      }

      const handleHashChange = () => {
        if (window.location.hash === "#admin" || window.location.pathname.startsWith("/admin")) {
          setShowAdminView(true);
        }
      };

      window.addEventListener("hashchange", handleHashChange);
      return () => {
        window.removeEventListener("hashchange", handleHashChange);
        window.removeEventListener("koochify_user_updated", handleUserUpdated);
      };
    }
  }, []);

  // Modal States
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [selectedRouteForDossier, setSelectedRouteForDossier] = useState<RecommendedRouteResult | null>(null);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // Handle Assessment Completion -> Verify Fresh Payment Status -> Gate / Results
  const handleAssessmentComplete = async (profile: UserAssessmentProfile) => {
    setIsCalculating(true);
    setUserProfile(profile);

    // Compute evaluation
    const summary = evaluateUserMigrationProfile(profile);
    setResults(summary);
    setIsSavedToCloud(false);

    // Call Groq AI deep evaluation in background/parallel to enrich dossier
    fetchGroqEvaluation(profile).then((aiEval) => {
      if (aiEval) {
        summary.aiEvaluation = aiEval;
        setResults((prev) => (prev ? { ...prev, aiEvaluation: aiEval } : prev));
        // If already paid and saved, update in cloud
        if (freshUser?.isPaid) {
          saveAssessmentToCloud(profile, { ...summary, aiEvaluation: aiEval }).catch(console.warn);
        }
      }
    }).catch((err) => console.warn("Groq AI evaluation async error:", err));

    // Fetch fresh user state from server to detect admin manual unlocks or real-time payment
    let freshUser = user;
    try {
      const fresh = await fetchCurrentUser();
      if (fresh) {
        setUser(fresh);
        freshUser = fresh;
      }
    } catch (err) {
      console.warn("Could not fetch fresh user status:", err);
    }

    setIsCalculating(false);

    // Always persist completed assessment to database for the authenticated user so it's tied to their dossier and visible in Admin CRM
    if (freshUser) {
      try {
        await saveAssessmentToCloud(profile, summary);
        setIsSavedToCloud(true);
        console.log("[DOSSIER] پرونده ارزیابی با موفقیت در دیتابیس ابری ثبت گردید.");
      } catch (err) {
        console.warn("Direct save to database failed:", err);
      }
    }

    // Also persist assessment to localStorage so it survives payment gateway redirect (full page reload)
    try {
      localStorage.setItem("koochify_pending_profile", JSON.stringify(profile));
      localStorage.setItem("koochify_pending_results", JSON.stringify(summary));
    } catch (err) {
      console.warn("خطا در ذخیره موقت پرونده:", err);
    }

    if (!freshUser?.isPaid) {
      setActiveTab("payment");
    } else {
      // Clear pending data from localStorage since it's safely in the database now
      try {
        localStorage.removeItem("koochify_pending_profile");
        localStorage.removeItem("koochify_pending_results");
      } catch { }
      setActiveTab("results");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle Payment Success
  const handlePaymentSuccess = async (paidUser: AuthUser) => {
    setUser(paidUser);
    setIsPaymentModalOpen(false);

    // If results exist in memory, save now that user is paid
    if (results) {
      try {
        await saveAssessmentToCloud(userProfile, results);
        setIsSavedToCloud(true);
        // Clear pending data from localStorage since it's safely in the database now
        try {
          localStorage.removeItem("koochify_pending_profile");
          localStorage.removeItem("koochify_pending_results");
        } catch { }
      } catch (err) {
        console.warn("Could not save to cloud after payment:", err);
      }
    }

    setActiveTab("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Start assessment handler with login requirement and 1-form check
  const handleStartAssessment = async () => {
    if (!user) {
      setPendingStartAssessment(true);
      setIsAuthModalOpen(true);
      return;
    }

    // Check if user already has an active assessment dossier
    try {
      const existingList = await fetchUserAssessments();
      if (existingList && existingList.length > 0) {
        const confirmNew = window.confirm(
          "شما در حال حاضر یک پرونده ارزیابی فعال دارید.\n\n" +
          "هر کاربر در کوچیفای فقط یک پرونده فعال دارد و هزینه پرداختی برای همان ارزیابی است.\n" +
          "اگر می‌خواهید پرونده جدیدی ثبت کنید، پرونده قبلی حذف شده و باید هزینه ارزیابی جدید پرداخت شود.\n\n" +
          "آیا مایل به حذف پرونده قبلی و شروع ارزیابی جدید هستید؟"
        );
        if (confirmNew) {
          for (const item of existingList) {
            await deleteAssessment(item.id);
          }
          const fresh = await fetchCurrentUser();
          if (fresh) setUser(fresh);
          setUserProfile(DEFAULT_PROFILE);
          setResults(null);
          setActiveTab("assessment");
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          setIsUserPanelOpen(true);
        }
        return;
      }
    } catch (e) {
      console.warn("Could not check existing assessments:", e);
    }

    setActiveTab("assessment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle Save Current Assessment to Cloud
  const handleSaveToCloud = async () => {
    if (!results) return;
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsSavingToCloud(true);
    setCloudSaveMessage(null);
    try {
      await saveAssessmentToCloud(userProfile, results);
      setIsSavedToCloud(true);
      clearAssessmentDraft();
    } catch (e) {
      console.error("Failed to save to cloud:", e);
      setIsSavedToCloud(false);
      setCloudSaveMessage("ذخیره پرونده در حساب کاربری ناموفق بود. اطلاعات این صفحه حفظ شده؛ دوباره تلاش کنید.");
    } finally {
      setIsSavingToCloud(false);
    }
  };

  // Handle Login Success
  const handleLoginSuccess = (loggedInUser: AuthUser) => {
    setUser(loggedInUser);
    setIsAuthModalOpen(false);

    if (pendingStartAssessment || activeTab === "home") {
      setPendingStartAssessment(false);
      setActiveTab("assessment");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (results) {
      saveAssessmentToCloud(userProfile, results)
        .then(() => setIsSavedToCloud(true))
        .catch((e) => console.warn("Auto-sync error after login:", e));
    }
  };

  // Handle Loading an Assessment from User Panel
  const handleLoadAssessment = (profile: UserAssessmentProfile, loadedResults: RecommendationSummary) => {
    setUserProfile(profile);
    setResults(loadedResults);
    setIsSavedToCloud(true);
    setActiveTab("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle Logout: Clean all user state and drafts so User B never inherits User A's data
  const handleLogout = () => {
    setUser(null);
    setUserProfile(DEFAULT_PROFILE);
    setResults(null);
    setIsSavedToCloud(false);
    setActiveTab("home");
    try {
      localStorage.removeItem("kochify_profile_draft");
      localStorage.removeItem("koochify_pending_profile");
      localStorage.removeItem("koochify_pending_results");
      localStorage.removeItem("koochify_pending_payment_track_id");
      sessionStorage.removeItem("kochify_profile_draft");
      sessionStorage.removeItem("koochify_pending_profile");
      sessionStorage.removeItem("koochify_pending_results");
      sessionStorage.removeItem("koochify_pending_payment_track_id");
    } catch {
      // Ignore
    }
  };

  // Handle Profile Import
  const handleProfileImport = (imported: UserAssessmentProfile) => {
    setUserProfile(imported);
    const summary = evaluateUserMigrationProfile(imported);
    setResults(summary);
    fetchGroqEvaluation(imported).then((aiEval) => {
      if (aiEval) {
        setResults((prev) => (prev ? { ...prev, aiEvaluation: aiEval } : prev));
      }
    }).catch(console.warn);

    if (!user?.isPaid) {
      setActiveTab("payment");
    } else {
      setActiveTab("results");
    }
  };

  // Handle Reset / Purge (In-Memory Only)
  const handleResetData = () => {
    setUserProfile(DEFAULT_PROFILE);
    setResults(null);
    setIsSavedToCloud(false);
    try {
      localStorage.removeItem("kochify_profile_draft");
      localStorage.removeItem("kochify_wizard_introduced");
      localStorage.removeItem("koochify_pending_payment_track_id");
    } catch { }
    setActiveTab("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle Download / Print Report
  const handleDownloadReport = () => {
    if (!results) return;

    // Strict access control: Full report download requires unlocked payment
    if (!user?.isPaid) {
      setIsPaymentModalOpen(true);
      return;
    }

    let md = `# گزارش جامع راهبردی مهاجرت کوچیفای (Kochify Report)\n`;
    md += `تاریخ ارزیابی: ${new Date().toLocaleDateString("fa-IR")} | نگارش سامانه: v2.6.1\n\n`;
    md += `> **توجه حقوقی:** این گزارش تحلیل غیررسمی تطابق شرایط خوداظهاری با قوانین مهاجرتی تا تاریخ بازبینی است و متضمن صدور ویزا یا پذیرش نیست.\n\n`;

    md += `## ۱. خلاصه پروفایل متقاضی\n`;
    md += `- سن: ${userProfile.age} سال\n`;
    md += `- بالاترین مقطع: ${userProfile.highestDegree} در رشته ${userProfile.fieldOfStudy}\n`;
    md += `- سابقه کار: ${userProfile.totalWorkExperienceYears} سال به عنوان ${userProfile.primaryJobTitle || "متخصص"}\n`;
    md += `- سطح زبان انگلیسی: ${userProfile.englishEstimatedLevel}\n`;
    md += `- بودجه در دسترس: ${userProfile.budgetRangeCategory} (${userProfile.budgetCurrency})\n\n`;

    md += `## ۲. سه مقصد برتر و متمایز پیشنهادی\n\n`;
    results.primaryDestinations.forEach((dest, idx) => {
      md += `### ${idx + 1}. ${dest.countryNameFa} — مسیر: ${dest.routeNameFa}\n`;
      md += `- **شاخص تناسب با شرایط اعلام‌شده:** ${dest.fitScore} از ۱۰۰\n`;
      md += `- **وضعیت صلاحیت فعلی:** ${dest.verdictLabelFa}\n`;
      md += `- **دلیل پیشنهاد:** ${dest.whyThisOptionFa}\n`;
      md += `- **حداقل تمکن رسمی:** ${dest.financialBreakdown.officialLivingFundFa} (معتبر از ${dest.financialBreakdown.rateEffectiveDate})\n`;
      md += `- **برآورد شهریه سال اول:** ${dest.financialBreakdown.annualTuitionEstimateFa}\n`;
      md += `- **مجموع هزینه تقریبی سال اول:** ${dest.financialBreakdown.estimatedFirstYearTotalFa}\n`;
      md += `- **حد قانونی زبان:** ${dest.languageRequirement.legalMinimumFa}\n`;
      md += `- **زمان‌بندی تقریبی:** ${dest.timelineEstFa}\n\n`;

      md += `#### مهم‌ترین اقدامات اجرایی بعدی:\n`;
      dest.nextActions.forEach((action) => {
        md += `- [ ] **${action.titleFa}**: ${action.descriptionFa} (مهلت: ${action.deadlineFa} | مسئول: ${action.responsibleParty})\n`;
      });
      md += `\n`;
    });

    md += `## ۳. نقاط قوت و شکاف‌های نیازمند تقویت پرونده\n`;
    md += `### نقاط قوت:\n`;
    results.profileStrengths.forEach((s) => (md += `- ${s}\n`));
    md += `\n### شکاف‌ها و موانع:\n`;
    results.profileGaps.forEach((g) => (md += `- ${g}\n`));
    md += `\n---\n*ایجاد شده توسط سامانه متن‌باز کوچیفای (Kochify)*\n`;

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kochify_migration_report_${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenDossier = (route: RecommendedRouteResult) => {
    setSelectedRouteForDossier(route);
    setIsDossierOpen(true);
  };

  if (showAdminView) {
    return (
      <div dir="rtl" className="min-h-screen bg-slate-900 text-slate-100 font-sans">
        <AdminLeadsView
          onBackToApp={() => {
            setShowAdminView(false);
            if (typeof window !== "undefined" && window.location.hash === "#admin") {
              window.location.hash = "";
            }
            fetchCurrentUser().then((fresh) => {
              if (fresh) setUser(fresh);
            });
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white" dir="rtl">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasResults={results !== null}
        onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
        onResetData={handleResetData}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenUserPanel={() => setIsUserPanelOpen(true)}
        onOpenPayment={() => setIsPaymentModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === "home" && (
          <LandingPage
            selectedGoal={selectedGoal}
            onSelectGoal={(g) => {
              setSelectedGoal(g);
              setUserProfile((prev) => ({ ...prev, migrationGoal: g }));
            }}
            onStartAssessment={handleStartAssessment}
            onViewCatalog={() => setActiveTab("catalog")}
          />
        )}

        {activeTab === "assessment" && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 space-y-4">
            {!user ? (
              <div className="max-w-md mx-auto py-16 text-center animate-fade-in">
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-slate-900">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 shadow-xs">
                    <Lock className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-black mb-2">
                    ورود به سامانه برای شروع ارزیابی
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-6">
                    جهت ذخیره اختصاصی و دسترسی همیشگی به پرونده ارزیابی و نتایج تحلیلی، لطفاً با شماره همراه خود وارد شوید.
                  </p>
                  <button
                    onClick={() => {
                      setPendingStartAssessment(true);
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    <span>ورود / ثبت‌نام با شماره موبایل</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("home")}
                    className="mt-4 text-xs text-slate-500 hover:text-slate-800 font-medium block mx-auto cursor-pointer"
                  >
                    ← بازگشت به صفحه اصلی
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center gap-2.5 text-xs text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>پرونده ارزیابی برای: <strong className="font-bold text-slate-900">{user.fullName || user.phoneNumber}</strong></span>
                  </div>
                  <button
                    onClick={() => setActiveTab("home")}
                    className="text-xs text-slate-500 hover:text-slate-900 font-bold cursor-pointer"
                  >
                    بازگشت به صفحه اصلی
                  </button>
                </div>

                <AssessmentWizard
                  initialGoal={selectedGoal}
                  onSubmit={handleAssessmentComplete}
                  isLoading={isCalculating}
                  user={user}
                  onUpdateUser={setUser}
                />
              </>
            )}
          </div>
        )}

        {activeTab === "payment" && (
          <PaymentScreen
            user={user}
            onPaymentSuccess={handlePaymentSuccess}
            onBackToEditForm={() => setActiveTab("assessment")}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            isPaymentRecoveryPending={isPaymentVerificationPending}
            isRecheckingPayment={isRecheckingPayment}
            onRetryPaymentVerification={() => {
              const trackId = paymentTrackId || localStorage.getItem("koochify_pending_payment_track_id");
              void verifyPendingPayment(trackId);
            }}
          />
        )}

        {activeTab === "results" && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            {results ? (
              <>
                {user?.isPaid && !isSavedToCloud && (
                  <div role="alert" className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
                    <p className="leading-relaxed">
                      {cloudSaveMessage || "پرداخت تأیید شده، اما پرونده هنوز در حساب کاربری ذخیره نشده است."}
                    </p>
                    <button
                      type="button"
                      onClick={() => void handleSaveToCloud()}
                      disabled={isSavingToCloud}
                      className="shrink-0 rounded-lg bg-amber-700 px-4 py-2 font-bold text-white disabled:opacity-60"
                    >
                      {isSavingToCloud ? "در حال ذخیره..." : "تلاش دوباره برای ذخیره پرونده"}
                    </button>
                  </div>
                )}
                <ResultsDashboard
                  summary={results}
                  profile={userProfile}
                  onSelectRouteForDossier={handleOpenDossier}
                  onOpenComparison={() => setIsComparisonOpen(true)}
                  onEditProfile={() => {
                    setActiveTab("assessment");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  onDownloadReport={handleDownloadReport}
                  user={user}
                  onOpenAuth={() => setIsAuthModalOpen(true)}
                  onSaveToCloud={handleSaveToCloud}
                  isSavedToCloud={isSavedToCloud}
                  onOpenUserPanel={() => setIsUserPanelOpen(true)}
                  onOpenPayment={() => setIsPaymentModalOpen(true)}
                />
              </>
            ) : (
              <div className="text-center py-20 bg-slate-900/60 rounded-3xl border border-slate-800 p-8 max-w-lg mx-auto">
                <Compass className="w-12 h-12 text-slate-500 mx-auto mb-4 animate-spin-slow" />
                <h3 className="text-lg font-bold text-slate-200 mb-2">هنوز ارزیابی را انجام نداده‌اید</h3>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  برای دریافت ۳ مقصد برتر متمایز، بررسی شرط‌های قانونی و پرونده کامل، فرم ارزیابی هوشمند چندمرحله‌ای را تکمیل کنید.
                </p>
                <button
                  onClick={() => setActiveTab("assessment")}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  شروع ارزیابی شرایط من
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "catalog" && (
          <CatalogExplorer />
        )}

        {activeTab === "opportunities" && (
          <OpportunitiesAndInterview />
        )}

        {activeTab === "sources" && (
          <SourcesAndAuditView />
        )}
      </main>

      {/* Modals */}
      {selectedRouteForDossier && (
        <DestinationDossierModal
          route={selectedRouteForDossier}
          onClose={() => {
            setIsDossierOpen(false);
            setSelectedRouteForDossier(null);
          }}
        />
      )}

      {results && (
        <RouteComparisonModal
          routes={results.primaryDestinations}
          isOpen={isComparisonOpen}
          onClose={() => setIsComparisonOpen(false)}
          onSelectDossier={(route) => {
            setIsComparisonOpen(false);
            handleOpenDossier(route);
          }}
        />
      )}

      <PrivacyAndDisclaimerModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        userProfile={userProfile}
        onProfileImport={handleProfileImport}
        onPurgeData={handleResetData}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Subscription & Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        user={user}
        onOpenAuth={() => {
          setIsPaymentModalOpen(false);
          setIsAuthModalOpen(true);
        }}
        onPaymentSuccess={(updatedUser) => {
          setUser(updatedUser);
          setIsPaymentModalOpen(false);
        }}
      />

      {/* User Dashboard / Panel Modal */}
      {user && (
        <UserPanelModal
          isOpen={isUserPanelOpen}
          onClose={() => setIsUserPanelOpen(false)}
          user={user}
          onLogout={handleLogout}
          onLoadAssessment={handleLoadAssessment}
          onOpenPayment={() => setIsPaymentModalOpen(true)}
          onStartNewAssessment={() => {
            setIsUserPanelOpen(false);
            handleStartAssessment();
          }}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 px-4 sm:px-6 text-xs text-slate-600">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">کوچیفای (Kochify)</div>
              <div className="text-[11px] text-slate-500">سامانه هوشمند تصمیم‌یار مهاجرت ویژه ایرانیان</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-[11px] font-semibold text-slate-600">
            <button
              onClick={() => {
                setActiveTab(results ? "results" : "assessment");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="hover:text-emerald-700 transition-colors cursor-pointer"
            >
              {results ? "ارزیابی من" : "فرم ارزیابی"}
            </button>
            <button
              onClick={() => {
                setActiveTab("catalog");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="hover:text-emerald-700 transition-colors cursor-pointer"
            >
              کاتالوگ ۳۰ کشور
            </button>
            <button
              onClick={() => {
                setActiveTab("opportunities");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="hover:text-emerald-700 transition-colors cursor-pointer"
            >
              فرصت‌ها و مصاحبه‌ها
            </button>
            <button
              onClick={() => {
                setActiveTab("sources");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="hover:text-emerald-700 transition-colors cursor-pointer"
            >
              شفافیت منابع
            </button>
            <button
              onClick={() => setIsPrivacyModalOpen(true)}
              className="text-emerald-700 hover:text-emerald-800 font-bold transition-colors cursor-pointer"
            >
              حریم خصوصی و سلب مسئولیت
            </button>
            <button
              onClick={() => {
                setShowAdminView(true);
                if (typeof window !== "undefined") window.location.hash = "#admin";
              }}
              className="text-slate-400 hover:text-emerald-700 font-mono transition-colors cursor-pointer"
              title="ورود به پنل سرنخ‌های فروش و تایید دستی"
            >
              پنل مدیریت (Leads)
            </button>
          </div>

          {/* Enamad Trust Seal */}
          <div className="flex flex-col items-center sm:items-end gap-1.5 shrink-0">
            <div
              className="bg-white p-1.5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-500/50 transition-all flex items-center justify-center cursor-pointer"
              dangerouslySetInnerHTML={{
                __html: `<a referrerpolicy='origin' target='_blank' href='https://trustseal.enamad.ir/?id=8347151&Code=cPtmp5o0en9YwezxN1LS9nOBqUpVAXl8'><img referrerpolicy='origin' src='https://trustseal.enamad.ir/logo.aspx?id=8347151&Code=cPtmp5o0en9YwezxN1LS9nOBqUpVAXl8' alt='' style='cursor:pointer' code='cPtmp5o0en9YwezxN1LS9nOBqUpVAXl8'></a>`
              }}
            />
            <span className="text-[10px] text-slate-400 font-medium">نماد اعتماد الکترونیکی</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div>کلیه حقوق برای سامانه کوچیفای محفوظ است © ۲۰۲۶</div>
          <div className="font-mono">داده‌ها به‌روزرسانی‌شده بر مبنای بخشنامه‌های مصوب ۲۰۲۶</div>
        </div>
      </footer>
    </div>
  );
}