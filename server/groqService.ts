import type { UserAssessmentProfile, GroqAIEvaluation } from "../src/types.ts";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Fallback models in priority order
const GROQ_MODELS = [
  "qwen/qwen3.8-27b",
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b"
];

export async function generateGroqImmigrationAnalysis(profile: UserAssessmentProfile): Promise<GroqAIEvaluation> {
  const apiKey = process.env.GROQ_API_KEY || "";

  const isMarried = profile.maritalStatus === "married_together" || profile.maritalStatus === "married_solo";
  const numChildren = profile.dependentsCount || 0;
  const isStudy = profile.migrationGoal === "study";
  const isWork = profile.migrationGoal === "work";
  const gapYears = profile.studyGapYears ?? (profile.graduationYear ? Math.max(0, 1404 - profile.graduationYear) : 0);

  if (!apiKey) {
    console.log("[Groq AI] No GROQ_API_KEY configured, using deterministic legal fallback.");
    return generateDeterministicFallback(profile, gapYears, isMarried, numChildren, isStudy, isWork);
  }

  const systemPrompt = `شما یک وکیل ارشد و مشاور بین‌المللی قوانین مهاجرت با ۱۵ سال سابقه وکالت رسمی در پرونده‌های ایرانیان در کانادا، اتحادیه اروپا (آلمان، ایتالیا، فرانسه، هلند) و استرالیا بر مبنای آخرین قوانین سال ۲۰۲۶ هستید.
شما باید پرونده متقاضی را با ریزبینی یک وکیل واقعی، صریح، علمی، بدون تعصب تجاری و با در نظر گرفتن جزئی‌ترین شرایط فردی و خانوادگی تحلیل کنید.

مهم‌ترین الزامات تحلیلی شما:
۱. تفکیک دقیق مسیر تحصیلی در برابر کاری: متقاضی تحصیلی نیازمند بررسی دقیق معدل، مدرک زبان، دانشگاه مبدا و قصد تحصیلی است؛ متقاضی کاری نیازمند بررسی کدهای شغلی، سابقه بیمه، ویزاهای جستجوی کار (مثل کارت شانس آلمان) یا جاب‌آفر است.
۲. وضعیت تاهل و فرزندان: اگر متاهل است، تاثیر مستقیم حضور همسر و فرزندان بر کف تمکن مالی مسدود سفارت، حق کار باز همسر (Open Work Permit) و تحصیل رایگان فرزندان را تحلیل کنید. اگر مجرد است، انفرادی بودن هزینه‌ها را نشان دهید.
۳. گپ تحصیلی (${gapYears} سال گپ): آیا این گپ تحصیلی در سفارت خطر ریجکتی (بابت عدم اثبات قصد تحصیلی) ایجاد می‌کند؟ اگر با بیمه و کار پر شده چطور؟ راهکار دفاعیه حقوقی در انگیزه‌نامه (SOP) چیست؟
۴. سن (${profile.age} سال): تاثیر سن بر امتیازهای اکسپرس اینتری، کارت شانس آلمان و سخت‌گیری سفارت‌ها برای ویزای دانشجویی.
۵. محاسبه دقیق تمکن مالی واقعی برای تعداد اعضای این خانواده.
۶. تعیین ۳ کشور طلایی سازگار با این پروفایل به ترتیب اولویت و شانس.
۷. افشای ریسک‌های پنهان ریجکتی و راهکارهای مکتوب مقابله با آنها.

خروجی شما باید منحصراً و بدون هیچ متن مقدمه یا اختتامیه، یک شیء معتبر JSON با این کلیدها باشد:
{
  "aiAnalysisTitle": "تحلیل تخصصی پرونده مهاجرتی توسط هوش مصنوعی Groq",
  "caseFeasibilityScore": عدد بین ۱ تا ۱۰۰ به عنوان درصد موفقیت کلی پرونده,
  "lawyerVerdict": "بیانیه حقوقی صریح و شفاف وکیل مهاجرت در مورد وضعیت پرونده (۲ تا ۳ پاراگراف متین و مستدل)",
  "ageAndFamilyImpact": {
    "ageVerdictFa": "تحلیل تخصصی تاثیر سن فرد بر ویزای کاری و تحصیلی",
    "maritalStatusImpactFa": "تحلیل وضعیت تاهل و همراهی همسر در پرونده",
    "dependentsBudgetImpactFa": "تاثیر تعداد فرزندان یا همراهان بر میزان تمکن مالی و مدارک سفارت",
    "spouseRoleFa": "نقش مدارک و مهارت‌های همسر در کسب امتیاز یا کار در مقصد"
  },
  "studyGapAssessment": {
    "gapStatusFa": "وضعیت گپ تحصیلی کاربر بر اساس سال فارغ‌التحصیلی و سابقه کار",
    "isRiskyForVisa": true یا false (آیا این گپ برای ویزا خطرناک است؟),
    "remedyAdviceFa": "راهکار و توصیه‌های مکتوب برای توجیه گپ تحصیلی در سفارت",
    "embassyVibeFa": "دیدگاه آفیسرهای سفارت مقاصد اصلی در قبال این میزان گپ"
  },
  "financialAssessment": {
    "estimatedTotalBudgetNeededFa": "برآورد کلی سرمایه مورد نیاز به دلار یا یورو با ذکر شرایط خانواده",
    "breakdownByFamilyFa": "ریز هزینه‌ها شامل تمکن مسدود، هزینه سال اول و هزینه همراهان",
    "costSavingAdviceFa": "راهکارهای کاهش هزینه (بورسیه، کار دانشجویی، حق کار همسر)"
  },
  "topDestinations": [
    {
      "country": "نام کشور",
      "route": "نام ویزا یا برنامه قانونی ۲۰۲۶ (مثلاً کارت شانس آلمان، اکسپرس اینتری و...)",
      "suitabilityScore": عدد بین ۱ تا ۱۰۰,
      "visaChance": "بسیار بالا" یا "بالا" یا "متوسط" یا "نیازمند تقویت",
      "reasoning": "دلیل فنی و قانونی برای انتخاب این کشور برای این شخص",
      "familyNotes": "شرایط همراهی همسر، اجازه کار و فرزندان در این کشور",
      "financialNotes": "کف تمکن مورد نیاز در این کشور"
    }
  ],
  "hiddenRejectionRisks": [
    "ریسک پنهان ۱",
    "ریسک پنهان ۲",
    "ریسک پنهان ۳"
  ],
  "legalStrategies": [
    "راهکار قانونی ۱ برای پیشگیری از ریجکتی",
    "راهکار قانونی ۲",
    "راهکار قانونی ۳"
  ],
  "actionableRoadmap": [
    "گام ۱: ...",
    "گام ۲: ...",
    "گام ۳: ...",
    "گام ۴: ..."
  ]
}`;

  const userPrompt = `مشخصات دقیق پرونده متقاضی ایرانی:
- نام: ${profile.fullName || "متقاضی"}
- سن: ${profile.age} سال
- هدف مهاجرتی: ${isStudy ? "مهاجرت تحصیلی" : isWork ? "مهاجرت کاری" : "مقایسه همزمان کار و تحصیل"}
- وضعیت تأهل: ${profile.maritalStatus === "single" ? "مجرد" : profile.maritalStatus === "married_together" ? "متأهل (سفر همزمان با همسر)" : "متأهل (ابتدا انفرادی)"}
- تعداد فرزندان همراه: ${numChildren} نفر
- تحصیلات همسر: ${profile.spouseEducation || "ذکر نشده"}
- سطح زبان همسر: ${profile.spouseLanguageLevel || "ذکر نشده"}
- آخرین مدرک تحصیلی: ${profile.highestDegree}
- رشته تحصیلی: ${profile.fieldOfStudy} (${profile.subFieldOrMajor || ""})
- نوع دانشگاه: ${profile.universityType}
- معدل: ${profile.gpa} از ۲۰
- سال اخذ آخرین مدرک (فارغ‌التحصیلی): ${profile.graduationYear || "مشخص نشده"}
- طول گپ تحصیلی: ${gapYears} سال
- نحوه پر شدن گپ تحصیلی: ${profile.studyGapReason === "working_with_insurance" ? "سابقه کار تمام‌وقت با بیمه رسمی" : profile.studyGapReason === "working_freelance" ? "کار فریلنسری یا بدون بیمه" : profile.studyGapReason === "military_service" ? "خدمت سربازی" : "سایر موارد"}
- عنوان شغلی و تخصص: ${profile.primaryJobTitle}
- سابقه کار مستند: ${profile.totalWorkExperienceYears} سال (${profile.hasDocumentedInsuranceOrTaxes === "full_official" ? "دارای سابقه بیمه رسمی" : "بدون بیمه یا ناقص"})
- سطح زبان انگلیسی: ${profile.englishEstimatedLevel} (نمره میانگین: ${profile.englishScores.overall})
- زبان دوم: ${profile.secondLanguage} (سطح ${profile.secondLanguageLevel})
- بودجه در دسترس: ${profile.budgetRangeCategory} (منبع اصلی: ${profile.primaryFundingSource})
- کشور هدف خاص (در صورت وجود): ${profile.targetSpecificCountry || "نامشخص"}

لطفاً خروجی JSON تحلیلی را تحویل دهید.`;

  for (const model of GROQ_MODELS) {
    try {
      console.log(`[Groq AI] Attempting immigration analysis with model: ${model}`);
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 3000
        }),
        signal: AbortSignal.timeout(12000)
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`[Groq AI] Model ${model} returned error ${response.status}: ${errText}`);
        continue;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        console.warn(`[Groq AI] Model ${model} returned empty content.`);
        continue;
      }

      // Parse JSON
      let cleaned = content.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "").trim();
      }

      const parsed = JSON.parse(cleaned);
      console.log(`[Groq AI] Successfully analyzed immigration dossier using ${model}`);

      return {
        aiAnalysisTitle: parsed.aiAnalysisTitle || "تحلیل هوشمند پرونده مهاجرتی توسط هوش مصنوعی Groq",
        caseFeasibilityScore: typeof parsed.caseFeasibilityScore === "number" ? parsed.caseFeasibilityScore : 75,
        lawyerVerdict: parsed.lawyerVerdict || "پرونده شما در مقایسه با استانداردهای ۲۰۲۶ دارای پتانسیل اجرایی مطلوبی است.",
        ageAndFamilyImpact: parsed.ageAndFamilyImpact || {
          ageVerdictFa: `سن شما (${profile.age} سال) در بازه متعارف قرار دارد.`,
          maritalStatusImpactFa: isMarried ? "حضور همسر نیازمند تطبیق تمکن مالی است." : "اقدام انفرادی هزینه‌ها را در کف ممکن نگه می‌دارد.",
          dependentsBudgetImpactFa: numChildren > 0 ? `${numChildren} فرزند همراه نیازمند تمکن سالانه بیشتر هستند.` : "بدون همراه فرزندی.",
          spouseRoleFa: "مدارک و زبان همسر می‌تواند امتیاز تکمیلی به همراه داشته باشد."
        },
        studyGapAssessment: parsed.studyGapAssessment || {
          gapStatusFa: `گپ تحصیلی تخمینی: ${gapYears} سال.`,
          isRiskyForVisa: gapYears > 4 && profile.studyGapReason !== "working_with_insurance",
          remedyAdviceFa: "توجیه سوابق کاری و فعالیت‌های علمی در انگیزه نامه (SOP) ضروری است.",
          embassyVibeFa: "سفارتخانه‌ها در صورت اثبات عدم بیکاری با گپ تحصیلی منطقی برخورد می‌کنند."
        },
        financialAssessment: parsed.financialAssessment || {
          estimatedTotalBudgetNeededFa: "برآورد کلی بر اساس جدول رسمی تمکن سفارتخانه‌ها.",
          breakdownByFamilyFa: "تمکن برای نفر اصلی به همراه مبالغ مجزای همراهان.",
          costSavingAdviceFa: "استفاده از کار دانشجویی پاره‌وقت یا کار همسر به شدت توصیه می‌شود."
        },
        topDestinations: Array.isArray(parsed.topDestinations) ? parsed.topDestinations : [],
        hiddenRejectionRisks: Array.isArray(parsed.hiddenRejectionRisks) ? parsed.hiddenRejectionRisks : [],
        legalStrategies: Array.isArray(parsed.legalStrategies) ? parsed.legalStrategies : [],
        actionableRoadmap: Array.isArray(parsed.actionableRoadmap) ? parsed.actionableRoadmap : [],
        generatedAt: new Date().toISOString(),
        modelUsed: model
      };
    } catch (err) {
      console.warn(`[Groq AI] Failed with model ${model}:`, err);
    }
  }

  // Fallback engine if all Groq models fail or offline
  console.log("[Groq AI] Generating structured fallback evaluation based on legal rules.");
  return generateDeterministicFallback(profile, gapYears, isMarried, numChildren, isStudy, isWork);
}

function generateDeterministicFallback(
  profile: UserAssessmentProfile,
  gapYears: number,
  isMarried: boolean,
  numChildren: number,
  isStudy: boolean,
  isWork: boolean
): GroqAIEvaluation {
  const isGoldenAge = profile.age >= 18 && profile.age <= 32;
  const hasStrongLanguage = profile.englishScores.overall >= 6.5;

  return {
    aiAnalysisTitle: "تحلیل تحلیلی پرونده مهاجرتی توسط موتور هوشمند کوچیفای",
    caseFeasibilityScore: isGoldenAge && hasStrongLanguage ? 85 : 70,
    lawyerVerdict: `با بررسی پرونده ${profile.fullName || "متقاضی محترم"} در چارچوب مقررات رسمی سال ۲۰۲۶، ترکیب مدرک ${profile.highestDegree} در رشته ${profile.fieldOfStudy} با سابقه شغلی ${profile.totalWorkExperienceYears} سال، ظرفیت بالایی برای اقدام بین‌المللی ایجاد کرده است. شرایط پرونده از نظر اقتصادی و قانونی نیازمند انطباق دقیق با هزینه‌های واقعی اسکان است.`,
    ageAndFamilyImpact: {
      ageVerdictFa: isGoldenAge 
        ? `سن شما (${profile.age} سال) در بازه طلایی قرار دارد و حداکثر امتیاز سنی را در سیستم‌های اکسپرس اینتری و کارت شانس آلمان دریافت می‌کنید.`
        : `سن شما (${profile.age} سال) نیازمند تمرکز بر مسیرهای متکی بر سابقه کار تخصصی، جاب‌آفر یا دوره‌های تکمیلی است.`,
      maritalStatusImpactFa: isMarried 
        ? "حضور همسر امکان استفاده از ویزای کار باز (Open Work Permit) را در کشورهای پیشرو فراهم می‌کند اما نیازمند افزایش کف تمکن مالی در حساب بانکی است."
        : "اقدام به صورت مجردی فرایند اثبات تمکن را بسیار روان‌تر کرده و سقف نقدینگی مورد نیاز را به حداقل می‌رساند.",
      dependentsBudgetImpactFa: numChildren > 0 
        ? `به ازای هر فرزند، هزینه‌های استقرار اولیه و تمکن سالانه بین ۳,۰۰۰ تا ۵,۰۰۰ یورو افزایش می‌یابد؛ در عوض آموزش دولتی در اکثر مقاصد اروپایی رایگان است.`
        : "بدون بار مالی ناشی از فرزندان تحت تکفل.",
      spouseRoleFa: profile.spouseEducation && profile.spouseEducation !== "diploma"
        ? "تحصیلات دانشگاهی همسر به عنوان اهرم امتیازآور و امکان کار تمام‌وقت در مقصد عمل می‌کند."
        : "پیشنهاد می‌شود همسر محترم نیز آموزش زبان را جهت ورود به بازار کار محلی آغاز کند."
    },
    studyGapAssessment: {
      gapStatusFa: `فاصله تخمینی از آخرین مدرک تحصیلی: حدود ${gapYears} سال.`,
      isRiskyForVisa: gapYears > 4 && profile.studyGapReason !== "working_with_insurance",
      remedyAdviceFa: profile.studyGapReason === "working_with_insurance"
        ? "گپ تحصیلی شما به دلیل سابقه کار و بیمه رسمی، کاملاً قانونی پوشش داده شده و در SOP به عنوان رشد تجربی قلمداد می‌شود."
        : "ارائه مدارک پروژه‌ها، گواهی‌های دوره‌های تخصصی یا نامه‌های اشتغال جهت پر کردن گپ در پرونده سفارت الزامی است.",
      embassyVibeFa: "سفارتخانه‌های آلمان و کانادا به گپ‌های خالی حساس هستند؛ اما پیوستگی شغلی این دغدغه را مرتفع می‌سازد."
    },
    financialAssessment: {
      estimatedTotalBudgetNeededFa: isMarried 
        ? "حدود ۱۸,۰۰۰ تا ۳۰,۰۰۰ دلار/یورو برای سال اول (شامل تمکن خانواده و اسکان)"
        : "حدود ۱۱,۰۰۰ تا ۲۰,۰۰۰ دلار/یورو برای سال اول به صورت انفرادی",
      breakdownByFamilyFa: isMarried
        ? "پوشش حساب مسدود متقاضی + کمک‌هزینه رسمی همسر و بیمه سلامت مهاجرتی خانواده."
        : "پوشش حساب مسدود فردی مصوب سفارت به همراه بلیت و ودیعه مسکن.",
      costSavingAdviceFa: "استفاده از دانشگاه‌های رایگان دولتی آلمان، ایتالیا (بورسیه DSU) یا ورود همسر به بازار کار تمام‌وقت."
    },
    topDestinations: [
      {
        country: "آلمان",
        route: isWork ? "کارت شانس آلمان (Chancenkarte ۲۰۲۶) / بلوکارت" : "پذیرش دانشگاه‌های دولتی رایگان آلمان",
        suitabilityScore: 88,
        visaChance: "بالا",
        reasoning: "تطابق کامل رشته با لیست مشاغل نیازمند نیروی کار ماهر و شهریه تقریباً صفر دانشگاه‌ها.",
        familyNotes: "همسر از بدو ورود اجازه کار تمام‌وقت دارد و فرزندان از تحصیل رایگان برخوردارند.",
        financialNotes: "حساب مسدود سالانه ۱۱,۹۰۴ یورو به ازای متقاضی اصلی."
      },
      {
        country: "ایتالیا",
        route: "بورسیه استانی DSU و تحصیل بین‌المللی",
        suitabilityScore: 82,
        visaChance: "بالا",
        reasoning: "پوشش کامل شهریه و دریافت کمک‌هزینه نقدی سالانه تا ۸,۰۰۰ یورو بر مبنای درآمد ریالی خانواده در ایران.",
        familyNotes: "امکان الحاق خانواده پس از دریافت اقامت موقت سال اول.",
        financialNotes: "کمترین میزان سرمایه اولیه در میان کشورهای اروپایی."
      },
      {
        country: "کانادا",
        route: isWork ? "اکسپرس اینتری (دسته‌بندی‌های هدفمند STEM/Healthcare)" : "پذیرش تحصیلی دوره‌های تحصیلات تکمیلی",
        suitabilityScore: 76,
        visaChance: "متوسط به بالا",
        reasoning: "امکان اخذ اقامت دائم از طریق مسیرهای مهاجرتی کاری و تحصیلی پس از فارغ‌التحصیلی (PGWP).",
        familyNotes: "ویزای کار باز برای همسر (Open Work Permit) و تحصیل رایگان فرزندان در مدارس دولتی.",
        financialNotes: "کف تمکن حداقل ۲۰,۶۳۵ دلار کانادا برای متقاضی مجرد + مبالغ همراهان."
      }
    ],
    hiddenRejectionRisks: [
      "عدم ارائه مستندات شفاف منبع پول (Source of Funds) در تمکن مالی بانکی",
      gapYears > 3 && profile.studyGapReason !== "working_with_insurance" ? "ابهام آفیسر ویزا در مورد گپ تحصیلی توجیه‌نشده" : "کسری احتمالی نمره مهارت نگارش یا مکالمه زبان",
      "انتخاب رشته یا مقطع ناهماهنگ با سوابق تحصیلی و شغلی قبلی"
    ],
    legalStrategies: [
      "تنظیم بیانیه انگیزه (SOP) تخصصی با تکیه بر اتصال تجارب کاری به رشته مقصد",
      "ارائه گواهی‌های بیمه تأمین اجتماعی، احکام شغلی و نمونه کارها جهت اثبات پیوستگی حرفه‌ای",
      "استفاده از گواهی حساب بانکی شفاف با گردش مناسب به جای واریزی‌های ناگهانی مشکوک"
    ],
    actionableRoadmap: [
      "گام اول: تثبیت مدرک زبان با تمرکز بر نمره حداقل B2 یا معادل آیلتس ۶.۵",
      "گام دوم: آزادسازی و ترجمه رسمی دانشنامه و ریزنمرات دانشگاهی به همراه تاییدات دادگستری/وزارت خارجه",
      "گام سوم: جمع‌آوری گواهی‌های کاری با جزییات دقیق شرح وظایف منطبق بر کدهای شغلی استاندارد",
      "گام چهارم: اقدام مستقیم جهت اخذ پذیرش دانشگاهی یا ثبت پروفایل متناسب در سیستم‌های مهاجرتی مقصد"
    ],
    generatedAt: new Date().toISOString(),
    modelUsed: "rule-based-legal-engine"
  };
}

