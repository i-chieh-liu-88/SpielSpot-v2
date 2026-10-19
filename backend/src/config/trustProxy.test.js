import { describe, test, expect } from "@jest/globals";
import express from "express";
import request from "supertest";
import { rateLimit } from "express-rate-limit";
import { configureTrustProxy } from "./trustProxy.js";

function example(hops) {
  const app = express();
  configureTrustProxy(app, hops);
  app.use(rateLimit({ windowMs: 60000, limit: 2, validate: false }));
  app.get("/", (req, res) => res.json({ ip: req.ip }));
  return app;
}

describe("bounded proxy trust", () => {
  test.each(["true", "-1", "6", "1.5", "1x"])("rejects invalid setting %s", value => {
    expect(() => configureTrustProxy(express(), value)).toThrow("TRUST_PROXY_HOPS");
  });
  test("direct mode ignores a forged forwarded address", async () => {
    const app = example("0");
    const first = await request(app).get("/").set("X-Forwarded-For", "203.0.113.1");
    const second = await request(app).get("/").set("X-Forwarded-For", "203.0.113.2");
    expect(first.body.ip).toBe(second.body.ip);
    await request(app).get("/").set("X-Forwarded-For", "203.0.113.3").expect(429);
  });
  test("one trusted proxy separates visitors and ignores a forged leftmost prefix", async () => {
    const app = example("1");
    await request(app).get("/").set("X-Forwarded-For", "198.51.100.1, 203.0.113.10").expect(200);
    const same = await request(app).get("/").set("X-Forwarded-For", "198.51.100.2, 203.0.113.10").expect(200);
    expect(same.body.ip).toBe("203.0.113.10");
    await request(app).get("/").set("X-Forwarded-For", "198.51.100.3, 203.0.113.10").expect(429);
    await request(app).get("/").set("X-Forwarded-For", "198.51.100.3, 203.0.113.11").expect(200);
  });
});
