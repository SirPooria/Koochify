import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  GraduationCap, 
  Briefcase, 
  Coins, 
  MessageSquare, 
  ArrowRight, 
  ArrowLeft, 
  Info,
  Calendar,
  Heart,
  Users,
  Compass,
  FileCheck,
  Award,
  Globe
} from "lucide-react";
import type { UserImmigrationProfile } from "../types";

interface ImmigrationFormProps {
  onSubmit: (profile: UserImmigrationProfile) => void;
  isLoading: boolean;
}

const INITIAL_PROFILE: UserImmigrationProfile = {
  fullName: "",
  age: 28,
  maritalStatus: "",
  education: "",
  fieldOfStudy: "",
  gpa: "",
  workExperienceYears: 3,
  jobTitle: "",
  englishLevel: "",
  otherLanguages: "",
  budgetTomans: "",
  immigrationCategoryPreference: "",
  destinationPriorities: [],
  interestedCountries: [],
  militaryStatus: "",
  academicPapersCount: "",
  academicRefLetters: "",
  workStage: "",
  languageExamRegistered: "",
  customNotes: "",
};

export default function ImmigrationForm({ onSubmit, isLoading }: ImmigrationFormProps) {
  const [step, setStep] = useState<number>(0); // 0 is landing, 1 to 5 are forms
  const [profile, setProfile] = useState<UserImmigrationProfile>(INITIAL_PROFILE);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleNext = () => {
    // Basic validation based on step
    if (step === 1) {
      if (!profile.fullName.trim()) {
        setErrorMsg("لطفاً نام و نام خانوادگی خود را وارد کنید.");
        return;
      }
      if (!profile.age || profile.age < 15 || profile.age > 75) {
        setErrorMsg("لطفاً سن معتبری بین ۱۵ تا ۷۵ سال وارد کنید.");
        return;
      }
      if (!profile.maritalStatus) {
        setErrorMsg("لطفاً وضعیت تاهل خود را مشخص کنید.");
        return;
      }
    } else if (step === 2) {
      if (!profile.education) {
        setErrorMsg("لطفاً آخرین مدرک تحصیلی خود را انتخاب کنید.");
        return;
      }
      if (!profile.fieldOfStudy.trim()) {
        setErrorMsg("لطفاً رشته تحصیلی خود را وارد کنید.");
        return;
      }
      if (!profile.englishLevel) {
        setErrorMsg("لطفاً سطح مهارت زبان انگلیسی خود را مشخص کنید.");
        return;
      }
    } else if (step === 3) {
      if (!profile.jobTitle.trim()) {
        setErrorMsg("لطفاً عنوان شغلی یا تخصص خود را وارد کنید.");
        return;
      }
      if (profile.workExperienceYears < 0 || profile.workExperienceYears > 45) {
        setErrorMsg("لطفاً سابقه کاری معتبری وارد کنید.");
        return;
      }
    } else if (step === 4) {
      if (!profile.budgetTomans) {
        setErrorMsg("لطفاً میزان حدود تمکن مالی یا بودجه خود را انتخاب کنید.");
        return;
      }
      if (!profile.immigrationCategoryPreference) {
        setErrorMsg("لطفاً اولویت یا علاقه مهاجرتی خود را مشخص کنید.");
        return;
      }
    }

    setErrorMsg("");
    setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setErrorMsg("");
    setStep((prev) => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(profile);
  };

  // Helper toggle for priorities
  const handleTogglePriority = (p: string) => {
    setProfile(prev => {
      const current = [...prev.destinationPriorities];
      if (current.includes(p)) {
        return { ...prev, destinationPriorities: current.filter(item => item !== p) };
      } else {
        return { ...prev, destinationPriorities: [...current, p] };
      }
    });
  };

  // Pre-determined options list
  const budgetOptions = [
    { value: "under_500m", label: "کمتر از ۵۰۰ میلیون تومان", desc: "مناسب بورسیه تحصیلی، کار مهارتی آلمان بدون شهریه" },
    { value: "500m_1_5b", label: "بین ۵۰۰ میلیون تا ۱.۵ میلیارد تومان", desc: "مناسب تحصیل در کشورهای ارزان اروپایی و ویزای کار" },
    { value: "1_5b_4b", label: "بین ۱.۵ تا ۴ میلیارد تومان", desc: "مناسب مهاجرت تحصیلی کانادا/استرالیا، ویزای استارتاپ و خوداشتغالی" },
    { value: "above_4b", label: "بیشتر از ۴ میلیارد تومان", desc: "تمکن عالی؛ مناسب تمام روش‌ها و سرمایه‌گذاری یا خرید ملک" }
  ];

  const educationOptions = [
    { value: "diploma", label: "دیپلم یا پیش‌دانشگاهی" },
    { value: "associate", label: "کاردانی / فوق دیپلم" },
    { value: "bachelor", label: "کارشناسی / لیسانس" },
    { value: "master", label: "کارشناسی ارشد / فوق لیسانس" },
    { value: "phd", label: "دکتری تخصصی / PhD" }
  ];

  const englishOptions = [
    { value: "none", label: "فاقد مهارت / بدون مدرک زبان", desc: "تمایل به یادگیری در مقصد یا نیاز به دوره‌های پیش‌نیاز" },
    { value: "basic", label: "مبتدی (IELTS معادل زیر ۵)", desc: "شناخت اولیه لغات و مکالمات ساده" },
    { value: "intermediate", label: "متوسط (IELTS معادل ۵.۵ تا ۶)", desc: "مناسب برخی پذیرش‌های دانشگاهی یا کار موقت" },
    { value: "ielts_6_7", label: "خوب (IELTS معادل ۶.۵ تا ۷)", desc: "سطح طلایی برای اکسپرس اینتری و ویزای تحصیلی معتبر" },
    { value: "ielts_7_plus", label: "عالی/پیشرفته (IELTS معادل بالای ۷.۵)", desc: "برتری رقابتی بالا و امکان دریافت بورسیه و آفر عالی" }
  ];

  const categoryOptions = [
    { value: "any", label: "بررسی تمام متدهای ممکن (پیشنهادی)", desc: "انتخاب بهترین متد با نظر وکیل هوش مصنوعی" },
    { value: "work", label: "مهاجرت کاری (Job Offer / Skill Worker)", desc: "با تکیه بر تخصص کاری، پیشنهاد شغلی یا ویزای جستجوی کار" },
    { value: "study", label: "مهاجرت تحصیلی (بورسیه، فاند یا شهریه شخصی)", desc: "پذیرش از کالج، دانشگاه یا مقاطع عالی" },
    { value: "investment", label: "سرمایه‌گذاری / خرید ملک یا تمکن مالی (حمایتی)", desc: "اقامت طلایی اروپا، خرید ملک یا برنامه‌های انتقال سرمایه" },
    { value: "startup_entrepreneur", label: "استارتاپ / کارآفرینی / ثبت شرکت", desc: "خلاقیت تجاری، ایده نوآورانه و ویزای نوآوری" },
    { value: "artists_athletes", label: "هنرمندان / ورزشکاران / نخبگان خاص", desc: "رزومه هنری یا ورزشی معتبر برای ویزاهای خاص" }
  ];

  const priorityOptions = [
    "سرعت در فرآیند صدور ویزا",
    "امکان همراهی همسر و فرزندان از بدو ورود",
    "پایین بودن هزینه تحصیل یا رایگان بودن دانشگاه",
    "آب و هوای معتدل و سازگار با ایران",
    "سهولت در اخذ اقامت دائم و پاسپورت نهایی",
    "رشد بالای بازار کار تکنولوژی و مهندسی",
    "وجود جامعه ایرانیان قوی در کشور مقصد",
    "امکان مهاجرت بدون نیاز به مدرک زبان بالا"
  ];

  // Steps breadcrumb
  const totalSubSteps = 5;

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden" id="immigration_form_wrapper">
      {/* Step Progress indicator */}
      {step > 0 && (
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-sm">
              {step}
            </span>
            <span className="text-sm font-semibold text-slate-700">
              {step === 1 && "اطلاعات هویت و پرسنلی"}
              {step === 2 && "تحصیلات و سطح زبان پرونده"}
              {step === 3 && "تجربه و حرفه کاری"}
              {step === 4 && "بودجه و روش مهاجرتی"}
              {step === 5 && "شرح حال و جزئیات نهایی متقاضی"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 h-2 w-48 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-teal-600 transition-all duration-300"
              style={{ width: `${(step / totalSubSteps) * 100}%` }}
            />
          </div>
          <span className="text-xs text-slate-500 font-mono">
            گام {step} از {totalSubSteps}
          </span>
        </div>
      )}

      {/* Main Content Area with Transitions */}
      <div className="p-6 md:p-10">
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-start gap-2.5 text-sm"
          >
            <Info className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 0: LANDING INTRO */}
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 text-center md:py-4"
            >
              <div className="flex justify-center mb-2">
                <span className="p-4 bg-teal-50 text-teal-600 rounded-2xl">
                  <Compass className="w-12 h-12 stroke-[1.5]" />
                </span>
              </div>
              
              <div className="space-y-2">
                <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-semibold">
                  تحلیل و شبیه‌سازی هوشمند قوانین ۲۰۲۶
                </span>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight leading-relaxed">
                  کجا و چطوری مهاجرت کنم؟
                </h1>
                <p className="text-slate-600 max-w-2xl mx-auto text-sm md:text-base leading-loose">
                  سالیانه هزاران هموطن با انتخاب مسیر اشتباه، مبالغ هنگفتی را به دلالان و موسسات نامعتبر پرداخت می‌کنند. این دستیار هوشمند، بر اساس علم وکیل مهاجرتی و قوانین کاملاً به روز شده سال ۲۰۲۶، شرایط دقیق شما را سنجیده و بهترین مسیر را شبیه‌سازی می‌کند.
                </p>
              </div>

              {/* Grid with Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 max-w-3xl mx-auto text-right">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <FileCheck className="w-8 h-8 text-teal-600 mb-2" />
                  <h3 className="font-bold text-slate-800 text-sm mb-1">ارزیابی همه‌جانبه</h3>
                  <p className="text-xs text-slate-500 leading-normal">
                    سن، مدرک تحصیلی، شغل، سرمایه ارزی و زبان شما را طبق آخرین قوانین سنجش می‌کنیم.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <Globe className="w-8 h-8 text-teal-600 mb-2" />
                  <h3 className="font-bold text-slate-800 text-sm mb-1">۳ بهینه ترین مقصد</h3>
                  <p className="text-xs text-slate-500 leading-normal">
                    تحلیل مقایسه‌ای ۳ کشور منتخب با ذکر درصد شانس قبولی واقعی و نوع ویزا.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <Award className="w-8 h-8 text-teal-600 mb-2" />
                  <h3 className="font-bold text-slate-800 text-sm mb-1">نقشه راه بهبود رزومه</h3>
                  <p className="text-xs text-slate-500 leading-normal">
                    وکیل هوش مصنوعی نقاط ضعف شما را اعلام کرده و برنامه افزایش امتیاز به شما ارائه می‌دهد.
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  id="btn_start_questionnaire"
                  onClick={() => setStep(1)}
                  className="px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-full font-bold text-base transition-all duration-200 inline-flex items-center gap-2 shadow-lg hover:shadow-teal-100 cursor-pointer"
                >
                  <span>شروع ارزیابی مشخصات پرونده</span>
                  <ArrowRight className="w-5 h-5 shrink-0" />
                </button>
                <p className="text-[11px] text-slate-400 mt-3">
                  تکمیل این پرسشنامه حدود ۴ دقیقه زمان می‌برد. پاسخ‌های دقیق شانس تحلیل باکیفیت‌تر را بالا خواهد برد.
                </p>
              </div>
            </motion.div>
          )}

          {/* STEP 1: PERSONAL DETAILS */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              className="space-y-6"
            >
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <User className="text-teal-600 w-5 h-5 py-0.5" />
                  <span>قدم اول: مانیفست سجلی و اهداف جغرافیایی</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">تکمیل مشخصات عمومی پرونده اولین ضابطه ارزیابی سن بهینه و انطباق قوانین مرزی سال ۲۰۲۶ است.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full name */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">نام و نام خانوادگی رسمی (یا نام مستعار)</label>
                  <input
                    type="text"
                    required
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    placeholder="مثال: دکتر آرش رادمنش"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-sm text-right"
                  />
                </div>

                {/* Age */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">سن شناسنامه‌ای دقیق</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="15"
                      max="75"
                      value={profile.age}
                      onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none text-sm text-center font-mono"
                    />
                    <span className="text-slate-500 text-sm whitespace-nowrap font-medium">سال سن</span>
                  </div>
                  <p className="text-[11px] text-slate-400">سن طلایی در برنامه‌های مهارتی (Express Entry / Chancenkarte) بین ۱۸ تا ۳۵ سال تمام است.</p>
                </div>
              </div>

              {/* Marital Status Cards */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">وضعیت تاهل و تایید تکفل متقاضی</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, maritalStatus: "single" })}
                    className={`p-4 rounded-2xl border text-right transition-all cursor-pointer ${
                      profile.maritalStatus === "single"
                        ? "border-teal-600 bg-teal-50/50"
                        : "border-slate-100 bg-slate-50 hover:bg-slate-100/70"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`p-2 rounded-xl transition-all ${profile.maritalStatus === 'single' ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        <User className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-slate-800">مجرد / اقدام انفرادی</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">بدون نیاز به سنجش امتیازات زوجین</p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, maritalStatus: "married" })}
                    className={`p-4 rounded-2xl border text-right transition-all cursor-pointer ${
                      profile.maritalStatus === "married"
                        ? "border-teal-600 bg-teal-50/50"
                        : "border-slate-100 bg-slate-50 hover:bg-slate-100/70"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`p-2 rounded-xl transition-all ${profile.maritalStatus === 'married' ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        <Heart className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-slate-800">متاهل (همراهی همسر)</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">امکان ارتقای پرونده شغلی با مدارک همسر</p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, maritalStatus: "married_with_children" })}
                    className={`p-4 rounded-2xl border text-right transition-all cursor-pointer ${
                      profile.maritalStatus === "married_with_children"
                        ? "border-teal-600 bg-teal-50/50"
                        : "border-slate-100 bg-slate-50 hover:bg-slate-100/70"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`p-2 rounded-xl transition-all ${profile.maritalStatus === 'married_with_children' ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        <Users className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-slate-800">متاهل متبوع فرزندان</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">سنجش فاکتور تحصیل کودکان و معافیت‌های اقامتی</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Military Status Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">آخرین وضعیت نظام وظیفه (مخصوص آقایان - خانم‌ها این بخش را رد کنند)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: "completed", label: "پایان خدمت / معافیت دائم", desc: "بدون ممانعت تردد خروج" },
                    { value: "educational_exemption", label: "معافیت تحصیلی فعال", desc: "مجاز به خروج با وثيقه" },
                    { value: "not_completed_no_exemption", label: "مشمول بدون معافیت", desc: "نیاز به رفع موانع نظام وظیفه" },
                    { value: "exempt_or_female", label: "عدم نیاز (متقاضی خانم)", desc: "مشمول قوانین خدمت نمی‌باشد" }
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setProfile({ ...profile, militaryStatus: opt.value as any })}
                      className={`p-3 rounded-xl border text-right transition-all cursor-pointer text-xs ${
                        profile.militaryStatus === opt.value
                          ? "border-teal-600 bg-teal-50/50 text-teal-900 ring-1 ring-teal-500/20 font-bold"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <span className="font-bold block text-slate-850">{opt.label}</span>
                      <span className="text-[9px] text-slate-450 block mt-0.5">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred destination countries */}
              <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-800">کشورهای مورد علاقه شما برای بررسی اختصاصی موازی (انتخابی اختیاری):</label>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold">کاملاً اختیاری</span>
                </div>
                <p className="text-[10px] text-slate-550 leading-relaxed">
                  هوش مصنوعی به صورت اتوماتیک ۳ کاندیدای برتر جهانی واقعی را برای شما استخراج خواهد کرد. مقاصد انتخاب شده در این بخش بدون اعمال محدودیت، در انتها به صورت پیوست مورد تحلیل موازی قرار می‌گیرند.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["کانادا", "آلمان", "استرالیا", "انگلستان", "سوئد", "امارات", "عمان", "ایتالیا", "فرانسه"].map((countryName) => {
                    const isSelected = profile.interestedCountries.includes(countryName);
                    return (
                      <button
                        key={countryName}
                        type="button"
                        onClick={() => {
                          setProfile(prev => {
                            const current = [...prev.interestedCountries];
                            if (current.includes(countryName)) {
                              return { ...prev, interestedCountries: current.filter(c => c !== countryName) };
                            } else {
                              return { ...prev, interestedCountries: [...current, countryName] };
                            }
                          });
                        }}
                        className={`text-xs px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer font-semibold ${
                          isSelected
                            ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 hover:border-teal-500"
                        }`}
                      >
                        {countryName}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation controls */}
              <div className="flex justify-between pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-5 py-2.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 font-semibold text-sm rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 shrink-0 rotate-180" />
                  <span>انصراف</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl transition-all inline-flex items-center gap-1.5 shadow focus:ring-2 focus:ring-teal-200 cursor-pointer"
                >
                  <span>مرحله بعد</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: EDUCATION AND LANGUAGE */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              className="space-y-6"
            >
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <GraduationCap className="text-teal-600 w-5 h-5" />
                  <span>قدم دوم: سوابق تحصیلی و اسناد مهارت زبان</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">مدارک معتبر آکادمیک و گواهینامه‌های رسمی زبان معیار اولیه تایید ارزش تحصیلی و شغلی شماست.</p>
              </div>

              {/* Last degree */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">آخرین مقطع تحصیلی فارغ‌التحصیل شده</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {educationOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setProfile({ ...profile, education: opt.value as any })}
                      className={`py-3 px-2 rounded-xl border text-center transition-all cursor-pointer text-xs font-semibold ${
                        profile.education === opt.value
                          ? "border-teal-600 bg-teal-50 text-teal-700 ring-2 ring-teal-500/10"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100/70"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field & GPA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">عنوان دقیق رشته تحصیلی</label>
                  <input
                    type="text"
                    value={profile.fieldOfStudy}
                    onChange={(e) => setProfile({ ...profile, fieldOfStudy: e.target.value })}
                    placeholder="مثال: مهندسی عمران / مترجمی زبان"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">معدل یا بازه نمرات</label>
                  <input
                    type="text"
                    value={profile.gpa}
                    onChange={(e) => setProfile({ ...profile, gpa: e.target.value })}
                    placeholder="مثال: ۱۵.۷۰ یا بالای ۳ از ۴"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none text-sm text-center font-mono"
                  />
                  <p className="text-[10px] text-slate-400">معدل بالای ۱۵ شانس اخذ پذیرش مستقیم از دانشگاه‌ها را افزایش می‌دهد.</p>
                </div>
              </div>

              {/* Special Academic research section for Higher degrees / Study preference */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5 border-b border-indigo-100/40 pb-2">
                  <FileCheck className="w-4 h-4 text-indigo-600" />
                  <span>تکمیلی: پژوهش‌های علمی (مخصوص متقاضیان پذیرش تحصیلی، ارشد تخصصی و دکتری)</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Academic papers count */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-slate-700">وضعیت مقالات علمی (ISI یا کنفرانسی معتبر):</label>
                    <select
                      value={profile.academicPapersCount}
                      onChange={(e) => setProfile({ ...profile, academicPapersCount: e.target.value as any })}
                      className="w-full p-2.5 bg-white border border-slate-250 rounded-xl text-xs text-slate-800 outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="">-- انتخاب کنید --</option>
                      <option value="none">فاقد مقاله نگارش یافته یا چاپ شده</option>
                      <option value="1_2">دارای ۱ الی ۲ مقاله ثبت شده / پذیرفته شده</option>
                      <option value="3_plus">دارای ۳ مقاله به بالا (پتانسیل عالی جهت بورسیه کامل)</option>
                    </select>
                  </div>

                  {/* Reference letters */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-slate-700">امکان اخذ حداقل ۲ توصیه‌نامه (Recommendation) موافق از دانشگاه قبلی:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setProfile({ ...profile, academicRefLetters: "yes" })}
                        className={`py-2 px-1 text-center text-xs rounded-lg border transition-all cursor-pointer ${
                          profile.academicRefLetters === "yes"
                            ? "border-teal-600 bg-teal-50 text-teal-900 font-bold"
                            : "border-slate-200 bg-white text-slate-600"
                        }`}
                      >
                        بله، کاملا در دسترس است
                      </button>
                      <button
                        type="button"
                        onClick={() => setProfile({ ...profile, academicRefLetters: "no" })}
                        className={`py-2 px-1 text-center text-xs rounded-lg border transition-all cursor-pointer ${
                          profile.academicRefLetters === "no"
                            ? "border-amber-600 bg-amber-50 text-amber-900 font-bold"
                            : "border-slate-200 bg-white text-slate-600"
                        }`}
                      >
                        خیر، دسترسی ندارم
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* English Level */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-700">سطح مهارت زبان انگلیسی فعلی</label>
                <div className="space-y-2">
                  {englishOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setProfile({ ...profile, englishLevel: opt.value as any })}
                      className={`w-full p-3 rounded-xl border text-right transition-all cursor-pointer ${
                        profile.englishLevel === opt.value
                          ? "border-teal-600 bg-teal-50/50"
                          : "border-slate-100 bg-slate-50 hover:bg-slate-100/70"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full ${profile.englishLevel === opt.value ? 'bg-teal-600' : 'bg-slate-300'}`} />
                        <div>
                          <span className="font-bold text-xs text-slate-800">{opt.label}</span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">{opt.desc}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Formal exam registration timeline */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">آیا برای آزمون رسمی زبان ثبت‌نام آزمون انجام داده‌اید؟</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { value: "yes", label: "بله، تاریخ آزمون مشخص است", desc: "آزمون رسمی در کمتر از ۳ ماه آینده برقرار است" },
                    { value: "preparing", label: "خیر، در حال آماده‌سازی و ممارست", desc: "مطالعه دارم ولی هنوز تاریخی فیکس نکرده‌ام" },
                    { value: "no", label: "خیر، ثبت نامی ندارم", desc: "نظری بر پذیرش بدون زبان یا شروع از کورس ابتدایی دارم" }
                  ].map((cand) => (
                    <button
                      key={cand.value}
                      type="button"
                      onClick={() => setProfile({ ...profile, languageExamRegistered: cand.value as any })}
                      className={`p-3 rounded-xl border text-right transition-all cursor-pointer text-xs ${
                        profile.languageExamRegistered === cand.value
                          ? "border-teal-600 bg-teal-50/50 text-teal-900 ring-1 ring-teal-500/25 font-bold"
                          : "border-slate-200 bg-slate-50 text-slate-650"
                      }`}
                    >
                      <span className="font-bold block text-slate-800">{cand.label}</span>
                      <span className="text-[9px] text-slate-450 block mt-0.5 leading-tight">{cand.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Other Languages */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">سایر مهارت‌های زبانی (اختیاری)</label>
                <input
                  type="text"
                  value={profile.otherLanguages}
                  onChange={(e) => setProfile({ ...profile, otherLanguages: e.target.value })}
                  placeholder="مثال: تسلط به زبان آلمانی در سطح B2 / آشنایی با زبان عربی"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                />
              </div>

              {/* Navigation controls */}
              <div className="flex justify-between pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-5 py-2.5 text-slate-550 hover:text-slate-800 hover:bg-slate-100 font-semibold text-sm rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 shrink-0 rotate-180" />
                  <span>مرحله قبل</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl transition-all inline-flex items-center gap-1.5 shadow focus:ring-2 focus:ring-teal-200 cursor-pointer"
                >
                  <span>مرحله بعد</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: WORK HISTORY */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              className="space-y-6"
            >
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Briefcase className="text-teal-600 w-5 h-5" />
                  <span>قدم سوم: سوابق شغلی و تجربه تخصصی</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">تخصص حرفه‌ای، بیمه قابل مکتوب و انطباق آن با کدهای مشاغل بین‌المللی اساس تایید مدارک کاری است.</p>
              </div>

              <div className="space-y-4">
                {/* Job Title */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">عنوان دقیق شغل یا تخصص فنی</label>
                  <input
                    type="text"
                    required
                    value={profile.jobTitle}
                    onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })}
                    placeholder="مثال: منشی مطب، توسعه‌دهنده وب پایتون، مدیر بازرگانی، جوشکار آرگون"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none text-sm text-right"
                  />
                  <p className="text-[11px] text-slate-400">کد ناک‌های شغلی کشورهای مهاجرتی بر اساس این فیلد سنجیده می‌شوند.</p>
                </div>

                {/* Work Experience Slider */}
                <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-slate-700">سابقه کار مرتبط و مکتوب (با بیمه یا فیش حقوقی معتبر):</label>
                    <span className="font-mono text-teal-600 font-extrabold text-lg px-3 py-1 bg-white border border-slate-100 rounded-lg">
                      {profile.workExperienceYears || 0} سال
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    value={profile.workExperienceYears}
                    onChange={(e) => setProfile({ ...profile, workExperienceYears: parseInt(e.target.value) || 0 })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>فاقد سابقه رسمی (۰)</span>
                    <span>متوسط (۵ سال)</span>
                    <span>حرفه‌ای و ارشد (۱۰+ سال)</span>
                  </div>
                </div>

                {/* Job Search progress stages (workStage) */}
                <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <label className="block text-sm font-bold text-slate-800">وضعیت پیشروی و ممارست شما در استخدام‌های بین‌المللی:</label>
                  <div className="space-y-2">
                    {[
                      { value: "just_started", label: "به تازگی آغاز کرده‌ام و اقدام خاصی تا کنون صورت نداده‌ام", desc: "بدون ارسال رزومه یا آماده‌سازی خاص" },
                      { value: "has_cv", label: "یک رزومه استاندارد استارتاپی یا فرمت بین‌المللی (Canada/Europass CV) دارم", desc: "ترجمه شده و بهینه برای سیستم‌های ATS غرب" },
                      { value: "has_linkedin", label: "پروفایل لینکدین دوزبانه فعال دارم و مشغول شبکه‌سازی شغلی هستم", desc: "پروفایل بهینه شده بر حسب کلیدواژه‌های شغلی خارج کشور" },
                      { value: "applied_interviews", label: "درخواست‌های متعددی فرستاده‌ام و وارد فرآیند مصاحبه اولیه یا جدی شده‌ام", desc: "دارای تجربه گفتگو یا آزمون‌های فنی اولیه خارج کشور" },
                      { value: "has_offer", label: "دارای پیشنهاد کاری رسمی (Job Offer) یا پیش‌نویس قرارداد مشروط هستم", desc: "پربازده‌ترین دستاورد جهت اخذ فوری ویزای کار" }
                    ].map((stg) => (
                      <button
                        key={stg.value}
                        type="button"
                        onClick={() => setProfile({ ...profile, workStage: stg.value as any })}
                        className={`w-full p-3 rounded-xl border text-right transition-all cursor-pointer text-xs ${
                          profile.workStage === stg.value
                            ? "border-teal-600 bg-teal-50/50 text-teal-950 font-bold"
                            : "border-slate-100 bg-white text-slate-650 hover:bg-slate-100/50"
                        }`}
                      >
                        <span className="font-bold block text-slate-800">{stg.label}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5 leading-normal">{stg.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Info text box */}
              <div className="p-4 bg-amber-50/50 border border-amber-100/70 rounded-2xl flex gap-3 text-right">
                <span className="text-amber-600 pt-0.5"><Info className="w-5 h-5 shrink-0" /></span>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">نکته بسیار مهم حقوقی (قوانین ۲۰۲۶):</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                    برخی مقاصد مهاجرتی مانند آلمان، امکان پذیرش بدون سابقه کار بیمه‌ای را با تکیه بر مانیفست مهارتی کارگر فراهم کرده‌اند. در مقابل، سیستم اکسپرس انتری کانادا برای تخصیص لایسنس کار، سابقه دقیق و مستند بیمه‌ای یا فیش مالیاتی را به شدت زیر ذره‌بین قرار می‌دهد.
                  </p>
                </div>
              </div>

              {/* Navigation controls */}
              <div className="flex justify-between pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-5 py-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-semibold text-sm rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 shrink-0 rotate-180" />
                  <span>مرحله قبل</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl transition-all inline-flex items-center gap-1.5 shadow focus:ring-2 focus:ring-teal-200 cursor-pointer"
                >
                  <span>مرحله بعد</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: BUDGET AND PREFERENCES */}
          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              className="space-y-6"
            >
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Coins className="text-teal-600 w-5 h-5" />
                  <span>قدم چهارم: تمکن مالی و دسته مهاجرتی</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">سنجش صادقانه بودجه برای تدارک هزینه‌های وکیل، ترجمه مدارک، شهریه ترم اول دانشگاه و هزینه‌های اولیه اسکان ضروری است.</p>
              </div>

              {/* Budget Option Cards */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">کل دارایی مایع و تمکن مالی قابل ارایه (تومان)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {budgetOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setProfile({ ...profile, budgetTomans: opt.value as any })}
                      className={`p-4 rounded-2xl border text-right transition-all cursor-pointer ${
                        profile.budgetTomans === opt.value
                          ? "border-teal-600 bg-teal-50/50"
                          : "border-slate-100 bg-slate-50 hover:bg-slate-100/70"
                      }`}
                    >
                      <div className="flex gap-3">
                        <span className={`p-2 rounded-xl h-10 w-10 flex items-center justify-center shrink-0 ${profile.budgetTomans === opt.value ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                          <Coins className="w-5 h-5" />
                        </span>
                        <div>
                          <h4 className="font-bold text-sm text-slate-800">{opt.label}</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">{opt.desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preference category cards */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">روش مهاجرتی مورد علاقه شما</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categoryOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setProfile({ ...profile, immigrationCategoryPreference: opt.value as any })}
                      className={`p-3 rounded-xl border text-right transition-all cursor-pointer text-xs ${
                        profile.immigrationCategoryPreference === opt.value
                          ? "border-teal-600 bg-teal-50/50"
                          : "border-slate-100 bg-slate-50 hover:bg-slate-100/70"
                      }`}
                    >
                      <h4 className="font-bold text-slate-800">{opt.label}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Priorities Tag Checklist */}
              <div className="space-y-2.5">
                <label className="block text-sm font-bold text-slate-700">ترجیحات و اولویت‌های حیاتی مقصد شما (یک یا چند گزینه انتخاب کنید):</label>
                <div className="flex flex-wrap gap-2">
                  {priorityOptions.map((p) => {
                    const isSelected = profile.destinationPriorities.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handleTogglePriority(p)}
                        className={`text-xs px-3 py-2 rounded-full border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-teal-600 text-white border-teal-600 hover:bg-teal-700"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-350 hover:bg-slate-100"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation controls */}
              <div className="flex justify-between pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-5 py-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-semibold text-sm rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 shrink-0 rotate-180" />
                  <span>مرحله قبل</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl transition-all inline-flex items-center gap-1.5 shadow focus:ring-2 focus:ring-teal-200 cursor-pointer"
                >
                  <span>مرحله بعد</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: ADDITIONAL CUSTOM DESCRIPTION */}
          {step === 5 && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              className="space-y-6"
            >
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <MessageSquare className="text-teal-600 w-5 h-5" />
                  <span>قدم پنجم: شرح حال و یادداشت‌های اختیاری</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">توضیحاتی از قبیل ریجکتی‌های قبلی کشورها، مهارت‌های خاص، اقوام درجه یک در خارج و برنامه‌های استارتاپی را اینجا وارد کنید.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">شرح دلایل، روحیات یا نیازهای شخصی شما برای مهاجرت (فارسی)</label>
                  <textarea
                    rows={6}
                    value={profile.customNotes}
                    onChange={(e) => setProfile({ ...profile, customNotes: e.target.value })}
                    placeholder="مثال: من به دنبال مهاجرتی سریع ترجیحا برای کشور آلمان یا کانادا هستم. همسرم معلم زبان است و توانایی خوبی دارد اما خودم هنوز آیلتس نداده‌ام. نگران هزینه‌های اولیه هستم و ترجیح می‌دهم روشی انتخاب شود که از ابتدا به همراه خانواده خارج شویم ..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none text-sm leading-relaxed"
                  />
                  <p className="text-[11px] text-slate-400">نوشتن توضیحات، دقت تحلیل و پیشنهادهای وکیل هوش مصنوعی را به شدت غنی‌تر و اختصاصی‌تر می‌کند.</p>
                </div>
              </div>

              {/* Terms of services */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                <span className="p-1 px-2 text-[10px] bg-teal-100 text-teal-800 rounded-lg shrink-0 font-bold mt-0.5">مشاوره ۲۰۲۶</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  با تایید نهایی مشخصات پرونده، اطلاعات شما برای موتور هوشمند وکیل ارزیابی دیجیتال ارسال شده و پرونده شما در سیستم شبیه‌ساز امتیازات مهارتی، تمکن مالی و قوانین پذیرش ۲۰۲۶ کشورها تحلیل خواهد شد. روند پردازش ۳۰ ثانیه زمان به طول خواهد انجامید.
                </p>
              </div>

              {/* Navigation controls */}
              <div className="flex justify-between pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-5 py-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-semibold text-sm rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 shrink-0 rotate-180" />
                  <span>مرحله قبل</span>
                </button>
                <button
                  type="button"
                  id="btn_submit_immigration_profile"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-7 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-bold text-sm rounded-xl transition-all inline-flex items-center gap-1.5 shadow-lg shadow-teal-500/15 cursor-pointer"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>در حال آنالیز پرونده مهاجرت...</span>
                    </span>
                  ) : (
                    <>
                      <span>ثبت و تحلیل نهایی پرونده</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
