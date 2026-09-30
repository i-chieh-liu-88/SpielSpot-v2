import { jest } from "@jest/globals";
import request from "supertest";

// 1. 先 mock 掉外部依賴：資料庫 model 和 Clerk
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

// 2. mock 設定好之後，才動態載入 app 跟要控制的 mock
const { default: app } = await import("../app.js");
const Playground = (await import("../models/Playground.js")).default;
const { getAuth } = await import("@clerk/express");

const validBody = {
  name: "Stadtpark Spielplatz",
  location: "Stadtpark 1, Essen",
  latitude: 51.45,
  longitude: 7.01,
};

describe("Playground endpoints (integration)", () => {
  beforeEach(() => {
    // 預設是「沒登入」，需要登入的測試再自己覆蓋
    getAuth.mockReturnValue({ userId: null });
  });

  test("GET /api/playgrounds returns the list", async () => {
    const fake = [{ _id: "1", name: "Test Playground" }];
    Playground.find.mockResolvedValue(fake);

    const res = await request(app).get("/api/playgrounds").expect(200);

    expect(res.body).toEqual({ success: true, data: fake });
  });

  test("GET /api/playgrounds/:id returns 404 when not found", async () => {
    Playground.findById.mockResolvedValue(null);

    const res = await request(app).get("/api/playgrounds/abc123").expect(404);

    expect(res.body).toEqual({ success: false, error: "Playground not found" });
  });

  test("POST /api/playgrounds returns 401 when not logged in", async () => {
    const res = await request(app)
      .post("/api/playgrounds")
      .send(validBody)
      .expect(401);

    expect(res.body).toEqual({ success: false, error: "Please login" });
    expect(Playground.create).not.toHaveBeenCalled();
  });

  test("POST /api/playgrounds returns 400 when latitude is not a number", async () => {
    getAuth.mockReturnValue({ userId: "user-abc" });

    const res = await request(app)
      .post("/api/playgrounds")
      .send({ ...validBody, latitude: "abc" })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(Playground.create).not.toHaveBeenCalled();
  });

  test("POST /api/playgrounds creates with the logged-in user as owner", async () => {
    getAuth.mockReturnValue({ userId: "user-abc" });
    Playground.create.mockResolvedValue({
      _id: "new1",
      ...validBody,
      ownerId: "user-abc",
    });

    // 故意在 body 塞一個假的 ownerId，就像你昨天在 Postman 測的那樣
    const res = await request(app)
      .post("/api/playgrounds")
      .send({ ...validBody, ownerId: "hacker-999" })
      .expect(201);

    expect(Playground.create).toHaveBeenCalledWith(
      expect.objectContaining({ ownerId: "user-abc" }),
    );
    expect(res.body.data.ownerId).toBe("user-abc");
  });
});
