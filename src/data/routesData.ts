import { DocumentItem, DegreeLevel } from "../types";

export interface RouteDefinition {
  id: string;
  countryCode: string;
  countryNameFa: string;
  countryNameEn: string;
  flagEmoji: string;
  routeNameFa: string;
  routeNameEn: string;
  routeType: "study" | "work_job_offer" | "skilled_pr" | "job_seeker" | "research_phd";
  routeTypeBadgeFa: string;
  overviewFa: string;

  // Hard Gate requirements
  minAge: number | null;
  maxAge: number | null;
  minDegree: DegreeLevel;
  requiresJobOffer: boolean;
  requiresAdmission: boolean;
  minWorkExpYears: number;
  minCefrEnglish: "none" | "B1" | "B2" | "C1";
  minCefrSecondLang?: { lang: string; level: "A1" | "A2" | "B1" | "B2" };
  regulatedLicenseMustBeHandled: boolean;

  // Language comparison strings
  legalLanguageRuleFa: string;
  practicalLanguageTargetFa: string;

  // Financial baseline
  proofOfFunds: {
    currency: string;
    livingAmountSingle: number;
    livingAmountTwoPeople: number;
    livingAmountPerAdditionalDependent: number;
    effectiveFrom: string;
    excludes: string[]; // e.g. ["tuition", "travel"]
    notesFa: string;
    sourceId: string;
  };
  typicalTuitionUsdEstimate: {
    bachelor: number;
    master: number;
    phd: number;
  };

  // Timeline & Documents
  estimatedProcessMonthsFa: string;
  documents: DocumentItem[];
  keyRisksFa: string[];
  remedyPathwaysFa: string[];
  citationSourceIds: string[];
  lastVerifiedAt: string;
}

export const ACTIVE_ROUTES: RouteDefinition[] = [
  // 1. CANADA: Study Permit (Regular Stream)
  {
    id: "ca_study_permit",
    countryCode: "CA",
    countryNameFa: "کانادا",
    countryNameEn: "Canada",
    flagEmoji: "🇨🇦",
    routeNameFa: "مجوز تحصیلی عادی کانادا (Study Permit)",
    routeNameEn: "Canada Study Permit (Post-Secondary)",
    routeType: "study",
    routeTypeBadgeFa: "مهاجرت تحصیلی",
    overviewFa: "تحصیل در کالج‌ها یا دانشگاه‌های دارای DLI کانادا با اجازه کار پاره‌وقت دانشجویی و امکان درخواست کار پس از تحصیل (PGWP) در برنامه‌های واجدشرایط.",
    minAge: 17,
    maxAge: null,
    minDegree: "diploma",
    requiresJobOffer: false,
    requiresAdmission: true,
    minWorkExpYears: 0,
    minCefrEnglish: "B2",
    regulatedLicenseMustBeHandled: false,
    legalLanguageRuleFa: "نمره زبان مورد قبول DLI (معمولاً معادل آیلتس ۶ یا ۶.۵ آکادمیک برای پذیرش و صدور نامه PAL/TAL).",
    practicalLanguageTargetFa: "آیلتس آکادمیک ۶.۵ یا ۷ جهت افزایش شانس اخذ ویزا و دفاع در آزمون واقعی کلاس‌های دانشگاهی.",
    proofOfFunds: {
      currency: "CAD",
      livingAmountSingle: 23448,
      livingAmountTwoPeople: 29192,
      livingAmountPerAdditionalDependent: 6318,
      effectiveFrom: "2026-09-01",
      excludes: ["شهریه سال اول", "بلیت پرواز و حمل‌ونقل"],
      notesFa: "نرخ مصوب IRCC مؤثر از ۱ سپتامبر ۲۰۲۶ برای خارج از کبک. شهریه دوره به صورت جداگانه اضافه می‌شود.",
      sourceId: "src_ircc_funds"
    },
    typicalTuitionUsdEstimate: {
      bachelor: 22000,
      master: 18000,
      phd: 9000
    },
    estimatedProcessMonthsFa: "۴ تا ۷ ماه پس از اخذ نامه PAL استانی و ثبت بیومتریک",
    documents: [
      {
        id: "ca_doc_pal",
        titleFa: "نامه تأییدیه استانی (PAL یا TAL)",
        category: "admission",
        status: "need_to_get",
        translationRule: "صادره به زبان انگلیسی/فرانسوی رسمی از استان کانادا",
        legalisationRule: "نیازی به آپوستیل ندارد",
        notesFa: "از سال ۲۰۲۴ برای اکثر دوره‌های لیسانس و دوره‌های کارشناسی ارشد غیرپژوهشی اجباری است.",
        isMandatory: true
      },
      {
        id: "ca_doc_loa",
        titleFa: "نامه رسمی پذیرش قطعی (Letter of Acceptance) از موسسه DLI",
        category: "admission",
        status: "need_to_get",
        translationRule: "زبان انگلیسی",
        legalisationRule: "ارائه نسخه اصلی دیجیتال دانشگاه",
        notesFa: "باید تاریخ شروع، طول دوره و شهریه سال اول در آن قید شده باشد.",
        isMandatory: true
      },
      {
        id: "ca_doc_bank",
        titleFa: "گواهی تمکن بانکی و گردش حساب ۴ ماه اخیر",
        category: "finance",
        status: "have",
        translationRule: "ترجمه رسمی یا صدور به زبان انگلیسی از بانک‌های معتبر",
        legalisationRule: "مهر بانک و بارکد قابل استعلام",
        notesFa: "پوشش ۲۳٬۴۴۸ دلار کانادا زندگی + ۱ سال شهریه؛ منبع واریزهای درشت باید با سند ملکی یا شغلی توجیه شود.",
        isMandatory: true
      },
      {
        id: "ca_doc_sop",
        titleFa: "شرح برنامه تحصیلی و قصد بازگشت (Study Plan / SOP)",
        category: "forms",
        status: "need_to_get",
        translationRule: "نگارش به زبان انگلیسی/فرانسوی استاندارد",
        legalisationRule: "نیازی به مهر ندارد",
        notesFa: "توجیه پیوند دوره با شغل آینده در ایران و دلایل انگیزه انتخاب کانادا.",
        isMandatory: true
      },
      {
        id: "ca_doc_transcripts",
        titleFa: "دانشنامه و ریزنمرات مقاطع پیشین",
        category: "education",
        status: "have",
        translationRule: "ترجمه رسمی دادگستری و امور خارجه به انگلیسی",
        legalisationRule: "مهر دارالترجمه رسمی و تاییدات قوه قضائیه/وزارت امور خارجه",
        notesFa: "برای مقاطع ارشد و دکترا ارزیابی ECA توسط WES ممکن است مورد مطالبه دانشگاه باشد.",
        isMandatory: true
      }
    ],
    keyRisksFa: [
      "احتمال رد ویزا به دلیل عدم اثبات قصد ترک کانادا پس از پایان تحصیل (Dual Intent باید مستدل باشد).",
      "تغییرات سهمیه‌های استانی و محدودیت‌های اخیر بر صدور ویزای کار همراه (Spousal Open Work Permit).",
      "افزایش هزینه‌های مسکن در ونکوور و تورنتو و لزوم داشتن بودجه پشتیبان علاوه بر حداقل قانونی."
    ],
    remedyPathwaysFa: [
      "تقویت نمره زبان به حداقل آیلتس آکادمیک ۶.۵ یا ۷.",
      "تأمین منبع مستند برای وجوه تمکن و ارائه سند ملک/درآمد اسپانسر.",
      "انتخاب دوره‌ها و دانشگاه‌های خارج از کلان‌شهرهای پرهزینه."
    ],
    citationSourceIds: ["src_ircc_funds"],
    lastVerifiedAt: "2026-10-04"
  },

  // 2. GERMANY: Student Visa (Blocked Account)
  {
    id: "de_study_visa",
    countryCode: "DE",
    countryNameFa: "آلمان",
    countryNameEn: "Germany",
    flagEmoji: "🇩🇪",
    routeNameFa: "ویزای دانشجویی دانشگاه‌های دولتی آلمان",
    routeNameEn: "Germany National Student Visa (Subclass D)",
    routeType: "study",
    routeTypeBadgeFa: "مهاجرت تحصیلی",
    overviewFa: "تحصیل در دانشگاه‌های دولتی با شهریه رایگان یا ناچیز در ایالت‌های فدرال، امکان کار دانشجویی ۲۰ ساعت در هفته و ۱۸ ماه اقامت کاریابی پس از فراغت از تحصیل.",
    minAge: 18,
    maxAge: null,
    minDegree: "diploma",
    requiresJobOffer: false,
    requiresAdmission: true,
    minWorkExpYears: 0,
    minCefrEnglish: "none",
    regulatedLicenseMustBeHandled: false,
    legalLanguageRuleFa: "مدرک زبان بر اساس زبان تدریس دوره (آلمانی B2 یا انگلیسی B2/C1 نظیر تافل یا آیلتس ۶.۵).",
    practicalLanguageTargetFa: "آلمانی حداقل B1 حتی برای دوره‌های انگلیسی جهت سهولت در استخدام حین تحصیل و استقرار زندگی.",
    proofOfFunds: {
      currency: "EUR",
      livingAmountSingle: 11904,
      livingAmountTwoPeople: 18000,
      livingAmountPerAdditionalDependent: 4500,
      effectiveFrom: "2024-09-01",
      excludes: ["هزینه سفر و بلیت هوایی", "ودیعه مسکن اولیه"],
      notesFa: "افتتاح حساب مسدود بانکی (Sperrkonto) با واریز ۹۹۲ یورو به ازای هر ماه اقامت دانشجویی (۱۱٬۹۰۴ یورو سال اول).",
      sourceId: "src_germany_blocked_account"
    },
    typicalTuitionUsdEstimate: {
      bachelor: 500,
      master: 600,
      phd: 200
    },
    estimatedProcessMonthsFa: "۳ تا ۵ ماه پس از نوبت‌گیری سفارت و ثبت بیومتریک در ویزامتریک",
    documents: [
      {
        id: "de_doc_admission",
        titleFa: "برگه پذیرش قطعی (Zulassungsbescheid) یا پذیرش مشروط",
        category: "admission",
        status: "need_to_get",
        translationRule: "به زبان آلمانی یا انگلیسی",
        legalisationRule: "اصل برگه الکترونیکی یونی‌اسیست یا دانشگاه",
        notesFa: "برای اکثر رشته‌ها ثبت‌نام از طریق پورتال uni-assist الزامی است.",
        isMandatory: true
      },
      {
        id: "de_doc_sperrkonto",
        titleFa: "تأییدیه واریز وجه به حساب مسدود (Sperrkonto Confirmation)",
        category: "finance",
        status: "need_to_get",
        translationRule: "صادره توسط ارائه‌دهندگان مجاز آلمانی (مانند Coracle, Fintiba, Expatrio) به انگلیسی/آلمانی",
        legalisationRule: "تأییدیه الکترونیکی دارای بارکد رسمی",
        notesFa: "مبلغ ۱۱٬۹۰۴ یورو برای سال اول؛ آزادسازی ۹۹۲ یورو در هر ماه پس از ورود به آلمان.",
        isMandatory: true
      },
      {
        id: "de_doc_insurance",
        titleFa: "بیمه سلامت دانشجویی دولتی یا خصوصی معتبر",
        category: "health_police",
        status: "have",
        translationRule: "گواهی بیمه معتبر آلمانی (TK, Barmer یا مسافرتی تا زمان ثبت‌نام)",
        legalisationRule: "نیازی به تاییدات دادگستری ندارد",
        notesFa: "بیمه مسافرتی برای روزهای ابتدایی و سپس بیمه سلامت دولتی دانشجویی.",
        isMandatory: true
      },
      {
        id: "de_doc_degrees",
        titleFa: "مدارک تحصیلی پیشین و ریزنمرات کامل",
        category: "education",
        status: "have",
        translationRule: "ترجمه رسمی به زبان آلمانی یا انگلیسی",
        legalisationRule: "تأیید مدارک توسط بخش کنسولی ویزامتریک (Legalisation)",
        notesFa: "تطبیق اعتبار دانشگاه در پایگاه داده Anabin با برچسب H+ الزامی است.",
        isMandatory: true
      }
    ],
    keyRisksFa: [
      "طولانی بودن بازه نوبت‌دهی مصاحبه در کارگزار ویزا (ویزامتریک).",
      "دشواری زبان آلمانی در دوره‌های تماماً آلمانی و لزوم گذراندن آزمون TestDaF یا DSH.",
      "بحران مسکن دانشجویی در شهرهای مونیخ، برلین و فرانکفورت."
    ],
    remedyPathwaysFa: [
      "اقدام زودتر برای یونی‌اسیست و نوبت ویزامتریک.",
      "فراگیری فشرده زبان آلمانی تا سطح B1 پیش از مهاجرت.",
      "بررسی دانشگاه‌های مستقر در ایالت‌های شرقی با اجاره‌بهای اقتصادی‌تر."
    ],
    citationSourceIds: ["src_germany_blocked_account"],
    lastVerifiedAt: "2026-10-04"
  },

  // 3. GERMANY: Opportunity Card (Chancenkarte)
  {
    id: "de_chancenkarte",
    countryCode: "DE",
    countryNameFa: "آلمان",
    countryNameEn: "Germany",
    flagEmoji: "🇩🇪",
    routeNameFa: "کارت فرصت جویای کار آلمان (Chancenkarte 2026)",
    routeNameEn: "Germany Opportunity Card (Job Search)",
    routeType: "job_seeker",
    routeTypeBadgeFa: "جست‌وجوی کار مهارتی",
    overviewFa: "ویزای ۱ ساله جست‌وجوی کار بر پایه سیستم امتیازی؛ به متقاضیان اجازه می‌دهد وارد آلمان شده و تا ۲۰ ساعت در هفته کار پاره‌وقت داشته باشند تا موقعیت شغلی متناسب با تخصص خود را پیدا کنند.",
    minAge: 18,
    maxAge: 40,
    minDegree: "associate",
    requiresJobOffer: false,
    requiresAdmission: false,
    minWorkExpYears: 2,
    minCefrEnglish: "none",
    regulatedLicenseMustBeHandled: true,
    legalLanguageRuleFa: "حداقل آلمانی A1 یا انگلیسی B2 رسمی؛ تسلط به آلمانی در سطوح بالاتر امتیاز کارت شانس را افزایش می‌دهد.",
    practicalLanguageTargetFa: "آلمانی B1 یا B2 برای کاریابی موفق در بازار کار محلی و مصاحبه با کارفرمایان سنتی آلمان.",
    proofOfFunds: {
      currency: "EUR",
      livingAmountSingle: 12324,
      livingAmountTwoPeople: 18500,
      livingAmountPerAdditionalDependent: 4500,
      effectiveFrom: "2024-06-01",
      excludes: ["هزینه سفر"],
      notesFa: "حساب مسدود برای ۱۲ ماه به ازای حداقل ۱٬۰۲۷ یورو در هر ماه.",
      sourceId: "src_germany_chancenkarte"
    },
    typicalTuitionUsdEstimate: {
      bachelor: 0,
      master: 0,
      phd: 0
    },
    estimatedProcessMonthsFa: "۲ تا ۴ ماه برای پردازش در سفارت و مأموریت کنسولی",
    documents: [
      {
        id: "de_ck_recognition",
        titleFa: "تأییدیه معادل‌سازی مدرک در آلمان (ZAB Statement of Comparability / Anabin)",
        category: "education",
        status: "need_to_get",
        translationRule: "ترجمه آلمانی رسمی",
        legalisationRule: "گواهی ارزشیابی انفرادی ZAB یا پرینت رسمی پایگاه داده Anabin",
        notesFa: "مدرک دانشگاهی باید مورد تأیید کشور مبدأ و منطبق با مدارک آلمانی باشد.",
        isMandatory: true
      },
      {
        id: "de_ck_work_proof",
        titleFa: "سابقه کار مرتبط حداقل ۲ تا ۵ سال اخیر همراه با بیمه",
        category: "work",
        status: "have",
        translationRule: "ترجمه رسمی به آلمانی یا انگلیسی",
        legalisationRule: "مهر دادگستری و وزارت امور خارجه",
        notesFa: "شرح وظایف و ارتباط با رشته تحصیلی برای اخذ امتیاز سابقه کار الزامی است.",
        isMandatory: true
      },
      {
        id: "de_ck_lang",
        titleFa: "مدرک زبان معتبر گوته/تست‌داف یا آیلتس/تافل",
        category: "language",
        status: "have",
        translationRule: "کارنامه رسمی آزمون",
        legalisationRule: "قابل استعلام آنلاین",
        notesFa: "حداقل مدرک آلمانی A1 یا انگلیسی B2 الزامی برای ورود به گردونه ارزیابی.",
        isMandatory: true
      }
    ],
    keyRisksFa: [
      "پیدا نکردن قرارداد کاری تمام‌وقت متناسب با تخصص در بازه ۱۲ ماهه حضور در آلمان.",
      "تسلط ناکافی به زبان آلمانی که مانع مصاحبه موفق در مشاغل غیر از نرم‌افزار می‌شود.",
      "هزینه‌های اقامت هتل/آپارتمان موقت در ماه‌های اول حضور در آلمان."
    ],
    remedyPathwaysFa: [
      "تمرکز بر کدهای شغلی MINT و حوزه‌های فناوری اطلاعات.",
      "ارتقای مدرک زبان آلمانی از A1 به B1 قبل از پرواز.",
      "شبکه‌سازی فعال در لینکدین و زینگ (Xing) پیش از خروج از ایران."
    ],
    citationSourceIds: ["src_germany_chancenkarte"],
    lastVerifiedAt: "2026-10-04"
  },

  // 4. CANADA: Federal Skilled Worker (Express Entry)
  {
    id: "ca_express_entry_fsw",
    countryCode: "CA",
    countryNameFa: "کانادا",
    countryNameEn: "Canada",
    flagEmoji: "🇨🇦",
    routeNameFa: "اکسپرس اینتری فدرال (نیروی متخصص FSW)",
    routeNameEn: "Canada Federal Skilled Worker Program (Express Entry)",
    routeType: "skilled_pr",
    routeTypeBadgeFa: "اقامت دائم مهارتی",
    overviewFa: "مسیر مستقیم اقامت دائم (PR) برای افراد دارای تحصیلات دانشگاهی، حداقل ۱ سال سابقه کار مداوم در کدهای TEER 0, 1, 2, 3 و زبان انگلیسی/فرانسوی قوی.",
    minAge: 18,
    maxAge: 47,
    minDegree: "bachelor",
    requiresJobOffer: false,
    requiresAdmission: false,
    minWorkExpYears: 1,
    minCefrEnglish: "B2",
    regulatedLicenseMustBeHandled: false,
    legalLanguageRuleFa: "حداقل سطح CLB 7 در هر چهار مهارت جداگانه (آیلتس جنرال: ۶ در هر مهارت؛ یا آزمون CELPIP/PTE Core).",
    practicalLanguageTargetFa: "سطح CLB 9 یا ۱۰ (آیلتس جنرال: شنیدار ۸، سایر مهارت‌ها ۷) جهت رقابت در سیستم رتبه‌بندی جامع CRS.",
    proofOfFunds: {
      currency: "CAD",
      livingAmountSingle: 14690,
      livingAmountTwoPeople: 18288,
      livingAmountPerAdditionalDependent: 3958,
      effectiveFrom: "2024-05-27",
      excludes: ["شهریه (ندارد)"],
      notesFa: "وجوه تمکن باید در حساب متقاضی نقد و قابل دسترس باشد؛ در صورت داشتن جاب‌آفر معتبر نیاز به اثبات تمکن نیست.",
      sourceId: "src_ircc_fsw"
    },
    typicalTuitionUsdEstimate: {
      bachelor: 0,
      master: 0,
      phd: 0
    },
    estimatedProcessMonthsFa: "۶ تا ۱۲ ماه پس از دریافت دعوت‌نامه (ITA) و ثبت پرونده نهایی",
    documents: [
      {
        id: "ca_fsw_eca",
        titleFa: "تأییدیه ارزیابی مدارک تحصیلی (ECA Report)",
        category: "education",
        status: "need_to_get",
        translationRule: "صادره توسط WES یا نهادهای مورد تأیید IRCC",
        legalisationRule: "استعلام دیجیتال با Reference Number رسمی",
        notesFa: "مدارک دانشگاهی ایران باید مستقیماً از دانشگاه به WES ارسال و ارزیابی شوند.",
        isMandatory: true
      },
      {
        id: "ca_fsw_ielts",
        titleFa: "کارنامه معتبر آزمون زبان عمومی (IELTS General / PTE Core / TEF)",
        category: "language",
        status: "have",
        translationRule: "کارنامه رسمی آزمون با اعتبار زیر ۲ سال",
        legalisationRule: "استعلام آنلاین TRF",
        notesFa: "حداقل CLB 7 الزامی؛ CLB 9 جهش بزرگی در امتیاز مهارت‌های انتقالی ایجاد می‌کند.",
        isMandatory: true
      },
      {
        id: "ca_fsw_work_letters",
        titleFa: "نامه‌های سابقه کار رسمی روی سربرگ شرکت همراه با شرح وظایف",
        category: "work",
        status: "have",
        translationRule: "ترجمه رسمی به انگلیسی با شرح ساعت کار هفتگی و حقوق",
        legalisationRule: "تأییدیه رسمی شرکت و در صورت امکان سوابق بیمه تأمین اجتماعی",
        notesFa: "تطبیق وظایف واقعی با کد ملی شغلی (NOC) کانادا مهم‌تر از عنوان شغلی است.",
        isMandatory: true
      }
    ],
    keyRisksFa: [
      "نمرات کف بالای استخر CRS در دوره‌های عمومی و عدم دریافت دعوت‌نامه بدون زبان فرانسه یا جاب‌آفر.",
      "افت شدید امتیاز سن پس از سن ۳۰ سالگی (هر سال ۵ امتیاز کسر می‌شود).",
      "اشتباه در انتخاب کد شغلی NOC و رد شدن به دلیل عدم انطباق شرح وظایف."
    ],
    remedyPathwaysFa: [
      "ارتقای زبان دوم (فرانسوی) که تا ۵۰ امتیاز بونوس به CRS اضافه می‌کند.",
      "بررسی برنامه‌های نامزدی استانی (PNP) متناسب با رشته شغلی.",
      "رساندن نمره انگلیسی به مرز CLB 9."
    ],
    citationSourceIds: ["src_ircc_fsw"],
    lastVerifiedAt: "2026-10-04"
  },

  // 5. UNITED KINGDOM: Skilled Worker Visa
  {
    id: "gb_skilled_worker",
    countryCode: "GB",
    countryNameFa: "بریتانیا",
    countryNameEn: "United Kingdom",
    flagEmoji: "🇬🇧",
    routeNameFa: "ویزای نیروی متخصص بریتانیا (Skilled Worker Visa)",
    routeNameEn: "UK Skilled Worker Visa",
    routeType: "work_job_offer",
    routeTypeBadgeFa: "کار با پیشنهاد شغلی",
    overviewFa: "ویزای کاری کارفرمایی بریتانیا با پیشنهاد شغلی از کارفرمای دارای لایسنس اسپانسرشیپ و رعایت سقف حداقل حقوق مصوب.",
    minAge: 18,
    maxAge: null,
    minDegree: "diploma",
    requiresJobOffer: true,
    requiresAdmission: false,
    minWorkExpYears: 1,
    minCefrEnglish: "B2",
    regulatedLicenseMustBeHandled: true,
    legalLanguageRuleFa: "درخواست‌های جدید از ۸ ژانویه ۲۰۲۶ عموماً سطح CEFR B2 در چهار مهارت را مطالبه می‌کنند (آزمون SELT تاییدشده).",
    practicalLanguageTargetFa: "تسلط کامل به زبان انگلیسی اداری و تخصصی برای مصاحبه با کارفرمایان بریتانیایی.",
    proofOfFunds: {
      currency: "GBP",
      livingAmountSingle: 1270,
      livingAmountTwoPeople: 1555,
      livingAmountPerAdditionalDependent: 315,
      effectiveFrom: "2024-01-01",
      excludes: ["هزینه ویزا و بیمه سلامت NHS Surcharge"],
      notesFa: "حداقل ۱٬۲۷۰ پوند در حساب متقاضی به مدت ۲۸ روز پیوسته، مگر آنکه کارفرما در برگه CoS هزینه را تقبل کرده باشد.",
      sourceId: "src_uk_skilled_worker_english"
    },
    typicalTuitionUsdEstimate: {
      bachelor: 0,
      master: 0,
      phd: 0
    },
    estimatedProcessMonthsFa: "۳ تا ۸ هفته پس از صدور CoS و انگشت‌نگاری در مرکز ویزا",
    documents: [
      {
        id: "gb_doc_cos",
        titleFa: "شماره مرجع گواهی اسپانسرشیپ (Certificate of Sponsorship - CoS)",
        category: "admission",
        status: "need_to_get",
        translationRule: "صادره توسط کارفرمای تحت لایسنس وزارت کشور بریتانیا",
        legalisationRule: "کد الکترونیکی ثبت‌شده در پرتال دولت بریتانیا",
        notesFa: "شامل شرح شغل، کد شغلی واجدشرایط SOC و تضمین حقوق مصوب سالانه.",
        isMandatory: true
      },
      {
        id: "gb_doc_tb",
        titleFa: "گواهی آزمایش سل ریوی (Tuberculosis / TB Test)",
        category: "health_police",
        status: "need_to_get",
        translationRule: "صادره از کلینیک‌های معتمد سازمان بین‌المللی مهاجرت (IOM) در تهران",
        legalisationRule: "گواهی پزشکی IOM",
        notesFa: "برای اقامت‌های بالای ۶ ماه متقاضیان ساکن ایران اجباری است.",
        isMandatory: true
      },
      {
        id: "gb_doc_selt",
        titleFa: "کارنامه رسمی آزمون زبان مورد تأیید وزارت کشور (SELT B2)",
        category: "language",
        status: "have",
        translationRule: "IELTS for UKVI یا PTE Home/Academic UKVI",
        legalisationRule: "شماره مرجع آزمون SELT معتبر",
        notesFa: "قانون جدید ژانویه ۲۰۲۶ نیازمند B2 برای پرونده‌های جدید است.",
        isMandatory: true
      }
    ],
    keyRisksFa: [
      "افزایش چشمگیر آستانه حداقل حقوق قانونی (۳۸٬۷۰۰ پوند برای اکثر مشاغل عمومی).",
      "هزینه بسیار سنگین مالیات سلامت مهاجران (IHS: ۱٬۰۳۵ پوند به ازای هر سال اقامت متقاضی و همراه).",
      "وابستگی کامل ویزا به کارفرما و از دست رفتن اقامت در صورت تعدیل یا ورشکستگی شرکت."
    ],
    remedyPathwaysFa: [
      "جست‌وجوی مشاغل موجود در فهرست کسری نیروی مهاجرتی (Immigration Salary List) با تخفیف آستانه حقوق.",
      "تمرکز بر فرصت‌های بخش بهداشت و درمان NHS که از سقف‌های حقوقی و IHS تخفیف ویژه دارند."
    ],
    citationSourceIds: ["src_uk_skilled_worker_english"],
    lastVerifiedAt: "2026-10-04"
  },

  // 6. AUSTRALIA: Subclass 500 Student Visa
  {
    id: "au_student_visa_500",
    countryCode: "AU",
    countryNameFa: "استرالیا",
    countryNameEn: "Australia",
    flagEmoji: "🇦🇺",
    routeNameFa: "ویزای دانشجویی استرالیا (Subclass 500)",
    routeNameEn: "Australia Student Visa (Subclass 500)",
    routeType: "study",
    routeTypeBadgeFa: "مهاجرت تحصیلی",
    overviewFa: "تحصیل در دانشگاه‌ها و موسسات عالی استرالیا با اجازه کار ۲۴ ساعت در هفته و مقررات به‌روزشده موثر از ۲ اکتبر ۲۰۲۶ برای اقامت و همراهان.",
    minAge: 18,
    maxAge: null,
    minDegree: "diploma",
    requiresJobOffer: false,
    requiresAdmission: true,
    minWorkExpYears: 0,
    minCefrEnglish: "B2",
    regulatedLicenseMustBeHandled: false,
    legalLanguageRuleFa: "نمره آیلتس آکادمیک ۶.۰ تا ۶.۵ یا معادل PTE رسمی بر اساس دوره و رشته دانشگاهی.",
    practicalLanguageTargetFa: "آیلتس آکادمیک ۶.۵ یا ۷ با نمرات مهارت‌های متوازن.",
    proofOfFunds: {
      currency: "AUD",
      livingAmountSingle: 29710,
      livingAmountTwoPeople: 40100,
      livingAmountPerAdditionalDependent: 4400,
      effectiveFrom: "2024-05-10",
      excludes: ["شهریه سال اول", "بیمه درمانی OSHC", "هزینه بلیت سفر"],
      notesFa: "فرمول تمکن مالی: هزینه ۱۲ ماه زندگی + ۱ سال کامل شهریه + ۲٬۰۰۰ دلار هزینه سفر + هزینه مدرسه فرزندان.",
      sourceId: "src_au_student_500"
    },
    typicalTuitionUsdEstimate: {
      bachelor: 26000,
      master: 23000,
      phd: 10000
    },
    estimatedProcessMonthsFa: "۲ تا ۴ ماه بر اساس ارزیابی ریسک کشور و دانشگاه",
    documents: [
      {
        id: "au_doc_coe",
        titleFa: "تأییدیه الکترونیکی ثبت نام قطعی (Confirmation of Enrolment - CoE)",
        category: "admission",
        status: "need_to_get",
        translationRule: "صادره از دانشگاه استرالیایی در سامانه PRISMS",
        legalisationRule: "کد CoE آنلاین",
        notesFa: "پس از پرداخت پیش‌پرداخت شهریه دانشگاه صادر می‌شود.",
        isMandatory: true
      },
      {
        id: "au_doc_gs",
        titleFa: "بیانیه قصد دانشجوی واقعی (Genuine Student - GS)",
        category: "forms",
        status: "need_to_get",
        translationRule: "پاسخ به سوالات مشخص و ساختاریافته در فرم ویزا به انگلیسی",
        legalisationRule: "ارائه اسناد پشتیبان",
        notesFa: "بررسی واقع‌بینانه ارتباط تحصیل با سابقه کار و بازگشت یا پیشرفت شغلی.",
        isMandatory: true
      },
      {
        id: "au_doc_oshc",
        titleFa: "بیمه سلامت دانشجویان خارجی (OSHC)",
        category: "health_police",
        status: "have",
        translationRule: "پالیسی صادرشده از شرکت‌های مجاز نظیر Bupa, Medibank, Allianz",
        legalisationRule: "شماره قرارداد بیمه",
        notesFa: "باید کل دوره اقامت تحصیلی را پوشش دهد.",
        isMandatory: true
      }
    ],
    keyRisksFa: [
      "مقررات جدید ۲ اکتبر ۲۰۲۶ و سخت‌گیری شدید روی تبدیل ویزا در داخل خاک استرالیا.",
      "بالا بودن هزینه‌های شهریه و اجاره مسکن در سیدنی و ملبورن.",
      "ریسک رد ویزا در صورت اثبات نشدن شرایط Genuine Student."
    ],
    remedyPathwaysFa: [
      "نگارش دقیق بیانیه GS با تمرکز بر پیشرفت شغلی ملموس.",
      "انتخاب دانشگاه‌های مستقر در مناطق رجینال (Regional) با امتیازهای اقامتی مضاعف.",
      "دریافت بورسیه‌های دانشگاهی RTP یا تخفیف شهریه بین‌المللی."
    ],
    citationSourceIds: ["src_au_student_500"],
    lastVerifiedAt: "2026-10-04"
  },

  // 7. NETHERLANDS: Highly Skilled Migrant / Study
  {
    id: "nl_highly_skilled",
    countryCode: "NL",
    countryNameFa: "هلند",
    countryNameEn: "Netherlands",
    flagEmoji: "🇳🇱",
    routeNameFa: "ویزای نیروی متخصص مهاجر هلند (Kennismigrant)",
    routeNameEn: "Netherlands Highly Skilled Migrant Permit",
    routeType: "work_job_offer",
    routeTypeBadgeFa: "کار با پیشنهاد شغلی",
    overviewFa: "ویزای اقامت کاری سریع هلند با پیشنهاد کار از شرکتی که توسط سازمان مهاجرت هلند (IND) به عنوان اسپانسر شناخته‌شده (Recognised Sponsor) تایید شده است.",
    minAge: 18,
    maxAge: null,
    minDegree: "bachelor",
    requiresJobOffer: true,
    requiresAdmission: false,
    minWorkExpYears: 2,
    minCefrEnglish: "B2",
    regulatedLicenseMustBeHandled: false,
    legalLanguageRuleFa: "آزمون زبان دولتی الزامی برای ویزای کار ندارد؛ زبان کار در شرکت‌های اسپانسر عموماً انگلیسی است.",
    practicalLanguageTargetFa: "انگلیسی روان تجاری؛ یادگیری هلندی مزیت کلیدی برای تعاملات اجتماعی و اقامت دائم بعد از ۵ سال.",
    proofOfFunds: {
      currency: "EUR",
      livingAmountSingle: 0,
      livingAmountTwoPeople: 0,
      livingAmountPerAdditionalDependent: 0,
      effectiveFrom: "2026-01-01",
      excludes: [],
      notesFa: "نیازی به تمکن بانکی نیست؛ قرارداد کاری با حداقل حقوق مصوب ماهانه IND (حدود ۳٬۹۰۰ تا ۵٬۳۰۰ یورو بسته به سن) کفایت می‌کند.",
      sourceId: "src_nl_ind_study"
    },
    typicalTuitionUsdEstimate: {
      bachelor: 0,
      master: 0,
      phd: 0
    },
    estimatedProcessMonthsFa: "۲ تا ۴ هفته پس از سابمیت توسط اسپانسر در هلند (Fast Track)",
    documents: [
      {
        id: "nl_doc_contract",
        titleFa: "قرارداد استخدامی رسمی با کارفرمای دارای Recognised Sponsor از IND",
        category: "admission",
        status: "need_to_get",
        translationRule: "هلندی یا انگلیسی",
        legalisationRule: "ثبت مستقیم در کارتابل IND توسط وکیل کارفرما",
        notesFa: "حقوق قیدشده باید با سقف سنی مصوب سال ۲۰۲۶ مطابقت داشته باشد.",
        isMandatory: true
      },
      {
        id: "nl_doc_passport",
        titleFa: "گذرنامه با حداقل ۶ ماه اعتبار",
        category: "identity",
        status: "have",
        translationRule: "اسکن صفحات گذرنامه",
        legalisationRule: "اصل در زمان تحویل استیکر ویزا در سفارت",
        notesFa: "صدور ویزای موقت ورود MVV برای سفر به هلند.",
        isMandatory: true
      }
    ],
    keyRisksFa: [
      "بحران شدید مسکن و سختی فوق‌العاده اجاره خانه در آمستردام، اوترخت و لاهه.",
      "تعدیلات بخش فناوری و کاهش صدور اسپانسرشیپ برای نیروهای غیراروپایی در شرکت‌های کوچک.",
      "مالیات بر درآمد تصاعدی و تغییرات معافیت مالیاتی ۳۰ درصدی (30% Ruling)."
    ],
    remedyPathwaysFa: [
      "جست‌وجوی فرصت در شهرهای آینده‌دار مانند آیندهوون (Eindhoven Tech Hub).",
      "مذاکره با کارفرما برای تقبل هزینه اسکان ماه اول در قرارداد کاری."
    ],
    citationSourceIds: ["src_nl_ind_study"],
    lastVerifiedAt: "2026-10-04"
  },

  // 8. IRELAND: Critical Skills Employment Permit
  {
    id: "ie_critical_skills",
    countryCode: "IE",
    countryNameFa: "ایرلند",
    countryNameEn: "Ireland",
    flagEmoji: "🇮🇪",
    routeNameFa: "مجوز استخدام مهارت‌های بحرانی ایرلند (CSEP)",
    routeNameEn: "Ireland Critical Skills Employment Permit",
    routeType: "work_job_offer",
    routeTypeBadgeFa: "کار با پیشنهاد شغلی",
    overviewFa: "مسیر استثنایی اشتغال متخصصان در تنها کشور انگلیسی‌زبان اتحادیه اروپا؛ امکان تبدیل به اقامت دائم (Stamp 4) تنها پس از ۲ سال کار مداوم.",
    minAge: 18,
    maxAge: null,
    minDegree: "bachelor",
    requiresJobOffer: true,
    requiresAdmission: false,
    minWorkExpYears: 2,
    minCefrEnglish: "B2",
    regulatedLicenseMustBeHandled: true,
    legalLanguageRuleFa: "سنجش سطح زبان انگلیسی توسط کارفرما و مصاحبه تخصصی؛ بدون نیاز به آزمون دولتی واحد مهاجرت.",
    practicalLanguageTargetFa: "تسلط کامل به زبان انگلیسی گفتاری و نوشتاری در محیط‌های کاری چندملیتی دوبلین.",
    proofOfFunds: {
      currency: "EUR",
      livingAmountSingle: 0,
      livingAmountTwoPeople: 0,
      livingAmountPerAdditionalDependent: 0,
      effectiveFrom: "2024-01-01",
      excludes: [],
      notesFa: "حقوق قرارداد باید حداقل ۳۸٬۰۰۰ یورو در سال برای مشاغل فهرست بحرانی یا ۶۴٬۰۰۰ یورو برای سایر تخصص‌ها باشد.",
      sourceId: "src_ie_isd_funds"
    },
    typicalTuitionUsdEstimate: {
      bachelor: 0,
      master: 0,
      phd: 0
    },
    estimatedProcessMonthsFa: "۶ تا ۱۲ هفته برای صدور مجوز کار DETE و سپس ۴ تا ۸ هفته برای ویزای ورود",
    documents: [
      {
        id: "ie_doc_contract",
        titleFa: "قرارداد کاری ۲ ساله با حقوق بالاتر از سقف قانونی",
        category: "admission",
        status: "need_to_get",
        translationRule: "انگلیسی رسمی",
        legalisationRule: "سابمیت در سیستم EPOS وزارت کسب‌وکار ایرلند (DETE)",
        notesFa: "کارفرما باید حداقل ۵۰٪ کارکنان اروپایی (قانون ۵۰/۵۰) را رعایت کرده باشد.",
        isMandatory: true
      },
      {
        id: "ie_doc_degree",
        titleFa: "مدرک تحصیلی کارشناسی یا بالاتر در رشته مرتبط با شغل",
        category: "education",
        status: "have",
        translationRule: "ترجمه رسمی به زبان انگلیسی",
        legalisationRule: "مهر دادگستری و امور خارجه",
        notesFa: "تطبیق تخصص با فهرست Critical Skills Occupations List.",
        isMandatory: true
      }
    ],
    keyRisksFa: [
      "بحران کمبود مسکن در دوبلین با اجاره‌های بسیار سنگین.",
      "زمان طولانی فرآیند صدور ویزای ورود توسط سفارت ایرلند.",
      "الزام کارفرما به پرداخت سقف حقوقی معین و انصراف برخی استارتاپ‌ها از اسپانسرشیپ."
    ],
    remedyPathwaysFa: [
      "تمرکز بر غول‌های بین‌المللی فناوری مستقر در Silicon Docks دوبلین و شرکت‌های داروسازی کورک (Cork).",
      "جست‌وجوی اقامت در شهرهای گالوی (Galway) یا لیمریک (Limerick) با هزینه معتدل‌تر."
    ],
    citationSourceIds: ["src_ie_isd_funds"],
    lastVerifiedAt: "2026-10-04"
  },

  // 9. NEW ZEALAND: Skilled Migrant Category / Green List
  {
    id: "nz_smc_green_list",
    countryCode: "NZ",
    countryNameFa: "نیوزیلند",
    countryNameEn: "New Zealand",
    flagEmoji: "🇳🇿",
    routeNameFa: "اقامت مهارتی و فهرست سبز نیوزیلند (SMC & Green List)",
    routeNameEn: "New Zealand Skilled Migrant Category Resident Visa",
    routeType: "skilled_pr",
    routeTypeBadgeFa: "اقامت دائم مهارتی",
    overviewFa: "مسیر مستقیم اقامت برای مشاغل ردیف اول فهرست سبز (Tier 1 Straight to Residence) یا سیستم جدید ۶ امتیازی بر پایه تحصیلات، ثبت حرفه‌ای و حقوق کارفرمای معتبر.",
    minAge: 18,
    maxAge: 55,
    minDegree: "bachelor",
    requiresJobOffer: true,
    requiresAdmission: false,
    minWorkExpYears: 2,
    minCefrEnglish: "B2",
    regulatedLicenseMustBeHandled: true,
    legalLanguageRuleFa: "حداقل آیلتس جنرال یا آکادمیک ۶.۵ یا معادل رسمی در آزمون‌های PTE/TOEFL برای متقاضی اصلی.",
    practicalLanguageTargetFa: "زبان انگلیسی روان با درک کامل لهجه و اصطلاحات محلی نیوزیلند (Kiwi English).",
    proofOfFunds: {
      currency: "NZD",
      livingAmountSingle: 0,
      livingAmountTwoPeople: 0,
      livingAmountPerAdditionalDependent: 0,
      effectiveFrom: "2024-01-01",
      excludes: [],
      notesFa: "حقوق مندرج در قرارداد کاری از کارفرمای معتبر Accredited Employer معیار اصلی است.",
      sourceId: "src_nz_smc"
    },
    typicalTuitionUsdEstimate: {
      bachelor: 0,
      master: 0,
      phd: 0
    },
    estimatedProcessMonthsFa: "۳ تا ۶ ماه برای مسیرهای دارای اولویت Green List",
    documents: [
      {
        id: "nz_doc_accredited_offer",
        titleFa: "پیشنهاد شغلی رسمی از کارفرمای تأییدشده (Accredited Employer)",
        category: "work",
        status: "need_to_get",
        translationRule: "انگلیسی رسمی",
        legalisationRule: "ثبت آنلاین در Immigration New Zealand",
        notesFa: "نقش باید با فهرست سبز (Green List Roles) تطابق کامل داشته باشد.",
        isMandatory: true
      },
      {
        id: "nz_doc_nzqa",
        titleFa: "ارزیابی مدرک تحصیلی توسط سازمان صلاحیت‌های نیوزیلند (NZQA IQA)",
        category: "education",
        status: "need_to_get",
        translationRule: "ترجمه رسمی مصدق",
        legalisationRule: "گواهی رسمی ارزیابی بین‌المللی NZQA",
        notesFa: "برای رشته‌های مشمول ثبت حرفه‌ای (مهندسی و سلامت) الزامی است.",
        isMandatory: true
      },
      {
        id: "nz_doc_police",
        titleFa: "گواهی عدم سوءپیشینه رسمی پلیس (Police Clearance Certificate)",
        category: "health_police",
        status: "have",
        translationRule: "ترجمه معتبر همراه با اصل مدرک",
        legalisationRule: "مهر رسمی و اعتبار زیر ۶ ماه",
        notesFa: "برای تمام کشورهایی که بیش از ۱۲ ماه در آن‌ها اقامت داشته‌اید.",
        isMandatory: true
      }
    ],
    keyRisksFa: [
      "فاصله جغرافیایی زیاد و محدودیت پروازهای مستقیم.",
      "اندازه کوچکتر بازار کار نسبت به استرالیا و رقابت در مشاغل بدون اسپانسر.",
      "شرط ثبت حرفه‌ای سخت‌گیرانه برای پزشکان، معلمان و پرستاران."
    ],
    remedyPathwaysFa: [
      "تمرکز ویژه بر مشاغل Tier 1 Green List که اقامت بدون نیاز به ۲ سال کار قبلی در نیوزیلند را اعطا می‌کنند.",
      "اخذ ویزای کاری AEWV به عنوان گام نخست پیش از تبدیل به اقامت دائم."
    ],
    citationSourceIds: ["src_nz_smc"],
    lastVerifiedAt: "2026-10-04"
  },

  // 10. ITALY: Study & DSU Regional Scholarship
  {
    id: "it_study_dsu",
    countryCode: "IT",
    countryNameFa: "ایتالیا",
    countryNameEn: "Italy",
    flagEmoji: "🇮🇹",
    routeNameFa: "پذیرش تحصیلی ایتالیا با بورسیه استانی (DSU / EDISU)",
    routeNameEn: "Italy University Admission with Regional Scholarship",
    routeType: "study",
    routeTypeBadgeFa: "مهاجرت تحصیلی (بورسیه‌محور)",
    overviewFa: "تحصیل در دانشگاه‌های معتبر ایتالیا (میلان، بولونیا، ساپینزا رم) با شهریه مبتنی بر درآمد خانوار و امکان بهره‌مندی از بورسیه‌های استانی مبتنی بر نیاز مالی با پوشش شهریه، خوابگاه و کمک‌هزینه نقدی سالانه.",
    minAge: 18,
    maxAge: null,
    minDegree: "diploma",
    requiresJobOffer: false,
    requiresAdmission: true,
    minWorkExpYears: 0,
    minCefrEnglish: "B2",
    regulatedLicenseMustBeHandled: false,
    legalLanguageRuleFa: "نمره آیلتس ۶ یا ۶.۵ آکادمیک یا تافل ۷۸ برای دوره‌های انگلیسی‌زبان؛ یا مدرک B2 ایتالیایی برای دوره‌های به زبان ایتالیایی.",
    practicalLanguageTargetFa: "زبان ایتالیایی حداقل A2 برای امور روزمره و ارتباطات بانکی و اداری در رم یا تورین.",
    proofOfFunds: {
      currency: "EUR",
      livingAmountSingle: 6000,
      livingAmountTwoPeople: 9500,
      livingAmountPerAdditionalDependent: 2500,
      effectiveFrom: "2024-01-01",
      excludes: ["هزینه سفر"],
      notesFa: "تمکن بانکی مورد مطالبه کنسولگری ایتالیا در تهران بر مبنای جدول سالانه (معمولاً حدود ۶٬۰۰۰ یورو در حساب شخصی یا سرپرست).",
      sourceId: "src_germany_blocked_account"
    },
    typicalTuitionUsdEstimate: {
      bachelor: 1500,
      master: 1800,
      phd: 200
    },
    estimatedProcessMonthsFa: "۳ تا ۵ ماه پس از ثبت‌نام اولیه در پورتال یونیورسیتالی (Universitaly)",
    documents: [
      {
        id: "it_doc_universitaly",
        titleFa: "پیش‌ثبت‌نام رسمی در پرتال دولتی Universitaly",
        category: "admission",
        status: "need_to_get",
        translationRule: "بارگذاری نسخه دیجیتال مدارک به انگلیسی/ایتالیایی",
        legalisationRule: "تأییدیه پذیرش آنلاین صادرشده از دانشگاه مقصد",
        notesFa: "بدون تأییدیه پرتال یونیورسیتالی وقت ویزا در ویزامتریک اعطا نمی‌شود.",
        isMandatory: true
      },
      {
        id: "it_doc_dov",
        titleFa: "تأییدیه ارزشیابی تحصیلی (DoV یا گواهی CIMEA)",
        category: "education",
        status: "need_to_get",
        translationRule: "ترجمه رسمی مدارک تحصیلی به ایتالیایی",
        legalisationRule: "تأییدیه سفارت ایتالیا یا استعلام رسمی Statement of Comparability از CIMEA",
        notesFa: "اثبات ۱۲ سال تحصیلات پیش‌دانشگاهی الزامی است.",
        isMandatory: true
      },
      {
        id: "it_doc_dsu_docs",
        titleFa: "مدارک مالی درآمد خانواده جهت بورسیه استانی (فیش حقوقی و اجاره‌نامه)",
        category: "finance",
        status: "have",
        translationRule: "ترجمه رسمی به ایتالیایی با تاییدات دادگستری و امور خارجه",
        legalisationRule: "تأیید کنسولی سفارت جهت محاسبه شاخص ISEE Parificato",
        notesFa: "تعیین‌کننده معافیت کامل از شهریه و دریافت نقدی کمک‌هزینه استانی (تا ۸٬۰۰۰ یورو در سال).",
        isMandatory: false
      }
    ],
    keyRisksFa: [
      "تاخیر در پرداخت قسط‌های بورسیه استانی در برخی دانشگاه‌ها و لزوم تأمین هزینه شخصی برای ۳ ماه اول ورود.",
      "محدودیت فرصت‌های شغلی پس از تحصیل به زبان صرفاً انگلیسی در بازار کار سنتی ایتالیا.",
      "پیچیدگی‌های فرآیند وقت‌دهی کنسولی و تاییدات مدارک مدنی خانوادگی."
    ],
    remedyPathwaysFa: [
      "اقدام فوری برای محاسبه شاخص ISEE به محض باز شدن فراخوان استانی.",
      "فراگیری زبان ایتالیایی حین تحصیل جهت تبدیل اقامت دانشجویی به ویزای کاری با اتمام دوره ارشد."
    ],
    citationSourceIds: ["src_germany_blocked_account"],
    lastVerifiedAt: "2026-10-04"
  }
];
