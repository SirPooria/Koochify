export interface JobPortalItem {
  countryCode: string;
  countryNameFa: string;
  portalName: string;
  url: string;
  type: "official_government" | "curated_public" | "industry_niche";
  descriptionFa: string;
  sponsorVerificationAdviceFa: string;
}

export interface ScholarshipPortalItem {
  id: string;
  nameFa: string;
  nameEn: string;
  coverage: "full_tuition_and_stipend" | "partial_or_variable";
  hostCountryOrOrgFa: string;
  officialUrl: string;
  eligibilityIranianNoticeFa: string;
  deadlineOverviewFa: string;
  keyRequirementsFa: string;
}

export interface InterviewGuideline {
  pillar: string;
  titleFa: string;
  explanationFa: string;
  exampleFa: string;
  commonPitfallFa: string;
}

export const OFFICIAL_JOB_PORTALS: JobPortalItem[] = [
  {
    countryCode: "CA",
    countryNameFa: "کانادا",
    portalName: "Canada Job Bank",
    url: "https://www.jobbank.gc.ca/",
    type: "official_government",
    descriptionFa: "پورتال رسمی کاریابی فدرال کانادا؛ فیلتر ویژه آگهی‌های کارفرمایان دارای تأییدیه ارزیابی اثر بازار کار (LMIA).",
    sponsorVerificationAdviceFa: "حتماً اطمینان حاصل کنید کارفرما مجوز LMIA معتبر برای استخدام خارجی دارد؛ هرگز به ادعای جاب‌آفر بدون شماره ثبت دولتی اعتماد نکنید."
  },
  {
    countryCode: "DE",
    countryNameFa: "آلمان",
    portalName: "BA Jobsuche (Federal Employment Agency)",
    url: "https://www.arbeitsagentur.de/jobsuche/",
    type: "official_government",
    descriptionFa: "بزرگترین پایگاه داده رسمی کار در آلمان تحت نظارت اداره کار فدرال (Bundesagentur für Arbeit).",
    sponsorVerificationAdviceFa: "کارفرمایان ثبت‌شده در این پرتال واقعی هستند؛ در صورت احراز صلاحیت با کارت شانس یا بلوکارت می‌توانید مستقیماً مصاحبه کنید."
  },
  {
    countryCode: "AU",
    countryNameFa: "استرالیا",
    portalName: "Workforce Australia",
    url: "https://www.workforceaustralia.gov.au/individuals/jobs/",
    type: "official_government",
    descriptionFa: "پرتال رسمی اشتغال دولت فدرال استرالیا؛ مکمل پرتال‌های خصوصی مانند SEEK Australia.",
    sponsorVerificationAdviceFa: "کارفرما برای صدور ویزای ۴۸۲ باید لایسنس اسپانسرشیپ استاندارد کسب‌وکار (SBS) از Home Affairs داشته باشد."
  },
  {
    countryCode: "GB",
    portalName: "Find a Job (GOV.UK)",
    countryNameFa: "بریتانیا",
    url: "https://www.gov.uk/find-a-job",
    type: "official_government",
    descriptionFa: "درگاه کاریابی رسمی دولت بریتانیا و بخش سلامت NHS Jobs برای کادر درمان.",
    sponsorVerificationAdviceFa: "همواره شماره ثبت کارفرما را با فایل زنده لیست اسپانسرهای مجاز (Register of Licensed Sponsors) در سایت GOV.UK مطابقت دهید."
  },
  {
    countryCode: "US",
    countryNameFa: "ایالات متحده",
    portalName: "CareerOneStop",
    url: "https://www.careeronestop.org/",
    type: "official_government",
    descriptionFa: "پورتال تحت حمایت وزارت کار آمریکا (U.S. Department of Labor) برای جست‌وجوی موقعیت‌های استخدامی و کدهای شغلی SOC.",
    sponsorVerificationAdviceFa: "ویزاهای تخصصی نظیر H-1B نیازمند ثبت دادخواست توسط وکیل کارفرما در USCIS و شرکت در قرعه‌کشی سالانه است."
  },
  {
    countryCode: "FR",
    countryNameFa: "فرانسه",
    portalName: "France Travail",
    url: "https://www.francetravail.fr/",
    type: "official_government",
    descriptionFa: "سازمان رسمی کاریابی دولتی فرانسه (پیش‌تر بنام Pôle Emploi) و پورتال Apec برای کارشناسان ارشد و مدیران.",
    sponsorVerificationAdviceFa: "قرارداد کاری (CDI) با رعایت حداقل حقوق مصوب برای تبدیل به ویزای پاسپورت تلنت یا Salarié ضروری است."
  },
  {
    countryCode: "NL",
    countryNameFa: "هلند",
    portalName: "Werk.nl (UWV)",
    url: "https://www.werk.nl/",
    type: "official_government",
    descriptionFa: "پورتال رسمی اداره بیمه کارکنان و کار هلند به همراه سایت اروپایی EURES.",
    sponsorVerificationAdviceFa: "برای ویزای مهاجر بسیار ماهر (Kennismigrant)، نام شرکت باید در لیست حامیان مالی شناخته‌شده (Public Register of Recognised Sponsors) در سایت IND هلند باشد."
  },
  {
    countryCode: "IE",
    countryNameFa: "ایرلند",
    portalName: "JobsIreland",
    url: "https://jobsireland.ie/",
    type: "official_government",
    descriptionFa: "خدمات ملی کاریابی تحت نظارت وزارت حمایت‌های اجتماعی ایرلند.",
    sponsorVerificationAdviceFa: "شغل باید با فهرست مشاغل دارای مهارت بحرانی (Critical Skills Occupations List) منطبق باشد و حداقل حقوق رسمی رعایت شود."
  },
  {
    countryCode: "NZ",
    countryNameFa: "نیوزیلند",
    portalName: "Careers NZ & SEEK NZ",
    url: "https://www.careers.govt.nz/jobs-database/",
    type: "official_government",
    descriptionFa: "پایگاه داده مشاغل دولتی و بازار کار نیوزیلند به همراه بررسی تقاضای Green List.",
    sponsorVerificationAdviceFa: "کارفرما برای استخدام از طریق ویزای کار AEWV باید گواهی تأیید صلاحیت (Accredited Employer) داشته باشد."
  },
  {
    countryCode: "SE",
    countryNameFa: "سوئد",
    portalName: "Platsbanken (Arbetsförmedlingen)",
    url: "https://arbetsformedlingen.se/platsbanken/",
    type: "official_government",
    descriptionFa: "سایت رسمی آژانس کاریابی دولتی سوئد؛ انتشار آگهی در EURES/Platsbanken برای ویزای کار سوئد قانوناً الزامی است.",
    sponsorVerificationAdviceFa: "شرایط قرارداد کاری و بیمه باید مطابق با توافق‌نامه‌های دسته‌جمعی صنفی (Kollektivavtal) باشد."
  },
  {
    countryCode: "FI",
    countryNameFa: "فنلاند",
    portalName: "Job Market Finland (Työmarkkinatori)",
    url: "https://tyomarkkinatori.fi/en",
    type: "official_government",
    descriptionFa: "پلتفرم رسمی هوشمند اشتغال و خدمات بازار کار فنلاند.",
    sponsorVerificationAdviceFa: "برای ویزای متخصصان سریع (Fast Track)، حداقل حقوق ماهانه خالص باید با استاندارد تخصص بالا مطابقت کند."
  },
  {
    countryCode: "DK",
    countryNameFa: "دانمارک",
    portalName: "Workindenmark",
    url: "https://www.workindenmark.dk/",
    type: "official_government",
    descriptionFa: "درگاه رسمی وزارت کار دانمارک برای استخدام بین‌المللی متخصصان ماهر خارجی.",
    sponsorVerificationAdviceFa: "شغل باید یا در فهرست مشاغل مثبت (Positive List) باشد یا درآمد قرارداد از سقف مصوب سالانه (Pay Limit) بیشتر باشد."
  },
  {
    countryCode: "EU",
    countryNameFa: "کل اتحادیه اروپا",
    portalName: "EURES (European Job Mobility Portal)",
    url: "https://eures.europa.eu/",
    type: "official_government",
    descriptionFa: "شبکه رسمی خدمات اشتغال اتحادیه اروپا با میلیون‌ها فرصت شغلی در ۲۷ کشور اروپایی.",
    sponsorVerificationAdviceFa: "فرصت‌های EURES مستقیماً با ادارات کار ملی لینک هستند؛ به وضعیت اقامت و نیاز به ویزا در هر آگهی توجه کنید."
  }
];

export const SCHOLARSHIP_AND_RESEARCH_PROGRAMS: ScholarshipPortalItem[] = [
  {
    id: "daad",
    nameFa: "بورسیه‌های سرویس تبادلات آکادمیک آلمان (DAAD)",
    nameEn: "DAAD Scholarships (Germany)",
    coverage: "full_tuition_and_stipend",
    hostCountryOrOrgFa: "آلمان",
    officialUrl: "https://www.daad.de/en/studying-in-germany/scholarships/",
    eligibilityIranianNoticeFa: "ایرانیان واجد شرایط شرکت در اکثر برنامه‌های کارشناسی ارشد و دکترای DAAD (نظیر EPOS و پژوهشی) هستند.",
    deadlineOverviewFa: "معمولاً بین ماه‌های آگوست تا نوامبر هر سال برای پذیرش سال تحصیلی بعد.",
    keyRequirementsFa: "معدل عالی، انگیزه‌نامه هدفمند متصل به نیازهای توسعه پایدار، رزومه کاری حداقل ۲ ساله برای برخی گرایش‌ها و نمره زبان رسمی."
  },
  {
    id: "erasmus_mundus",
    nameFa: "بورسیه دوره‌های مشترک ارشد اراسموس موندوس اتحادیه اروپا",
    nameEn: "Erasmus Mundus Joint Masters (EMJM)",
    coverage: "full_tuition_and_stipend",
    hostCountryOrOrgFa: "اتحادیه اروپا (تحصیل در ۲ تا ۳ کشور مختلف)",
    officialUrl: "https://erasmus-plus.ec.europa.eu/opportunities/opportunities-for-individuals/students/erasmus-mundus-joint-masters",
    eligibilityIranianNoticeFa: "سهمیه کشورهای Partner Countries؛ ایرانیان همه ساله در رتبه‌های برتر پذیرفته‌شدگان فاند اراسموس موندوس قرار دارند.",
    deadlineOverviewFa: "معمولاً بین نوامبر تا ژانویه هر سال به صورت مستقیم در وب‌سایت کنسرسیوم هر رشته.",
    keyRequirementsFa: "کارنامه تحصیلی شاخص، توصیه‌نامه‌های قوی آکادمیک، مدرک زبان انگلیسی معتبر و تطبیق رشته لیسانس با کاتالوگ برنامه."
  },
  {
    id: "campus_france_eiffel",
    nameFa: "بورسیه نخبگان ایفل فرانسه (Eiffel Scholarship)",
    nameEn: "France Eiffel Excellence Scholarship",
    coverage: "full_tuition_and_stipend",
    hostCountryOrOrgFa: "فرانسه (Campus France)",
    officialUrl: "https://www.campusfrance.org/en/the-eiffel-scholarship-program",
    eligibilityIranianNoticeFa: "متقاضیان باید توسط یکی از دانشگاه‌های فرانسوی نامزد (Nominate) شوند؛ ارسال انفرادی مستقیم امکان‌پذیر نیست.",
    deadlineOverviewFa: "دانشگاه‌ها پرونده‌ها را تا اوایل ژانویه به پرتال مرکزی کامپوس فرانس ارسال می‌کنند.",
    keyRequirementsFa: "سن زیر ۲۵ سال برای ارشد و زیر ۳۰ سال برای دکترا، رزومه علمی بسیار ممتاز در رشته‌های مهندسی، علوم پایه، حقوق یا مدیریت."
  },
  {
    id: "mext_japan",
    nameFa: "بورسیه دولتی مونبوکاگاکوشو ژاپن (MEXT)",
    nameEn: "Japanese Government (MEXT) Scholarships",
    coverage: "full_tuition_and_stipend",
    hostCountryOrOrgFa: "ژاپن",
    officialUrl: "https://www.studyinjapan.go.jp/en/planning/scholarships/",
    eligibilityIranianNoticeFa: "دو مسیر اقدام: از طریق سفارت ژاپن در تهران (Embassy Track) یا مستقیماً از طریق دانشگاه پذیرنده‌کننده ژاپنی (University Track).",
    deadlineOverviewFa: "مسیر سفارت معمولاً در اردیبهشت‌ماه هر سال فراخوان می‌دهد.",
    keyRequirementsFa: "آزمون کتبی زبان انگلیسی/ژاپنی، مصاحبه در سفارت و ارائه پروپوزال تحقیقاتی عمیق برای دوره تحقیقاتی."
  },
  {
    id: "gks_korea",
    nameFa: "بورسیه دولتی کره جنوبی (Global Korea Scholarship - GKS)",
    nameEn: "Global Korea Scholarship (GKS)",
    coverage: "full_tuition_and_stipend",
    hostCountryOrOrgFa: "کره جنوبی (NIIED)",
    officialUrl: "https://www.studyinkorea.go.kr/",
    eligibilityIranianNoticeFa: "ایران دارای سهمیه سالانه در هر دو مسیر سفارت و دانشگاه است؛ پوشش کامل شهریه، بلیت رفت و برگشت و ماهانه هزینه زندگی.",
    deadlineOverviewFa: "فوریه تا مارس برای دوره‌های تحصیلات تکمیلی (ارشد و دکترا).",
    keyRequirementsFa: "معدل بالای ۸۰٪ (حداقل ۱۶ از ۲۰ ایران)، سلامت جسمی کامل، توصیه‌نامه‌ها و برنامه تحصیلی مدون."
  },
  {
    id: "euraxess_jobs",
    nameFa: "درگاه پوزیشن‌های تحقیقاتی و دکترای اتحادیه اروپا (EURAXESS)",
    nameEn: "EURAXESS Research Jobs & Fellowships",
    coverage: "full_tuition_and_stipend",
    hostCountryOrOrgFa: "اروپا (پروژه‌های ماری کوری Horizon Europe)",
    officialUrl: "https://euraxess.ec.europa.eu/jobs",
    eligibilityIranianNoticeFa: "موقعیت‌های دکترا در کشورهای نظیر هلند، سوئد، دانمارک و بلژیک به عنوان استخدام رسمی با حقوق، بیمه و بازنشستگی تعریف می‌شوند.",
    deadlineOverviewFa: "پیوسته و در تمام طول سال بر مبنای باز شدن گرنت‌های اساتید.",
    keyRequirementsFa: "تطبیق دقیق موضوع تحقیق با گرنت استاد، نمونه کد/مقاله و مصاحبه تخصصی فنی با کمیته جذب دانشگاه."
  },
  {
    id: "academic_transfer",
    nameFa: "پرتال استخدام دانشگاهی هلند (AcademicTransfer)",
    nameEn: "AcademicTransfer Netherlands",
    coverage: "full_tuition_and_stipend",
    hostCountryOrOrgFa: "هلند",
    officialUrl: "https://www.academictransfer.com/",
    eligibilityIranianNoticeFa: "همه دانشگاه‌های پژوهشی هلند آگهی‌های PhD Vacancy خود را که استخدام رسمی هستند در این سایت منتشر می‌کنند.",
    deadlineOverviewFa: "پیوسته در طول سال.",
    keyRequirementsFa: "مدرک کارشناسی ارشد معتبر، تسلط عالی به زبان انگلیسی و توانایی اثبات‌شده در نگارش پایان‌نامه."
  }
];

export const STAR_INTERVIEW_GUIDELINES: InterviewGuideline[] = [
  {
    pillar: "Situation",
    titleFa: "۱. توصیف موقعیت و زمینه (Situation)",
    explanationFa: "صحنه را با جزئیات ضروری، اما کوتاه و منسجم ترسیم کنید؛ چه شرکتی، چه مقیاسی و چه چالشی در میان بود؟",
    exampleFa: "«در شرکت قبلی من، ترافیک سامانه در ساعات اوج ۵ برابر شد و نرخ خطای سرورها به ۱۲٪ افزایش یافت که منجر به افت تجربه کاربران گردید.»",
    commonPitfallFa: "پرگویی و توصیف بیش از حد جزئیات حاشیه‌ای که مصاحبه‌کننده را خسته کند."
  },
  {
    pillar: "Task",
    titleFa: "۲. مسئولیت و وظیفه مشخص شما (Task)",
    explanationFa: "سهم فردی خود را روشن کنید؛ هدف چه بود و چه دستاوردی از شما انتظار می‌رفت؟",
    exampleFa: "«به عنوان مهندس ارشد بک‌اند، وظیفه من شناسایی گره‌های عملکردی دیتابیس و کاهش زمان پاسخگویی به زیر ۲۰۰ میلی‌ثانیه ظرف ۲ هفته بود.»",
    commonPitfallFa: "استفاده دائم از ضمیر «ما» به جای توضیح دقیق اینکه شخص شما چه مسئولیتی را بر دوش داشتید."
  },
  {
    pillar: "Action",
    titleFa: "۳. اقدام عملی و راه‌حل تخصصی (Action)",
    explanationFa: "قلب مصاحبه؛ با چه ابزار، چه تکنولوژی، چه مذاکره یا چه منطقی مسئله را حل کردید؟",
    exampleFa: "«ابتدا لاگ‌های کند را با ابزارهای مانیتورینگ استخراج کردم، کوئری‌های ناکارآمد را بازنویسی نمودم، لایه کش ریدیس را به معماری اضافه کردم و ایندکس‌های دیتابیس را بازطراحی نمودم.»",
    commonPitfallFa: "کلی‌گویی تئوریک بدون اشاره به متدولوژی، ابزارهای تخصصی یا موانع بین‌راهی."
  },
  {
    pillar: "Result",
    titleFa: "۴. نتیجه ملموس و قابل سنجش عددی (Result)",
    explanationFa: "خروجی اقدام شما چه بود؟ همیشه نتیجه را با عدد، درصد یا شاخص کسب‌وکار همراه کنید.",
    exampleFa: "«در نتیجه، زمان پاسخ سرور تا ۶۵٪ کاهش یافت، نرخ خطا به زیر ۰.۱٪ رسید و سیستم موفق شد بلک‌فرایدی را بدون یک دقیقه قطعی سپری کند.»",
    commonPitfallFa: "فراموش کردن بیان نتیجه نهایی یا اتمام پاسخ بدون اشاره به ارزش خلق‌شده برای کسب‌وکار."
  }
];

export const SCAM_WARNINGS: string[] = [
  "هرگز بابت 'تضمین صددرصد جاب‌آفر'، صدور ویزای فوری یا شرکت در قرعه‌کشی‌های ادعایی استخدامی پول پرداخت نکنید؛ هیچ شخص یا آژانسی امکان تضمین تصمیم افسر ویزا را ندارد.",
  "فروش پیشنهادهای کاری ساختگی (مانند LMIA جعلی در کانادا یا CoS جعلی در بریتانیا) جرم بین‌المللی است و به ریجکتی فوری، درج سابقه تقلب (Misrepresentation) و محرومیت ۵ ساله از ورود منجر می‌شود.",
  "از ارسال اطلاعات حساس بانکی، شماره گذرنامه، اسکن کارت ملی یا امضای قرارداد در چت‌های خصوصی تلگرام و واتس‌اپ پیش از احراز هویت شرکت و دامنه ایمیل رسمی کارفرما اکیداً خودداری کنید.",
  "مراقب ژورنال‌های نامعتبر یا جعلی (Predatory Journals) و خرید جایگاه نویسندگی (Authorship) در مقالات باشید؛ مراجع ارزیابی مهاجرتی و دانشگاه‌های غربی این موارد را به راحتی ردگیری و پرونده را باطل می‌کنند.",
  "هزینه‌های دولتی بررسی ویزا، ارزیابی مدارک (WES, Engineers Australia) و آزمون‌های زبان فقط و فقط از طریق درگاه‌های پرداخت کارت‌های بین‌المللی در وب‌سایت‌های رسمی دولتی پرداخت می‌شوند."
];
