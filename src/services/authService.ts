import { UserAssessmentProfile, RecommendationSummary } from "../types";

export interface AuthUser {
  id: string;
  phoneNumber: string;
  fullName: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  isPaid: boolean;
  paymentStatus: "none" | "pending_verification" | "paid";
  paymentRef: string | null;
  cardLastDigits: string | null;
  paidAt: string | null;
}

export interface PaymentConfig {
  amountTomans: number;
  amountRials: number;
  cardNumber: string;
  cardHolder: string;
  bankName: string;
  hasOnlineGateway: boolean;
  autoUnlockCardToCard: boolean;
}

export interface AdminLeadItem {
  id: string;
  phoneNumber: string;
  fullName: string;
  createdAt: string;
  lastLoginAt: string | null;
  isPaid: boolean;
  paymentStatus: "none" | "pending_verification" | "paid";
  paymentRef: string | null;
  cardLastDigits: string | null;
  paidAt: string | null;
  assessmentsCount: number;
  latestDestination: string | null;
  latestRoute: string | null;
  latestScore: number | null;
  latestGoal?: string | null;
}

export interface SavedAssessmentSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  primaryDestinations: Array<{
    countryCode: string;
    countryNameFa: string;
    routeNameFa: string;
    fitScore: number;
    flagEmoji?: string;
  }>;
  migrationGoal: string;
}

export interface SavedAssessmentRecord {
  id: string;
  userId: string;
  title: string;
  profileData: UserAssessmentProfile;
  resultsData: RecommendationSummary;
  createdAt: string;
  updatedAt: string;
}

const TOKEN_KEY = "koochify_auth_token";
const USER_KEY = "koochify_auth_user";

/**
 * Gets saved auth token from sessionStorage (or localStorage fallback)
 */
export function getStoredToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Gets cached user from sessionStorage (or localStorage fallback)
 */
export function getStoredUser(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Saves auth session in sessionStorage
 */
export function saveAuthSession(token: string, user: AuthUser) {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error("Failed to save auth session to storage:", e);
  }
}

/**
 * Clears session
 */
export function clearAuthSession() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem("kochify_user_profile_v2");
    localStorage.removeItem("kochify_assessment_results_v2");
  } catch (e) {
    console.error("Failed to clear auth session:", e);
  }
}

/**
 * Safely parses response as JSON, falling back to clean error message if server returns HTML or text
 */
async function parseJsonResponse<T = any>(res: Response, fallbackError: string): Promise<T> {
  const contentType = res.headers.get("content-type") || "";
  let data: any = null;

  if (contentType.includes("application/json")) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    if (data && data.error) {
      throw new Error(data.error);
    }
    const rawText = await res.text().catch(() => "");
    if (rawText && rawText.length > 0 && rawText.length < 150 && !rawText.includes("<")) {
      throw new Error(rawText);
    }
    throw new Error(fallbackError);
  }

  if (!data) {
    throw new Error(fallbackError);
  }

  return data;
}

/**
 * Send OTP verification code to phone number
 */
export async function sendOtp(phoneNumber: string): Promise<{
  success: boolean;
  message: string;
  devCode?: string;
  expiresAt?: number;
}> {
  const res = await fetch("/api/auth/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phoneNumber }),
  });

  return await parseJsonResponse(res, "خطا در برقراری ارتباط. لطفاً لحظاتی بعد مجدداً تلاش کنید.");
}

/**
 * Verify OTP and login/register
 */
export async function verifyOtp(
  phoneNumber: string,
  code: string,
  fullName?: string
): Promise<{ success: boolean; user: AuthUser; token: string }> {
  const res = await fetch("/api/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phoneNumber, code, fullName }),
  });

  const data = await parseJsonResponse<{ success: boolean; user: AuthUser; token: string }>(
    res,
    "کد تأیید نامعتبر است یا منقضی شده است"
  );

  saveAuthSession(data.token, data.user);
  return data;
}

/**
 * Fetch fresh current user data from server
 */
export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const res = await fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
      clearAuthSession();
      return null;
    }

    if (!res.ok) return getStoredUser();

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) return getStoredUser();

    const data = await res.json().catch(() => null);
    if (data?.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      return data.user;
    }
    return null;
  } catch (e) {
    console.error("Failed to fetch current user:", e);
    return getStoredUser();
  }
}

/**
 * Logout
 */
export async function logout(): Promise<void> {
  const token = getStoredToken();
  try {
    if (token) {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  } catch (e) {
    console.warn("Logout error:", e);
  } finally {
    clearAuthSession();
  }
}

/**
 * Update user full name
 */
export async function updateProfile(fullName: string): Promise<AuthUser> {
  const token = getStoredToken();
  if (!token) throw new Error("وارد نشده‌اید");

  const res = await fetch("/api/user/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ fullName }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "خطا در به‌روزرسانی نام");

  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
}

/**
 * Save assessment dossier to database for logged in user
 */
export async function saveAssessmentToCloud(
  profile: UserAssessmentProfile,
  results: RecommendationSummary,
  title?: string
): Promise<SavedAssessmentRecord> {
  const token = getStoredToken();
  if (!token) {
    throw new Error("برای ذخیره پرونده، ابتدا وارد حساب کاربری خود شوید.");
  }

  const res = await fetch("/api/user/assessments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ profile, results, title }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "خطا در ذخیره پرونده ارزیابی در سرور");
  }

  return data.assessment;
}

/**
 * Fetch all saved assessments of the user
 */
export async function fetchUserAssessments(): Promise<SavedAssessmentSummary[]> {
  const token = getStoredToken();
  if (!token) return [];

  const res = await fetch("/api/user/assessments", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "خطا در دریافت لیست پرونده‌ها");
  }

  return data.assessments || [];
}

/**
 * Fetch full assessment data by ID
 */
export async function fetchUserAssessmentById(id: string): Promise<SavedAssessmentRecord> {
  const token = getStoredToken();
  if (!token) throw new Error("وارد نشده‌اید");

  const res = await fetch(`/api/user/assessments/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "خطا در دریافت جزئیات پرونده");
  }

  return data.assessment;
}

/**
 * Delete assessment by ID
 */
export async function deleteAssessment(id: string): Promise<boolean> {
  const token = getStoredToken();
  if (!token) throw new Error("وارد نشده‌اید");

  const res = await fetch(`/api/user/assessments/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "خطا در حذف پرونده");
  }

  return true;
}

/**
 * Fetch Payment Configuration (Card info, amounts, gateways)
 */
export async function fetchPaymentConfig(): Promise<PaymentConfig> {
  const res = await fetch("/api/payment/config");
  const data = await res.json();
  return data;
}

/**
 * Submit Card-to-Card payment proof
 */
export async function submitCardToCardPayment(
  cardLastDigits: string,
  transactionRef?: string
): Promise<{ success: boolean; message: string; user: AuthUser; isPaid: boolean }> {
  const token = getStoredToken();
  if (!token) throw new Error("لطفاً ابتدا وارد حساب کاربری خود شوید.");

  const res = await fetch("/api/payment/card-to-card", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ cardLastDigits, transactionRef }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "خطا در ثبت پرداخت کارت‌به‌کارت");
  }

  // Update cached user
  if (data.user) {
    sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }

  return data;
}

/**
 * Instant Online Payment Simulation & Unlock
 */
export async function instantUnlockPayment(): Promise<{
  success: boolean;
  message: string;
  user: AuthUser;
  isPaid: boolean;
}> {
  const token = getStoredToken();
  if (!token) throw new Error("لطفاً ابتدا وارد حساب کاربری خود شوید.");

  const res = await fetch("/api/payment/instant-unlock", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "خطا در تأیید پرداخت آنلاین");
  }

  if (data.user) {
    sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }

  return data;
}

/**
 * Request online payment link
 */
export async function requestOnlinePayment(): Promise<{
  success: boolean;
  paymentUrl: string;
  isSandbox?: boolean;
}> {
  const token = getStoredToken();
  if (!token) throw new Error("لطفاً ابتدا وارد حساب کاربری خود شوید.");

  const res = await fetch("/api/payment/zarinpal/request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "خطا در اتصال به درگاه پرداخت");
  }

  return data;
}

/**
 * Admin Panel Authentication
 */
export async function adminLogin(password: string): Promise<{ success: boolean; token: string }> {
  const res = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "رمز عبور مدیریت اشتباه است");
  }

  return data;
}

/**
 * Fetch all leads for admin panel
 */
export async function fetchAdminLeads(adminToken: string): Promise<AdminLeadItem[]> {
  const res = await fetch("/api/admin/leads", {
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "خطا در دریافت سرنخ‌ها");
  }

  return data.leads || [];
}

/**
 * Admin manual toggle of user subscription
 */
export async function adminUnlockUser(
  userId: string,
  isPaid: boolean,
  adminToken: string
): Promise<{ success: boolean; user: AuthUser; message: string }> {
  const res = await fetch("/api/admin/unlock-user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ userId, isPaid }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "خطا در تغییر وضعیت دسترسی کاربر");
  }

  return data;
}

