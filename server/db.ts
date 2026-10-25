import { createClient, SupabaseClient } from "@supabase/supabase-js";
import crypto from "node:crypto";
import dotenv from "dotenv";

dotenv.config();

export interface User {
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

export interface UserAssessmentRecord {
  id: string;
  userId: string;
  title: string;
  profileData: any;
  resultsData: any;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransactionRecord {
  id: string;
  userId: string | null;
  amountTomans: number;
  amountRials: number;
  gateway: string;
  trackId: string | null;
  refNumber: string | null;
  cardPan: string | null;
  status: "pending" | "verified" | "failed" | "cancelled";
  rawResponse?: any;
  createdAt: string;
  verifiedAt: string | null;
}

// -----------------------------------------------------------------------------
// 1. Supabase Client Configuration (Production Database)
// -----------------------------------------------------------------------------
const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseServiceKey &&
  supabaseUrl.startsWith("http") &&
  supabaseServiceKey.length > 20
);

if (isSupabaseConfigured) {
  console.log("⚡ [DATABASE] اتصال موفق به پایگاه داده ابری Supabase با کلید Service Role.");
} else {
  console.warn("⚠️ [DATABASE WARNING] متغیرهای SUPABASE_URL یا SUPABASE_SERVICE_ROLE_KEY در فایل .env یا متغیرهای سرور یافت نشدند!");
}

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseServiceKey!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

// Emergency fallback store for offline tests when Supabase is not configured
const memoryFallbackStore = {
  users: new Map<string, User>(),
  usersByPhone: new Map<string, string>(),
  otps: new Map<string, { id: string; phoneNumber: string; code: string; expiresAt: number; used: boolean; createdAt: string }>(),
  sessions: new Map<string, { id: string; userId: string; token: string; expiresAt: number; createdAt: string }>(),
  assessments: new Map<string, UserAssessmentRecord>(),
  transactions: new Map<string, PaymentTransactionRecord>(),
};

// -----------------------------------------------------------------------------
// 2. Data Helper & Mapping Functions
// -----------------------------------------------------------------------------
export function normalizePhoneNumber(rawInput: string): string {
  if (!rawInput) return "";

  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

  let normalized = rawInput.trim();
  for (let i = 0; i < 10; i++) {
    normalized = normalized.replaceAll(persianDigits[i], String(i));
    normalized = normalized.replaceAll(arabicDigits[i], String(i));
  }

  const hasPlus = normalized.startsWith("+");
  const digitsOnly = normalized.replace(/\D/g, "");

  if (hasPlus) {
    if (digitsOnly.startsWith("98")) {
      return "0" + digitsOnly.slice(2);
    }
    return digitsOnly;
  }

  if (digitsOnly.startsWith("0098")) {
    return "0" + digitsOnly.slice(4);
  }

  if (digitsOnly.length === 10 && digitsOnly.startsWith("9")) {
    return "0" + digitsOnly;
  }

  return digitsOnly;
}

function mapSupabaseUser(row: any): User {
  return {
    id: row.id,
    phoneNumber: row.phone_number,
    fullName: row.full_name || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at || null,
    isPaid: Boolean(row.is_paid),
    paymentStatus: (row.payment_status || "none") as any,
    paymentRef: row.payment_ref || null,
    cardLastDigits: row.card_last_digits || null,
    paidAt: row.paid_at || null,
  };
}

// -----------------------------------------------------------------------------
// 3. Database Operations (Direct Supabase Queries)
// -----------------------------------------------------------------------------

/**
 * Creates and stores a 5-digit OTP in Supabase
 */
export async function createOtp(phoneNumber: string): Promise<{ code: string; expiresAt: number }> {
  const normPhone = normalizePhoneNumber(phoneNumber);
  const code = String(Math.floor(10000 + Math.random() * 90000));
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
  const now = new Date().toISOString();
  const id = "otp_" + crypto.randomUUID().replace(/-/g, "");

  if (supabase) {
    const { error } = await supabase.from("otps").insert({
      id,
      phone_number: normPhone,
      code,
      expires_at: expiresAt,
      used: false,
      created_at: now,
    });
    if (error) {
      console.error("❌ [SUPABASE ERROR] createOtp failed:", error.message, error.details);
      throw new Error(`خطا در ذخیره کد ورود در دیتابیس: ${error.message}`);
    }
    return { code, expiresAt };
  }

  // Fallback for local unit tests without env
  memoryFallbackStore.otps.set(id, { id, phoneNumber: normPhone, code, expiresAt, used: false, createdAt: now });
  return { code, expiresAt };
}

/**
 * Verifies an OTP code (single-use)
 */
export async function verifyOtpCode(phoneNumber: string, code: string): Promise<boolean> {
  const normPhone = normalizePhoneNumber(phoneNumber);
  const cleanCode = code.trim();
  const now = Date.now();

  if (supabase) {
    const { data, error } = await supabase
      .from("otps")
      .select("id")
      .eq("phone_number", normPhone)
      .eq("code", cleanCode)
      .eq("used", false)
      .gt("expires_at", now)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("❌ [SUPABASE ERROR] verifyOtpCode select:", error.message);
      return false;
    }
    if (!data) return false;

    // Mark as used
    await supabase.from("otps").update({ used: true }).eq("id", data.id);
    return true;
  }

  // Fallback
  const allOtps = Array.from(memoryFallbackStore.otps.values());
  for (let i = allOtps.length - 1; i >= 0; i--) {
    const item = allOtps[i];
    if (item.phoneNumber === normPhone && item.code === cleanCode && !item.used && item.expiresAt > now) {
      item.used = true;
      return true;
    }
  }
  return false;
}

/**
 * Finds user by phone or creates a new one in Supabase
 */
export async function findOrCreateUser(phoneNumber: string, fullName?: string): Promise<User> {
  const normPhone = normalizePhoneNumber(phoneNumber);
  const now = new Date().toISOString();

  if (supabase) {
    // 1. Check if user already exists
    const { data: existing, error: selectError } = await supabase
      .from("users")
      .select("*")
      .eq("phone_number", normPhone)
      .maybeSingle();

    if (selectError) {
      console.error("❌ [SUPABASE ERROR] findOrCreateUser select:", selectError.message);
      throw new Error(`خطای ارتباط با دیتابیس کاربران: ${selectError.message}`);
    }

    if (existing) {
      const updatePayload: any = {
        last_login_at: now,
        updated_at: now,
      };
      if (fullName && fullName.trim() && existing.full_name !== fullName.trim()) {
        updatePayload.full_name = fullName.trim();
      }

      const { data: updated, error: updateError } = await supabase
        .from("users")
        .update(updatePayload)
        .eq("id", existing.id)
        .select()
        .single();

      if (updateError) {
        console.warn("Update login timestamp error:", updateError.message);
        return mapSupabaseUser(existing);
      }
      return mapSupabaseUser(updated);
    }

    // 2. Create new user
    const newId = "usr_" + crypto.randomUUID().replace(/-/g, "").substring(0, 16);
    const { data: created, error: insertError } = await supabase
      .from("users")
      .insert({
        id: newId,
        phone_number: normPhone,
        full_name: fullName?.trim() || "",
        created_at: now,
        updated_at: now,
        last_login_at: now,
        is_paid: false,
        payment_status: "none",
      })
      .select()
      .single();

    if (insertError) {
      console.error("❌ [SUPABASE ERROR] findOrCreateUser insert:", insertError.message);
      // Concurrency check: in case of duplicate insert, fetch existing
      const { data: retry } = await supabase.from("users").select("*").eq("phone_number", normPhone).single();
      if (retry) return mapSupabaseUser(retry);
      throw new Error(`خطا در ایجاد کاربر در دیتابیس: ${insertError.message}`);
    }

    return mapSupabaseUser(created);
  }

  // Fallback
  const existingUserId = memoryFallbackStore.usersByPhone.get(normPhone);
  if (existingUserId && memoryFallbackStore.users.has(existingUserId)) {
    const user = memoryFallbackStore.users.get(existingUserId)!;
    if (fullName && fullName.trim()) user.fullName = fullName.trim();
    user.updatedAt = now;
    user.lastLoginAt = now;
    return user;
  }

  const newId = "usr_" + crypto.randomUUID().replace(/-/g, "").substring(0, 16);
  const newUser: User = {
    id: newId,
    phoneNumber: normPhone,
    fullName: fullName?.trim() || "",
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now,
    isPaid: false,
    paymentStatus: "none",
    paymentRef: null,
    cardLastDigits: null,
    paidAt: null,
  };
  memoryFallbackStore.users.set(newId, newUser);
  memoryFallbackStore.usersByPhone.set(normPhone, newId);
  return newUser;
}

/**
 * Finds user by ID
 */
export async function findUserById(userId: string): Promise<User | null> {
  if (supabase) {
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).maybeSingle();
    if (error) {
      console.error("❌ [SUPABASE ERROR] findUserById:", error.message);
      return null;
    }
    return data ? mapSupabaseUser(data) : null;
  }
  return memoryFallbackStore.users.get(userId) || null;
}

/**
 * Updates user profile name
 */
export async function updateUserProfile(userId: string, fullName: string): Promise<User | null> {
  const now = new Date().toISOString();

  if (supabase) {
    const { data, error } = await supabase
      .from("users")
      .update({ full_name: fullName.trim(), updated_at: now })
      .eq("id", userId)
      .select()
      .maybeSingle();

    if (error) {
      console.error("❌ [SUPABASE ERROR] updateUserProfile:", error.message);
      throw new Error(`خطا در ویرایش اطلاعات کاربر: ${error.message}`);
    }
    return data ? mapSupabaseUser(data) : null;
  }

  const user = memoryFallbackStore.users.get(userId);
  if (user) {
    user.fullName = fullName.trim();
    user.updatedAt = now;
    return user;
  }
  return null;
}

/**
 * Updates user subscription & payment status
 */
export async function updateUserPayment(
  userId: string,
  isPaid: boolean,
  paymentStatus: "none" | "pending_verification" | "paid",
  paymentRef?: string | null,
  cardLastDigits?: string | null
): Promise<User | null> {
  const now = new Date().toISOString();

  if (supabase) {
    const payload: any = {
      is_paid: isPaid,
      payment_status: paymentStatus,
      updated_at: now,
    };
    if (paymentRef !== undefined) payload.payment_ref = paymentRef;
    if (cardLastDigits !== undefined) payload.card_last_digits = cardLastDigits;
    if (isPaid) payload.paid_at = now;

    const { data, error } = await supabase
      .from("users")
      .update(payload)
      .eq("id", userId)
      .select()
      .maybeSingle();

    if (error) {
      console.error("❌ [SUPABASE ERROR] updateUserPayment:", error.message);
      throw new Error(`خطا در ثبت وضعیت پرداخت: ${error.message}`);
    }
    return data ? mapSupabaseUser(data) : null;
  }

  const user = memoryFallbackStore.users.get(userId);
  if (user) {
    user.isPaid = isPaid;
    user.paymentStatus = paymentStatus;
    user.updatedAt = now;
    if (paymentRef !== undefined) user.paymentRef = paymentRef;
    if (cardLastDigits !== undefined) user.cardLastDigits = cardLastDigits;
    if (isPaid) user.paidAt = now;
    return user;
  }
  return null;
}

/**
 * Creates a login session token
 */
export async function createSession(userId: string): Promise<{ token: string; expiresAt: number }> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  const now = new Date().toISOString();
  const id = "sess_" + crypto.randomUUID().replace(/-/g, "");

  if (supabase) {
    const { error } = await supabase.from("sessions").insert({
      id,
      user_id: userId,
      token,
      expires_at: expiresAt,
      created_at: now,
    });
    if (error) {
      console.error("❌ [SUPABASE ERROR] createSession:", error.message);
      throw new Error(`خطا در ایجاد نشست کاربری: ${error.message}`);
    }
    return { token, expiresAt };
  }

  memoryFallbackStore.sessions.set(token, { id, userId, token, expiresAt, createdAt: now });
  return { token, expiresAt };
}

/**
 * Gets user by session token
 */
export async function getUserByToken(token: string): Promise<User | null> {
  if (!token) return null;
  const now = Date.now();

  if (supabase) {
    const { data: session, error } = await supabase
      .from("sessions")
      .select("user_id")
      .eq("token", token)
      .gt("expires_at", now)
      .maybeSingle();

    if (error || !session) return null;
    return await findUserById(session.user_id);
  }

  const session = memoryFallbackStore.sessions.get(token);
  if (!session || session.expiresAt <= now) return null;
  return memoryFallbackStore.users.get(session.userId) || null;
}

/**
 * Deletes a session on logout
 */
export async function deleteSession(token: string): Promise<boolean> {
  if (supabase) {
    const { error } = await supabase.from("sessions").delete().eq("token", token);
    return !error;
  }
  memoryFallbackStore.sessions.delete(token);
  return true;
}

/**
 * Saves an assessment dossier in Supabase
 */
export async function saveAssessment(
  userId: string,
  profileData: any,
  resultsData: any,
  title?: string
): Promise<UserAssessmentRecord> {
  const newId = "asmt_" + crypto.randomUUID().replace(/-/g, "").substring(0, 16);
  const now = new Date().toISOString();
  const finalTitle = title || `ارزیابی مهاجرت - ${new Date().toLocaleDateString("fa-IR")}`;

  if (supabase) {
    const { data, error } = await supabase
      .from("user_assessments")
      .insert({
        id: newId,
        user_id: userId,
        title: finalTitle,
        profile_data: profileData,
        results_data: resultsData,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      console.error("❌ [SUPABASE ERROR] saveAssessment:", error.message, error.details);
      throw new Error(`خطا در ذخیره پرونده در دیتابیس: ${error.message}`);
    }

    return {
      id: newId,
      userId,
      title: finalTitle,
      profileData,
      resultsData,
      createdAt: now,
      updatedAt: now,
    };
  }

  const record: UserAssessmentRecord = {
    id: newId,
    userId,
    title: finalTitle,
    profileData,
    resultsData,
    createdAt: now,
    updatedAt: now,
  };
  memoryFallbackStore.assessments.set(newId, record);
  return record;
}

/**
 * Lists user assessments from Supabase
 */
export async function getUserAssessments(userId: string): Promise<any[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from("user_assessments")
      .select("id, title, created_at, updated_at, results_data, profile_data")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ [SUPABASE ERROR] getUserAssessments:", error.message);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id,
      title: row.title,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      primaryDestinations: row.results_data?.primaryDestinations || [],
      migrationGoal: row.profile_data?.migrationGoal || "both",
    }));
  }

  return Array.from(memoryFallbackStore.assessments.values())
    .filter((a) => a.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((r) => ({
      id: r.id,
      title: r.title,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      primaryDestinations: r.resultsData?.primaryDestinations || [],
      migrationGoal: r.profileData?.migrationGoal || "both",
    }));
}

/**
 * Gets a single assessment by ID for authorized user
 */
export async function getUserAssessmentById(id: string, userId: string): Promise<UserAssessmentRecord | null> {
  if (supabase) {
    const { data, error } = await supabase
      .from("user_assessments")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) return null;
    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      profileData: data.profile_data,
      resultsData: data.results_data,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  const record = memoryFallbackStore.assessments.get(id);
  if (record && record.userId === userId) return record;
  return null;
}

/**
 * Deletes an assessment
 */
export async function deleteUserAssessment(id: string, userId: string): Promise<boolean> {
  if (supabase) {
    const { error } = await supabase
      .from("user_assessments")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    return !error;
  }

  const record = memoryFallbackStore.assessments.get(id);
  if (record && record.userId === userId) {
    memoryFallbackStore.assessments.delete(id);
    return true;
  }
  return false;
}

/**
 * Records an online payment transaction (Zibal)
 */
export async function recordPaymentTransaction(
  userId: string | null,
  amountTomans: number = 499000,
  amountRials: number = 4990000,
  trackId?: string,
  status: "pending" | "verified" | "failed" | "cancelled" = "pending"
): Promise<string> {
  const id = "tx_" + crypto.randomUUID().replace(/-/g, "");
  const now = new Date().toISOString();

  if (supabase) {
    const { error } = await supabase.from("payment_transactions").insert({
      id,
      user_id: userId,
      amount_tomans: amountTomans,
      amount_rials: amountRials,
      gateway: "zibal",
      track_id: trackId || null,
      status,
      created_at: now,
    });
    if (error) console.error("❌ [SUPABASE ERROR] recordPaymentTransaction:", error.message);
    return id;
  }

  memoryFallbackStore.transactions.set(id, {
    id,
    userId,
    amountTomans,
    amountRials,
    gateway: "zibal",
    trackId: trackId || null,
    refNumber: null,
    cardPan: null,
    status,
    createdAt: now,
    verifiedAt: null,
  });
  return id;
}

/**
 * Completes and marks payment transaction as verified
 */
export async function completePaymentTransaction(
  trackId: string,
  refNumber: string,
  cardPan?: string,
  rawResponse?: any
): Promise<boolean> {
  const now = new Date().toISOString();

  if (supabase) {
    const { error } = await supabase
      .from("payment_transactions")
      .update({
        status: "verified",
        ref_number: refNumber,
        card_pan: cardPan || null,
        raw_response: rawResponse || null,
        verified_at: now,
      })
      .eq("track_id", trackId);

    if (error) console.error("❌ [SUPABASE ERROR] completePaymentTransaction:", error.message);
    return !error;
  }

  for (const tx of memoryFallbackStore.transactions.values()) {
    if (tx.trackId === trackId) {
      tx.status = "verified";
      tx.refNumber = refNumber;
      tx.cardPan = cardPan || null;
      tx.rawResponse = rawResponse;
      tx.verifiedAt = now;
      return true;
    }
  }
  return false;
}

/**
 * Extracts leads and big data for Admin panel from Supabase
 */
export async function getAllLeadsForAdmin(): Promise<AdminLeadItem[]> {
  if (supabase) {
    const { data: users, error } = await supabase
      .from("users")
      .select(`
        id,
        phone_number,
        full_name,
        created_at,
        last_login_at,
        is_paid,
        payment_status,
        payment_ref,
        card_last_digits,
        paid_at,
        user_assessments (
          profile_data,
          results_data,
          created_at
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ [SUPABASE ERROR] getAllLeadsForAdmin:", error.message);
      return [];
    }

    return (users || []).map((u: any) => {
      const assessments = u.user_assessments || [];
      const assessmentsCount = assessments.length;
      let latestDestination: string | null = null;
      let latestRoute: string | null = null;
      let latestScore: number | null = null;
      let latestGoal: string | null = null;

      if (assessmentsCount > 0) {
        const sorted = [...assessments].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        const latestResults = sorted[0]?.results_data;
        const latestProfile = sorted[0]?.profile_data;
        const topDest = latestResults?.primaryDestinations?.[0];
        if (topDest) {
          latestDestination = topDest.countryNameFa || topDest.countryCode || null;
          latestRoute = topDest.routeNameFa || null;
          latestScore = topDest.fitScore ?? null;
        }
        latestGoal = latestProfile?.migrationGoal || latestResults?.migrationGoal || null;
      }

      return {
        id: u.id,
        phoneNumber: u.phone_number,
        fullName: u.full_name || "",
        createdAt: u.created_at,
        lastLoginAt: u.last_login_at || null,
        isPaid: Boolean(u.is_paid),
        paymentStatus: (u.payment_status || "none") as any,
        paymentRef: u.payment_ref || null,
        cardLastDigits: u.card_last_digits || null,
        paidAt: u.paid_at || null,
        assessmentsCount,
        latestDestination,
        latestRoute,
        latestScore,
        latestGoal,
      };
    });
  }

  // Fallback for offline dev
  return Array.from(memoryFallbackStore.users.values()).map((u) => {
    const userAssessments = Array.from(memoryFallbackStore.assessments.values())
      .filter((a) => a.userId === u.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    let latestDestination: string | null = null;
    let latestRoute: string | null = null;
    let latestScore: number | null = null;
    let latestGoal: string | null = null;

    if (userAssessments.length > 0) {
      const topDest = userAssessments[0].resultsData?.primaryDestinations?.[0];
      if (topDest) {
        latestDestination = topDest.countryNameFa || topDest.countryCode || null;
        latestRoute = topDest.routeNameFa || null;
        latestScore = topDest.fitScore ?? null;
      }
      latestGoal = userAssessments[0].profileData?.migrationGoal || userAssessments[0].resultsData?.migrationGoal || null;
    }

    return {
      id: u.id,
      phoneNumber: u.phoneNumber,
      fullName: u.fullName || "",
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt || null,
      isPaid: Boolean(u.isPaid),
      paymentStatus: (u.paymentStatus || "none") as any,
      paymentRef: u.paymentRef || null,
      cardLastDigits: u.cardLastDigits || null,
      paidAt: u.paidAt || null,
      assessmentsCount: userAssessments.length,
      latestDestination,
      latestRoute,
      latestScore,
      latestGoal,
    };
  });
}
