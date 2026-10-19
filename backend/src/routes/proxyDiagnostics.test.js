import { jest, beforeEach, afterEach, test, expect } from "@jest/globals";
import express from "express";
import request from "supertest";
jest.unstable_mockModule("@clerk/express", () => ({ getAuth: jest.fn() }));
const { getAuth } = await import("@clerk/express");
const { proxyDiagnostics } = await import("./proxyDiagnostics.js");
const app = express();
app.use("/diagnostic", proxyDiagnostics);
const previous = process.env.PROXY_DIAGNOSTICS_ENABLED;
afterEach(() => {
  if (previous === undefined) delete process.env.PROXY_DIAGNOSTICS_ENABLED;
  else process.env.PROXY_DIAGNOSTICS_ENABLED = previous;
});
beforeEach(() => { getAuth.mockReturnValue({ userId: "tester" }); });
test("disabled by default even for signed-in users", async () => {
  delete process.env.PROXY_DIAGNOSTICS_ENABLED;
  await request(app).get("/diagnostic").expect(404);
});
test("requires authentication when explicitly enabled", async () => {
  process.env.PROXY_DIAGNOSTICS_ENABLED = "true";
  getAuth.mockReturnValue({});
  await request(app).get("/diagnostic").expect(401);
});
test("returns structure without leaking IP addresses or bearer tokens", async () => {
  process.env.PROXY_DIAGNOSTICS_ENABLED = "true";
  const response = await request(app).get("/diagnostic")
    .set("X-Forwarded-For", "198.51.100.3, 203.0.113.9")
    .set("Authorization", "Bearer example-private-value").expect(200);
  expect(response.body.data).toMatchObject({ forwardedForEntries: 2, allEntriesAreIPs: true, trustedProxyHops: 0 });
  expect(response.text).not.toContain("198.51.100");
  expect(response.text).not.toContain("203.0.113");
  expect(response.text).not.toContain("example-private-value");
  expect(response.headers["cache-control"]).toBe("no-store");
});
test("reports invalid address format without reflecting attacker input", async () => {
  process.env.PROXY_DIAGNOSTICS_ENABLED = "true";
  const response = await request(app).get("/diagnostic").set("X-Forwarded-For", "invalid-entry").expect(200);
  expect(response.body.data.allEntriesAreIPs).toBe(false);
  expect(response.text).not.toContain("invalid-entry");
});

test("compares a known client IP without returning the address", async () => {
  process.env.PROXY_DIAGNOSTICS_ENABLED = "true";
  const response = await request(app).get("/diagnostic")
    .set("X-Forwarded-For", "203.0.113.8, 192.0.2.2, 192.0.2.3")
    .set("X-Diagnostic-Client-IP", "203.0.113.8").expect(200);
  expect(response.body.data.matchingHopsFromApp).toEqual([3]);
  expect(response.text).not.toContain("203.0.113");
});
test("does not infer trust when the supplied IP is absent", async () => {
  process.env.PROXY_DIAGNOSTICS_ENABLED = "true";
  const response = await request(app).get("/diagnostic")
    .set("X-Forwarded-For", "192.0.2.2")
    .set("X-Diagnostic-Client-IP", "203.0.113.8").expect(200);
  expect(response.body.data.matchingHopsFromApp).toEqual([]);
});
