import fs from "node:fs";
import path from "node:path";
import { supabase } from "./db.ts";

interface SystemSettings {
  assessmentPriceTomans: number;
  updatedAt: string;
}

const SETTINGS_FILE_PATH = path.resolve(process.cwd(), "data", "settings.json");

const DEFAULT_SETTINGS: SystemSettings = {
  assessmentPriceTomans: 499000,
  updatedAt: new Date().toISOString(),
};

let cachedSettings: SystemSettings = { ...DEFAULT_SETTINGS };
let isInitialized = false;
let lastFetchedAt = 0;
const CACHE_TTL_MS = 15000; // 15 seconds cache TTL for multi-instance / serverless sync

// Read settings from local file fallback
function loadLocalFallbackSettings(): SystemSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const raw = fs.readFileSync(SETTINGS_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (typeof parsed.assessmentPriceTomans === "number") {
        return {
          assessmentPriceTomans: parsed.assessmentPriceTomans,
          updatedAt: parsed.updatedAt || new Date().toISOString(),
        };
      }
    }
  } catch {
    // Non-fatal, especially on read-only serverless
  }
  return { ...DEFAULT_SETTINGS };
}

// Save to local file fallback safely
function saveLocalFallbackSettings(settings: SystemSettings): void {
  try {
    const dir = path.dirname(SETTINGS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(settings, null, 2), "utf-8");
  } catch {
    // Ignore on read-only environments
  }
}

// Initial local load
cachedSettings = loadLocalFallbackSettings();

/**
 * Loads and syncs settings from Supabase database
 */
export async function refreshSettingsFromDatabase(force = false): Promise<SystemSettings> {
  const now = Date.now();
  if (!force && isInitialized && now - lastFetchedAt < CACHE_TTL_MS) {
    return cachedSettings;
  }

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("payment_transactions")
        .select("amount_tomans, raw_response, created_at")
        .eq("id", "tx_system_settings_config")
        .maybeSingle();

      if (!error && data) {
        const price = typeof data.amount_tomans === "number" ? data.amount_tomans : data.raw_response?.assessmentPriceTomans;
        if (typeof price === "number") {
          cachedSettings = {
            assessmentPriceTomans: price,
            updatedAt: data.raw_response?.updatedAt || data.created_at || new Date().toISOString(),
          };
          isInitialized = true;
          lastFetchedAt = now;
          return cachedSettings;
        }
      } else if (error) {
        console.warn("[SETTINGS] Supabase error fetching settings:", error.message);
      }
    } catch (dbErr) {
      console.warn("[SETTINGS] Could not fetch settings from Supabase, using cache:", dbErr);
    }
  }

  isInitialized = true;
  lastFetchedAt = now;
  return cachedSettings;
}

/**
 * Gets the current active assessment price in Tomans.
 * Syncs from database if not initialized or if cache TTL has expired.
 */
export async function getAssessmentPriceTomans(): Promise<number> {
  const now = Date.now();
  if (!isInitialized || now - lastFetchedAt >= CACHE_TTL_MS) {
    await refreshSettingsFromDatabase();
  }
  return cachedSettings.assessmentPriceTomans;
}

/**
 * Synchronous getter for backward compatibility where async is not yet awaited
 */
export function getAssessmentPriceTomansSync(): number {
  return cachedSettings.assessmentPriceTomans;
}

/**
 * Updates the assessment price in Tomans, persisting both to in-memory cache and Supabase
 */
export async function setAssessmentPriceTomans(price: number): Promise<number> {
  const safePrice = Math.max(0, Math.round(price));
  const now = new Date().toISOString();

  cachedSettings = {
    assessmentPriceTomans: safePrice,
    updatedAt: now,
  };
  isInitialized = true;
  lastFetchedAt = Date.now();

  // Persist to local fallback file
  saveLocalFallbackSettings(cachedSettings);

  // Persist to Supabase payment_transactions table
  if (supabase) {
    try {
      const { error } = await supabase.from("payment_transactions").upsert({
        id: "tx_system_settings_config",
        user_id: null,
        amount_tomans: safePrice,
        amount_rials: safePrice * 10,
        gateway: "system_settings",
        track_id: "SYSTEM_SETTINGS",
        status: "verified",
        raw_response: {
          assessmentPriceTomans: safePrice,
          updatedAt: now,
        },
      });

      if (error) {
        console.error("❌ [SUPABASE ERROR] Failed to persist system settings:", error.message);
      } else {
        console.log(`⚡ [SETTINGS] تعرفه ارزیابی در پایگاه داده ذخیره شد: ${safePrice.toLocaleString("fa-IR")} تومان`);
      }
    } catch (err) {
      console.error("❌ [SETTINGS] Exception persisting settings to Supabase:", err);
    }
  }

  return safePrice;
}
