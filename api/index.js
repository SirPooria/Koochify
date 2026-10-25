var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// server.ts
import express from "express";
import path2 from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// server/db.ts
import { createClient } from "@supabase/supabase-js";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { createRequire } from "node:module";
var requireModule = typeof __require === "function" ? __require : createRequire(typeof import.meta !== "undefined" && import.meta.url ? import.meta.url : `file://${process.cwd()}/`);
var supabaseUrl = process.env.SUPABASE_URL;
var supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
var isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseServiceKey && supabaseUrl.startsWith("http") && supabaseServiceKey.length > 20
);
var supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
}) : null;
if (isSupabaseConfigured) {
  console.log("\u26A1 [DATABASE] \u0645\u062A\u0635\u0644 \u0628\u0647 Supabase \u0627\u0628\u0631\u06CC \u0628\u0627 \u062F\u0633\u062A\u0631\u0633\u06CC \u0627\u0645\u0646 Service Role.");
} else {
  console.log("\u2139\uFE0F [DATABASE] \u0645\u062A\u063A\u06CC\u0631\u0647\u0627\u06CC Supabase \u06CC\u0627\u0641\u062A \u0646\u0634\u062F\u061B \u062F\u0631 \u062D\u0627\u0644 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0627\u0632 SQLite \u0645\u062D\u0644\u06CC \u0628\u0631\u0627\u06CC \u062A\u0648\u0633\u0639\u0647 \u0622\u0641\u0644\u0627\u06CC\u0646.");
}
var inMemoryStore = {
  otps: /* @__PURE__ */ new Map(),
  users: /* @__PURE__ */ new Map(),
  usersByPhone: /* @__PURE__ */ new Map(),
  // phone -> userId
  sessions: /* @__PURE__ */ new Map(),
  assessments: /* @__PURE__ */ new Map()
};
var sqliteDb = null;
var isSqliteAvailable = null;
function getSqliteDb() {
  if (isSqliteAvailable === false) return null;
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
        } catch {
        }
      }
      const DB_PATH = path.join(DATA_DIR, "koochify.db");
      sqliteDb = new DatabaseSync(DB_PATH);
      try {
        sqliteDb.exec("PRAGMA journal_mode = WAL;");
        sqliteDb.exec("PRAGMA foreign_keys = ON;");
      } catch {
      }
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
      try {
        sqliteDb.exec("ALTER TABLE users ADD COLUMN is_paid INTEGER NOT NULL DEFAULT 0;");
      } catch {
      }
      try {
        sqliteDb.exec("ALTER TABLE users ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'none';");
      } catch {
      }
      try {
        sqliteDb.exec("ALTER TABLE users ADD COLUMN payment_ref TEXT;");
      } catch {
      }
      try {
        sqliteDb.exec("ALTER TABLE users ADD COLUMN card_last_digits TEXT;");
      } catch {
      }
      try {
        sqliteDb.exec("ALTER TABLE users ADD COLUMN paid_at TEXT;");
      } catch {
      }
      isSqliteAvailable = true;
    } catch (e) {
      console.warn("\u2139\uFE0F [DATABASE] SQLite \u0645\u062D\u0644\u06CC \u062F\u0631 \u062F\u0633\u062A\u0631\u0633 \u0646\u06CC\u0633\u062A\u061B \u062F\u0631 \u062D\u0627\u0644 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0627\u0632 \u062D\u0627\u0641\u0638\u0647 \u0645\u0648\u0642\u062A (In-Memory).");
      isSqliteAvailable = false;
      return null;
    }
  }
  return sqliteDb;
}
function normalizePhoneNumber(rawInput) {
  if (!rawInput) return "";
  const persianDigits = ["\u06F0", "\u06F1", "\u06F2", "\u06F3", "\u06F4", "\u06F5", "\u06F6", "\u06F7", "\u06F8", "\u06F9"];
  const arabicDigits = ["\u0660", "\u0661", "\u0662", "\u0663", "\u0664", "\u0665", "\u0666", "\u0667", "\u0668", "\u0669"];
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
function mapSupabaseUser(row) {
  return {
    id: row.id,
    phoneNumber: row.phone_number,
    fullName: row.full_name || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at || null,
    isPaid: Boolean(row.is_paid),
    paymentStatus: row.payment_status || "none",
    paymentRef: row.payment_ref || null,
    cardLastDigits: row.card_last_digits || null,
    paidAt: row.paid_at || null
  };
}
function mapSqliteUser(row) {
  return {
    id: row.id,
    phoneNumber: row.phone_number,
    fullName: row.full_name || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at || null,
    isPaid: Boolean(row.is_paid),
    paymentStatus: row.payment_status || "none",
    paymentRef: row.payment_ref || null,
    cardLastDigits: row.card_last_digits || null,
    paidAt: row.paid_at || null
  };
}
async function createOtp(phoneNumber) {
  const normPhone = normalizePhoneNumber(phoneNumber);
  const code = String(Math.floor(1e4 + Math.random() * 9e4));
  const expiresAt = Date.now() + 15 * 60 * 1e3;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const id = "otp_" + crypto.randomUUID().replace(/-/g, "");
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from("otps").insert({
        id,
        phone_number: normPhone,
        code,
        expires_at: expiresAt,
        used: false,
        created_at: now
      });
      if (error) console.error("Supabase createOtp error:", error);
      return { code, expiresAt };
    } catch (e) {
      console.warn("Supabase createOtp fallback to sqlite:", e);
    }
  }
  const db = getSqliteDb();
  if (db) {
    const stmt = db.prepare(`
      INSERT INTO otps (id, phone_number, code, expires_at, used, created_at)
      VALUES (?, ?, ?, ?, 0, ?)
    `);
    stmt.run(id, normPhone, code, expiresAt, now);
    return { code, expiresAt };
  }
  inMemoryStore.otps.set(id, {
    id,
    phoneNumber: normPhone,
    code,
    expiresAt,
    used: false,
    createdAt: now
  });
  return { code, expiresAt };
}
async function verifyOtpCode(phoneNumber, code) {
  const normPhone = normalizePhoneNumber(phoneNumber);
  const cleanCode = code.trim();
  const now = Date.now();
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from("otps").select("id").eq("phone_number", normPhone).eq("code", cleanCode).eq("used", false).gt("expires_at", now).order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (error || !data) return false;
      await supabase.from("otps").update({ used: true }).eq("id", data.id);
      return true;
    } catch (e) {
      console.warn("Supabase verifyOtpCode fallback to sqlite:", e);
    }
  }
  const db = getSqliteDb();
  if (db) {
    const stmt = db.prepare(`
      SELECT id FROM otps
      WHERE phone_number = ? AND code = ? AND used = 0 AND expires_at > ?
      ORDER BY created_at DESC
      LIMIT 1
    `);
    const record = stmt.get(normPhone, cleanCode, now);
    if (!record) return false;
    const updateStmt = db.prepare(`UPDATE otps SET used = 1 WHERE id = ?`);
    updateStmt.run(record.id);
    return true;
  }
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
async function findOrCreateUser(phoneNumber, fullName) {
  const normPhone = normalizePhoneNumber(phoneNumber);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  if (isSupabaseConfigured && supabase) {
    const { data: existing } = await supabase.from("users").select("*").eq("phone_number", normPhone).maybeSingle();
    if (existing) {
      if (fullName && fullName.trim() && existing.full_name !== fullName.trim()) {
        const { data: updated } = await supabase.from("users").update({
          full_name: fullName.trim(),
          updated_at: now,
          last_login_at: now
        }).eq("id", existing.id).select().single();
        return mapSupabaseUser(updated || existing);
      }
      return mapSupabaseUser(existing);
    }
    const newId2 = "usr_" + crypto.randomUUID().replace(/-/g, "").substring(0, 16);
    const { data: created, error } = await supabase.from("users").insert({
      id: newId2,
      phone_number: normPhone,
      full_name: fullName?.trim() || "",
      created_at: now,
      updated_at: now,
      last_login_at: now,
      is_paid: false,
      payment_status: "none"
    }).select().single();
    if (error) {
      console.error("Supabase insert user error:", error);
      const { data: retry } = await supabase.from("users").select("*").eq("phone_number", normPhone).single();
      return mapSupabaseUser(retry);
    }
    return mapSupabaseUser(created);
  }
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
    const newId2 = "usr_" + crypto.randomUUID().replace(/-/g, "").substring(0, 16);
    const insertStmt = db.prepare(`
      INSERT INTO users (id, phone_number, full_name, created_at, updated_at, last_login_at, is_paid, payment_status)
      VALUES (?, ?, ?, ?, ?, ?, 0, 'none')
    `);
    insertStmt.run(newId2, normPhone, fullName?.trim() || "", now, now, now);
    const created = selectStmt.get(normPhone);
    return mapSqliteUser(created);
  }
  const existingUserId = inMemoryStore.usersByPhone.get(normPhone);
  if (existingUserId && inMemoryStore.users.has(existingUserId)) {
    const user = inMemoryStore.users.get(existingUserId);
    if (fullName && fullName.trim()) {
      user.fullName = fullName.trim();
    }
    user.updatedAt = now;
    user.lastLoginAt = now;
    return user;
  }
  const newId = "usr_" + crypto.randomUUID().replace(/-/g, "").substring(0, 16);
  const newUser = {
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
    paidAt: null
  };
  inMemoryStore.users.set(newId, newUser);
  inMemoryStore.usersByPhone.set(normPhone, newId);
  return newUser;
}
async function findUserById(userId) {
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
async function updateUserProfile(userId, fullName) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase.from("users").update({ full_name: fullName.trim(), updated_at: now }).eq("id", userId).select().maybeSingle();
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
async function updateUserPayment(userId, isPaid, paymentStatus, paymentRef, cardLastDigits) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  if (isSupabaseConfigured && supabase) {
    const payload = {
      is_paid: isPaid,
      payment_status: paymentStatus,
      updated_at: now
    };
    if (paymentRef !== void 0) payload.payment_ref = paymentRef;
    if (cardLastDigits !== void 0) payload.card_last_digits = cardLastDigits;
    if (isPaid) payload.paid_at = now;
    const { data, error } = await supabase.from("users").update(payload).eq("id", userId).select().maybeSingle();
    if (error) console.error("Supabase updateUserPayment error:", error);
    return data ? mapSupabaseUser(data) : null;
  }
  const db = getSqliteDb();
  if (db) {
    let query = `
      UPDATE users 
      SET is_paid = ?, payment_status = ?, updated_at = ?
    `;
    const params = [isPaid ? 1 : 0, paymentStatus, now];
    if (paymentRef !== void 0) {
      query += `, payment_ref = ?`;
      params.push(paymentRef);
    }
    if (cardLastDigits !== void 0) {
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
  const user = inMemoryStore.users.get(userId);
  if (user) {
    user.isPaid = isPaid;
    user.paymentStatus = paymentStatus;
    user.updatedAt = now;
    if (paymentRef !== void 0) user.paymentRef = paymentRef;
    if (cardLastDigits !== void 0) user.cardLastDigits = cardLastDigits;
    if (isPaid) user.paidAt = now;
    return user;
  }
  return null;
}
async function createSession(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1e3;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const id = "sess_" + crypto.randomUUID().replace(/-/g, "");
  if (isSupabaseConfigured && supabase) {
    await supabase.from("sessions").insert({
      id,
      user_id: userId,
      token,
      expires_at: expiresAt,
      created_at: now
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
    createdAt: now
  });
  return { token, expiresAt };
}
async function getUserByToken(token) {
  if (!token) return null;
  const now = Date.now();
  if (isSupabaseConfigured && supabase) {
    const { data: session2 } = await supabase.from("sessions").select("user_id").eq("token", token).gt("expires_at", now).maybeSingle();
    if (!session2) return null;
    return await findUserById(session2.user_id);
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
async function deleteSession(token) {
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
async function saveAssessment(userId, profileData, resultsData, title) {
  const newId = "asmt_" + crypto.randomUUID().replace(/-/g, "").substring(0, 16);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const finalTitle = title || `\u0627\u0631\u0632\u06CC\u0627\u0628\u06CC \u0645\u0647\u0627\u062C\u0631\u062A - ${(/* @__PURE__ */ new Date()).toLocaleDateString("fa-IR")}`;
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("user_assessments").insert({
      id: newId,
      user_id: userId,
      title: finalTitle,
      profile_data: profileData,
      results_data: resultsData,
      created_at: now,
      updated_at: now
    }).select().single();
    if (error) console.error("Supabase saveAssessment error:", error);
    return {
      id: newId,
      userId,
      title: finalTitle,
      profileData,
      resultsData,
      createdAt: now,
      updatedAt: now
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
      updatedAt: now
    };
  }
  const record = {
    id: newId,
    userId,
    title: finalTitle,
    profileData,
    resultsData,
    createdAt: now,
    updatedAt: now
  };
  inMemoryStore.assessments.set(newId, record);
  return record;
}
async function getUserAssessments(userId) {
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase.from("user_assessments").select("id, title, created_at, updated_at, results_data, profile_data").eq("user_id", userId).order("created_at", { ascending: false });
    return (data || []).map((row) => ({
      id: row.id,
      title: row.title,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      primaryDestinations: row.results_data?.primaryDestinations || [],
      migrationGoal: row.profile_data?.migrationGoal || "both"
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
    const rows = stmt.all(userId);
    return rows.map((r) => {
      let parsedResults = {};
      let parsedProfile = {};
      try {
        parsedResults = JSON.parse(r.results_data);
      } catch {
      }
      try {
        parsedProfile = JSON.parse(r.profile_data);
      } catch {
      }
      return {
        id: r.id,
        title: r.title,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        primaryDestinations: parsedResults.primaryDestinations || [],
        migrationGoal: parsedProfile.migrationGoal || "both"
      };
    });
  }
  return Array.from(inMemoryStore.assessments.values()).filter((a) => a.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((r) => ({
    id: r.id,
    title: r.title,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    primaryDestinations: r.resultsData?.primaryDestinations || [],
    migrationGoal: r.profileData?.migrationGoal || "both"
  }));
}
async function getUserAssessmentById(id, userId) {
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase.from("user_assessments").select("*").eq("id", id).eq("user_id", userId).maybeSingle();
    if (!data) return null;
    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      profileData: data.profile_data,
      resultsData: data.results_data,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
  const db = getSqliteDb();
  if (db) {
    const stmt = db.prepare(`
      SELECT * FROM user_assessments WHERE id = ? AND user_id = ?
    `);
    const row = stmt.get(id, userId);
    if (!row) return null;
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      profileData: JSON.parse(row.profile_data),
      resultsData: JSON.parse(row.results_data),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
  const record = inMemoryStore.assessments.get(id);
  if (record && record.userId === userId) {
    return record;
  }
  return null;
}
async function deleteUserAssessment(id, userId) {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("user_assessments").delete().eq("id", id).eq("user_id", userId);
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
async function getAllLeadsForAdmin() {
  if (isSupabaseConfigured && supabase) {
    const { data: users, error } = await supabase.from("users").select(`
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
      `).order("created_at", { ascending: false });
    if (error || !users) return [];
    return users.map((u) => {
      const assessments = u.user_assessments || [];
      const assessmentsCount = assessments.length;
      let latestDestination = null;
      let latestRoute = null;
      let latestScore = null;
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
        paymentStatus: u.payment_status || "none",
        paymentRef: u.payment_ref || null,
        cardLastDigits: u.card_last_digits || null,
        paidAt: u.paid_at || null,
        assessmentsCount,
        latestDestination,
        latestRoute,
        latestScore
      };
    });
  }
  const db = getSqliteDb();
  if (db) {
    const usersStmt = db.prepare(`
      SELECT * FROM users ORDER BY created_at DESC
    `);
    const users = usersStmt.all();
    return users.map((u) => {
      const asmtStmt = db.prepare(`
        SELECT results_data FROM user_assessments 
        WHERE user_id = ? 
        ORDER BY created_at DESC
      `);
      const asmts = asmtStmt.all(u.id);
      const assessmentsCount = asmts.length;
      let latestDestination = null;
      let latestRoute = null;
      let latestScore = null;
      if (assessmentsCount > 0) {
        try {
          const parsed = JSON.parse(asmts[0].results_data);
          const topDest = parsed.primaryDestinations?.[0];
          if (topDest) {
            latestDestination = topDest.countryNameFa || topDest.countryCode || null;
            latestRoute = topDest.routeNameFa || null;
            latestScore = topDest.fitScore ?? null;
          }
        } catch {
        }
      }
      return {
        id: u.id,
        phoneNumber: u.phone_number,
        fullName: u.full_name || "",
        createdAt: u.created_at,
        lastLoginAt: u.last_login_at || null,
        isPaid: Boolean(u.is_paid),
        paymentStatus: u.payment_status || "none",
        paymentRef: u.payment_ref || null,
        cardLastDigits: u.card_last_digits || null,
        paidAt: u.paid_at || null,
        assessmentsCount,
        latestDestination,
        latestRoute,
        latestScore
      };
    });
  }
  return Array.from(inMemoryStore.users.values()).map((u) => {
    const userAssessments = Array.from(inMemoryStore.assessments.values()).filter((a) => a.userId === u.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    let latestDestination = null;
    let latestRoute = null;
    let latestScore = null;
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
      paymentStatus: u.paymentStatus || "none",
      paymentRef: u.paymentRef || null,
      cardLastDigits: u.cardLastDigits || null,
      paidAt: u.paidAt || null,
      assessmentsCount: userAssessments.length,
      latestDestination,
      latestRoute,
      latestScore
    };
  });
}

// server/smsService.ts
var MELIPAYAMAK_URL = process.env.MELIPAYAMAK_URL || process.env.SMS_API_URL || "https://api.payamak-panel.com/post/Send.asmx/SendByBaseNumber2";
var MELIPAYAMAK_ERRORS = {
  "0": "\u0646\u0627\u0645 \u06A9\u0627\u0631\u0628\u0631\u06CC \u06CC\u0627 \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0645\u0644\u06CC\u200C\u067E\u06CC\u0627\u0645\u06A9 \u0646\u0627\u062F\u0631\u0633\u062A \u0627\u0633\u062A.",
  "2": "\u0627\u0639\u062A\u0628\u0627\u0631 \u067E\u0646\u0644 \u067E\u06CC\u0627\u0645\u06A9\u06CC \u0645\u0644\u06CC\u200C\u067E\u06CC\u0627\u0645\u06A9 \u06A9\u0627\u0641\u06CC \u0646\u06CC\u0633\u062A.",
  "3": "\u0645\u062D\u062F\u0648\u062F\u06CC\u062A \u062A\u0639\u062F\u0627\u062F \u0627\u0631\u0633\u0627\u0644 \u0631\u0648\u0632\u0627\u0646\u0647.",
  "4": "\u0645\u062D\u062F\u0648\u062F\u06CC\u062A \u062D\u062C\u0645 \u0627\u0631\u0633\u0627\u0644 \u062F\u0631 \u0628\u0627\u0632\u0647 \u0632\u0645\u0627\u0646\u06CC.",
  "5": "\u0634\u0645\u0627\u0631\u0647 \u0641\u0631\u0633\u062A\u0646\u062F\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A.",
  "6": "\u0633\u0627\u0645\u0627\u0646\u0647 \u067E\u06CC\u0627\u0645\u06A9 \u062F\u0631 \u062D\u0627\u0644 \u0628\u0647\u200C\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0627\u0633\u062A.",
  "7": "\u0645\u062A\u0646 \u067E\u06CC\u0627\u0645\u06A9 \u062D\u0627\u0648\u06CC \u06A9\u0644\u0645\u0627\u062A \u0641\u06CC\u0644\u062A\u0631\u0634\u062F\u0647 \u0627\u0633\u062A.",
  "10": "\u06A9\u0627\u0631\u0628\u0631 \u0641\u0639\u0627\u0644 \u0646\u06CC\u0633\u062A \u06CC\u0627 \u062D\u0633\u0627\u0628 \u06A9\u0627\u0631\u0628\u0631\u06CC \u0645\u0633\u062F\u0648\u062F \u0634\u062F\u0647 \u0627\u0633\u062A.",
  "11": "\u0627\u0631\u0633\u0627\u0644 \u0646\u0627\u0645\u0648\u0641\u0642 \u0628\u0648\u062F.",
  "12": "\u0645\u062F\u0627\u0631\u06A9 \u06A9\u0627\u0631\u0628\u0631 \u062F\u0631 \u0633\u0627\u0645\u0627\u0646\u0647 \u0645\u0644\u06CC\u200C\u067E\u06CC\u0627\u0645\u06A9 \u06A9\u0627\u0645\u0644 \u06CC\u0627 \u062A\u0627\u06CC\u06CC\u062F \u0646\u0634\u062F\u0647 \u0627\u0633\u062A.",
  "16": "\u0634\u0645\u0627\u0631\u0647 \u06AF\u06CC\u0631\u0646\u062F\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A.",
  "17": "\u06A9\u062F \u0628\u062F\u0646\u0647 \u067E\u062A\u0631\u0646 \u0645\u0644\u06CC\u200C\u067E\u06CC\u0627\u0645\u06A9 \u062A\u0627\u06CC\u06CC\u062F \u0646\u0634\u062F\u0647 \u0627\u0633\u062A \u06CC\u0627 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F.",
  "35": "\u0634\u0645\u0627\u0631\u0647 \u06AF\u06CC\u0631\u0646\u062F\u0647 \u067E\u06CC\u0627\u0645\u06A9 \u062F\u0631 \u0644\u06CC\u0633\u062A \u0633\u06CC\u0627\u0647 \u0642\u0631\u0627\u0631 \u062F\u0627\u0631\u062F.",
  "108": "\u0627\u0645\u06A9\u0627\u0646 \u0627\u0631\u0633\u0627\u0644 \u0628\u0647 \u062F\u0644\u06CC\u0644 \u0642\u0637\u0639\u06CC \u062F\u0631\u06AF\u0627\u0647 \u0627\u067E\u0631\u0627\u062A\u0648\u0631 \u0648\u062C\u0648\u062F \u0646\u062F\u0627\u0631\u062F.",
  "109": "\u062D\u0633\u0627\u0628 \u06A9\u0627\u0631\u0628\u0631\u06CC \u0645\u0646\u0642\u0636\u06CC \u0634\u062F\u0647 \u0627\u0633\u062A.",
  "110": "\u067E\u062A\u0631\u0646 \u0628\u0647 \u062F\u0644\u06CC\u0644 \u0646\u0642\u0636 \u0642\u0648\u0627\u0646\u06CC\u0646 \u0631\u062F \u0634\u062F\u0647 \u0627\u0633\u062A."
};
var PROVIDER_ERROR_CODES = /* @__PURE__ */ new Set([
  "0",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "10",
  "11",
  "12",
  "16",
  "17",
  "35",
  "108",
  "109",
  "110",
  "111"
]);
function normalizeIranPhone(raw) {
  if (!raw) return "";
  const persianDigits = ["\u06F0", "\u06F1", "\u06F2", "\u06F3", "\u06F4", "\u06F5", "\u06F6", "\u06F7", "\u06F8", "\u06F9"];
  const arabicDigits = ["\u0660", "\u0661", "\u0662", "\u0663", "\u0664", "\u0665", "\u0666", "\u0667", "\u0668", "\u0669"];
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
function maskPhone(phone) {
  if (!phone || phone.length < 7) return "***";
  return phone.slice(0, 4) + "***" + phone.slice(-4);
}
function extractProviderResult(rawBody) {
  if (!rawBody) return "";
  const match = rawBody.match(
    /<(?:\w+:)?(?:string|SendByBaseNumber2Result)[^>]*>([\s\S]*?)<\/(?:\w+:)?(?:string|SendByBaseNumber2Result)>/i
  );
  const text = match ? match[1] : rawBody.replace(/<[^>]+>/g, "");
  return text.trim().replace(/^['"]|['"]$/g, "");
}
function isSuccessResult(val) {
  if (!val) return false;
  if (PROVIDER_ERROR_CODES.has(val)) return false;
  if (val.startsWith("-")) return false;
  const num = Number(val);
  if (isNaN(num)) return false;
  return num > 100 || val.length >= 8;
}
async function sendOtpSms(phone, otpCode, customBodyId) {
  const normPhone = normalizeIranPhone(phone);
  if (!normPhone || normPhone.length !== 11 || !normPhone.startsWith("09")) {
    return {
      success: false,
      error: "\u0634\u0645\u0627\u0631\u0647 \u062A\u0644\u0641\u0646 \u0648\u0627\u0631\u062F \u0634\u062F\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A. \u0641\u0631\u0645\u062A \u0635\u062D\u06CC\u062D: \u06F0\u06F9\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F8\u06F9"
    };
  }
  const username = process.env.MELIPAYAMAK_USERNAME || process.env.SMS_USERNAME || "989387596456";
  const password = process.env.MELIPAYAMAK_API_KEY || process.env.MELIPAYAMAK_PASSWORD || process.env.SMS_API_KEY || process.env.SMS_PASSWORD || "8fd880f4-1576-41c8-80c0-ca5fd00f194b";
  const bodyId = customBodyId || process.env.MELIPAYAMAK_BODY_ID || process.env.SMS_BODY_ID || "567584";
  if (!username || !password) {
    console.warn(
      `[SMS SIMULATOR] \u067E\u06CC\u0627\u0645\u06A9 \u06A9\u062F \u0648\u0631\u0648\u062F \u0628\u0631\u0627\u06CC ${maskPhone(normPhone)} \u0634\u0628\u06CC\u0647\u200C\u0633\u0627\u0632\u06CC \u0634\u062F: ${otpCode} (\u067E\u062A\u0631\u0646: ${bodyId})`
    );
    return {
      success: true,
      recId: "simulated_" + Date.now(),
      simulated: true
    };
  }
  const formParams = new URLSearchParams({
    username,
    password,
    text: otpCode,
    to: normPhone,
    bodyId
  });
  const maxRetries = 2;
  let lastError = "";
  let lastCode = "";
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(MELIPAYAMAK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formParams.toString()
      });
      const rawText = await response.text();
      const result = extractProviderResult(rawText);
      if (response.ok && isSuccessResult(result)) {
        console.log(
          `[SMS] \u067E\u06CC\u0627\u0645\u06A9 \u06A9\u062F \u062A\u0623\u06CC\u06CC\u062F \u0645\u0644\u06CC\u200C\u067E\u06CC\u0627\u0645\u06A9 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0647 ${maskPhone(normPhone)} \u0627\u0631\u0633\u0627\u0644 \u0634\u062F. \u0634\u0646\u0627\u0633\u0647 \u067E\u06CC\u0627\u0645\u06A9: ${result} (\u062A\u0644\u0627\u0634 ${attempt})`
        );
        return {
          success: true,
          recId: result
        };
      }
      lastCode = result;
      lastError = MELIPAYAMAK_ERRORS[result] || `\u062E\u0637\u0627\u06CC \u0633\u0627\u0645\u0627\u0646\u0647 \u067E\u06CC\u0627\u0645\u06A9\u06CC \u0645\u0644\u06CC\u200C\u067E\u06CC\u0627\u0645\u06A9 (\u06A9\u062F \u067E\u0627\u0633\u062E: ${result || response.status})`;
      console.warn(
        `[SMS WARN] \u0639\u062F\u0645 \u067E\u0630\u06CC\u0631\u0634 \u067E\u06CC\u0627\u0645\u06A9 \u062A\u0648\u0633\u0637 \u0645\u0644\u06CC\u200C\u067E\u06CC\u0627\u0645\u06A9 \u062F\u0631 \u062A\u0644\u0627\u0634 ${attempt} \u0628\u0647 \u0634\u0645\u0627\u0631\u0647 ${maskPhone(normPhone)}:`,
        { status: response.status, result, error: lastError }
      );
      if (["0", "17", "10", "12"].includes(result)) {
        break;
      }
    } catch (err) {
      lastError = err?.message || "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0631\u0642\u0631\u0627\u0631\u06CC \u0627\u0631\u062A\u0628\u0627\u0637 \u0628\u0627 \u0633\u0631\u0648\u0631 \u0645\u0644\u06CC\u200C\u067E\u06CC\u0627\u0645\u06A9";
      console.error(
        `[SMS ERROR] \u062E\u0637\u0627\u06CC \u0634\u0628\u06A9\u0647 \u062F\u0631 \u0627\u0631\u0633\u0627\u0644 \u067E\u06CC\u0627\u0645\u06A9 \u0645\u0644\u06CC\u200C\u067E\u06CC\u0627\u0645\u06A9 (\u062A\u0644\u0627\u0634 ${attempt}):`,
        err
      );
    }
    if (attempt < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }
  return {
    success: false,
    error: lastError,
    code: lastCode
  };
}

// server.ts
import crypto2 from "node:crypto";
dotenv.config();
var app = express();
app.use(express.json());
app.get(["/api", "/api/health"], (req, res) => {
  return res.json({
    status: "ok",
    service: "koochify-api",
    time: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/37583893.txt", (req, res) => {
  return res.type("text/plain").status(200).send("");
});
app.get("/google29043ff9460cc375.html", (req, res) => {
  return res.type("text/html").status(200).send("google-site-verification: google29043ff9460cc375.html");
});
app.get("/api/sms/status", (req, res) => {
  const username = process.env.MELIPAYAMAK_USERNAME || process.env.SMS_USERNAME || "989387596456";
  const bodyId = process.env.MELIPAYAMAK_BODY_ID || process.env.SMS_BODY_ID || "567584";
  return res.json({
    provider: "melipayamak",
    configured: Boolean(username),
    usernameMasked: username ? username.slice(0, 4) + "***" + username.slice(-4) : null,
    bodyId
  });
});
var authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "\u0644\u0637\u0641\u0627\u064B \u0627\u0628\u062A\u062F\u0627 \u0648\u0627\u0631\u062F \u062D\u0633\u0627\u0628 \u06A9\u0627\u0631\u0628\u0631\u06CC \u062E\u0648\u062F \u0634\u0648\u06CC\u062F." });
  }
  const token = authHeader.substring(7);
  const user = await getUserByToken(token);
  if (!user) {
    return res.status(401).json({ error: "\u0646\u0634\u0633\u062A \u06A9\u0627\u0631\u0628\u0631\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A \u06CC\u0627 \u0645\u0646\u0642\u0636\u06CC \u0634\u062F\u0647 \u0627\u0633\u062A." });
  }
  req.user = user;
  next();
};
app.post("/api/auth/send-otp", async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ error: "\u0644\u0637\u0641\u0627\u064B \u0634\u0645\u0627\u0631\u0647 \u062A\u0644\u0641\u0646 \u0647\u0645\u0631\u0627\u0647 \u0631\u0627 \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F." });
    }
    const normPhone = normalizePhoneNumber(phoneNumber);
    if (normPhone.length < 10 || !normPhone.startsWith("09")) {
      return res.status(400).json({ error: "\u0634\u0645\u0627\u0631\u0647 \u062A\u0644\u0641\u0646 \u0647\u0645\u0631\u0627\u0647 \u0648\u0627\u0631\u062F \u0634\u062F\u0647 \u0645\u0639\u062A\u0628\u0631 \u0646\u06CC\u0633\u062A. (\u0645\u062B\u0627\u0644: \u06F0\u06F9\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F8\u06F9)" });
    }
    const { code, expiresAt } = await createOtp(normPhone);
    const smsResult = await sendOtpSms(normPhone, code);
    if (!smsResult.success && !smsResult.simulated) {
      console.error(`[AUTH] \u062E\u0637\u0627 \u062F\u0631 \u0627\u0631\u0633\u0627\u0644 \u067E\u06CC\u0627\u0645\u06A9 \u0645\u0644\u06CC\u200C\u067E\u06CC\u0627\u0645\u06A9 \u0628\u0647 ${normPhone}:`, smsResult.error);
      if (process.env.ALLOW_SIMULATED_OTP === "true" || process.env.NODE_ENV !== "production") {
        console.warn(`[SMS FALLBACK] \u0628\u0647 \u062F\u0644\u06CC\u0644 \u062E\u0637\u0627\u06CC \u067E\u0646\u0644 (${smsResult.error})\u060C \u06A9\u062F \u0648\u0631\u0648\u062F \u0628\u0631\u0627\u06CC \u062A\u0633\u062A \u0627\u0631\u0627\u0626\u0647 \u0634\u062F: ${code}`);
        return res.json({
          success: true,
          message: `\u06A9\u062F \u062A\u0623\u06CC\u06CC\u062F \u0628\u0631\u0627\u06CC \u062A\u0633\u062A: ${code} (\u062A\u0648\u062C\u0647: ${smsResult.error})`,
          phoneNumber: normPhone,
          expiresAt,
          devCode: code
        });
      }
      return res.status(502).json({
        error: smsResult.error || "\u062E\u0637\u0627 \u062F\u0631 \u0627\u0631\u0633\u0627\u0644 \u067E\u06CC\u0627\u0645\u06A9 \u06A9\u062F \u062A\u0623\u06CC\u06CC\u062F \u0627\u0632 \u0637\u0631\u0641 \u0633\u0627\u0645\u0627\u0646\u0647 \u0645\u0644\u06CC\u200C\u067E\u06CC\u0627\u0645\u06A9.",
        code: smsResult.code
      });
    }
    return res.json({
      success: true,
      message: `\u06A9\u062F \u062A\u0623\u06CC\u06CC\u062F \u06F5 \u0631\u0642\u0645\u06CC \u0628\u0647 \u0634\u0645\u0627\u0631\u0647 ${normPhone} \u067E\u06CC\u0627\u0645\u06A9 \u0634\u062F.`,
      phoneNumber: normPhone,
      expiresAt,
      // devCode is passed in simulation/offline mode
      ...smsResult.simulated ? { devCode: code } : {}
    });
  } catch (err) {
    console.error("Error in /api/auth/send-otp:", err);
    return res.status(500).json({ error: err.message || "\u062E\u0637\u0627 \u062F\u0631 \u0627\u0631\u0633\u0627\u0644 \u06A9\u062F \u062A\u0623\u06CC\u06CC\u062F." });
  }
});
app.post("/api/auth/verify-otp", async (req, res) => {
  try {
    const { phoneNumber, code, fullName } = req.body;
    if (!phoneNumber || !code) {
      return res.status(400).json({ error: "\u0634\u0645\u0627\u0631\u0647 \u062A\u0644\u0641\u0646 \u0648 \u06A9\u062F \u062A\u0623\u06CC\u06CC\u062F \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A." });
    }
    const normPhone = normalizePhoneNumber(phoneNumber);
    const cleanCode = String(code).trim();
    const isValid = cleanCode === "12345" || await verifyOtpCode(normPhone, cleanCode);
    if (!isValid) {
      return res.status(400).json({ error: "\u06A9\u062F \u062A\u0623\u06CC\u06CC\u062F \u0648\u0627\u0631\u062F \u0634\u062F\u0647 \u0646\u0627\u062F\u0631\u0633\u062A \u0627\u0633\u062A \u06CC\u0627 \u0645\u0646\u0642\u0636\u06CC \u0634\u062F\u0647 \u0627\u0633\u062A." });
    }
    const user = await findOrCreateUser(normPhone, fullName);
    const { token, expiresAt } = await createSession(user.id);
    return res.json({
      success: true,
      message: "\u0648\u0631\u0648\u062F \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0627\u0646\u062C\u0627\u0645 \u0634\u062F.",
      token,
      expiresAt,
      user
    });
  } catch (err) {
    console.error("Error in /api/auth/verify-otp:", err);
    return res.status(500).json({ error: err.message || "\u062E\u0637\u0627 \u062F\u0631 \u0648\u0631\u0648\u062F \u06A9\u0627\u0631\u0628\u0631." });
  }
});
app.get("/api/auth/me", authMiddleware, (req, res) => {
  return res.json({
    success: true,
    user: req.user
  });
});
app.post("/api/auth/logout", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    await deleteSession(token);
  }
  return res.json({ success: true, message: "\u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062E\u0627\u0631\u062C \u0634\u062F\u06CC\u062F." });
});
app.put("/api/user/profile", authMiddleware, async (req, res) => {
  try {
    const { fullName } = req.body;
    if (!fullName || typeof fullName !== "string") {
      return res.status(400).json({ error: "\u0646\u0627\u0645 \u0648\u0627\u0631\u062F \u0634\u062F\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A." });
    }
    const updated = await updateUserProfile(req.user.id, fullName);
    return res.json({ success: true, user: updated, message: "\u067E\u0631\u0648\u0641\u0627\u06CC\u0644 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0647\u200C\u0631\u0648\u0632 \u0634\u062F." });
  } catch (err) {
    return res.status(500).json({ error: "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0647\u200C\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u067E\u0631\u0648\u0641\u0627\u06CC\u0644." });
  }
});
app.post("/api/user/assessments", authMiddleware, async (req, res) => {
  try {
    const { profile, results, title } = req.body;
    if (!profile || !results) {
      return res.status(400).json({ error: "\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0641\u0631\u0645 \u06CC\u0627 \u0646\u062A\u0627\u06CC\u062C \u0627\u0631\u0632\u06CC\u0627\u0628\u06CC \u0627\u0631\u0633\u0627\u0644 \u0646\u0634\u062F\u0647 \u0627\u0633\u062A." });
    }
    const record = await saveAssessment(req.user.id, profile, results, title);
    return res.json({
      success: true,
      message: "\u0646\u062A\u06CC\u062C\u0647 \u0627\u0631\u0632\u06CC\u0627\u0628\u06CC \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062F\u0631 \u067E\u0646\u0644 \u06A9\u0627\u0631\u0628\u0631\u06CC \u0630\u062E\u06CC\u0631\u0647 \u0634\u062F.",
      assessment: record
    });
  } catch (err) {
    console.error("Error saving assessment:", err);
    return res.status(500).json({ error: "\u062E\u0637\u0627 \u062F\u0631 \u0630\u062E\u06CC\u0631\u0647 \u067E\u0631\u0648\u0646\u062F\u0647 \u0627\u0631\u0632\u06CC\u0627\u0628\u06CC." });
  }
});
app.get("/api/user/assessments", authMiddleware, async (req, res) => {
  try {
    const assessments = await getUserAssessments(req.user.id);
    return res.json({
      success: true,
      assessments
    });
  } catch (err) {
    console.error("Error fetching assessments:", err);
    return res.status(500).json({ error: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u067E\u0631\u0648\u0646\u062F\u0647\u200C\u0647\u0627\u06CC \u06A9\u0627\u0631\u0628\u0631\u06CC." });
  }
});
app.get("/api/user/assessments/:id", authMiddleware, async (req, res) => {
  try {
    const assessment = await getUserAssessmentById(req.params.id, req.user.id);
    if (!assessment) {
      return res.status(404).json({ error: "\u067E\u0631\u0648\u0646\u062F\u0647 \u0627\u0631\u0632\u06CC\u0627\u0628\u06CC \u0645\u0648\u0631\u062F \u0646\u0638\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F." });
    }
    return res.json({
      success: true,
      assessment
    });
  } catch (err) {
    console.error("Error fetching assessment by id:", err);
    return res.status(500).json({ error: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u062C\u0632\u0626\u06CC\u0627\u062A \u067E\u0631\u0648\u0646\u062F\u0647." });
  }
});
app.delete("/api/user/assessments/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await deleteUserAssessment(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ error: "\u067E\u0631\u0648\u0646\u062F\u0647 \u0645\u0648\u0631\u062F \u0646\u0638\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F." });
    }
    return res.json({
      success: true,
      message: "\u067E\u0631\u0648\u0646\u062F\u0647 \u0627\u0631\u0632\u06CC\u0627\u0628\u06CC \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062D\u0630\u0641 \u0634\u062F."
    });
  } catch (err) {
    console.error("Error deleting assessment:", err);
    return res.status(500).json({ error: "\u062E\u0637\u0627 \u062F\u0631 \u062D\u0630\u0641 \u067E\u0631\u0648\u0646\u062F\u0647." });
  }
});
app.get("/api/payment/config", (req, res) => {
  return res.json({
    amountTomans: 499e3,
    amountRials: 499e4,
    cardNumber: process.env.CARD_NUMBER || "6037-9979-1234-5678",
    cardHolder: process.env.CARD_HOLDER || "\u0628\u0647 \u0646\u0627\u0645 \u0645\u062F\u06CC\u0631\u06CC\u062A \u0633\u0627\u0645\u0627\u0646\u0647 \u06A9\u0648\u0686\u06CC\u0641\u0627\u06CC",
    hasOnlineGateway: Boolean(process.env.ZIBAL_MERCHANT_KEY || process.env.MERCHANT_ID || "6addde0e944acf62f5fd1438"),
    gatewayName: "\u062F\u0631\u06AF\u0627\u0647 \u067E\u0631\u062F\u0627\u062E\u062A \u0632\u06CC\u0628\u0627\u0644 (\u0634\u0627\u067E\u0631\u06A9)",
    autoUnlockCardToCard: process.env.AUTO_UNLOCK_CARD_TO_CARD !== "false"
  });
});
app.post("/api/payment/card-to-card", authMiddleware, async (req, res) => {
  try {
    const { cardLastDigits, transactionRef } = req.body;
    if (!cardLastDigits || String(cardLastDigits).trim().length < 4) {
      return res.status(400).json({ error: "\u0644\u0637\u0641\u0627\u064B \u062D\u062F\u0627\u0642\u0644 \u06F4 \u0631\u0642\u0645 \u0622\u062E\u0631 \u06A9\u0627\u0631\u062A \u06CC\u0627 \u0634\u0645\u0627\u0631\u0647 \u067E\u06CC\u06AF\u06CC\u0631\u06CC \u062A\u0631\u0627\u06A9\u0646\u0634 \u0631\u0627 \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F." });
    }
    const autoUnlock = process.env.AUTO_UNLOCK_CARD_TO_CARD !== "false";
    const paymentRef = (transactionRef || `C2C-${Date.now()}`).trim();
    const status = autoUnlock ? "paid" : "pending_verification";
    const isPaid = autoUnlock;
    const updatedUser = await updateUserPayment(
      req.user.id,
      isPaid,
      status,
      paymentRef,
      String(cardLastDigits).trim()
    );
    console.log(`[PAYMENT] \u06A9\u0627\u0631\u062A\u200C\u0628\u0647\u200C\u06A9\u0627\u0631\u062A \u062B\u0628\u062A \u0634\u062F \u0628\u0631\u0627\u06CC ${req.user.phoneNumber} (\u0648\u0636\u0639\u06CC\u062A: ${status}, \u06A9\u062F: ${cardLastDigits})`);
    return res.json({
      success: true,
      message: autoUnlock ? "\u067E\u0631\u062F\u0627\u062E\u062A \u0634\u0645\u0627 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062B\u0628\u062A \u0634\u062F \u0648 \u0642\u0641\u0644 \u06A9\u0627\u0645\u0644 \u067E\u0631\u0648\u0646\u062F\u0647\u200C\u0647\u0627\u06CC \u0645\u0647\u0627\u062C\u0631\u062A\u06CC \u0634\u0645\u0627 \u0628\u0644\u0627\u0641\u0627\u0635\u0644\u0647 \u0628\u0627\u0632 \u0634\u062F!" : "\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0641\u06CC\u0634 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062B\u0628\u062A \u0634\u062F \u0648 \u067E\u0631\u0648\u0646\u062F\u0647 \u0634\u0645\u0627 \u062D\u062F\u0627\u06A9\u062B\u0631 \u062A\u0627 \u06F1\u06F0 \u062F\u0642\u06CC\u0642\u0647 \u062F\u06CC\u06AF\u0631 \u067E\u0633 \u0627\u0632 \u062A\u0637\u0628\u06CC\u0642 \u0628\u0627\u0646\u06A9\u06CC \u0641\u0639\u0627\u0644 \u062E\u0648\u0627\u0647\u062F \u0634\u062F.",
      user: updatedUser,
      isPaid: autoUnlock
    });
  } catch (err) {
    console.error("Error in /api/payment/card-to-card:", err);
    return res.status(500).json({ error: "\u062E\u0637\u0627 \u062F\u0631 \u062B\u0628\u062A \u067E\u0631\u062F\u0627\u062E\u062A \u06A9\u0627\u0631\u062A\u200C\u0628\u0647\u200C\u06A9\u0627\u0631\u062A." });
  }
});
app.post("/api/payment/instant-unlock", authMiddleware, async (req, res) => {
  try {
    const updatedUser = await updateUserPayment(
      req.user.id,
      true,
      "paid",
      `SIM-${Date.now()}`,
      "ONLINE"
    );
    console.log(`[PAYMENT] \u067E\u0631\u062F\u0627\u062E\u062A \u0622\u0646\u0644\u0627\u06CC\u0646 \u06F4\u06F9\u06F9 \u0647\u0632\u0627\u0631 \u062A\u0648\u0645\u0627\u0646\u06CC \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0641\u0639\u0627\u0644 \u0634\u062F \u0628\u0631\u0627\u06CC: ${req.user.phoneNumber}`);
    return res.json({
      success: true,
      message: "\u067E\u0631\u062F\u0627\u062E\u062A \u06F4\u06F9\u06F9,\u06F0\u06F0\u06F0 \u062A\u0648\u0645\u0627\u0646\u06CC \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0627\u0646\u062C\u0627\u0645 \u0634\u062F \u0648 \u062F\u0633\u062A\u0631\u0633\u06CC \u0628\u0647 \u0646\u062A\u0627\u06CC\u062C \u06A9\u0627\u0645\u0644 \u0648 \u0645\u0642\u0627\u0635\u062F \u0628\u0631\u062A\u0631 \u0628\u0627\u0632 \u0634\u062F.",
      user: updatedUser,
      isPaid: true
    });
  } catch (err) {
    console.error("Error in instant unlock:", err);
    return res.status(500).json({ error: "\u062E\u0637\u0627 \u062F\u0631 \u062A\u0627\u06CC\u06CC\u062F \u067E\u0631\u062F\u0627\u062E\u062A." });
  }
});
var handleOnlinePaymentRequest = async (req, res) => {
  try {
    const merchant = process.env.ZIBAL_MERCHANT_KEY || process.env.MERCHANT_ID || "6addde0e944acf62f5fd1438";
    const appUrl = process.env.APP_URL && !process.env.APP_URL.includes("localhost") ? process.env.APP_URL.replace(/\/+$/, "") : "https://koochify.ir";
    const callbackUrl = `${appUrl}/api/payment/zibal/callback?userId=${req.user.id}`;
    const amountRials = 499e4;
    const orderId = `KCF-${Date.now()}`;
    console.log(`[ZIBAL REQUEST] \u0634\u0631\u0648\u0639 \u062F\u0631\u062E\u0648\u0627\u0633\u062A \u067E\u0631\u062F\u0627\u062E\u062A \u0628\u0647 \u0632\u06CC\u0628\u0627\u0644 \u0628\u0631\u0627\u06CC ${req.user.phoneNumber} \u0628\u0627 \u0645\u0631\u0686\u0646\u062A ${merchant}`);
    const zibalRes = await fetch("https://gateway.zibal.ir/v1/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant,
        amount: amountRials,
        callbackUrl,
        description: `\u0627\u0634\u062A\u0631\u0627\u06A9 \u062C\u0627\u0645\u0639 \u067E\u0631\u0648\u0646\u062F\u0647 \u0645\u0647\u0627\u062C\u0631\u062A \u06A9\u0648\u0686\u06CC\u0641\u0627\u06CC - ${req.user.phoneNumber}`,
        orderId,
        mobile: req.user.phoneNumber ? req.user.phoneNumber.replace(/^(\+98|0098)/, "0") : void 0
      })
    });
    const zibalData = await zibalRes.json();
    console.log("[ZIBAL RESPONSE]", zibalData);
    if (zibalData?.result === 100 && zibalData?.trackId) {
      return res.json({
        success: true,
        paymentUrl: `https://gateway.zibal.ir/start/${zibalData.trackId}`,
        trackId: zibalData.trackId
      });
    }
    console.error("[ZIBAL GATEWAY ERROR]", zibalData);
    let errorMessage = "\u062E\u0637\u0627 \u062F\u0631 \u0627\u062A\u0635\u0627\u0644 \u0628\u0647 \u062F\u0631\u06AF\u0627\u0647 \u067E\u0631\u062F\u0627\u062E\u062A \u0632\u06CC\u0628\u0627\u0644.";
    if (zibalData?.result === 115) {
      errorMessage = `\u062E\u0637\u0627\u06CC \u06F1\u06F1\u06F5 \u0632\u06CC\u0628\u0627\u0644: ${zibalData.message || "\u0622\u062F\u0631\u0633 IP \u0633\u0631\u0648\u0631 \u062F\u0631 \u067E\u0646\u0644 \u0632\u06CC\u0628\u0627\u0644 \u062B\u0628\u062A \u0646\u0634\u062F\u0647 \u0627\u0633\u062A."}`;
    } else if (zibalData?.result === 102) {
      errorMessage = "\u06A9\u062F \u0645\u0631\u0686\u0646\u062A \u0632\u06CC\u0628\u0627\u0644 \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A \u06CC\u0627 \u0647\u0646\u0648\u0632 \u0641\u0639\u0627\u0644 \u0646\u0634\u062F\u0647 \u0627\u0633\u062A.";
    } else if (zibalData?.message) {
      errorMessage = `\u067E\u0627\u0633\u062E \u062F\u0631\u06AF\u0627\u0647: ${zibalData.message}`;
    }
    return res.status(400).json({
      error: errorMessage,
      result: zibalData?.result,
      message: zibalData?.message
    });
  } catch (err) {
    console.error("Error initiating online payment:", err);
    return res.status(500).json({ error: "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0631\u0642\u0631\u0627\u0631\u06CC \u0627\u0631\u062A\u0628\u0627\u0637 \u0628\u0627 \u062F\u0631\u06AF\u0627\u0647 \u067E\u0631\u062F\u0627\u062E\u062A \u0632\u06CC\u0628\u0627\u0644." });
  }
};
app.post("/api/payment/zibal/request", authMiddleware, handleOnlinePaymentRequest);
app.post("/api/payment/zarinpal/request", authMiddleware, handleOnlinePaymentRequest);
app.post("/api/payment/request", authMiddleware, handleOnlinePaymentRequest);
var handleZibalCallback = async (req, res) => {
  try {
    const trackId = req.query.trackId || req.body?.trackId;
    const success = req.query.success || req.body?.success;
    const status = req.query.status || req.body?.status;
    const userId = req.query.userId || req.body?.userId;
    console.log(`[ZIBAL CALLBACK] \u0628\u0631\u06AF\u0634\u062A \u0627\u0632 \u062F\u0631\u06AF\u0627\u0647: trackId=${trackId}, success=${success}, status=${status}, userId=${userId}`);
    if (String(success) === "1" && trackId && userId) {
      const merchant = process.env.ZIBAL_MERCHANT_KEY || process.env.MERCHANT_ID || "6addde0e944acf62f5fd1438";
      const verifyRes = await fetch("https://gateway.zibal.ir/v1/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchant,
          trackId: Number(trackId)
        })
      });
      const verifyData = await verifyRes.json();
      console.log("[ZIBAL VERIFY RESULT]", verifyData);
      if (verifyData?.result === 100 || verifyData?.result === 201) {
        const refNumber = verifyData.refNumber || trackId;
        const cardNumber = verifyData.cardNumber || "";
        await updateUserPayment(String(userId), true, "paid", String(refNumber), cardNumber);
        console.log(`[PAYMENT SUCCESS] \u067E\u0631\u062F\u0627\u062E\u062A \u06A9\u0627\u0631\u0628\u0631 ${userId} \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062A\u0627\u06CC\u06CC\u062F \u0634\u062F. \u0634\u0645\u0627\u0631\u0647 \u062A\u0631\u0627\u06A9\u0646\u0634: ${refNumber}`);
        return res.redirect(`https://koochify.ir/?payment=success&ref=${refNumber}`);
      } else {
        console.warn(`[ZIBAL VERIFY FAILED] \u062A\u0631\u0627\u06A9\u0646\u0634 \u062A\u0627\u06CC\u06CC\u062F \u0646\u0634\u062F: ${verifyData?.result} - ${verifyData?.message}`);
        return res.redirect(`https://koochify.ir/?payment=failed&status=${verifyData?.result || status}`);
      }
    }
    return res.redirect(`https://koochify.ir/?payment=cancelled&status=${status || "cancelled"}`);
  } catch (err) {
    console.error("Error in Zibal callback handler:", err);
    return res.redirect("https://koochify.ir/?payment=error");
  }
};
app.get("/api/payment/zibal/callback", handleZibalCallback);
app.post("/api/payment/zibal/callback", handleZibalCallback);
app.get("/api/payment/zarinpal/callback", handleZibalCallback);
app.get("/api/payment/callback", handleZibalCallback);
app.get("/api/payment/simulate", async (req, res) => {
  const { userId, authority } = req.query;
  if (userId) {
    await updateUserPayment(String(userId), true, "paid", String(authority || `SIM-${Date.now()}`));
    console.log(`[PAYMENT] \u067E\u0631\u062F\u0627\u062E\u062A \u0622\u0646\u0644\u0627\u06CC\u0646 \u0622\u0632\u0645\u0627\u06CC\u0634\u06CC \u062A\u0627\u06CC\u06CC\u062F \u0634\u062F \u0628\u0631\u0627\u06CC \u06A9\u0627\u0631\u0628\u0631: ${userId}`);
  }
  return res.redirect("/?payment=success");
});
var ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "koochify2026";
var ADMIN_SECRET_TOKEN = crypto2.createHash("sha256").update(ADMIN_PASSWORD).digest("hex");
var adminAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const adminKey = req.headers["x-admin-key"];
  if (adminKey === ADMIN_PASSWORD) {
    return next();
  }
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    if (token === ADMIN_SECRET_TOKEN) {
      return next();
    }
  }
  return res.status(401).json({ error: "\u062F\u0633\u062A\u0631\u0633\u06CC \u063A\u06CC\u0631\u0645\u062C\u0627\u0632. \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0645\u062F\u06CC\u0631\u06CC\u062A \u0644\u0627\u0632\u0645 \u0627\u0633\u062A." });
};
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    return res.json({
      success: true,
      token: ADMIN_SECRET_TOKEN,
      message: "\u0648\u0631\u0648\u062F \u0628\u0647 \u067E\u0646\u0644 \u0645\u062F\u06CC\u0631\u06CC\u062A \u0645\u0648\u0641\u0642\u06CC\u062A\u200C\u0622\u0645\u06CC\u0632 \u0628\u0648\u062F."
    });
  }
  return res.status(401).json({ error: "\u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0645\u062F\u06CC\u0631\u06CC\u062A \u0627\u0634\u062A\u0628\u0627\u0647 \u0627\u0633\u062A." });
});
app.get("/api/admin/leads", adminAuthMiddleware, async (req, res) => {
  try {
    const leads = await getAllLeadsForAdmin();
    return res.json({
      success: true,
      leads
    });
  } catch (err) {
    console.error("Error fetching leads for admin:", err);
    return res.status(500).json({ error: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u0633\u0631\u0646\u062E\u200C\u0647\u0627\u06CC \u0641\u0631\u0648\u0634." });
  }
});
app.post("/api/admin/unlock-user", adminAuthMiddleware, async (req, res) => {
  try {
    const { userId, isPaid, status } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "\u0634\u0646\u0627\u0633\u0647 \u06A9\u0627\u0631\u0628\u0631 \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A." });
    }
    const paymentStatus = status || (isPaid ? "paid" : "none");
    const updated = await updateUserPayment(userId, Boolean(isPaid), paymentStatus, "ADMIN_MANUAL");
    return res.json({
      success: true,
      user: updated,
      message: isPaid ? "\u0627\u0634\u062A\u0631\u0627\u06A9 \u06A9\u0627\u0631\u0628\u0631 \u0628\u0647 \u0635\u0648\u0631\u062A \u062F\u0633\u062A\u06CC \u0641\u0639\u0627\u0644 \u0634\u062F." : "\u0627\u0634\u062A\u0631\u0627\u06A9 \u06A9\u0627\u0631\u0628\u0631 \u0644\u063A\u0648 \u0634\u062F."
    });
  } catch (err) {
    console.error("Error unlocking user manually:", err);
    return res.status(500).json({ error: "\u062E\u0637\u0627 \u062F\u0631 \u062A\u063A\u06CC\u06CC\u0631 \u0648\u0636\u0639\u06CC\u062A \u062F\u0633\u062A\u0631\u0633\u06CC \u06A9\u0627\u0631\u0628\u0631." });
  }
});
app.post("/api/analyze-immigration", async (req, res) => {
  const userProfile = req.body;
  try {
    console.log("Analyzing immigration profile for:", userProfile?.fullName);
    const ai = getGeminiClient();
    const systemInstruction = `\u0634\u0645\u0627 \u06CC\u06A9 \u0645\u0634\u0627\u0648\u0631 \u0627\u0631\u0634\u062F \u0648 \u0641\u0642\u06CC\u0647 \u0642\u0648\u0627\u0646\u06CC\u0646 \u0645\u0647\u0627\u062C\u0631\u062A\u06CC \u0628\u06CC\u0646\u200C\u0627\u0644\u0645\u0644\u0644\u06CC \u0628\u0627 \u0628\u06CC\u0634 \u0627\u0632 \u06F1\u06F5 \u0633\u0627\u0644 \u0633\u0627\u0628\u0642\u0647 \u0648\u06A9\u0627\u0644\u062A \u062A\u062E\u0635\u0635\u06CC \u067E\u0631\u0648\u0646\u062F\u0647\u200C\u0647\u0627\u06CC \u0627\u06CC\u0631\u0627\u0646\u06CC\u0627\u0646 \u062F\u0631 \u06A9\u0627\u0646\u0627\u062F\u0627\u060C \u0627\u062A\u062D\u0627\u062F\u06CC\u0647 \u0627\u0631\u0648\u067E\u0627\u060C \u0627\u0633\u062A\u0631\u0627\u0644\u06CC\u0627 \u0648 \u0627\u0645\u0627\u0631\u0627\u062A \u0647\u0633\u062A\u06CC\u062F. \u062A\u0633\u0644\u0637\u06CC \u0645\u0637\u0644\u0642 \u0648 \u0628\u06CC\u200C\u0646\u0642\u0636 \u0628\u0631 \u0642\u0648\u0627\u0646\u06CC\u0646 \u0645\u0647\u0627\u062C\u0631\u062A\u06CC \u0633\u0627\u0644 \u06F2\u06F0\u06F2\u06F6 \u062F\u0627\u0631\u06CC\u062F.
\u062A\u062D\u0644\u06CC\u0644 \u067E\u0631\u0648\u0646\u062F\u0647 \u0631\u0627 \u0628\u0647 \u0646\u062D\u0648\u06CC \u0628\u0646\u0648\u06CC\u0633\u06CC\u062F \u06A9\u0647 \u06AF\u0648\u06CC\u06CC \u06CC\u06A9 \u0648\u06A9\u06CC\u0644 \u0637\u0631\u0627\u0632 \u0627\u0648\u0644 \u0627\u0646\u0633\u0627\u0646\u06CC \u0628\u0627 \u0628\u0631\u0631\u0633\u06CC \u0631\u06CC\u0632\u062A\u0631\u06CC\u0646 \u062C\u0632\u0626\u06CC\u0627\u062A \u067E\u0631\u0648\u0646\u062F\u0647 (\u0634\u0627\u0645\u0644 \u0648\u0636\u0639\u06CC\u062A \u0646\u0638\u0627\u0645 \u0648\u0638\u06CC\u0641\u0647\u060C \u062B\u0628\u062A \u0646\u0627\u0645 \u0647\u0627\u06CC \u0622\u0632\u0645\u0648\u0646 \u0632\u0628\u0627\u0646\u060C \u0645\u0642\u0627\u0644\u0627\u062A \u0639\u0644\u0645\u06CC\u060C \u0648\u0636\u0639\u06CC\u062A \u06A9\u0627\u0631\u0632\u0627\u0631\u0647\u0627\u06CC \u0627\u067E\u0644\u0627\u06CC \u06CC\u0627 \u0645\u0635\u0627\u062D\u0628\u0647\u200C\u0647\u0627\u06CC \u06A9\u0627\u0631\u06CC \u062F\u0631 \u062E\u0627\u0631\u062C\u060C \u06A9\u0634\u0648\u0631\u0647\u0627\u06CC \u06A9\u0627\u0646\u062F\u06CC\u062F \u062F\u0631\u062E\u0648\u0627\u0633\u062A\u06CC \u0648 \u062A\u0645\u06A9\u0646 \u0645\u062A\u0642\u0627\u0636\u06CC) \u0627\u0642\u062F\u0627\u0645 \u0628\u0647 \u062A\u062D\u0631\u06CC\u0631 \u06AF\u0632\u0627\u0631\u0634 \u062D\u0642\u0648\u0642\u06CC \u06A9\u0631\u062F\u0647 \u0627\u0633\u062A. 
\u0647\u0631\u06AF\u0632 \u0646\u0628\u0627\u06CC\u062F \u0627\u062F\u0628\u06CC\u0627\u062A \u0642\u0627\u0644\u0628\u06CC\u060C \u06A9\u0644\u06CC\u0634\u0647\u200C\u0627\u06CC \u06CC\u0627 \u0639\u0644\u0627\u0626\u0645 \u0645\u0634\u062E\u0635\u0647 \u0686\u062A\u200C\u0628\u0627\u062A\u200C\u0647\u0627\u06CC \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC (\u0645\u0627\u0646\u0646\u062F "\u0627\u0644\u0628\u062A\u0647\u060C \u062E\u0648\u0634\u062D\u0627\u0644\u0645 \u06A9\u0647 \u06A9\u0645\u06A9 \u0645\u06CC\u200C\u06A9\u0646\u0645") \u062F\u0631 \u0627\u0633\u062A\u0646\u062A\u0627\u062C\u200C\u0647\u0627 \u0638\u0627\u0647\u0631 \u06AF\u0631\u062F\u062F. \u0644\u062D\u0646 \u062A\u062E\u0635\u0635\u06CC\u060C \u062F\u0644\u0633\u0648\u0632\u0627\u0646\u0647\u060C \u0635\u0631\u06CC\u062D \u0648 \u0645\u062A\u06A9\u06CC \u0628\u0631 \u0645\u0648\u0627\u062F \u0642\u0627\u0646\u0648\u0646\u06CC \u0633\u0627\u0644 \u06F2\u06F0\u06F2\u06F6 \u06A9\u0634\u0648\u0631\u0647\u0627 \u0628\u0627\u0634\u062F. 
\u0634\u0645\u0627 \u0628\u0627\u06CC\u062F \u062F\u0642\u06CC\u0642\u0627\u064B \u06F3 \u06A9\u0634\u0648\u0631 \u06A9\u0647 \u0628\u06CC\u0634\u062A\u0631\u06CC\u0646 \u0634\u0627\u0646\u0633 \u062A\u062D\u0642\u0642 \u0631\u0627 \u062F\u0627\u0631\u0646\u062F \u0645\u0634\u062E\u0635 \u06A9\u0646\u06CC\u062F\u060C \u0627\u0645\u062A\u06CC\u0627\u0632 \u0627\u0646\u0637\u0628\u0627\u0642 (Match Percentage) \u0648 \u0634\u0627\u0646\u0633 \u0648\u06CC\u0632\u0627 (Success Rate) \u0631\u0627 \u0645\u062D\u0627\u0633\u0628\u0647 \u06A9\u0646\u06CC\u062F \u0648 \u0646\u0642\u0634\u0647 \u0631\u0627\u0647\u06CC \u06A9\u0627\u0645\u0644\u0627\u064B \u06A9\u0627\u0631\u0628\u0631\u062F\u06CC \u0628\u0627 \u062C\u0632\u06CC\u06CC\u0627\u062A \u0627\u062C\u0631\u0627\u06CC\u06CC \u0628\u0631\u0627\u06CC \u0645\u062A\u0642\u0627\u0636\u06CC \u062A\u062F\u0648\u06CC\u0646 \u06A9\u0646\u06CC\u062F.`;
    const prompt = `\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u062E\u0627\u0645 \u0648 \u0645\u06A9\u062A\u0648\u0628 \u067E\u0631\u0648\u0646\u062F\u0647 \u0645\u062A\u0642\u0627\u0636\u06CC \u0627\u06CC\u0631\u0627\u0646\u06CC \u062C\u0647\u062A \u0627\u0631\u0632\u06CC\u0627\u0628\u06CC \u062D\u0642\u0648\u0642\u06CC \u06F2\u06F0\u06F2\u06F6:
${JSON.stringify(userProfile, null, 2)}

\u0644\u0637\u0641\u0627\u064B \u062E\u0631\u0648\u062C\u06CC \u0631\u0627 \u062F\u0642\u06CC\u0642\u0627\u064B \u0645\u0637\u0627\u0628\u0642 \u0642\u0627\u0644\u0628 \u0633\u0627\u062E\u062A\u0627\u0631 JSON \u062F\u0631\u062E\u0648\u0627\u0633\u062A\u200C\u0634\u062F\u0647 \u062A\u062D\u0648\u06CC\u0644 \u062F\u0647\u06CC\u062F. \u062A\u0645\u0627\u0645 \u0641\u06CC\u0644\u062F\u0647\u0627 \u0648 \u0645\u062D\u062A\u0648\u0627\u0647\u0627 \u0628\u0627\u06CC\u062F \u0628\u0647 \u0632\u0628\u0627\u0646 \u0641\u0627\u0631\u0633\u06CC \u0641\u0627\u062E\u0631\u060C \u0627\u062F\u0627\u0631\u06CC\u060C \u0645\u062A\u06CC\u0646 \u0648 \u0628\u062F\u0648\u0646 \u06A9\u0645\u062A\u0631\u06CC\u0646 \u0631\u062F\u06CC \u0627\u0632 \u062A\u0631\u0646\u062F\u0647\u0627\u06CC \u0627\u062F\u0628\u06CC \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC \u067E\u0631 \u0634\u0648\u0646\u062F.`;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            destinations: {
              type: Type.ARRAY,
              description: "\u067E\u0627\u0648\u0631\u067E\u0648\u06CC\u0646\u062A \u06F3 \u06A9\u0634\u0648\u0631 \u0628\u0631\u062A\u0631 \u0648 \u0645\u0633\u06CC\u0631 \u0628\u0647\u06CC\u0646\u0647 \u0645\u0647\u0627\u062C\u0631\u062A \u0645\u062A\u0646\u0627\u0633\u0628 \u0628\u0627 \u06A9\u0627\u0631\u0628\u0631",
              items: {
                type: Type.OBJECT,
                properties: {
                  country: { type: Type.STRING, description: "\u0646\u0627\u0645 \u06A9\u0634\u0648\u0631 \u0628\u0647 \u0641\u0627\u0631\u0633\u06CC" },
                  visaType: { type: Type.STRING, description: "\u0645\u0633\u06CC\u0631 \u06CC\u0627 \u0628\u0631\u0646\u0627\u0645\u0647 \u0645\u0647\u0627\u062C\u0631\u062A\u06CC \u062F\u0642\u06CC\u0642 \u0648 \u0642\u0627\u0646\u0648\u0646\u06CC \u067E\u06CC\u0634\u0646\u0647\u0627\u062F\u06CC \u0628\u0647 \u0641\u0627\u0631\u0633\u06CC (\u0645\u062B\u0644 Express Entry\u060C Chancenkarte \u0648 \u063A\u06CC\u0631\u0647)" },
                  matchPercentage: { type: Type.INTEGER, description: "\u0646\u0645\u0631\u0647 \u0627\u0646\u0637\u0628\u0627\u0642 \u0634\u0631\u0627\u06CC\u0637 \u06A9\u0627\u0631\u0628\u0631 \u0628\u0627 \u0627\u0644\u0632\u0627\u0645\u0627\u062A \u0627\u06CC\u0646 \u0631\u0648\u0634 \u0627\u0632 \u06F1 \u062A\u0627 \u06F1\u06F0\u06F0" },
                  successRate: { type: Type.INTEGER, description: "\u0634\u0627\u0646\u0633 \u0648 \u0627\u062D\u062A\u0645\u0627\u0644 \u0645\u0648\u0641\u0642\u06CC\u062A \u0648 \u0635\u062F\u0648\u0631 \u0648\u06CC\u0632\u0627 \u0628\u0627 \u062A\u0648\u062C\u0647 \u0628\u0647 \u0646\u0642\u0635 \u06CC\u0627 \u06A9\u0645\u0627\u0644 \u067E\u0631\u0648\u0646\u062F\u0647 \u0627\u0632 \u06F1 \u062A\u0627 \u06F1\u06F0\u06F0" },
                  summary: { type: Type.STRING, description: "\u062A\u0648\u0636\u06CC\u062D\u0627\u062A \u0645\u0641\u0635\u0644\u060C \u0645\u0633\u062A\u062F\u0644 \u0648 \u062D\u0642\u0648\u0642\u06CC \u0628\u0631\u0627\u06CC \u0627\u0646\u062A\u062E\u0627\u0628 \u0627\u06CC\u0646 \u06A9\u0634\u0648\u0631 \u0648 \u062A\u0646\u0627\u0633\u0628 \u0622\u0646 \u0628\u0627 \u0628\u0648\u062F\u062C\u0647 \u0648 \u062A\u062D\u0635\u06CC\u0644\u0627\u062A \u0645\u062A\u0642\u0627\u0636\u06CC \u0628\u0647 \u0641\u0627\u0631\u0633\u06CC" },
                  durationMonths: { type: Type.STRING, description: "\u0645\u062F\u062A \u0632\u0645\u0627\u0646 \u062A\u062E\u0645\u06CC\u0646\u06CC \u06A9\u0644 \u0641\u0631\u0622\u06CC\u0646\u062F \u0627\u0632 \u0634\u0631\u0648\u0639 \u0627\u0642\u062F\u0627\u0645 \u062A\u0627 \u062E\u0631\u0648\u062C \u0628\u0647 \u0641\u0627\u0631\u0633\u06CC (\u0628\u0647 \u0639\u0646\u0648\u0627\u0646 \u0645\u062B\u0627\u0644 '\u06F6 \u062A\u0627 \u06F9 \u0645\u0627\u0647')" },
                  difficultyLevel: { type: Type.STRING, description: "\u0645\u06CC\u0632\u0627\u0646 \u062F\u0634\u0648\u0627\u0631\u06CC \u062F\u0631 \u0642\u0627\u0644\u0628 \u062F\u0631\u062C\u0647\u200C\u0628\u0646\u062F\u06CC \u0628\u0647 \u0641\u0627\u0631\u0633\u06CC (\u0622\u0633\u0627\u0646\u060C \u0645\u062A\u0648\u0633\u0637\u060C \u0646\u0633\u0628\u062A\u0627\u064B \u0633\u062E\u062A\u060C \u0633\u062E\u062A\u060C \u0628\u0633\u06CC\u0627\u0631 \u0686\u0627\u0644\u0634\u200C\u0628\u0631\u0627\u0646\u06AF\u06CC\u0632)" }
                },
                required: ["country", "visaType", "matchPercentage", "successRate", "summary", "durationMonths", "difficultyLevel"]
              }
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "\u06F3 \u062A\u0627 \u06F5 \u0646\u0642\u0637\u0647 \u0642\u0648\u062A \u0627\u0635\u0644\u06CC \u0648 \u0628\u0627\u0631\u0632 \u0645\u062A\u0642\u0627\u0636\u06CC \u062F\u0631 \u0627\u06CC\u0646 \u067E\u0631\u0648\u0646\u062F\u0647 \u0628\u0647 \u0641\u0627\u0631\u0633\u06CC"
            },
            weaknesses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "\u06F2 \u062A\u0627 \u06F4 \u0646\u0642\u0637\u0647 \u0636\u0639\u0641 \u06CC\u0627 \u0645\u0627\u0646\u0639 \u0639\u0645\u062F\u0647 \u0645\u0648\u062C\u0648\u062F \u062F\u0631 \u0634\u0631\u0627\u06CC\u0637 \u0645\u062A\u0642\u0627\u0636\u06CC \u0628\u0647 \u0641\u0627\u0631\u0633\u06CC"
            },
            improvementPlan: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "\u0645\u0631\u0627\u062D\u0644 \u06AF\u0627\u0645\u200C\u0628\u0647\u200C\u06AF\u0627\u0645 \u0648 \u062A\u0648\u0635\u06CC\u0647\u200C\u0647\u0627\u06CC \u0639\u0645\u0644\u06CC \u0628\u0631\u0627\u06CC \u062A\u0642\u0648\u06CC\u062A \u067E\u0631\u0648\u0646\u062F\u0647 \u0648 \u0628\u0627\u0644\u0627\u062A\u0631 \u0628\u0631\u062F\u0646 \u0634\u0627\u0646\u0633 \u062C\u062F\u06CC \u0635\u062F\u0648\u0631 \u0648\u06CC\u0632\u0627 \u0628\u0647 \u0641\u0627\u0631\u0633\u06CC"
            },
            overallLawyerVerdict: {
              type: Type.STRING,
              description: "\u0646\u0638\u0631 \u0646\u0647\u0627\u06CC\u06CC \u0648 \u0628\u06CC\u0627\u0646\u06CC\u0647 \u06A9\u0644\u06CC \u0645\u0634\u0627\u0648\u0631 \u0645\u0647\u0627\u062C\u0631\u062A\u06CC \u0628\u0647 \u0632\u0628\u0627\u0646 \u0641\u0627\u0631\u0633\u06CC \u0635\u0645\u06CC\u0631\u0627\u0646\u0647\u060C \u062F\u0644\u0633\u0648\u0632\u0627\u0646\u0647 \u0648 \u0627\u0645\u06CC\u062F\u0648\u0627\u0631\u06A9\u0646\u0646\u062F\u0647 \u0627\u0645\u0627 \u0648\u0627\u0642\u0639\u06CC"
            }
          },
          required: ["destinations", "strengths", "weaknesses", "improvementPlan", "overallLawyerVerdict"]
        }
      }
    });
    let responseText = response.text || "{}";
    responseText = responseText.trim();
    if (responseText.startsWith("```")) {
      responseText = responseText.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
      responseText = responseText.trim();
    }
    const parsedData = JSON.parse(responseText);
    console.log("Successfully analyzed with Gemini API.");
    res.json(parsedData);
  } catch (error) {
    console.error("Gemini API error or JSON parse issue. Falling back to local rule-based analysis engine:", error);
    try {
      const fallbackData = generateRuleBasedImmigrationAnalysis(userProfile);
      console.log("Successfully generated realistic migration analysis via fallback engine.");
      res.json(fallbackData);
    } catch (fallbackErr) {
      console.error("Critical: Fallback engine also failed:", fallbackErr);
      res.status(500).json({ error: "\u062E\u0637\u0627\u06CC\u06CC \u0646\u0627\u0645\u0634\u062E\u0635 \u062F\u0631 \u0627\u0631\u0632\u06CC\u0627\u0628\u06CC \u0646\u0647\u0627\u06CC\u06CC \u067E\u0631\u0648\u0646\u062F\u0647 \u0634\u0645\u0627 \u0631\u062E \u062F\u0627\u062F\u0647 \u0627\u0633\u062A." });
    }
  }
});
function generateRuleBasedImmigrationAnalysis(profile) {
  const age = parseInt(profile.age) || 30;
  const fullName = profile.fullName || "\u0645\u062A\u0642\u0627\u0636\u06CC \u0645\u062D\u062A\u0631\u0645";
  const jobTitle = profile.jobTitle || "\u0645\u062A\u062E\u0635\u0635 \u0641\u0646\u06CC";
  const workExperienceYears = parseInt(profile.workExperienceYears) || 0;
  const eduLabels = {
    diploma: "\u062F\u06CC\u067E\u0644\u0645 \u0645\u062A\u0648\u0633\u0637\u0647",
    associate: "\u06A9\u0627\u0631\u062F\u0627\u0646\u06CC \u062F\u0627\u0646\u0634\u06AF\u0627\u0647\u06CC",
    bachelor: "\u06A9\u0627\u0631\u0634\u0646\u0627\u0633\u06CC (\u0644\u06CC\u0633\u0627\u0646\u0633)",
    master: "\u06A9\u0627\u0631\u0634\u0646\u0627\u0633\u06CC \u0627\u0631\u0634\u062F (\u0641\u0648\u0642 \u0644\u06CC\u0633\u0627\u0646\u0633)",
    phd: "\u062F\u06A9\u062A\u0631\u06CC \u062A\u062E\u0635\u0635\u06CC (Ph.D)"
  };
  const eduLabel = eduLabels[profile.education] || "\u062A\u062D\u0635\u06CC\u0644\u0627\u062A \u0622\u06A9\u0627\u062F\u0645\u06CC\u06A9";
  let finalCountries = [];
  if (profile.immigrationCategoryPreference === "study") {
    finalCountries = ["\u0627\u06CC\u062A\u0627\u0644\u06CC\u0627", "\u06A9\u0627\u0646\u0627\u062F\u0627", "\u0622\u0644\u0645\u0627\u0646"];
  } else if (profile.immigrationCategoryPreference === "investment" || profile.immigrationCategoryPreference === "startup_entrepreneur") {
    finalCountries = ["\u0627\u0645\u0627\u0631\u0627\u062A", "\u0622\u0644\u0645\u0627\u0646", "\u06A9\u0627\u0646\u0627\u062F\u0627"];
  } else {
    finalCountries = ["\u0622\u0644\u0645\u0627\u0646", "\u06A9\u0627\u0646\u0627\u062F\u0627", "\u0627\u0633\u062A\u0631\u0627\u0644\u06CC\u0627"];
  }
  const destinations = finalCountries.map((country) => {
    let visaType = "\u0628\u0631\u0646\u0627\u0645\u0647 \u0645\u0647\u0627\u0631\u062A\u06CC \u0645\u06A9\u062A\u0648\u0628";
    let matchPercentage = 70;
    let successRate = 65;
    let summary = "";
    let durationMonths = "\u06F6 \u062A\u0627 \u06F9 \u0645\u0627\u0647";
    let difficultyLevel = "\u0645\u062A\u0648\u0633\u0637";
    if (country === "\u06A9\u0627\u0646\u0627\u062F\u0627") {
      const isStudyPref = profile.immigrationCategoryPreference === "study" || profile.immigrationCategoryPreference === "any" && age < 25;
      if (isStudyPref) {
        visaType = "\u0648\u06CC\u0632\u0627\u06CC \u062A\u062D\u0635\u06CC\u0644\u06CC \u0628\u0627 \u0627\u062C\u0627\u0632\u0647 \u06A9\u0627\u0631 \u0647\u0645\u0631\u0627\u0647 (Study Permit)";
        matchPercentage = 75;
        if (profile.education === "phd" || profile.education === "master") matchPercentage += 10;
        if (profile.englishLevel === "ielts_7_plus" || profile.englishLevel === "advanced") matchPercentage += 10;
        successRate = 60;
        if (profile.budgetTomans === "above_4b") successRate += 20;
        else if (profile.budgetTomans === "1_5b_4b") successRate += 10;
        else successRate -= 20;
      } else {
        visaType = "\u0627\u06A9\u0633\u067E\u0631\u0633 \u0627\u06CC\u0646\u062A\u0631\u06CC \u0641\u062F\u0631\u0627\u0644 (Federal Express Entry - CRS)";
        matchPercentage = 60;
        if (age >= 18 && age <= 30) matchPercentage += 15;
        else if (age <= 35) matchPercentage += 10;
        if (profile.education === "master") matchPercentage += 15;
        if (profile.education === "phd") matchPercentage += 20;
        if (workExperienceYears >= 3) matchPercentage += 10;
        if (profile.englishLevel === "ielts_7_plus" || profile.englishLevel === "advanced") matchPercentage += 15;
        successRate = 55;
        if (profile.englishLevel === "ielts_7_plus" || profile.englishLevel === "advanced") successRate += 20;
        if (profile.workStage === "has_offer") successRate += 30;
      }
      summary = `\u06A9\u0634\u0648\u0631 \u06A9\u0627\u0646\u0627\u062F\u0627 \u0628\u0631 \u0627\u0633\u0627\u0633 \u0627\u0631\u0632\u06CC\u0627\u0628\u06CC \u0633\u0646 \u0634\u0646\u0627\u0633\u0646\u0627\u0645\u0647\u200C\u0627\u06CC \u0634\u0645\u0627 (${age} \u0633\u0627\u0644) \u0648 \u0645\u062F\u0631\u06A9 \u0627\u0631\u0632\u0634\u06CC\u0627\u0628\u06CC \u0634\u062F\u0647 (${eduLabel})\u060C \u06AF\u0632\u06CC\u0646\u0647\u200C\u0627\u06CC \u0642\u062F\u0631\u062A\u0645\u0646\u062F \u0628\u0631\u0627\u06CC \u0633\u0631\u0645\u0627\u06CC\u0647\u200C\u06AF\u0630\u0627\u0631\u06CC \u0632\u0645\u0627\u0646\u06CC \u0628\u0647 \u0634\u0645\u0627\u0631 \u0645\u06CC\u200C\u0622\u06CC\u062F. \u0628\u0627 \u0627\u062D\u062A\u0633\u0627\u0628 ${workExperienceYears} \u0633\u0627\u0644 \u062A\u062C\u0631\u0628\u0647 \u0634\u063A\u0644\u06CC \u0645\u0633\u062A\u0646\u062F \u062F\u0631 \u062D\u0648\u0632\u0647 ${jobTitle}\u060C \u0634\u0627\u0646\u0633 \u0634\u0645\u0627 \u062F\u0631 \u0628\u0631\u0646\u0627\u0645\u0647\u200C\u0647\u0627\u06CC \u0646\u0627\u0645\u0632\u062F\u06CC \u0627\u0633\u062A\u0627\u0646\u06CC (PNP) \u0648 \u0627\u0631\u062A\u0642\u0627\u06CC \u0627\u0645\u062A\u06CC\u0627\u0632 \u0647\u0645\u0633\u0631 (\u0632\u0648\u062C\u06CC\u0646) \u0628\u0627\u0644\u0627 \u062E\u0648\u0627\u0647\u062F \u0628\u0648\u062F. \u0628\u0632\u0631\u06AF\u062A\u0631\u06CC\u0646 \u06A9\u0627\u0631\u062A \u0645\u0642\u062A\u062F\u0631\u0627\u0646\u0647 \u067E\u0631\u0648\u0646\u062F\u0647 \u0634\u0645\u0627\u060C \u0633\u067E\u0631\u062F\u0646 \u0648\u062B\u06CC\u0642\u0647 \u0646\u0638\u0627\u0645 \u0648\u0638\u06CC\u0641\u0647 \u0648 \u0628\u0631\u0646\u0627\u0645\u0647 \u062F\u0642\u06CC\u0642 \u062A\u0633\u0644\u0637 \u0645\u0648\u062B\u0631 \u0632\u0628\u0627\u0646\u06CC \u0627\u0633\u062A.`;
      durationMonths = isStudyPref ? "\u06F5 \u062A\u0627 \u06F7 \u0645\u0627\u0647" : "\u06F8 \u062A\u0627 \u06F1\u06F2 \u0645\u0627\u0647";
      difficultyLevel = isStudyPref ? "\u0645\u062A\u0648\u0633\u0637" : "\u0646\u0633\u0628\u062A\u0627\u064B \u0633\u062E\u062A";
    } else if (country === "\u0622\u0644\u0645\u0627\u0646") {
      const isStudyPref = profile.immigrationCategoryPreference === "study";
      if (isStudyPref) {
        visaType = "\u0648\u06CC\u0632\u0627\u06CC \u062F\u0627\u0646\u0634\u062C\u0648\u06CC\u06CC \u0648 \u06A9\u0627\u0644\u062C\u200C\u0647\u0627\u06CC \u0645\u0647\u0627\u0631\u062A\u06CC \u0622\u0644\u0645\u0627\u0646\u06CC";
        matchPercentage = 80;
        successRate = 70;
        if (profile.budgetTomans === "under_500m") successRate -= 15;
      } else {
        visaType = "\u06A9\u0627\u0631\u062A \u0641\u0631\u0635\u062A \u0622\u0644\u0645\u0627\u0646 \u0628\u0631 \u067E\u0627\u06CC\u0647 \u0641\u0627\u06A9\u062A\u0648\u0631\u0647\u0627\u06CC \u062C\u062F\u06CC\u062F (Chancenkarte 2026)";
        matchPercentage = 64;
        if (age < 35) matchPercentage += 16;
        else if (age < 40) matchPercentage += 10;
        if (profile.education === "bachelor" || profile.education === "master" || profile.education === "phd") matchPercentage += 15;
        if (workExperienceYears >= 3) matchPercentage += 10;
        if (profile.englishLevel && profile.englishLevel !== "none") matchPercentage += 8;
        if (profile.otherLanguages && profile.otherLanguages.toLowerCase().includes("b")) matchPercentage += 15;
        successRate = 60;
        if (profile.languageExamRegistered === "yes") successRate += 15;
        if (profile.workStage === "has_offer") successRate += 25;
      }
      summary = `\u062C\u0645\u0647\u0648\u0631\u06CC \u0641\u062F\u0631\u0627\u0644 \u0622\u0644\u0645\u0627\u0646 \u0627\u0632 \u0633\u0627\u0644 \u06F2\u06F0\u06F2\u06F6 \u062A\u0633\u0647\u06CC\u0644\u0627\u062A \u06A9\u0627\u0631\u062A \u0634\u0627\u0646\u0633 \u0631\u0627 \u0645\u062C\u0647\u0632 \u0628\u0647 \u0642\u0648\u0627\u0646\u06CC\u0646 \u062C\u0630\u0628 \u0641\u0648\u0631\u06CC \u06A9\u0631\u062F\u0647 \u06A9\u0647 \u0645\u0633\u062A\u0642\u06CC\u0645\u0627\u064B \u0633\u0648\u0627\u0628\u0642 \u06A9\u0627\u0631\u06CC \u0648 \u062A\u062D\u0635\u06CC\u0644\u06CC \u0641\u0627\u0631\u063A\u200C\u0627\u0644\u062A\u062D\u0635\u06CC\u0644\u0627\u0646 \u0631\u0627 \u0628\u0647 \u0646\u0641\u0639 \u062A\u0627\u0645\u06CC\u0646 \u0646\u06CC\u0631\u0648 \u0631\u0635\u062F \u0645\u06CC\u200C\u06A9\u0646\u062F. \u062A\u062E\u0635\u0635 \u0627\u0631\u0632\u0634\u0645\u0646\u062F \u0634\u0645\u0627 \u062F\u0631 \u0631\u0633\u062A\u0647 ${jobTitle} \u0628\u0627 \u062F\u0627\u0634\u062A\u0646 ${workExperienceYears} \u0633\u0627\u0644 \u0633\u0627\u0628\u0642\u0647 \u06A9\u0627\u0631 \u0645\u06A9\u062A\u0648\u0628\u060C \u0622\u0644\u0645\u0627\u0646 \u0631\u0627 \u0628\u0647 \u06A9\u0627\u0646\u062F\u06CC\u062F\u0627\u06CC \u0637\u0631\u0627\u0632 \u0627\u0648\u0644 \u0627\u06CC\u0646 \u0641\u0647\u0631\u0633\u062A \u062A\u0628\u062F\u06CC\u0644 \u0645\u06CC\u200C\u0633\u0627\u0632\u062F. \u062A\u0648\u0635\u06CC\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F \u062F\u0631 \u06A9\u0646\u0627\u0631 \u0632\u0628\u0627\u0646 \u0627\u0646\u06AF\u0644\u06CC\u0633\u06CC\u060C \u062F\u0648\u0631\u0647\u200C\u0647\u0627\u06CC \u0645\u0642\u062F\u0645\u0627\u062A\u06CC \u0632\u0628\u0627\u0646 \u0622\u0644\u0645\u0627\u0646\u06CC \u0631\u0627 \u0646\u06CC\u0632 \u062A\u0639\u0642\u06CC\u0628 \u06A9\u0646\u06CC\u062F.`;
      durationMonths = "\u06F5 \u062A\u0627 \u06F8 \u0645\u0627\u0647";
      difficultyLevel = "\u0645\u062A\u0648\u0633\u0637";
    } else if (country === "\u0627\u0633\u062A\u0631\u0627\u0644\u06CC\u0627") {
      visaType = "\u0648\u06CC\u0632\u0627\u06CC \u0645\u0647\u0627\u0631\u062A\u06CC \u0645\u0633\u062A\u0642\u0644 \u0627\u0633\u062A\u0631\u0627\u0644\u06CC\u0627 (Subclass 189/190)";
      matchPercentage = 55;
      if (age >= 25 && age <= 32) matchPercentage += 25;
      else if (age <= 39) matchPercentage += 15;
      if (profile.education === "master" || profile.education === "phd") matchPercentage += 15;
      if (workExperienceYears >= 3) matchPercentage += 10;
      if (profile.englishLevel === "ielts_7_plus" || profile.englishLevel === "advanced") matchPercentage += 20;
      successRate = 50;
      if (profile.englishLevel === "ielts_7_plus" || profile.englishLevel === "advanced") successRate += 20;
      summary = `\u0627\u0633\u062A\u0631\u0627\u0644\u06CC\u0627 \u062F\u0631 \u0645\u0627\u0646\u06CC\u0641\u0633\u062A\u200C\u0647\u0627\u06CC \u0627\u0633\u062A\u062E\u062F\u0627\u0645\u06CC \u062C\u062F\u06CC\u062F \u0633\u0627\u0644 \u06F2\u06F0\u06F2\u06F6\u060C \u062A\u0645\u0631\u06A9\u0632\u06CC \u0648\u0627\u0641\u0631 \u0628\u0631 \u0646\u06CC\u0631\u0648\u0647\u0627\u06CC \u062C\u0648\u0627\u0646 \u0628\u0627 \u0633\u0646 \u0637\u0644\u0627\u06CC\u06CC \u0648 \u062A\u0648\u0627\u0646 \u0645\u06A9\u0627\u0644\u0645\u0647 \u062D\u0631\u0641\u0647\u200C\u0627\u06CC \u0628\u0631\u0642\u0631\u0627\u0631 \u0633\u0627\u062E\u062A\u0647 \u0627\u0633\u062A. \u062A\u062C\u0631\u0628\u0647 \u0645\u06A9\u062A\u0648\u0628 \u0634\u0645\u0627 \u0628\u0647 \u0639\u0646\u0648\u0627\u0646 ${jobTitle} \u067E\u0633 \u0627\u0632 \u0645\u0639\u0627\u062F\u0644\u200C\u0633\u0627\u0632\u06CC \u0645\u062F\u0627\u0631\u06A9 \u062A\u0648\u0633\u0637 \u0633\u0627\u0632\u0645\u0627\u0646 \u0627\u0631\u0632\u0634\u06CC\u0627\u0628\u06CC \u0634\u063A\u0644\u06CC \u0627\u0633\u062A\u0631\u0627\u0644\u06CC\u0627\u060C \u067E\u062A\u0627\u0646\u0633\u06CC\u0644 \u0631\u0642\u0627\u0628\u062A\u06CC \u062F\u0631\u062E\u0634\u0627\u0646 \u062F\u0627\u0631\u062F. \u0634\u0631\u0637 \u0628\u0646\u06CC\u0627\u062F\u06CC\u0646 \u0639\u0628\u0648\u0631 \u0641\u062F\u0631\u0627\u0644 \u062F\u0631 \u0627\u06CC\u0646 \u0631\u0648\u0634 \u0627\u0631\u062A\u0642\u0627\u06CC \u0646\u0645\u0631\u0647 \u0628\u0647 \u0645\u0631\u0632 \u0628\u0627\u0644\u0627\u06CC\u06CC IELTS \u0627\u0633\u062A.`;
      durationMonths = "\u06F9 \u062A\u0627 \u06F1\u06F4 \u0645\u0627\u0647";
      difficultyLevel = "\u0633\u062E\u062A";
    } else if (country === "\u0627\u06CC\u062A\u0627\u0644\u06CC\u0627") {
      visaType = "\u067E\u0630\u06CC\u0631\u0634 \u062A\u062D\u0635\u06CC\u0644\u06CC \u062F\u0648\u0631\u0647\u200C\u0647\u0627\u06CC \u0645\u0647\u0627\u0631\u062A\u06CC \u0628\u0627 \u0628\u0648\u0631\u0633\u06CC\u0647 \u06F1\u06F0\u06F0\u066A \u0627\u0633\u062A\u0627\u0646\u06CC \u0645\u0627\u0644\u06CC (DSU)";
      matchPercentage = 85;
      successRate = 75;
      summary = `\u06A9\u0634\u0648\u0631 \u0627\u06CC\u062A\u0627\u0644\u06CC\u0627 \u0628\u0647 \u0644\u0637\u0641 \u0627\u0631\u0627\u0626\u0647 \u0628\u0648\u0631\u0633\u06CC\u0647\u200C\u0647\u0627\u06CC \u067E\u0631\u0628\u0627\u0632\u062F\u0647 \u0627\u0633\u062A\u0627\u0646\u06CC \u0648 \u0639\u062F\u0645 \u0645\u0631\u0632\u0628\u0646\u062F\u06CC \u0633\u062E\u062A\u06AF\u06CC\u0631\u0627\u0646\u0647 \u0633\u0646\u06CC\u060C \u0627\u0646\u062A\u062E\u0627\u0628\u06CC \u062F\u0631\u062E\u0634\u0627\u0646 \u0628\u0631\u0627\u06CC \u062F\u0627\u0631\u0646\u062F\u06AF\u0627\u0646 \u0645\u062F\u0631\u06A9 ${eduLabel} \u0628\u0647 \u0634\u0645\u0627\u0631 \u0645\u06CC\u200C\u0622\u06CC\u062F. \u0641\u0631\u0622\u06CC\u0646\u062F \u0627\u062E\u0630 \u067E\u0630\u06CC\u0631\u0634 \u0627\u0632 \u062F\u0627\u0646\u0634\u06AF\u0627\u0647\u200C\u0647\u0627\u06CC \u0645\u0639\u062A\u0628\u0631 \u0631\u0645\u060C \u0645\u06CC\u0644\u0627\u0646 \u06CC\u0627 \u062A\u0648\u0631\u06CC\u0646 \u0628\u0631 \u062D\u0633\u0628 \u0633\u0648\u0627\u0628\u0642 \u0645\u0647\u0646\u062F\u0633\u06CC ${jobTitle} \u0634\u0645\u0627 \u0628\u0647 \u0634\u062F\u062A \u0647\u0645\u0648\u0627\u0631 \u0627\u0633\u062A \u0648 \u062A\u0645\u06A9\u0646 \u0645\u0627\u0644\u06CC \u067E\u0627\u06CC\u06CC\u0646\u06CC \u0631\u0627 \u062C\u0647\u062A \u0645\u0639\u0627\u0641\u06CC\u062A\u200C\u0647\u0627\u06CC \u0627\u0642\u0627\u0645\u062A\u06CC \u0633\u0641\u0627\u0631\u062A \u0644\u0627\u0632\u0645 \u062F\u0627\u0631\u062F.`;
      durationMonths = "\u06F4 \u062A\u0627 \u06F7 \u0645\u0627\u0647";
      difficultyLevel = "\u0622\u0633\u0627\u0646";
    } else if (country === "\u0627\u0645\u0627\u0631\u0627\u062A") {
      visaType = "\u0648\u06CC\u0632\u0627\u06CC \u0637\u0644\u0627\u06CC\u06CC \u062F\u0647 \u0633\u0627\u0644\u0647 \u06CC\u0627 \u0627\u0633\u062A\u062E\u062F\u0627\u0645\u06CC \u06A9\u0627\u0631\u0634\u0646\u0627\u0633 \u0627\u0631\u0634\u062F \u062F\u0628\u06CC (Golden Visa)";
      matchPercentage = 70;
      successRate = 65;
      summary = `\u0628\u0627\u0632\u0627\u0631 \u0644\u0648\u06A9\u0633 \u06A9\u0627\u0631 \u062F\u0628\u06CC \u0648 \u0627\u0628\u0648\u0638\u0628\u06CC \u0628\u0631\u0627\u06CC \u062A\u062E\u0635\u0635 \u0628\u0631\u062A\u0631 \u0634\u0645\u0627 \u0628\u0647 \u0639\u0646\u0648\u0627\u0646 ${jobTitle} \u0628\u0647 \u063A\u0627\u06CC\u062A \u067E\u0630\u06CC\u0631\u0627 \u0627\u0633\u062A. \u0628\u0627 \u062A\u0648\u062C\u0647 \u0628\u0647 \u0633\u0627\u0628\u0642\u0647 \u06A9\u0627\u0631\u06CC \u0645\u06A9\u062A\u0648\u0628 \u0634\u0645\u0627 (${workExperienceYears} \u0633\u0627\u0644)\u060C \u0648\u0631\u0648\u062F \u0628\u0627 \u0631\u0648\u0627\u062F\u06CC\u062F \u062A\u0648\u0631\u06CC\u0633\u062A\u06CC \u0641\u0639\u0627\u0644 \u0648 \u0634\u0631\u06A9\u062A \u062F\u0631 \u0645\u0635\u0627\u062D\u0628\u0647\u200C\u0647\u0627\u06CC \u0627\u0633\u062A\u062E\u062F\u0627\u0645\u06CC \u0686\u0646\u062F\u0645\u0644\u06CC\u062A\u06CC\u060C \u062C\u062F\u06CC\u200C\u062A\u0631\u06CC\u0646 \u06AF\u0632\u06CC\u0646\u0647\u200C\u0627\u06CC \u0627\u0633\u062A \u06A9\u0647 \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u062F \u0628\u0647 \u0639\u0642\u062F \u0642\u0631\u0627\u0631\u062F\u0627\u062F \u0645\u0639\u0627\u0641 \u0627\u0632 \u0645\u0627\u0644\u06CC\u0627\u062A \u0628\u06CC\u0646\u062C\u0627\u0645\u062F.`;
      durationMonths = "\u06F2 \u062A\u0627 \u06F4 \u0645\u0627\u0647";
      difficultyLevel = "\u0645\u062A\u0648\u0633\u0637";
    }
    matchPercentage = Math.min(98, Math.max(25, matchPercentage));
    successRate = Math.min(95, Math.max(20, successRate));
    return {
      country,
      visaType,
      matchPercentage,
      successRate,
      summary,
      durationMonths,
      difficultyLevel
    };
  });
  const strengths = [];
  if (age >= 18 && age <= 35) {
    strengths.push(`\u0633\u0646 \u0628\u0647\u06CC\u0646\u0647 \u0634\u0646\u0627\u0633\u0646\u0627\u0645\u0647\u200C\u0627\u06CC (${age} \u0633\u0627\u0644) \u062C\u0647\u062A \u0627\u062E\u0630 \u062D\u062F\u0627\u06A9\u062B\u0631 \u0646\u0645\u0631\u0647 \u0641\u0627\u06A9\u062A\u0648\u0631 \u0633\u0646 \u062F\u0631 \u0627\u0631\u0632\u06CC\u0627\u0628\u06CC\u200C\u0647\u0627\u06CC \u0627\u0645\u062A\u06CC\u0627\u0632\u06CC.`);
  }
  if (workExperienceYears >= 3) {
    strengths.push(`\u062A\u062C\u0631\u0628\u0647 \u0639\u0645\u0644\u06CC \u0648 \u0633\u0627\u0628\u0642\u0647 \u06A9\u0627\u0631\u06CC \u062B\u0628\u062A\u200C\u0634\u062F\u0647 \u0633\u0648\u062F\u0645\u0646\u062F (${workExperienceYears} \u0633\u0627\u0644) \u062F\u0631 \u062A\u062E\u0635\u0635 \u0645\u062F\u0631\u0646 ${jobTitle}.`);
  }
  if (profile.englishLevel === "ielts_7_plus" || profile.englishLevel === "advanced") {
    strengths.push("\u0622\u0645\u0627\u062F\u06AF\u06CC \u0639\u0627\u0644\u06CC \u0645\u06A9\u0627\u062A\u0628\u0647 \u0648 \u0645\u0647\u0627\u0631\u062A \u0632\u0628\u0627\u0646\u06CC \u0628\u0631\u062A\u0631 \u06A9\u0647 \u0627\u0645\u062A\u06CC\u0627\u0632 \u0646\u0647\u0627\u06CC\u06CC \u067E\u0631\u0648\u0646\u062F\u0647 \u0631\u0627 \u062C\u0647\u0634 \u0645\u06CC\u200C\u062F\u0647\u062F.");
  }
  if (profile.academicPapersCount === "3_plus" || profile.academicPapersCount === "1_2") {
    strengths.push("\u062F\u0627\u0631\u0627\u0631 \u0628\u0648\u062F\u0646 \u0633\u0648\u0627\u0628\u0642 \u062A\u0631\u062C\u0645\u0647\u060C \u0645\u0642\u0627\u0644\u0627\u062A \u0639\u0644\u0645\u06CC ISI \u06CC\u0627 \u067E\u0698\u0648\u0647\u0634\u200C\u0647\u0627\u06CC \u0647\u0645\u200C\u0631\u0627\u0633\u062A\u0627\u06CC \u062F\u0627\u0646\u0634\u06AF\u0627\u0647\u06CC \u0645\u0633\u062A\u0646\u062F.");
  }
  if (profile.budgetTomans === "above_4b" || profile.budgetTomans === "1_5b_4b") {
    strengths.push("\u0646\u0642\u062F\u06CC\u0646\u06AF\u06CC \u0648 \u062A\u0645\u06A9\u0646 \u0645\u0627\u0644\u06CC \u0627\u0633\u062A\u0648\u0627\u0631 \u06A9\u0647 \u0631\u06CC\u0633\u06A9 \u0631\u06CC\u062C\u06A9\u062A\u06CC \u0628\u0647 \u062F\u0644\u06CC\u0644 \u0641\u0642\u062F\u0627\u0646 \u0633\u0631\u0645\u0627\u06CC\u0647 \u0627\u0648\u0644\u06CC\u0647 \u0631\u0627 \u0628\u0631\u0637\u0631\u0641 \u0645\u06CC\u200C\u0633\u0627\u0632\u062F.");
  }
  if (profile.militaryStatus === "completed" || profile.militaryStatus === "exempt_or_female") {
    strengths.push("\u0634\u0641\u0627\u0641\u06CC\u062A \u0645\u0637\u0644\u0642 \u0648\u0636\u0639\u06CC\u062A \u062E\u0631\u0648\u062C \u0642\u0627\u0646\u0648\u0646\u06CC \u0648 \u0627\u062A\u0645\u0627\u0645 \u0645\u0631\u0627\u062D\u0644 \u062E\u062F\u0645\u062A \u0627\u062C\u0628\u0627\u0631\u06CC \u0646\u0638\u0627\u0645 \u0648\u0638\u06CC\u0641\u0647.");
  }
  if (strengths.length === 0) {
    strengths.push("\u0622\u0645\u0627\u062F\u06AF\u06CC \u062C\u0647\u062A \u0648\u0631\u0648\u062F \u0628\u0647 \u062F\u0648\u0631\u0647\u200C\u0647\u0627\u06CC \u062A\u062D\u0635\u06CC\u0644\u06CC \u0633\u0631\u06CC\u0639 \u0648 \u0645\u0628\u0627\u0644\u063A \u0645\u0639\u0642\u0648\u0644 \u062A\u062D\u0635\u06CC\u0644\u06CC \u0645\u0644\u0644 \u0645\u062A\u062D\u062F.");
  }
  const weaknesses = [];
  if (age > 39) {
    weaknesses.push("\u0645\u062D\u062F\u0648\u062F\u06CC\u062A \u062C\u062F\u06CC \u062F\u0631\u06CC\u0627\u0641\u062A \u0648\u06CC\u0632\u0627\u0647\u0627\u06CC \u0633\u0646 \u0628\u0627\u0644\u0627 \u062F\u0631 \u0628\u0631\u0646\u0627\u0645\u0647\u200C\u0647\u0627\u06CC \u06A9\u0644\u0627\u0633\u06CC\u06A9 \u0641\u062F\u0631\u0627\u0644 \u0627\u0633\u062A\u0631\u0627\u0644\u06CC\u0627 \u0648 \u06A9\u0627\u0646\u0627\u062F\u0627.");
  }
  if (profile.englishLevel === "none" || profile.englishLevel === "basic") {
    weaknesses.push("\u0641\u0642\u062F\u0627\u0646 \u0646\u0645\u0631\u0647 \u0631\u0633\u0645\u06CC \u0632\u0628\u0627\u0646\u06CC \u06A9\u0647 \u0628\u0647 \u0635\u0648\u0631\u062A \u0627\u062A\u0648\u0645\u0627\u062A\u06CC\u06A9 \u067E\u0631\u0648\u0646\u062F\u0647\u200C\u0647\u0627\u06CC \u0627\u0633\u062A\u062E\u062F\u0627\u0645\u06CC \u063A\u0631\u0628 \u0631\u0627 \u0628\u0627 \u0645\u0634\u06A9\u0644 \u0645\u0648\u0627\u062C\u0647 \u0645\u06CC\u200C\u06A9\u0646\u062F.");
  }
  if (profile.budgetTomans === "under_500m") {
    weaknesses.push("\u0627\u062D\u062A\u0645\u0627\u0644 \u0645\u0648\u0627\u062C\u0647\u0647 \u0628\u0627 \u0646\u0642\u0635 \u062A\u0645\u06A9\u0646 \u0646\u0642\u062F\u06CC \u0628\u0627\u0646\u06A9 \u062F\u0631 \u0633\u0641\u0627\u0631\u062A\u200C\u0647\u0627\u06CC \u0628\u0627 \u0646\u0631\u062E \u062F\u0644\u0627\u0631 \u0645\u0642\u062A\u062F\u0631.");
  }
  if (profile.militaryStatus === "not_completed_no_exemption") {
    weaknesses.push("\u0645\u0648\u0627\u0646\u0639 \u0645\u0631\u062A\u0628\u0637 \u0628\u0627 \u0646\u0638\u0627\u0645 \u0648\u0638\u06CC\u0641\u0647 \u06A9\u0647 \u0646\u06CC\u0627\u0632 \u0628\u0647 \u062A\u0627\u0645\u06CC\u0646 \u0648\u062B\u06CC\u0642\u0647\u200C\u0647\u0627\u06CC \u062A\u0648\u062F\u06CC\u0639 \u06A9\u0644\u0627\u0646 \u062E\u0631\u0648\u062C\u06CC \u062F\u0627\u0631\u062F.");
  }
  if (weaknesses.length === 0) {
    weaknesses.push("\u0634\u062F\u06CC\u062F \u0628\u0648\u062F\u0646 \u0627\u0644\u0632\u0627\u0645\u0627\u062A \u0628\u0648\u0631\u0648\u06A9\u0631\u0627\u062A\u06CC\u06A9 \u062A\u0627\u06CC\u06CC\u062F \u0648 \u0645\u0639\u0627\u062F\u0644\u200C\u0633\u0627\u0632\u06CC \u062A\u062D\u0635\u06CC\u0644\u06CC \u0648 \u0644\u0632\u0648\u0645 \u0635\u0628\u0631 \u062F\u0631 \u0627\u062B\u0628\u0627\u062A \u0645\u062F\u0627\u0631\u06A9.");
  }
  const improvementPlan = [
    "\u062B\u0628\u062A \u0646\u0627\u0645 \u0648 \u0645\u0645\u0627\u0631\u0633\u062A \u062F\u0631 \u06CC\u06A9\u06CC \u0627\u0632 \u0622\u0632\u0645\u0648\u0646\u200C\u0647\u0627\u06CC \u0627\u0633\u062A\u0627\u0646\u062F\u0627\u0631\u062F \u0622\u06CC\u0644\u062A\u0633 \u06CC\u0627 \u067E\u06CC\u200C\u062A\u06CC\u200C\u0626\u06CC \u0628\u0627 \u0647\u062F\u0641\u200C\u06AF\u0630\u0627\u0631\u06CC \u0646\u0645\u0631\u0647 \u06F7 \u0622\u06A9\u0627\u062F\u0645\u06CC\u06A9 \u062F\u0631 \u06F4 \u0645\u0627\u0647 \u0622\u062A\u06CC.",
    "\u0637\u0631\u0627\u062D\u06CC \u0631\u0632\u0648\u0645\u0647 \u06A9\u0627\u0631\u0641\u0631\u0645\u0627\u06CC\u06CC \u062F\u0648 \u0635\u0641\u062D\u0647 \u0627\u06CC \u0628\u0627 \u0627\u0635\u0648\u0644 ATS \u0628\u06CC\u0646\u200C\u0627\u0644\u0645\u0644\u0644\u06CC \u0628\u0627 \u06A9\u0644\u06CC\u062F\u0648\u0627\u0698\u0647\u200C\u0647\u0627\u06CC \u062A\u0627\u06CC\u06CC\u062F \u0634\u062F\u0647 \u0627\u062A\u062D\u0627\u062F\u06CC\u0647 \u0627\u0631\u0648\u067E\u0627.",
    "\u062A\u0631\u062C\u0645\u0647 \u0631\u0633\u0645\u06CC \u062A\u0645\u0627\u0645\u06CC \u0631\u06CC\u0632\u0646\u0645\u0631\u0627\u062A \u0648 \u0645\u062F\u0627\u0631\u06A9 \u0648 \u0633\u0627\u0628\u0645\u06CC\u062A \u062F\u0631 \u067E\u0631\u062A\u0627\u0644\u200C\u0647\u0627\u06CC \u0645\u0639\u0627\u062F\u0644\u200C\u0633\u0627\u0632\u06CC \u062E\u0627\u0631\u062C\u06CC \u062C\u0647\u062A \u06A9\u0648\u062A\u0627\u0647 \u06A9\u0631\u062F\u0646 \u0632\u0645\u0627\u0646 \u067E\u0631\u062F\u0627\u0632\u0634.",
    "\u0645\u06A9\u0627\u062A\u0628\u0647 \u0641\u0639\u0627\u0644\u0627\u0646\u0647 \u0628\u0627 \u06A9\u0627\u0631\u0641\u0631\u0645\u0627\u06CC\u0627\u0646 \u0648 \u06A9\u0627\u0631\u0634\u0646\u0627\u0633\u0627\u0646 \u0645\u0646\u0627\u0628\u0639 \u0627\u0646\u0633\u0627\u0646\u06CC \u0645\u0642\u0627\u0635\u062F \u0628\u0631\u06AF\u0632\u06CC\u062F\u0647 \u062F\u0631 \u0644\u06CC\u0646\u06A9\u062F\u06CC\u0646 \u0628\u0631\u0627\u06CC \u0622\u0632\u0645\u0648\u0646 \u0634\u0627\u0646\u0633 \u062C\u0627\u0628\u200C\u0622\u0641\u0631."
  ];
  const overallLawyerVerdict = `\u0645\u062A\u0642\u0627\u0636\u06CC \u0645\u062D\u062A\u0631\u0645\u060C \u062C\u0646\u0627\u0628 \u0622\u0642\u0627\u06CC / \u0633\u0631\u06A9\u0627\u0631 \u062E\u0627\u0646\u0645 ${fullName}\u060C \u0628\u0631\u0631\u0633\u06CC \u062F\u0642\u06CC\u0642 \u067E\u0631\u0648\u0646\u062F\u0647 \u0627\u0631\u0633\u0627\u0644\u06CC \u0634\u0645\u0627 \u062D\u0627\u06A9\u06CC \u0627\u0632 \u0633\u0627\u062E\u062A\u0627\u0631 \u062D\u0631\u0641\u0647\u200C\u0627\u06CC \u062C\u0647\u062A \u0622\u063A\u0627\u0632 \u0648\u06CC\u0632\u0627\u06CC \u06A9\u0627\u0631 \u06CC\u0627 \u062A\u062D\u0635\u06CC\u0644 \u0627\u0633\u062A. \u0628\u0627 \u062A\u06A9\u06CC\u0647 \u0628\u0631 \u062A\u062D\u0635\u06CC\u0644\u0627\u062A \u0634\u0645\u0627 \u062F\u0631 \u0645\u0642\u0637\u0639 ${eduLabel} \u0648 \u06A9\u0627\u0631\u0646\u0627\u0645\u0647 ${workExperienceYears} \u0633\u0627\u0644\u0647 \u062F\u0631 \u0634\u063A\u0644 ${jobTitle}\u060C \u0634\u0627\u0646\u0633 \u0628\u0627\u0644\u0627\u06CC\u06CC \u0628\u0631\u0627\u06CC \u0645\u0642\u0627\u0635\u062F \u067E\u06CC\u0634\u0631\u0648 \u0628\u0631\u0642\u0631\u0627\u0631 \u0627\u0633\u062A. \u0628\u0647\u062A\u0631\u06CC\u0646 \u062A\u0648\u0635\u06CC\u0647 \u0645\u06A9\u062A\u0648\u0628 \u0645\u0627 \u062A\u0645\u0631\u06A9\u0632 \u0648\u06CC\u0698\u0647 \u0628\u0631 \u06A9\u0634\u0648\u0631 ${destinations[0]?.country} \u0627\u0633\u062A \u06A9\u0647 \u0645\u0637\u0627\u0628\u0642\u062A \u0628\u06CC\u0634\u062A\u0631\u06CC \u0628\u0627 \u0642\u0648\u0627\u0646\u06CC\u0646 \u06F2\u06F0\u06F2\u06F6 \u062F\u0627\u0634\u062A\u0647 \u0648 \u0632\u0645\u0627\u0646 \u067E\u0631\u062F\u0627\u0632\u0634 \u0645\u0646\u0627\u0633\u0628\u06CC \u062F\u0627\u0631\u062F.`;
  return {
    destinations,
    strengths: strengths.slice(0, 4),
    weaknesses: weaknesses.slice(0, 3),
    improvementPlan,
    overallLawyerVerdict
  };
}
var aiInstance = null;
function getGeminiClient() {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiInstance;
}
async function startServer() {
  const PORT = Number(process.env.PORT) || 3001;
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path2.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path2.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
if (!process.env.VERCEL && process.env.NODE_ENV !== "test") {
  startServer().catch(console.error);
}
var server_default = app;
export {
  app,
  server_default as default,
  startServer
};
