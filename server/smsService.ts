/**
 * Koochify (کوچیفای) - Melipayamak SMS Provider Service
 * Service for sending fast OTP verification messages via Melipayamak Pattern (SendByBaseNumber2)
 */

export interface SendSmsResult {
  success: boolean;
  recId?: string;
  error?: string;
  code?: string;
  simulated?: boolean;
}

const MELIPAYAMAK_URL =
  process.env.MELIPAYAMAK_URL ||
  process.env.SMS_API_URL ||
  "https://api.payamak-panel.com/post/Send.asmx/SendByBaseNumber2";

// Known Melipayamak Error Codes mapping to user-friendly Persian descriptions
const MELIPAYAMAK_ERRORS: Record<string, string> = {
  "0": "نام کاربری یا رمز عبور ملی‌پیامک نادرست است.",
  "2": "اعتبار پنل پیامکی ملی‌پیامک کافی نیست.",
  "3": "محدودیت تعداد ارسال روزانه.",
  "4": "محدودیت حجم ارسال در بازه زمانی.",
  "5": "شماره فرستنده نامعتبر است.",
  "6": "سامانه پیامک در حال به‌روزرسانی است.",
  "7": "متن پیامک حاوی کلمات فیلترشده است.",
  "10": "کاربر فعال نیست یا حساب کاربری مسدود شده است.",
  "11": "ارسال ناموفق بود.",
  "12": "مدارک کاربر در سامانه ملی‌پیامک کامل یا تایید نشده است.",
  "16": "شماره گیرنده نامعتبر است.",
  "17": "کد بدنه پترن ملی‌پیامک تایید نشده است یا یافت نشد.",
  "35": "شماره گیرنده پیامک در لیست سیاه قرار دارد.",
  "108": "امکان ارسال به دلیل قطعی درگاه اپراتور وجود ندارد.",
  "109": "حساب کاربری منقضی شده است.",
  "110": "پترن به دلیل نقض قوانین رد شده است.",
};

const PROVIDER_ERROR_CODES = new Set([
  "0", "2", "3", "4", "5", "6", "7", "10", "11", "12", "16", "17", "35", "108", "109", "110", "111"
]);

/**
 * Normalizes phone number to standard Iranian 11-digit mobile (09xxxxxxxxx)
 */
export function normalizeIranPhone(raw: string): string {
  if (!raw) return "";

  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

  let normalized = raw.trim();
  for (let i = 0; i < 10; i++) {
    normalized = normalized.replaceAll(persianDigits[i], String(i));
    normalized = normalized.replaceAll(arabicDigits[i], String(i));
  }

  const digitsOnly = normalized.replace(/\D/g, "");

  if (digitsOnly.startsWith("989") && digitsOnly.length === 12) {
    return "0" + digitsOnly.slice(2);
  }
  if (digitsOnly.startsWith("00989") && digitsOnly.length === 14) {
    return "0" + digitsOnly.slice(4);
  }
  if (digitsOnly.startsWith("9") && digitsOnly.length === 10) {
    return "0" + digitsOnly;
  }
  if (digitsOnly.startsWith("09") && digitsOnly.length === 11) {
    return digitsOnly;
  }

  return digitsOnly;
}

/**
 * Masks phone number for safe logging (e.g. 0912***6789)
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return "***";
  return phone.slice(0, 4) + "***" + phone.slice(-4);
}

/**
 * Masks OTP code for safe logging (e.g. 12**5)
 */
export function maskOtp(code: string): string {
  if (!code || code.length < 4) return "****";
  return code.slice(0, 2) + "**" + code.slice(-1);
}

/**
 * Parses XML/plain text response from Melipayamak SendByBaseNumber2
 */
export function extractProviderResult(rawBody: string): string {
  if (!rawBody) return "";
  const match = rawBody.match(
    /<(?:\w+:)?(?:string|SendByBaseNumber2Result)[^>]*>([\s\S]*?)<\/(?:\w+:)?(?:string|SendByBaseNumber2Result)>/i
  );
  const text = match ? match[1] : rawBody.replace(/<[^>]+>/g, "");
  return text.trim().replace(/^['"]|['"]$/g, "");
}

/**
 * Validates whether the returned Melipayamak result represents a successful dispatch.
 * In Melipayamak SendByBaseNumber2:
 * A success result is a positive delivery/request record ID (numeric string > 100 or >= 10 digits).
 * Single/double digit return values are error codes.
 */
export function isSuccessResult(val: string): boolean {
  if (!val) return false;
  if (PROVIDER_ERROR_CODES.has(val)) return false;
  if (val.startsWith("-")) return false;
  const num = Number(val);
  if (isNaN(num)) return false;
  // Valid RecIds in Melipayamak are typically 8 to 20 digit numbers (> 100)
  return num > 100 || val.length >= 8;
}

/**
 * Sends OTP SMS using Melipayamak Pattern (SendByBaseNumber2)
 *
 * @param phone Target Iranian mobile number (09...)
 * @param otpCode 5-digit verification code
 * @param customBodyId Optional pattern ID override (default: 567584)
 */
export async function sendOtpSms(
  phone: string,
  otpCode: string,
  customBodyId?: string
): Promise<SendSmsResult> {
  const normPhone = normalizeIranPhone(phone);
  if (!normPhone || normPhone.length !== 11 || !normPhone.startsWith("09")) {
    return {
      success: false,
      error: "شماره تلفن وارد شده نامعتبر است. فرمت صحیح: ۰۹۱۲۳۴۵۶۷۸۹",
    };
  }

  const username =
    process.env.MELIPAYAMAK_USERNAME ||
    process.env.SMS_USERNAME ||
    "989387596456";

  const password =
    process.env.MELIPAYAMAK_API_KEY ||
    process.env.MELIPAYAMAK_PASSWORD ||
    process.env.SMS_API_KEY ||
    process.env.SMS_PASSWORD ||
    "8fd880f4-1576-41c8-80c0-ca5fd00f194b";

  // Pattern code provided by user
  const bodyId =
    customBodyId ||
    process.env.MELIPAYAMAK_BODY_ID ||
    process.env.SMS_BODY_ID ||
    "567584";

  // If no credentials configured, fallback to simulation mode
  if (!username || !password) {
    console.warn(
      `[SMS SIMULATOR] پیامک کد ورود برای ${maskPhone(normPhone)} شبیه‌سازی شد: ${otpCode} (پترن: ${bodyId})`
    );
    return {
      success: true,
      recId: "simulated_" + Date.now(),
      simulated: true,
    };
  }

  // Melipayamak SendByBaseNumber2 expects application/x-www-form-urlencoded
  const formParams = new URLSearchParams({
    username,
    password,
    text: otpCode,
    to: normPhone,
    bodyId,
  });

  const maxRetries = 2;
  let lastError = "";
  let lastCode = "";

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(MELIPAYAMAK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formParams.toString(),
      });

      const rawText = await response.text();
      const result = extractProviderResult(rawText);

      if (response.ok && isSuccessResult(result)) {
        console.log(
          `[SMS] پیامک کد تأیید ملی‌پیامک با موفقیت به ${maskPhone(normPhone)} ارسال شد. شناسه پیامک: ${result} (تلاش ${attempt})`
        );
        return {
          success: true,
          recId: result,
        };
      }

      lastCode = result;
      lastError =
        MELIPAYAMAK_ERRORS[result] ||
        `خطای سامانه پیامکی ملی‌پیامک (کد پاسخ: ${result || response.status})`;

      console.warn(
        `[SMS WARN] عدم پذیرش پیامک توسط ملی‌پیامک در تلاش ${attempt} به شماره ${maskPhone(normPhone)}:`,
        { status: response.status, result, error: lastError }
      );

      // If credentials or pattern is rejected, retrying won't change the outcome
      if (["0", "17", "10", "12"].includes(result)) {
        break;
      }
    } catch (err: any) {
      lastError = err?.message || "خطا در برقراری ارتباط با سرور ملی‌پیامک";
      console.error(
        `[SMS ERROR] خطای شبکه در ارسال پیامک ملی‌پیامک (تلاش ${attempt}):`,
        err
      );
    }

    if (attempt < maxRetries) {
      // 400ms delay before retry
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }

  return {
    success: false,
    error: lastError,
    code: lastCode,
  };
}
