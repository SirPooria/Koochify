import { OfficialSourceCitation } from "../types";

export const AUDITED_SOURCES: Record<string, OfficialSourceCitation> = {
  src_ircc_funds: {
    sourceId: "src_ircc_funds",
    publisher: "اداره مهاجرت، پناهندگی و شهروندی کانادا (IRCC)",
    title: "IRCC — Proof of financial support for study permits",
    canonicalUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/get-documents/financial-support.html",
    sourceType: "government",
    effectiveFrom: "2026-09-01",
    checkedAt: "2026-10-04",
    confidence: "official_current_page",
    summaryFa: "نرخ مصوب جدید تمکن زندگی دانشجو در کانادا خارج از کبک: ۲۳٬۴۴۸ دلار کانادا برای ۱ نفر از ۱ سپتامبر ۲۰۲۶ (شهریه و حمل‌ونقل جداگانه محاسبه می‌شود)."
  },
  src_ircc_fsw: {
    sourceId: "src_ircc_fsw",
    publisher: "اداره مهاجرت کانادا (IRCC)",
    title: "Federal Skilled Worker Program (Express Entry)",
    canonicalUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply/federal-skilled-workers.html",
    sourceType: "government",
    effectiveFrom: "2024-01-01",
    checkedAt: "2026-10-04",
    confidence: "official_current_page",
    summaryFa: "شروط ویزای نیروی متخصص فدرال: حداقل زبان CLB 7 در هر چهار مهارت، حداقل ۶۷ امتیاز در جدول انتخابی اولیه، ارزیابی مدرک تحصیلی ECA و سابقه کار در طبقات TEER 0, 1, 2, 3."
  },
  src_germany_blocked_account: {
    sourceId: "src_germany_blocked_account",
    publisher: "وزارت امور خارجه آلمان (Auswärtiges Amt)",
    title: "Opening a blocked account (Sperrkonto) for Germany",
    canonicalUrl: "https://www.auswaertiges-amt.de/en/sperrkonto-388600",
    sourceType: "government",
    effectiveFrom: "2024-09-01",
    checkedAt: "2026-10-04",
    confidence: "official_current_page",
    summaryFa: "نرخ استاندارد حساب مسدود (Sperrkonto) دانشجویی آلمان: ماهانه ۹۹۲ یورو (معادل ۱۱٬۹۰۴ یورو برای سال اول). شهریه دانشگاه‌های دولتی اغلب رایگان یا ناچیز است."
  },
  src_germany_chancenkarte: {
    sourceId: "src_germany_chancenkarte",
    publisher: "درگاه رسمی مهاجرت آلمان (Make it in Germany)",
    title: "Opportunity Card (Chancenkarte) for Job Seekers",
    canonicalUrl: "https://www.make-it-in-germany.com/en/visa-residence/types/job-search-opportunity-card",
    sourceType: "government",
    effectiveFrom: "2024-06-01",
    checkedAt: "2026-10-04",
    confidence: "official_current_page",
    summaryFa: "کارت فرصت جویای کار آلمان: حداقل مدرک دانشگاهی یا آموزش حرفه‌ای ۲ ساله شناخته‌شده، زبان آلمانی A1 یا انگلیسی B2، و کسب حداقل ۶ امتیاز در سیستم امتیازی سن/زبان/سابقه."
  },
  src_germany_blue_card: {
    sourceId: "src_germany_blue_card",
    publisher: "Make it in Germany",
    title: "EU Blue Card Germany",
    canonicalUrl: "https://www.make-it-in-germany.com/en/visa-residence/types/eu-blue-card",
    sourceType: "government",
    effectiveFrom: "2024-01-01",
    checkedAt: "2026-10-04",
    confidence: "official_current_page",
    summaryFa: "بلوکارت آلمان: نیاز به جاب‌آفر با حداقل آستانه حقوق قانونی در مشاغل دارای کمبود (MINT/پزشکی) یا عمومی، و مدرک دانشگاهی معتبر در پایگاه Anabin."
  },
  src_uk_student_money: {
    sourceId: "src_uk_student_money",
    publisher: "وزارت کشور بریتانیا (GOV.UK)",
    title: "Student visa: Money you need",
    canonicalUrl: "https://www.gov.uk/student-visa/money",
    sourceType: "government",
    effectiveFrom: "2025-01-02",
    checkedAt: "2026-10-04",
    confidence: "official_current_page",
    summaryFa: "تمکن زندگی بریتانیا: ماهانه ۱٬۵۲۹ پوند در لندن (تا ۹ ماه = ۱۳٬۷۶۱ پوند) یا ۱٬۱۷۱ پوند خارج لندن (تا ۹ ماه = ۱۰٬۵۳۹ پوند) به همراه باقیمانده شهریه. قانون نگهداری ۲۸ روزه متوالی."
  },
  src_uk_skilled_worker_english: {
    sourceId: "src_uk_skilled_worker_english",
    publisher: "وزارت کشور بریتانیا (GOV.UK)",
    title: "Skilled Worker visa: Knowledge of English (2026 changes)",
    canonicalUrl: "https://www.gov.uk/skilled-worker-visa/knowledge-of-english",
    sourceType: "government",
    effectiveFrom: "2026-01-08",
    checkedAt: "2026-10-04",
    confidence: "official_current_page",
    summaryFa: "درخواست‌های جدید ویزای کار تخصصی بریتانیا از ۸ ژانویه ۲۰۲۶ عموماً سطح زبان انگلیسی CEFR B2 را مطالبه می‌کنند. کارفرما باید لایسنس اسپانسرشیپ معتبر داشته باشد."
  },
  src_au_student_500: {
    sourceId: "src_au_student_500",
    publisher: "وزارت امور داخلی استرالیا (Home Affairs)",
    title: "Subclass 500 Student Visa & Oct 2026 Updates",
    canonicalUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
    sourceType: "government",
    effectiveFrom: "2026-10-02",
    checkedAt: "2026-10-04",
    confidence: "official_current_page",
    summaryFa: "ویزای دانشجویی ۵۰۰ استرالیا: مقررات جدید آغازشده از ۲ اکتبر ۲۰۲۶ روی درخواست داخل خاک و همراهان اثرگذار است. الزام CoE، بیمه OSHC و تمکن رسمی ۱۲ ماهه زندگی و شهریه."
  },
  src_au_skills_482: {
    sourceId: "src_au_skills_482",
    publisher: "Home Affairs Australia",
    title: "Skills in Demand Subclass 482",
    canonicalUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skills-in-demand-visa-subclass-482",
    sourceType: "government",
    effectiveFrom: "2024-12-01",
    checkedAt: "2026-10-04",
    confidence: "official_current_page",
    summaryFa: "ویزای کاری کارفرمایی ۴۸۲ استرالیا: اسپانسر تاییدشده، آزمون زبان معتبر، ارزیابی مهارت توسط مرجع ذی‌صلاح و سابقه کار مرتبط."
  },
  src_us_study_i20: {
    sourceId: "src_us_study_i20",
    publisher: "وزارت امور خارجه ایالات متحده (Travel.State.Gov)",
    title: "Student Visa (F-1/M-1) & Form I-20",
    canonicalUrl: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html",
    sourceType: "government",
    effectiveFrom: "2024-01-01",
    checkedAt: "2026-10-04",
    confidence: "official_current_page",
    summaryFa: "ویزای تحصیلی آمریکا رقم ثابتی ندارد؛ تمکن باید کل هزینه‌های سال اول ثبت‌شده در فرم I-20 دانشگاه را پوشش دهد. مصاحبه کنسولی و پرداخت هزینه SEVIS اجباری است."
  },
  src_us_iran_reciprocity: {
    sourceId: "src_us_iran_reciprocity",
    publisher: "وزارت امور خارجه آمریکا",
    title: "Iran Reciprocity and Civil Documents",
    canonicalUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/IranIslamicRepublicof.html",
    sourceType: "government",
    effectiveFrom: "2024-01-01",
    checkedAt: "2026-10-04",
    confidence: "official_current_page",
    summaryFa: "طبق جدول رسمی Reciprocity آمریکا، گواهی پلیس صادره از ایران برای ویزاهای مهاجرتی مورد نیاز نیست (به دلیل غیرقابل راستی‌آزمایی بودن در محل)؛ اما گواهی سایر کشورهای محل سکونت متقاضی جداگانه الزامی است."
  },
  src_nl_ind_study: {
    sourceId: "src_nl_ind_study",
    publisher: "اداره مهاجرت هلند (IND)",
    title: "Income requirements for study in the Netherlands",
    canonicalUrl: "https://ind.nl/en/income-requirements-study",
    sourceType: "government",
    effectiveFrom: "2026-01-01",
    checkedAt: "2026-10-04",
    confidence: "official_current_page",
    summaryFa: "تمکن دانشجویی هلند (study norm) هر سال در ۱ ژانویه بازبینی می‌شود. دانشگاهِ اسپانسر مدارک را به IND ارسال می‌کند؛ زبان مدارک باید هلندی، انگلیسی، آلمانی یا فرانسوی باشد یا ترجمه رسمی گردد."
  },
  src_ie_isd_funds: {
    sourceId: "src_ie_isd_funds",
    publisher: "سازمان تحویل خدمات مهاجرتی ایرلند (ISD)",
    title: "Student finances & Immigration requirements",
    canonicalUrl: "https://www.irishimmigration.ie/coming-to-study-in-ireland/what-are-my-study-options/a-fee-paying-private-primary-or-secondary-school/information-on-student-finances/",
    sourceType: "government",
    effectiveFrom: "2025-06-30",
    checkedAt: "2026-10-04",
    confidence: "official_current_page",
    summaryFa: "تمکن دانشجویی ایرلند: دسترسی فوری به حداقل ۱۰٬۰۰۰ یورو برای سال اول علاوه بر پرداخت کامل شهریه، به همراه اثبات دسترسی به همین میزان برای سال‌های بعد."
  },
  src_nz_student_funds: {
    sourceId: "src_nz_student_funds",
    publisher: "اداره مهاجرت نیوزیلند (Immigration New Zealand)",
    title: "Student fund requirements",
    canonicalUrl: "https://www.immigration.govt.nz/process-to-apply/applying-for-a-visa/providing-evidence-and-documents-to-support-your-visa-application/student-fund-requirements/",
    sourceType: "government",
    effectiveFrom: "2024-01-01",
    checkedAt: "2026-10-04",
    confidence: "official_current_page",
    summaryFa: "تمکن تحصیلی نیوزیلند: ۲۰٬۰۰۰ دلار نیوزیلند برای هر سال تحصیل عالی (یا ماهانه ۱٬۶۶۷ دلار) به همراه بلیت خروج یا اعتبار کافی برای بازگشت."
  },
  src_nz_smc: {
    sourceId: "src_nz_smc",
    publisher: "Immigration New Zealand",
    title: "Skilled Migrant Category Resident Visa",
    canonicalUrl: "https://www.immigration.govt.nz/visas/skilled-migrant-category-resident-visa/",
    sourceType: "government",
    effectiveFrom: "2024-01-01",
    checkedAt: "2026-10-04",
    confidence: "official_current_page",
    summaryFa: "مسیر اقامت مهارتی نیوزیلند: سقف سنی ۵۵ سال، پیشنهاد شغلی از کارفرمای معتبر (Accredited Employer)، زبان انگلیسی و کسب ۶ امتیاز مهارتی."
  },
  src_un_desa_stats: {
    sourceId: "src_un_desa_stats",
    publisher: "دپارتمان امور اقتصادی و اجتماعی ملل متحد (UN DESA)",
    title: "International Migrant Stock 2024",
    canonicalUrl: "https://www.un.org/development/desa/pd/content/international-migrant-stock/",
    sourceType: "official_statistics",
    effectiveFrom: "2024-07-01",
    checkedAt: "2026-10-04",
    confidence: "official_current_page",
    summaryFa: "برآورد UN DESA برای سال ۲۰۲۴: حدود ۱٫۷۳۳ میلیون نفر متولد ایران به عنوان مهاجر بین‌المللی در خارج از ایران ساکن هستند (stock بر پایه زادگاه، نه کل دیاسپورا یا فرزندان نسل دوم)."
  },
  src_unfpa_pop: {
    sourceId: "src_unfpa_pop",
    publisher: "صندوق جمعیت سازمان ملل متحد (UNFPA)",
    title: "Iran Population 2025 (WPP 2024 projections)",
    canonicalUrl: "https://www.unfpa.org/data/world-population/IR",
    sourceType: "official_statistics",
    effectiveFrom: "2025-01-01",
    checkedAt: "2026-10-04",
    confidence: "official_current_page",
    summaryFa: "جمعیت تخمینی ساکن ایران در سال ۲۰۲۵ حدود ۹۲٫۴ میلیون نفر است که تقریباً ۶۹٪ آن در سن کار آماری (۱۵ تا ۶۴ سال) قرار دارند."
  }
};
