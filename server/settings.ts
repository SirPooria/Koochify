import fs from "node:fs";
import path from "node:path";

interface SystemSettings {
  assessmentPriceTomans: number;
  updatedAt: string;
}

const SETTINGS_FILE_PATH = path.resolve(process.cwd(), "data", "settings.json");

const DEFAULT_SETTINGS: SystemSettings = {
  assessmentPriceTomans: 499000,
  updatedAt: new Date().toISOString(),
};

let cachedSettings: SystemSettings = loadSettings();

function loadSettings(): SystemSettings {
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
  } catch (err) {
    console.warn("[SETTINGS] Could not read settings file, using defaults:", err);
  }
  return { ...DEFAULT_SETTINGS };
}

function saveSettings(settings: SystemSettings): void {
  try {
    const dir = path.dirname(SETTINGS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(settings, null, 2), "utf-8");
  } catch (err) {
    console.error("[SETTINGS] Could not save settings file:", err);
  }
}

export function getAssessmentPriceTomans(): number {
  return cachedSettings.assessmentPriceTomans;
}

export function setAssessmentPriceTomans(price: number): number {
  const safePrice = Math.max(0, Math.round(price));
  cachedSettings = {
    assessmentPriceTomans: safePrice,
    updatedAt: new Date().toISOString(),
  };
  saveSettings(cachedSettings);
  console.log(`[SETTINGS] تعرفه ارزیابی هوشمند به‌روزرسانی شد: ${safePrice.toLocaleString("fa-IR")} تومان`);
  return safePrice;
}

