process.env.NODE_ENV = "test";
process.env.SUPABASE_URL = "disabled";
process.env.SUPABASE_SERVICE_ROLE_KEY = "disabled";

import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import http from "node:http";
import https from "node:https";

const originalFetch = globalThis.fetch;
const originalHttpsRequest = https.request;
let mockVerifyResult: Record<string, unknown> = { result: 100, refNumber: "test-ref" };

// Ensure callback verification stays local and cannot contact external services.
(https as any).request = () => {
  throw new Error("Proxy disabled in callback test");
};

const [{ app }, database] = await Promise.all([
  import("../server"),
  import("../server/db"),
]);

describe("Zibal payment callback", () => {
  let server: http.Server;
  let baseUrl: string;

  before(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, "127.0.0.1", () => {
        const address = server.address() as { port: number };
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });

    globalThis.fetch = async (input, init) => {
      const url = String(input);
      if (url.startsWith(baseUrl)) {
        return originalFetch(input, init);
      }
      assert.strictEqual(url, "https://gateway.zibal.ir/v1/verify");
      return new Response(JSON.stringify(mockVerifyResult), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    };
  });

  after(async () => {
    globalThis.fetch = originalFetch;
    (https as any).request = originalHttpsRequest;
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it("verifies the track ID even when callback flags say failure", async () => {
    const user = await database.findOrCreateUser("09120000000", "callback test");
    const trackId = `test-${Date.now()}`;
    await database.recordPaymentTransaction(user.id, 1000, 10000, trackId);

    const response = await originalFetch(
      `${baseUrl}/api/payment/zibal/callback?trackId=${trackId}&userId=${user.id}&success=0&status=-1`,
      { redirect: "manual" }
    );

    assert.strictEqual(response.status, 302);
    assert.match(response.headers.get("location") || "", /payment=success/);
    const updatedUser = await database.findUserById(user.id);
    assert.strictEqual(updatedUser?.isPaid, true);
  });

  it("reconciles a pending payment for its authenticated owner", async () => {
    const user = await database.findOrCreateUser("09120000001", "reconcile test");
    const { token } = await database.createSession(user.id);
    const trackId = String(Date.now());
    await database.recordPaymentTransaction(user.id, 1000, 10000, trackId);

    const response = await originalFetch(`${baseUrl}/api/payment/zibal/reconcile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ trackId }),
    });

    assert.strictEqual(response.status, 200);
    const result = await response.json() as { success: boolean; user: { isPaid: boolean } };
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.user.isPaid, true);
  });

  it("does not expose another user's payment transaction", async () => {
    const owner = await database.findOrCreateUser("09120000003", "transaction owner");
    const otherUser = await database.findOrCreateUser("09120000004", "other user");
    const { token } = await database.createSession(otherUser.id);
    const trackId = String(Date.now() + 2);
    await database.recordPaymentTransaction(owner.id, 1000, 10000, trackId);

    const response = await originalFetch(`${baseUrl}/api/payment/zibal/reconcile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ trackId }),
    });

    assert.strictEqual(response.status, 404);
  });

  it("leaves an unverified callback pending in the database", async () => {
    mockVerifyResult = { result: 102, message: "not paid" };
    const user = await database.findOrCreateUser("09120000002", "pending test");
    const trackId = String(Date.now() + 1);
    await database.recordPaymentTransaction(user.id, 1000, 10000, trackId);

    const response = await originalFetch(
      `${baseUrl}/api/payment/zibal/callback?trackId=${trackId}&userId=${user.id}&success=0&status=-1`,
      { redirect: "manual" }
    );

    assert.strictEqual(response.status, 302);
    assert.match(response.headers.get("location") || "", /payment=failed/);
    const transaction = await database.getTransactionByTrackId(trackId);
    assert.strictEqual(transaction?.status, "pending");
    const updatedUser = await database.findUserById(user.id);
    assert.strictEqual(updatedUser?.isPaid, false);
    mockVerifyResult = { result: 100, refNumber: "test-ref" };
  });
});