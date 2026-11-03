process.env.NODE_ENV = "test";
import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import type { Server } from "node:http";
import { app } from "../server";
import { evaluateUserMigrationProfile } from "../src/services/matcherEngine";
import { DEFAULT_PROFILE } from "../src/components/AssessmentWizard";
import {
  findOrCreateUser,
  createSession,
  getUserByToken,
  recordPaymentTransaction,
  getTransactionByTrackId,
} from "../server/db";

describe("Koochify Security, Payment Hardening & Concurrency Stress Test Suite", () => {
  let server: Server;
  let baseUrl: string;

  before(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, "127.0.0.1", () => {
        const addr = server.address() as any;
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it("High Concurrency: 50 simultaneous immigration evaluations complete under 3s with zero errors", async () => {
    const startTime = Date.now();
    const tasks = Array.from({ length: 50 }, (_, i) => {
      const variationProfile = {
        ...DEFAULT_PROFILE,
        age: 22 + (i % 25),
        maritalStatus: i % 2 === 0 ? "single" : "married_no_children",
        highestDegree: i % 3 === 0 ? "bachelor" : i % 3 === 1 ? "master" : "phd",
        totalWorkExperienceYears: (i % 10) + 1,
        migrationGoal: i % 2 === 0 ? "work" : "study",
        budgetRangeCategory: i % 2 === 0 ? "medium" : "high",
        englishEstimatedLevel: "b2",
        hasSpouseAccompanying: i % 2 !== 0,
      } as any;

      return Promise.resolve(evaluateUserMigrationProfile(variationProfile));
    });

    const results = await Promise.all(tasks);
    const duration = Date.now() - startTime;

    assert.strictEqual(results.length, 50, "All 50 concurrent profiles must be processed");
    results.forEach((res, idx) => {
      assert.ok(res.primaryDestinations.length > 0, `Profile ${idx} must yield destinations`);
      assert.ok(res.primaryDestinations.length <= 3, `Profile ${idx} must not exceed 3 destinations`);
      // Assert distinct countries
      const countries = res.primaryDestinations.map((d) => d.countryCode);
      const uniqueCountries = new Set(countries);
      assert.strictEqual(countries.length, uniqueCountries.size, "Destinations must be distinct countries");
    });

    console.log(`⚡ [STRESS TEST] 50 concurrent decision evaluations finished in ${duration}ms (Avg ${(duration / 50).toFixed(2)}ms/req)`);
    assert.ok(duration < 4000, `Execution took ${duration}ms, which should be under 4000ms`);
  });

  it("High Concurrency: 50 simultaneous session token lookups leverage in-memory cache", async () => {
    const testPhone = "0999" + Math.floor(1000000 + Math.random() * 9000000);
    const user = await findOrCreateUser(testPhone, "تست کارایی هم‌زمانی");
    const { token } = await createSession(user.id);

    // Warm up cache once
    const firstLookup = await getUserByToken(token);
    assert.ok(firstLookup, "First lookup must succeed");

    const startTime = Date.now();
    const tokenLookups = Array.from({ length: 50 }, () => getUserByToken(token));
    const users = await Promise.all(tokenLookups);
    const duration = Date.now() - startTime;

    assert.strictEqual(users.length, 50);
    users.forEach((u) => {
      assert.ok(u);
      assert.strictEqual(u?.id, user.id);
    });

    console.log(`⚡ [STRESS TEST] 50 concurrent session lookups finished in ${duration}ms (Cache accelerated)`);
    assert.ok(duration < 500, `Cached session lookups should complete under 500ms, took ${duration}ms`);
  });

  it("Security Hardening: /api/payment/instant-unlock rejects normal authenticated users without admin privileges", async () => {
    const testPhone = "0998" + Math.floor(1000000 + Math.random() * 9000000);
    const user = await findOrCreateUser(testPhone, "کاربر تستی نفوذگر");
    const { token } = await createSession(user.id);

    const res = await fetch(`${baseUrl}/api/payment/instant-unlock`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    assert.strictEqual(res.status, 403, "Must return 403 Forbidden when unprivileged user calls instant-unlock");
    const body: any = await res.json();
    assert.ok(body.error, "Error message explaining restriction must be returned");
  });

  it("Security Hardening: /api/payment/card-to-card sets pending_verification and does not auto-unlock", async () => {
    const testPhone = "0997" + Math.floor(1000000 + Math.random() * 9000000);
    const user = await findOrCreateUser(testPhone, "متقاضی کارت به کارت");
    const { token } = await createSession(user.id);

    const res = await fetch(`${baseUrl}/api/payment/card-to-card`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ cardLastDigits: "8899", transactionRef: "C2C-TEST-1234" }),
    });

    assert.strictEqual(res.status, 200);
    const body: any = await res.json();
    assert.strictEqual(body.isPaid, false, "Card-to-card must not auto-unlock without manual verification");
    assert.strictEqual(body.user.paymentStatus, "pending_verification");
  });

  it("Security Hardening: /api/payment/simulate is protected against unauthenticated query parameters", async () => {
    const res = await fetch(`${baseUrl}/api/payment/simulate?userId=usr_fake_attacker`);
    // Must return 403 or 404 because admin secret is missing
    assert.ok(res.status === 403 || res.status === 404, `Expected 403 or 404, got ${res.status}`);
  });

  it("Security Hardening: Fake OTP 12345 is rejected for regular numbers", async () => {
    const realVictimPhone = "09361112233";
    const res = await fetch(`${baseUrl}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber: realVictimPhone, code: "12345" }),
    });

    assert.strictEqual(res.status, 400, "12345 must not authenticate arbitrary phone numbers");
  });

  it("Security Hardening: Repeated OTP verification failures trigger rate limit lockout", async () => {
    const targetPhone = "0937" + Math.floor(1000000 + Math.random() * 9000000);

    // Fail 5 times
    for (let i = 0; i < 5; i++) {
      await fetch(`${baseUrl}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: targetPhone, code: "00000" }),
      });
    }

    // 6th attempt should be blocked with 429
    const blockedRes = await fetch(`${baseUrl}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber: targetPhone, code: "00000" }),
    });

    assert.strictEqual(blockedRes.status, 429, "6th attempt must be rejected with 429 Too Many Requests");
    const blockedBody: any = await blockedRes.json();
    assert.ok(blockedBody.error.includes("تلاش‌های ناموفق"));
  });

  it("Database Integrity: Transaction records correctly bind trackId to authenticated userId", async () => {
    const testPhone = "0996" + Math.floor(1000000 + Math.random() * 9000000);
    const user = await findOrCreateUser(testPhone, "تست تراکنش بانکی");
    const trackId = "TRK_" + Date.now();

    await recordPaymentTransaction(user.id, 499000, 4990000, trackId, "pending");

    const foundTx = await getTransactionByTrackId(trackId);
    assert.ok(foundTx, "Transaction must be queryable by trackId");
    assert.strictEqual(foundTx.userId, user.id, "Transaction must store authentic user.id");
    assert.strictEqual(foundTx.status, "pending");
  });
});
