import { createClient, SupabaseClient } from "@supabase/supabase-js";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { createRequire } from "node:module";

const requireModule = typeof require === "function"
  ? require
  : createRequire(typeof import.meta !== "undefined" && import.meta.url ? import.meta.url : `file://${process.cwd()}/`);

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

// -----------------------------------------------------------------------------
// 1. Supabase Client Setup (Server-Side Only via Service Role)
// -----------------------------------------------------------------------------
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseServiceKey &&
  supabaseUrl.startsWith("http") &&
  supabaseServiceKey.length > 20
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseServiceKey!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
  : null;

if (isSupabaseConfigured) {
  console.log("⚡ [DATABASE] متصل به Supabase ابری با دسترسی امن Service Role.");
} else {
  console.log("ℹ️ [DATABASE] متغیرهای Supabase یافت نشد؛ در حال استفاده از SQLite محلی برای توسعه آفلاین.");
}

// -----------------------------------------------------------------------------
// 2. Storage Strategy: Supabase (Primary) -> SQLite (Local Dev) -> In-Memory (Serverless Fallback)
// -----------------------------------------------------------------------------

export interface MemoryOtp {
  id: string;
  phoneNumber: string;
  code: string;
  expiresAt: number;
  used: boolean;
  createdAt: string;
}

export interface MemorySession {
  id: string;
  userId: string;
  token: string;
  expiresAt: number;
  createdAt: string;
}

export const inMemoryStore = {
  otps: new Map<string, MemoryOtp>(),
  users: new Map<string, User>(),
  usersByPhone: new Map<string, string>(), // phone -> userId
  sessions: new Map<string, MemorySession>(),
  assessments: new Map<string, UserAssessmentRecord>(),
};

let sqliteDb: any = null;
let isSqliteAvailable: boolean | null = null;

function getSqliteDb() {
  if (isSqliteAvailable === false) return null;
  // Never attempt file-based SQLite in Serverless/Vercel environments (read-only filesystem, missing node:sqlite)
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    isSqliteAvailable = false;
    return null;
  }
  if (!sqliteDb) {
    try {
      const { DatabaseSync } = requireModule("node:sqlite");
      if (!DatabaseSync) {
        isSqliteAvailable = false;
        return null;
      }
      const DATA_DIR = path.join(process.cwd(), "data");
      if (!fs.existsSync(DATA_DIR)) {
        try {
          fs.mkdirSync(DATA_DIR, { recursive: true });
        } catch { }
      }
      const DB_PATH = path.join(DATA_DIR, "koochify.db");
      sqliteDb = new DatabaseSync(DB_PATH);
      try {
        sqliteDb.exec("PRAGMA journal_mode = WAL;");
        sqliteDb.exec("PRAGMA foreign_keys = ON;");
      } catch { }

      // Init SQLite Schema
      sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          phone_number TEXT UNIQUE NOT NULL,
          full_name TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          last_login_at TEXT,
          is_paid INTEGER NOT NULL DEFAULT 0,
          payment_status TEXT NOT NULL DEFAULT 'none',
          payment_ref TEXT,
          card_last_digits TEXT,
          paid_at TEXT
        );

        CREATE TABLE IF NOT EXISTS otps (
          id TEXT PRIMARY KEY,
          phone_number TEXT NOT NULL,
          code TEXT NOT NULL,
          expires_at INTEGER NOT NULL,
          used INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token TEXT UNIQUE NOT NULL,
          expires_at INTEGER NOT NULL,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS user_assessments (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          profile_data TEXT NOT NULL,
          results_data TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
        CREATE INDEX IF NOT EXISTS idx_otps_phone ON otps(phone_number);
        CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
        CREATE INDEX IF NOT EXISTS idx_assessments_user ON user_assessments(user_id);
      `);

      try { sqliteDb.exec("ALTER TABLE users ADD COLUMN is_paid INTEGER NOT NULL DEFAULT 0;"); } catch { }
      try { sqliteDb.exec("ALTER TABLE users ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'none';"); } catch { }
      try { sqliteDb.exec("ALTER TABLE users ADD COLUMN payment_ref TEXT;"); } catch { }
      try { sqliteDb.exec("ALTER TABLE users ADD COLUMN card_last_digits TEXT;"); } catch { }
      try { sqliteDb.exec("ALTER TABLE users ADD COLUMN paid_at TEXT;"); } catch { }
      isSqliteAvailable = true;
    } catch (e) {
      console.warn("ℹ️ [DATABASE] SQLite محلی در دسترس نیست؛ در حال استفاده از حافظه موقت (In-Memory).");
      isSqliteAvailable = false;
      return null;
    }
  }
  return sqliteDb;
}

// -----------------------------------------------------------------------------
// 3. Helper Functions & Mappings
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

function mapSqliteUser(row: any): User {
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
// 4. Unified Data Access Operations (Supabase with SQLite Fallback)
// -----------------------------------------------------------------------------

/**
 * Creates and stores a 5-digit OTP
 */
export async function createOtp(phoneNumber: string): Promise<{ code: string; expiresAt: number }> {
  const normPhone = normalizePhoneNumber(phoneNumber);
  const code = String(Math.floor(10000 + Math.random() * 90000));
  const expiresAt = Date.now() + 15 * 60 * 1000;
  const now = new Date().toISOString();
  const id = "otp_" + crypto.randomUUID().replace(/-/g, "");

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from("otps").insert({
        id,
        phone_number: normPhone,
        code,
        expires_at: expiresAt,
        used: false,
        created_at: now,
      });
      if (error) console.error("Supabase createOtp error:", error);
      return { code, expiresAt };
    } catch (e) {
      console.warn("Supabase createOtp fallback to sqlite:", e);
    }
  }

  // SQLite fallback
  const db = getSqliteDb();
  if (db) {
    const stmt = db.prepare(`
      INSERT INTO otps (id, phone_number, code, expires_at, used, created_at)
      VALUES (?, ?, ?, ?, 0, ?)
    `);
    stmt.run(id, normPhone, code, expiresAt, now);
    return { code, expiresAt };
  }

  // In-Memory Fallback (Vercel / Serverless)
  inMemoryStore.otps.set(id, {
    id,
    phoneNumber: normPhone,
    code,
    expiresAt,
    used: false,
    createdAt: now,
  });
  return { code, expiresAt };
}

/**
 * Verifies an OTP code (single-use)
 */
export async function verifyOtpCode(phoneNumber: string, code: string): Promise<boolean> {
  const normPhone = normalizePhoneNumber(phoneNumber);
  const cleanCode = code.trim();
  const now = Date.now();

  if (isSupabaseConfigured && supabase) {
    try {
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

      if (error || !data) return false;

      await supabase.from("otps").update({ used: true }).eq("id", data.id);
      return true;
    } catch (e) {
      console.warn("Supabase verifyOtpCode fallback to sqlite:", e);
    }
  }

  // SQLite fallback
  const db = getSqliteDb();
  if (db) {
    const stmt = db.prepare(`
      SELECT id FROM otps
      WHERE phone_number = ? AND code = ? AND used = 0 AND expires_at > ?
      ORDER BY created_at DESC
      LIMIT 1
    `);
    const record = stmt.get(normPhone, cleanCode, now) as { id: string } | undefined;
    if (!record) return false;

    const updateStmt = db.prepare(`UPDATE otps SET used = 1 WHERE id = ?`);
    updateStmt.run(record.id);
    return true;
  }

  // In-Memory Fallback (Vercel / Serverless)
  const allOtps = Array.from(inMemoryStore.otps.values());
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
 * Finds user by phone or creates a new one
 */
export async function findOrCreateUser(phoneNumber: string, fullName?: string): Promise<User> {
  const normPhone = normalizePhoneNumber(phoneNumber);
  const now = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    const { data: existing } = await supabase
      .from("users")
      .select("*")
      .eq("phone_number", normPhone)
      .maybeSingle();

    if (existing) {
      if (fullName && fullName.trim() && existing.full_name !== fullName.trim()) {
        const { data: updated } = await supabase
          .from("users")
          .update({
            full_name: fullName.trim(),
            updated_at: now,
            last_login_at: now,
          })
          .eq("id", existing.id)
          .select()
          .single();
        return mapSupabaseUser(updated || existing);
      }
      return mapSupabaseUser(existing);
    }

    const newId = "usr_" + crypto.randomUUID().replace(/-/g, "").substring(0, 16);
    const { data: created, error } = await supabase
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

    if (error) {
      console.error("Supabase insert user error:", error);
      // Fallback check if concurrent insert happened
      const { data: retry } = await supabase.from("users").select("*").eq("phone_number", normPhone).single();
      return mapSupabaseUser(retry);
    }

    return mapSupabaseUser(created);
  }

  // SQLite fallback
  const db = getSqliteDb();
  if (db) {
    const selectStmt = db.prepare(`SELECT * FROM users WHERE phone_number = ?`);
    const existing = selectStmt.get(normPhone);

    if (existing) {
      if (fullName && fullName.trim()) {
        const updateStmt = db.prepare(`
          UPDATE users 
          SET full_name = ?, updated_at = ?, last_login_at = ?
          WHERE phone_number = ?
        `);
        updateStmt.run(fullName.trim(), now, now, normPhone);
      } else {
        const updateLoginStmt = db.prepare(`
          UPDATE users SET last_login_at = ? WHERE phone_number = ?
        `);
        updateLoginStmt.run(now, normPhone);
      }
      const refreshed = selectStmt.get(normPhone);
      return mapSqliteUser(refreshed);
    }

    const newId = "usr_" + crypto.randomUUID().replace(/-/g, "").substring(0, 16);
    const insertStmt = db.prepare(`
      INSERT INTO users (id, phone_number, full_name, created_at, updated_at, last_login_at, is_paid, payment_status)
      VALUES (?, ?, ?, ?, ?, ?, 0, 'none')
    `);
    insertStmt.run(newId, normPhone, fullName?.trim() || "", now, now, now);
    const created = selectStmt.get(normPhone);
    return mapSqliteUser(created);
  }

  // In-Memory Fallback (Vercel / Serverless)
  const existingUserId = inMemoryStore.usersByPhone.get(normPhone);
  if (existingUserId && inMemoryStore.users.has(existingUserId)) {
    const user = inMemoryStore.users.get(existingUserId)!;
    if (fullName && fullName.trim()) {
      user.fullName = fullName.trim();
    }
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
  inMemoryStore.users.set(newId, newUser);
  inMemoryStore.usersByPhone.set(normPhone, newId);
  return newUser;
}

/**
 * Finds user by ID
 */
export async function findUserById(userId: string): Promise<User | null> {
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase.from("users").select("*").eq("id", userId).maybeSingle();
    return data ? mapSupabaseUser(data) : null;
  }

  const db = getSqliteDb();
  if (db) {
    const stmt = db.prepare(`SELECT * FROM users WHERE id = ?`);
    const row = stmt.get(userId);
    return row ? mapSqliteUser(row) : null;
  }

  return inMemoryStore.users.get(userId) || null;
}

/**
 * Updates user profile name
 */
export async function updateUserProfile(userId: string, fullName: string): Promise<User | null> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase
      .from("users")
      .update({ full_name: fullName.trim(), updated_at: now })
      .eq("id", userId)
      .select()
      .maybeSingle();
    return data ? mapSupabaseUser(data) : null;
  }

  const db = getSqliteDb();
  if (db) {
    const stmt = db.prepare(`
      UPDATE users SET full_name = ?, updated_at = ? WHERE id = ?
    `);
    stmt.run(fullName.trim(), now, userId);
    return findUserById(userId);
  }

  const user = inMemoryStore.users.get(userId);
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

  if (isSupabaseConfigured && supabase) {
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

    if (error) console.error("Supabase updateUserPayment error:", error);
    return data ? mapSupabaseUser(data) : null;
  }

  const db = getSqliteDb();
  if (db) {
    let query = `
      UPDATE users 
      SET is_paid = ?, payment_status = ?, updated_at = ?
    `;
    const params: any[] = [isPaid ? 1 : 0, paymentStatus, now];

    if (paymentRef !== undefined) {
      query += `, payment_ref = ?`;
      params.push(paymentRef);
    }
    if (cardLastDigits !== undefined) {
      query += `, card_last_digits = ?`;
      params.push(cardLastDigits);
    }
    if (isPaid) {
      query += `, paid_at = ?`;
      params.push(now);
    }

    query += ` WHERE id = ?`;
    params.push(userId);

    const stmt = db.prepare(query);
    stmt.run(...params);

    return findUserById(userId);
  }

  // In-Memory Fallback
  const user = inMemoryStore.users.get(userId);
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
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
  const now = new Date().toISOString();
  const id = "sess_" + crypto.randomUUID().replace(/-/g, "");

  if (isSupabaseConfigured && supabase) {
    await supabase.from("sessions").insert({
      id,
      user_id: userId,
      token,
      expires_at: expiresAt,
      created_at: now,
    });
    return { token, expiresAt };
  }

  const db = getSqliteDb();
  if (db) {
    const stmt = db.prepare(`
      INSERT INTO sessions (id, user_id, token, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(id, userId, token, expiresAt, now);
    return { token, expiresAt };
  }

  inMemoryStore.sessions.set(token, {
    id,
    userId,
    token,
    expiresAt,
    createdAt: now,
  });
  return { token, expiresAt };
}

/**
 * Gets user by session token
 */
export async function getUserByToken(token: string): Promise<User | null> {
  if (!token) return null;
  const now = Date.now();

  if (isSupabaseConfigured && supabase) {
    const { data: session } = await supabase
      .from("sessions")
      .select("user_id")
      .eq("token", token)
      .gt("expires_at", now)
      .maybeSingle();

    if (!session) return null;
    return await findUserById(session.user_id);
  }

  const db = getSqliteDb();
  if (db) {
    const stmt = db.prepare(`
      SELECT u.* FROM users u
      JOIN sessions s ON u.id = s.user_id
      WHERE s.token = ? AND s.expires_at > ?
      LIMIT 1
    `);
    const row = stmt.get(token, now);
    return row ? mapSqliteUser(row) : null;
  }

  const session = inMemoryStore.sessions.get(token);
  if (!session || session.expiresAt <= now) {
    return null;
  }
  return inMemoryStore.users.get(session.userId) || null;
}

/**
 * Deletes a session on logout
 */
export async function deleteSession(token: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    await supabase.from("sessions").delete().eq("token", token);
    return true;
  }

  const db = getSqliteDb();
  if (db) {
    const stmt = db.prepare(`DELETE FROM sessions WHERE token = ?`);
    stmt.run(token);
    return true;
  }

  inMemoryStore.sessions.delete(token);
  return true;
}

/**
 * Saves an assessment dossier
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

  if (isSupabaseConfigured && supabase) {
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

    if (error) console.error("Supabase saveAssessment error:", error);
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

  const db = getSqliteDb();
  if (db) {
    const stmt = db.prepare(`
      INSERT INTO user_assessments (id, user_id, title, profile_data, results_data, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      newId,
      userId,
      finalTitle,
      JSON.stringify(profileData),
      JSON.stringify(resultsData),
      now,
      now
    );

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
  inMemoryStore.assessments.set(newId, record);
  return record;
}

/**
 * Lists user assessments
 */
export async function getUserAssessments(userId: string): Promise<any[]> {
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase
      .from("user_assessments")
      .select("id, title, created_at, updated_at, results_data, profile_data")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    return (data || []).map((row) => ({
      id: row.id,
      title: row.title,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      primaryDestinations: row.results_data?.primaryDestinations || [],
      migrationGoal: row.profile_data?.migrationGoal || "both",
    }));
  }

  const db = getSqliteDb();
  if (db) {
    const stmt = db.prepare(`
      SELECT id, title, created_at, updated_at, results_data, profile_data 
      FROM user_assessments 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `);
    const rows = stmt.all(userId) as any[];

    return rows.map((r) => {
      let parsedResults: any = {};
      let parsedProfile: any = {};
      try { parsedResults = JSON.parse(r.results_data); } catch { }
      try { parsedProfile = JSON.parse(r.profile_data); } catch { }

      return {
        id: r.id,
        title: r.title,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        primaryDestinations: parsedResults.primaryDestinations || [],
        migrationGoal: parsedProfile.migrationGoal || "both",
      };
    });
  }

  return Array.from(inMemoryStore.assessments.values())
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
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase
      .from("user_assessments")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (!data) return null;
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

  const db = getSqliteDb();
  if (db) {
    const stmt = db.prepare(`
      SELECT * FROM user_assessments WHERE id = ? AND user_id = ?
    `);
    const row = stmt.get(id, userId) as any;
    if (!row) return null;

    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      profileData: JSON.parse(row.profile_data),
      resultsData: JSON.parse(row.results_data),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  const record = inMemoryStore.assessments.get(id);
  if (record && record.userId === userId) {
    return record;
  }
  return null;
}

/**
 * Deletes an assessment
 */
export async function deleteUserAssessment(id: string, userId: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from("user_assessments")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    return !error;
  }

  const db = getSqliteDb();
  if (db) {
    const stmt = db.prepare(`
      DELETE FROM user_assessments WHERE id = ? AND user_id = ?
    `);
    stmt.run(id, userId);
    return true;
  }

  const record = inMemoryStore.assessments.get(id);
  if (record && record.userId === userId) {
    inMemoryStore.assessments.delete(id);
    return true;
  }
  return false;
}

/**
 * Extracts leads for Admin panel
 */
export async function getAllLeadsForAdmin(): Promise<AdminLeadItem[]> {
  if (isSupabaseConfigured && supabase) {
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
          results_data,
          created_at
        )
      `)
      .order("created_at", { ascending: false });

    if (error || !users) return [];

    return users.map((u: any) => {
      const assessments = u.user_assessments || [];
      const assessmentsCount = assessments.length;
      let latestDestination: string | null = null;
      let latestRoute: string | null = null;
      let latestScore: number | null = null;

      if (assessmentsCount > 0) {
        const sorted = [...assessments].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        const latestResults = sorted[0]?.results_data;
        const topDest = latestResults?.primaryDestinations?.[0];
        if (topDest) {
          latestDestination = topDest.countryNameFa || topDest.countryCode || null;
          latestRoute = topDest.routeNameFa || null;
          latestScore = topDest.fitScore ?? null;
        }
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
      };
    });
  }

  // SQLite fallback
  const db = getSqliteDb();
  if (db) {
    const usersStmt = db.prepare(`
      SELECT * FROM users ORDER BY created_at DESC
    `);
    const users = usersStmt.all() as any[];

    return users.map((u) => {
      const asmtStmt = db.prepare(`
        SELECT results_data FROM user_assessments 
        WHERE user_id = ? 
        ORDER BY created_at DESC
      `);
      const asmts = asmtStmt.all(u.id) as any[];
      const assessmentsCount = asmts.length;

      let latestDestination: string | null = null;
      let latestRoute: string | null = null;
      let latestScore: number | null = null;

      if (assessmentsCount > 0) {
        try {
          const parsed = JSON.parse(asmts[0].results_data);
          const topDest = parsed.primaryDestinations?.[0];
          if (topDest) {
            latestDestination = topDest.countryNameFa || topDest.countryCode || null;
            latestRoute = topDest.routeNameFa || null;
            latestScore = topDest.fitScore ?? null;
          }
        } catch { }
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
      };
    });
  }

  // In-Memory Fallback
  return Array.from(inMemoryStore.users.values()).map((u) => {
    const userAssessments = Array.from(inMemoryStore.assessments.values())
      .filter((a) => a.userId === u.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    let latestDestination: string | null = null;
    let latestRoute: string | null = null;
    let latestScore: number | null = null;

    if (userAssessments.length > 0) {
      const topDest = userAssessments[0].resultsData?.primaryDestinations?.[0];
      if (topDest) {
        latestDestination = topDest.countryNameFa || topDest.countryCode || null;
        latestRoute = topDest.routeNameFa || null;
        latestScore = topDest.fitScore ?? null;
      }
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
    };
  });
}
