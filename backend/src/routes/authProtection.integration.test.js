import { jest } from "@jest/globals";
import request from "supertest";

// mock 外部依賴：資料庫 model 和 Clerk
jest.unstable_mockModule("../models/Playground.js", () => ({
  default: { find: jest.fn(), findById: jest.fn(), create: jest.fn() },
}));

jest.unstable_mockModule("../models/Review.js", () => ({
  default: { find: jest.fn(), findById: jest.fn(), create: jest.fn() },
}));

jest.unstable_mockModule("@clerk/express", () => ({
  clerkMiddleware: jest.fn(() => (req, res, next) => next()),
  getAuth: jest.fn(),
}));

const { default: app } = await import("../app.js");
const { getAuth } = await import("@clerk/express");
const { default: Playground } = await import("../models/Playground.js");

describe("protected routes reject anonymous users", () => {
  beforeEach(() => {
    getAuth.mockReturnValue({ userId: null });
  });

  test.each([
    ["POST", "/api/playgrounds"],
    ["PATCH", "/api/playgrounds/p1"],
    ["DELETE", "/api/playgrounds/p1"],
    ["POST", "/api/playgrounds/p1/reviews"],
    ["DELETE", "/api/reviews/r1"],
  ])("%s %s returns 401 when not logged in", async (method, path) => {
    const res = await request(app)[method.toLowerCase()](path).send({});

    expect(res.status).toBe(401);
  });
});

/* ------------------------- 健康檢查、未知路徑，以及格式錯誤的 JSON ------------------------- */
describe("health and error responses", () => {
  test("GET /health returns 200", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.body).toEqual({
      success: true,
      status: "ok",
    });
  });

  test("unknown routes return JSON with 404", async () => {
    const res = await request(app).get("/api/not-a-real-route");

    expect(res.status).toBe(404);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.body).toEqual({
      success: false,
      error: "Route not found",
    });
  });

  test("malformed JSON returns a clear 400 error", async () => {
    const res = await request(app)
      .post("/api/playgrounds")
      .set("Content-Type", "application/json")
      .send('{"name": "Test"');

    expect(res.status).toBe(400);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.body).toEqual({
      success: false,
      error: "Invalid JSON format",
    });
  });

  //這個測試會模擬資料庫查詢失敗，確認 API 不會把內部錯誤傳給使用者，不會連線或修改真正的資料庫。
  test("database errors return 500 without exposing internal details", async () => {
    Playground.find.mockRejectedValueOnce(
      new Error("TEST_ONLY: private database connection details"),
    );

    const res = await request(app).get("/api/playgrounds");

    expect(res.status).toBe(500);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.body).toEqual({
      success: false,
      error: "Internal server error",
    });
    expect(res.text).not.toContain("TEST_ONLY");
  });
});
