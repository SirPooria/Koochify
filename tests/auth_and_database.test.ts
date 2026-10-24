import { describe, it } from "node:test";
import assert from "node:assert";
import {
  normalizePhoneNumber,
  createOtp,
  verifyOtpCode,
  findOrCreateUser,
  createSession,
  getUserByToken,
  deleteSession,
  updateUserProfile,
  saveAssessment,
  getUserAssessments,
  getUserAssessmentById,
  deleteUserAssessment,
  updateUserPayment,
  getAllLeadsForAdmin,
  findUserById,
} from "../server/db";

describe("Koochify Phone Authentication & User Dossier Database Suite", () => {
  it("Phone normalization accurately standardizes Iranian and Persian numerals", () => {
    // Standard English digits
    assert.strictEqual(normalizePhoneNumber("09123456789"), "09123456789");
    // Persian numerals
    assert.strictEqual(normalizePhoneNumber("۰۹۱۲۳۴۵۶۷۸۹"), "09123456789");
    // Formatted with spaces and dashes
    assert.strictEqual(normalizePhoneNumber(" 0912-345 6789 "), "09123456789");
    // International prefix +98
    assert.strictEqual(normalizePhoneNumber("+989123456789"), "09123456789");
    // 0098 prefix
    assert.strictEqual(normalizePhoneNumber("00989123456789"), "09123456789");
  });

  it("OTP generation and single-use verification operates securely", async () => {
    const testPhone = "09350001122";
    const { code, expiresAt } = await createOtp(testPhone);

    assert.ok(code.length === 5, "OTP code must be 5 digits");
    assert.ok(expiresAt > Date.now(), "Expiration must be in the future");

    // Invalid code check
    const wrongCheck = await verifyOtpCode(testPhone, "99999");
    assert.strictEqual(wrongCheck, false, "Wrong code must fail verification");

    // Valid code check
    const validCheck = await verifyOtpCode(testPhone, code);
    assert.strictEqual(validCheck, true, "Correct code must pass verification");

    // Replay attack prevention: used code cannot be verified twice
    const replayCheck = await verifyOtpCode(testPhone, code);
    assert.strictEqual(replayCheck, false, "Used code cannot be re-used");
  });

  it("User creation, session tokens and profile updating", async () => {
    const testPhone = "0919" + Math.floor(1000000 + Math.random() * 9000000);
    const user = await findOrCreateUser(testPhone, "پوریا رافوزه");

    assert.ok(user.id.startsWith("usr_"), "User id must have usr_ prefix");
    assert.strictEqual(user.phoneNumber, testPhone);
    assert.strictEqual(user.fullName, "پوریا رافوزه");
    assert.strictEqual(user.isPaid, false, "Default user isPaid must be false");
    assert.strictEqual(user.paymentStatus, "none", "Default paymentStatus must be none");

    // Create session token
    const { token } = await createSession(user.id);
    assert.ok(token && token.length === 64, "Session token must be 64-char crypto hex string");

    // Validate session
    const verifiedUser = await getUserByToken(token);
    assert.ok(verifiedUser, "Session must return active user");
    assert.strictEqual(verifiedUser?.id, user.id);

    // Update profile
    const updated = await updateUserProfile(user.id, "پوریا رافوزه (ویرایش‌شده)");
    assert.strictEqual(updated?.fullName, "پوریا رافوزه (ویرایش‌شده)");

    // Delete session
    await deleteSession(token);
    const expiredUser = await getUserByToken(token);
    assert.strictEqual(expiredUser, null, "Deleted session must return null");
  });

  it("Assessment dossiers persist in database and are queryable per user", async () => {
    const testPhone = "0910" + Math.floor(1000000 + Math.random() * 9000000);
    const user = await findOrCreateUser(testPhone, "کاربر مهاجرت");

    const mockProfile: any = {
      age: 28,
      migrationGoal: "work",
      primaryJobTitle: "Frontend Developer",
      highestDegree: "master",
    };

    const mockResults: any = {
      primaryDestinations: [
        {
          countryCode: "DE",
          countryNameFa: "آلمان",
          routeNameFa: "کارت شانس (Chancenkarte)",
          fitScore: 84,
          flagEmoji: "🇩🇪",
        },
        {
          countryCode: "CA",
          countryNameFa: "کانادا",
          routeNameFa: "اکسپرس اینتری (Express Entry)",
          fitScore: 78,
          flagEmoji: "🇨🇦",
        },
      ],
      profileStrengths: ["۴ سال سابقه کاری مستند", "مدرک ارشد مرتبط"],
    };

    // Save assessment
    const saved = await saveAssessment(user.id, mockProfile, mockResults, "پرونده مهاجرت کاری ۲۰۲۶");
    assert.ok(saved.id.startsWith("asmt_"), "Assessment record ID must start with asmt_");
    assert.strictEqual(saved.userId, user.id);
    assert.strictEqual(saved.title, "پرونده مهاجرت کاری ۲۰۲۶");

    // List user assessments
    const list = await getUserAssessments(user.id);
    assert.ok(list.length >= 1, "Must find saved assessment in list");
    const foundSummary = list.find((a) => a.id === saved.id);
    assert.ok(foundSummary, "Dossier must exist in user assessment list");
    assert.strictEqual(foundSummary?.primaryDestinations[0].countryCode, "DE");

    // Fetch full record by ID
    const full = await getUserAssessmentById(saved.id, user.id);
    assert.ok(full, "Full record must be returned");
    assert.strictEqual(full?.profileData.primaryJobTitle, "Frontend Developer");
    assert.strictEqual(full?.resultsData.primaryDestinations[0].countryNameFa, "آلمان");

    // User isolation check: another user cannot fetch this assessment
    const otherUser = await findOrCreateUser("09339998877", "کاربر ناشناس");
    const unauthorizedAccess = await getUserAssessmentById(saved.id, otherUser.id);
    assert.strictEqual(unauthorizedAccess, null, "Unauthorized user cannot access another user's dossier");

    // Delete assessment
    const isDeleted = await deleteUserAssessment(saved.id, user.id);
    assert.strictEqual(isDeleted, true, "Delete must succeed");
    const deletedCheck = await getUserAssessmentById(saved.id, user.id);
    assert.strictEqual(deletedCheck, null, "Deleted assessment should not be found");
  });

  it("User payment update and admin lead extraction", async () => {
    const testPhone = "0912" + Math.floor(1000000 + Math.random() * 9000000);
    const user = await findOrCreateUser(testPhone, "مشتری پرداختی");

    // Initially unpaid
    assert.strictEqual(user.isPaid, false);
    assert.strictEqual(user.paymentStatus, "none");

    // Submit card to card pending
    const pendingUser = await updateUserPayment(user.id, false, "pending_verification", "REF-9988", "1234");
    assert.ok(pendingUser);
    assert.strictEqual(pendingUser?.isPaid, false);
    assert.strictEqual(pendingUser?.paymentStatus, "pending_verification");
    assert.strictEqual(pendingUser?.cardLastDigits, "1234");
    assert.strictEqual(pendingUser?.paymentRef, "REF-9988");

    // Confirm payment (unlock subscription)
    const paidUser = await updateUserPayment(user.id, true, "paid", "REF-9988-CONFIRMED");
    assert.ok(paidUser);
    assert.strictEqual(paidUser?.isPaid, true);
    assert.strictEqual(paidUser?.paymentStatus, "paid");
    assert.ok(paidUser?.paidAt, "paidAt timestamp must be recorded");

    // Verify findUserById
    const fetched = await findUserById(user.id);
    assert.strictEqual(fetched?.id, user.id);
    assert.strictEqual(fetched?.isPaid, true);

    // Verify admin leads list contains user and payment details
    const leads = await getAllLeadsForAdmin();
    assert.ok(Array.isArray(leads));
    const lead = leads.find((l) => l.id === user.id);
    assert.ok(lead, "Admin leads must include created user");
    assert.strictEqual(lead?.phoneNumber, testPhone);
    assert.strictEqual(lead?.isPaid, true);
    assert.strictEqual(lead?.paymentStatus, "paid");
  });
});
