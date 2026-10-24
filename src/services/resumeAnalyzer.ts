import { UserAssessmentProfile } from "../types";

export interface BulletRewriteSuggestion {
  originalBullet: string;
  improvedBullet: string;
  actionVerb: string;
  scopeOrTool: string;
  measurableOutcomeNote: string;
  userVerificationNoticeFa: string; // "پیشنهاد ویرایشی، نیازمند تأیید کاربر"
}

export interface AtsAuditResult {
  score: number; // 0-100
  passedChecks: string[];
  warningChecks: string[];
  regionalAdviceFa: string[];
}

export interface ResumeAnalysisOutput {
  targetJobTitle: string;
  targetCountryFa: string;
  atsAudit: AtsAuditResult;
  realStrengths: string[];
  identifiedGaps: string[];
  remediationRoadmapFa: string[];
  suggestedHeadlineFa: string;
  suggestedSummaryFa: string;
  suggestedCoverLetterFa: string;
  recruiterOutreachMessageFa: string;
  bulletSuggestions: BulletRewriteSuggestion[];
  academicVsIndustryNotesFa: string;
  generatedAtsResumeMarkdown?: string;
}

export function analyzeUserResume(
  resumeText: string,
  targetJobTitle: string,
  targetCountryCode: string,
  profile?: UserAssessmentProfile
): ResumeAnalysisOutput {
  const text = (resumeText || "").trim();
  const lower = text.toLowerCase();

  const passedChecks: string[] = [];
  const warningChecks: string[] = [];
  const regionalAdvice: string[] = [];

  // Regional norms check (North America / UK vs Germany / EU)
  const isNorthAmericaOrUK = ["CA", "US", "GB", "IE"].includes(targetCountryCode);
  if (isNorthAmericaOrUK) {
    regionalAdvice.push("در رزومه‌های کانادا، آمریکا و بریتانیا اکیداً از درج عکس پرسنلی، تاریخ تولد، وضعیت تأهل یا جنسیت خودداری کنید تا از سوگیری در استخدام پیشگیری شود.");
    if (lower.includes("birth") || lower.includes("married") || lower.includes("single") || lower.includes("photo") || lower.includes("religion")) {
      warningChecks.push("اطلاعات حساس شخصی غیرضروری (نظیر تاریخ تولد، وضعیت تاهل یا عکس) شناسایی شد؛ پیشنهاد می‌شود حذف گردند.");
    } else {
      passedChecks.push("رعایت استانداردهای ضد تبعیض رزومه‌های بین‌المللی و عدم درج اطلاعات شخصی غیرضروری.");
    }
  } else if (targetCountryCode === "DE") {
    regionalAdvice.push("در آلمان (Lebenslauf)، درج عکس حرفه‌ای اداری و اطلاعات کلی اقامت در فرمت‌های سنتی شرکت‌های صنعتی رایج است، گرچه در شرکت‌های نرم‌افزاری بین‌المللی اختیاری شده است.");
  }

  // Length and structure checks
  if (text.length > 300) {
    passedChecks.push("حجم متن کافی برای ارزیابی سوابق شغلی و تحصیلی.");
  } else {
    warningChecks.push("متن رزومه بسیار کوتاه است؛ جزئیات سوابق کاری و ابزارهای مورد استفاده را تکمیل کنید.");
  }

  // Quantitative numbers check
  const hasNumbers = /\d+%|\d+\s*(users|clients|projects|million|k|years|تومان|کاربر|پروژه)/i.test(text);
  if (hasNumbers) {
    passedChecks.push("وجود دستاوردهای عددی و شاخص‌های قابل اندازه‌گیری در متن.");
  } else {
    warningChecks.push("کمبود اعداد و معیارهای سنجش نتیجه (Metrics). تلاش کنید در هر سابقه کاری درصد بهبود، مقیاس کاربران یا حجم پروژه را اضافه کنید.");
  }

  // Action verbs check
  const actionVerbsEn = ["developed", "engineered", "led", "managed", "optimized", "designed", "architected", "increased", "reduced", "delivered", "implemented"];
  const actionVerbsFa = ["طراحی", "توسعه", "بهینه‌سازی", "مدیریت", "پیاده‌سازی", "کاهش", "افزایش", "معماری"];
  const hasActionVerbs = actionVerbsEn.some(v => lower.includes(v)) || actionVerbsFa.some(v => text.includes(v));
  if (hasActionVerbs) {
    passedChecks.push("استفاده از افعال کنشی قوی در توصیف مسئولیت‌ها.");
  } else {
    warningChecks.push("شروع جملات با عبارات مجهول یا کلیشه‌ای مانند «مسئول انجام امور» به جای افعال کنشی مستقیم.");
  }

  // Calculate ATS Score
  let atsScore = 60;
  atsScore += passedChecks.length * 10;
  atsScore -= warningChecks.length * 8;
  atsScore = Math.max(30, Math.min(95, atsScore));

  // Identify strengths & gaps
  const realStrengths: string[] = [
    `انطباق ساختار با عنوان شغلی هدف (${targetJobTitle || "متخصص فنی"}).`,
    "وضوح در زنجیره زمانی تجارب کاری بدون خلاء زمانی پنهان."
  ];

  const identifiedGaps: string[] = [
    "عدم پیوند مستقیم برخی مهارت‌ها با گواهینامه‌های رسمی یا پروژه‌های عمومی در گیت‌هاب/پورتفولیو.",
    "نیاز به سفارشی‌سازی کلیدواژه‌های تخصصی دقیقاً مطابق با شرح آگهی شغلی مقصد."
  ];

  // Bullet rewriting formula: Action Verb + Scope/Tool + Measurable Outcome
  const bulletSuggestions: BulletRewriteSuggestion[] = [
    {
      originalBullet: text.includes("طراحی") || text.includes("توسعه")
        ? "توسعه و نگهداری سرویس‌های بک‌اند سامانه و رفع باگ‌ها."
        : "Responsible for managing software modules and daily tasks.",
      improvedBullet: "توسعه و بازمعماری ۴ میکروسرویس اصلی با تایپ‌اسکریپت و داکر، که منجر به کاهش ۳۵ درصدی زمان بارگذاری و ارتقای پایداری سامانه در ساعات اوج مصرف گردید.",
      actionVerb: "بازمعماری و توسعه (Re-architected & Developed)",
      scopeOrTool: "میکروسرویس‌های مقیاس‌پذیر با تایپ‌اسکریپت و داکر",
      measurableOutcomeNote: "کاهش ۳۵٪ زمان بارگذاری سرور (واقعیت عدد باید توسط کاربر تأیید شود)",
      userVerificationNoticeFa: "پیشنهاد ویرایشی، نیازمند تأیید کاربر بر اساس اعداد واقعی پروژه"
    },
    {
      originalBullet: "همکاری با اعضای تیم برای بهبود پایگاه داده و گزارش‌گیری.",
      improvedBullet: "طراحی مجدد پایپ‌لاین انبار داده با SQL و پایتون و پیاده‌سازی ایندکس‌های بهینه، که گزارش‌گیری مدیریتی هفتگی را از ۳ ساعت به ۱۵ دقیقه تقلیل داد.",
      actionVerb: "طراحی مجدد و پیاده‌سازی (Redesigned & Implemented)",
      scopeOrTool: "پایپ‌لاین انبار داده با پایتون و SQL",
      measurableOutcomeNote: "صرفه‌جویی ۲.۵ ساعت در هر دوره گزارش‌گیری هفتگی",
      userVerificationNoticeFa: "پیشنهاد ویرایشی، نیازمند تأیید کاربر بر اساس واقعیت"
    }
  ];

  // Country name for display
  const countryNames: Record<string, string> = {
    CA: "کانادا",
    DE: "آلمان",
    AU: "استرالیا",
    GB: "بریتانیا",
    US: "آمریکا",
    NL: "هلند",
    IE: "ایرلند",
    NZ: "نیوزیلند",
    IT: "ایتالیا",
    SE: "سوئد"
  };
  const targetCountryFa = countryNames[targetCountryCode] || "مقصد بین‌المللی";

  // Tailored Summary / Headline
  const job = targetJobTitle || (profile?.primaryJobTitle) || "متخصص فنی";
  const years = profile?.totalWorkExperienceYears || 3;
  const suggestedHeadlineFa = `${job} | با ${years} سال سابقه در طراحی و پیاده‌سازی سیستم‌های مقیاس‌پذیر | آماده همکاری و جابه‌جایی به ${targetCountryFa}`;

  const suggestedSummaryFa = `${job} نتیجه‌محور با بیش از ${years} سال تجربه تخصصی در تحلیل، توسعه و استقرار راهکارهای نرم‌افزاری و مهندسی. دارای سابقه اثبات‌شده در بهینه‌سازی عملکرد سامانه‌ها، کار با استانداردهای مدرن صنعتی و همکاری در تیم‌های بین‌المللی چابک (Agile). متعهد به رعایت بالاترین اصول مهندسی و مشتاق خلق ارزش در بازار کار ${targetCountryFa}.`;

  const suggestedCoverLetterFa = `مدیر محترم استخدام،

با اشتیاق فراوان این درخواست را جهت همکاری در موقعیت شغلی ${job} ارسال می‌نمایم. با توجه به سابقه بیش از ${years} سال فعالیت مستمر در زمینه مهندسی و پیاده‌سازی پروژه‌های مقیاس‌پذیر، باور دارم که مهارت‌های فنی و تعهد کاری من ارزش افزوده‌ای ملموس برای تیم شما در ${targetCountryFa} به همراه خواهد داشت.

در تجارب گذشته خود، همواره بر دستیابی به نتایج قابل سنجش، ارتقای پایداری فرآیندها و تعامل موثر با ذی‌نفعان پروژه متمرکز بوده‌ام. آمادگی دارم تا در یک مصاحبه کاری جزئیات بیشتری از دستاوردهای قابل راستی‌آزمایی خود را تشریح نمایم.

با احترام و سپاس از وقت و توجه شما،
${profile?.fullName || "متقاضی محترم"}`;

  const recruiterOutreachMessageFa = `Hi [Recruiter Name],

I came across the ${job} opening at [Company Name] and was impressed by your team's engineering mission. With ${years}+ years of hands-on experience in building scalable systems and a solid track record in optimizing performance, I believe my technical background aligns well with your role requirements.

I am actively exploring opportunities in ${targetCountryFa} and would welcome a brief conversation to explore how my expertise could add value to your team.

Best regards,
${profile?.fullName || "Candidate"}`;

  const academicVsIndustryNotesFa = "توجه: در رزومه‌های صنعتی (Industry Resume) تمرکز باید بر حل مسائل کسب‌وکار و درآمدزایی باشد. اگر قصد اقدام برای مقاطع تحصیلی ارشد پژوهشی یا دکترا را دارید، فایل شما باید به CV آکادمیک با تفکیک مقالات پذیرفته‌شده، سوابق TA/RA و موضوع پایان‌نامه تبدیل گردد. هرگز مقالات سابمیت‌شده یا در دست نگارش را با عنوان مقاله منتشرشده معرفی نکنید.";

  return {
    targetJobTitle: job,
    targetCountryFa,
    atsAudit: {
      score: atsScore,
      passedChecks,
      warningChecks,
      regionalAdviceFa: regionalAdvice
    },
    realStrengths,
    identifiedGaps,
    remediationRoadmapFa: [
      "بهره‌گیری از قالب ساده تک‌ستونه بدون جداول پیچیده یا اشکال گرافیکی که برای ربات‌های ATS ناخوانا هستند.",
      "تکمیل لینک فعال و پاکسازی‌شده به حساب گیت‌هاب یا لینکدین در هدر رزومه.",
      "افزودن دستاوردهای کمی همراه با اعداد واقعی به هر یک از موقعیت‌های شغلی پیشین."
    ],
    suggestedHeadlineFa,
    suggestedSummaryFa,
    suggestedCoverLetterFa,
    recruiterOutreachMessageFa,
    bulletSuggestions,
    academicVsIndustryNotesFa,
    generatedAtsResumeMarkdown: generateAtsResumeTemplate(profile, job, targetCountryFa)
  };
}

function generateAtsResumeTemplate(profile?: UserAssessmentProfile, jobTitle?: string, countryFa?: string): string {
  const name = profile?.fullName || "نام و نام خانوادگی";
  const job = jobTitle || profile?.primaryJobTitle || "عنوان شغلی هدف";
  const exp = profile?.totalWorkExperienceYears || 3;
  const tools = (profile?.toolsAndTechStack || ["Python", "TypeScript", "SQL", "Git", "Docker"]).join(", ");

  return `# ${name}
**${job} | ${profile?.currentCityOrProvince || "تهران، ایران"} | آماده به کار در ${countryFa || "کانادا"}**
ایمیل: example@email.com | لینکدین: linkedin.com/in/profile | گیت‌هاب: github.com/username

---

### خلاصه حرفه‌ای (Professional Summary)
${job} با انگیزه و متمرکز بر نتایج، با بیش از ${exp} سال تجربه تخصصی در تحلیل، توسعه و استقرار سیستم‌ها. دارای تسلط به ابزارهای ${tools} و سابقه اثبات‌شده در کاهش خطاها و افزایش بهره‌وری پروژه‌ها.

---

### مهارت‌های کلیدی (Core Competencies)
- **فناوری‌ها و زبان‌ها:** ${tools}
- **ابزارها و متدولوژی‌ها:** Agile/Scrum, CI/CD, Unit Testing, Code Review
- **مهارت‌های نرم:** حل مسئله، مدیریت زمان، کار تیمی چندفرهنگی

---

### تجارب شغلی (Professional Experience)
**${job} ارشد** | شرکت فناوری نمونه | تهران، ایران (۱۴۰۱ - اکنون)
- رهبری توسعه و پیاده‌سازی ماژول‌های اصلی پروژه با کاهش ۳۰ درصدی خطاهای سیستمی.
- همکاری نزدیک با مدیران محصول جهت بازتعریف نیازمندی‌ها بر پایه متدولوژی Scrum.
- بهینه‌سازی فرآیندهای پایگاه داده و بهبود زمان پاسخگویی به درخواست‌های مشتریان.

**${job}** | شرکت نرم‌افزاری پیشگام | تهران، ایران (۱۳۹۸ - ۱۴۰۱)
- پیاده‌سازی بیش از ۱۰ قابلیت جدید نرم‌افزاری مطابق با زمان‌بندی دقیق تحویل محصول.
- مستندسازی فنی معماری سیستم و هدایت جلسات انتقال دانش برای اعضای جدید تیم.

---

### تحصیلات (Education)
**${profile?.highestDegree === "master" ? "کارشناسی ارشد" : "کارشناسی"} ${profile?.fieldOfStudy || "مهندسی کامپیوتر"}**
${profile?.universityName || "دانشگاه دولتی"} | معدل: ${profile?.gpa || "۱۷.۵"} از ۲۰ (${profile?.graduationYear || "۱۴۰۰"})

---

### زبان‌ها (Languages)
- **فارسی:** زبان مادری (Native)
- **انگلیسی:** ${profile?.englishEstimatedLevel || "B2"} حرفه‌ای (تسلط بر مکاتبات و مصاحبه کاری)
`;
}
