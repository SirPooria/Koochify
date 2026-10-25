import { describe, it } from "node:test";
import assert from "node:assert";
import {
  normalizeIranPhone,
  maskPhone,
  maskOtp,
  extractProviderResult,
  isSuccessResult,
} from "../server/smsService";

describe("Melipayamak SMS Provider & Pattern 567584 Integration Suite", () => {
  it("normalizeIranPhone accurately standardizes Iranian numbers", () => {
    assert.strictEqual(normalizeIranPhone("09123456789"), "09123456789");
    assert.strictEqual(normalizeIranPhone("+989123456789"), "09123456789");
    assert.strictEqual(normalizeIranPhone("00989123456789"), "09123456789");
    assert.strictEqual(normalizeIranPhone("9123456789"), "09123456789");
    assert.strictEqual(normalizeIranPhone("۰۹۱۲۳۴۵۶۷۸۹"), "09123456789");
    assert.strictEqual(normalizeIranPhone(" ۰۹۱۲-۳۴۵-۶۷۸۹ "), "09123456789");
  });

  it("maskPhone and maskOtp mask sensitive data for log security", () => {
    assert.strictEqual(maskPhone("09123456789"), "0912***6789");
    assert.strictEqual(maskOtp("54321"), "54**1");
  });

  it("extractProviderResult parses XML strings and clean responses correctly", () => {
    const xml1 = '<?xml version="1.0" encoding="utf-8"?><string xmlns="http://tempuri.org/">59281729381</string>';
    assert.strictEqual(extractProviderResult(xml1), "59281729381");

    const xml2 = '<SendByBaseNumber2Result>789123456</SendByBaseNumber2Result>';
    assert.strictEqual(extractProviderResult(xml2), "789123456");

    const raw = "  1234567890  ";
    assert.strictEqual(extractProviderResult(raw), "1234567890");

    const errXml = '<string xmlns="http://tempuri.org/">17</string>';
    assert.strictEqual(extractProviderResult(errXml), "17");
  });

  it("isSuccessResult distinguishes Melipayamak recIds from provider error codes", () => {
    // Valid RecIds
    assert.strictEqual(isSuccessResult("59281729381"), true);
    assert.strictEqual(isSuccessResult("100254001"), true);
    assert.strictEqual(isSuccessResult("98234512"), true);

    // Error codes
    assert.strictEqual(isSuccessResult("0"), false); // Auth failed
    assert.strictEqual(isSuccessResult("2"), false); // Credit insufficient
    assert.strictEqual(isSuccessResult("17"), false); // Pattern not found
    assert.strictEqual(isSuccessResult("35"), false); // Blacklisted
    assert.strictEqual(isSuccessResult("-1"), false); // Negative error
    assert.strictEqual(isSuccessResult("unknown"), false); // Not numeric
  });
});
