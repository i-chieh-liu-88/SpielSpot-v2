import { jest } from "@jest/globals";
import request from "supertest";

// 1. 先 mock 掉外部依賴：資料庫 model 和 Clerk
jest.unstable_mockModule("../models/Playground.js", () => ({
  default: { find: jest.fn(), findById: jest.fn(), create: jest.fn() },
}));

jest.unstable_mockModule("../models/Review.js", () => ({
  default: { find: jest.fn(), findById: jest.fn(), create: jest.fn(), exists: jest.fn() },
}));

jest.unstable_mockModule("@clerk/express", () => ({
  clerkMiddleware: jest.fn(() => (req, res, next) => next()),
  getAuth: jest.fn(),
}));

// 2. mock 設定好之後，才動態載入 app 跟要控制的 mock
const { default: app } = await import("../app.js");
const Playground = (await import("../models/Playground.js")).default;
const Review = (await import("../models/Review.js")).default;
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

/* ---------------------------- PATCH 的 ownership --------------------------- */
/* ---------------------------- PATCH 的 ownership --------------------------- */
/* ---------------------------- PATCH 的 ownership --------------------------- */
describe("PATCH /api/playgrounds/:id (ownership)", () => {
  beforeEach(() => {
    getAuth.mockReturnValue({ userId: null });
  });

  test("returns 403 and does not save when the user is not the owner", async () => {
    getAuth.mockReturnValue({ userId: "user-not-owner" });
    const fake = { ownerId: "user-real-owner", save: jest.fn() };
    Playground.findById.mockResolvedValue(fake);

    const res = await request(app)
      .patch("/api/playgrounds/p1")
      .send({ name: "Hacked Name" })
      .expect(403);

    expect(res.body).toEqual({
      success: false,
      error: "Not allowed to edit this playground",
    });
    expect(fake.save).not.toHaveBeenCalled();
  });

  test("returns 200 and saves when the user is the owner", async () => {
    getAuth.mockReturnValue({ userId: "user-real-owner" });
    const fake = {
      ownerId: "user-real-owner",
      name: "Old Name",
      save: jest.fn().mockResolvedValue(true),
    };
    Playground.findById.mockResolvedValue(fake);

    const res = await request(app)
      .patch("/api/playgrounds/p1")
      .send({ name: "New Name" })
      .expect(200);

    expect(fake.save).toHaveBeenCalled();
    expect(res.body.data.name).toBe("New Name");
  });

  test("does not let the owner change ownerId through the body", async () => {
    getAuth.mockReturnValue({ userId: "user-real-owner" });
    const fake = {
      ownerId: "user-real-owner",
      name: "Old Name",
      save: jest.fn().mockResolvedValue(true),
    };
    Playground.findById.mockResolvedValue(fake);

    await request(app)
      .patch("/api/playgrounds/p1")
      .send({ name: "New Name", ownerId: "someone-else" })
      .expect(200);

    expect(fake.ownerId).toBe("user-real-owner");
  });
});
/* --------------------------- DELETE 的 ownership --------------------------- */
/* --------------------------- DELETE 的 ownership --------------------------- */
/* --------------------------- DELETE 的 ownership --------------------------- */
describe("DELETE /api/playgrounds/:id (ownership)", () => {
  // 這組 test 會經過真正的 Express route，但 Clerk 與資料庫 model 都是 mock。
  // 不會連接 Atlas 或刪除真實資料；驗證的是 HTTP 回應與 model 是否被呼叫。
  beforeEach(() => {
    getAuth.mockReturnValue({ userId: null });
    // 每個 test 預設沒有評論，並清除上一個 test 的查詢結果。
    // exists 找到資料會回傳含 _id 的物件，找不到則回傳 null。
    Review.exists.mockReset().mockResolvedValue(null);
  });

  // 未登入應在 requireLogin 被擋下，不應查詢遊樂場或評論。
  test("returns 401 without looking up data when signed out", async () => {
    await request(app).delete("/api/playgrounds/p1").expect(401);
    expect(Playground.findById).not.toHaveBeenCalled();
    expect(Review.exists).not.toHaveBeenCalled();
  });

  // 已登入但遊樂場不存在時回傳 404，不應繼續查詢相關評論。
  test("returns 404 when the playground does not exist", async () => {
    getAuth.mockReturnValue({ userId: "user-real-owner" });
    Playground.findById.mockResolvedValue(null);
    await request(app).delete("/api/playgrounds/p1").expect(404);
    expect(Review.exists).not.toHaveBeenCalled();
  });

  // 模擬非擁有者在 request body 偽造 ownerId。
  // 權限仍以 Clerk userId 與資料庫 ownerId 比對，必須回傳 403 且不刪除。
  test("spoofing ownerId in the body does not grant deletion permission", async () => {
    getAuth.mockReturnValue({ userId: "user-not-owner" });
    const fake = { ownerId: "user-real-owner", deleteOne: jest.fn() };
    Playground.findById.mockResolvedValue(fake);
    await request(app)
      .delete("/api/playgrounds/p1")
      .send({ ownerId: "user-not-owner" })
      .expect(403);
    expect(fake.deleteOne).not.toHaveBeenCalled();
    expect(Review.exists).not.toHaveBeenCalled();
  });

  // 即使是擁有者，只要有評論指向這個遊樂場，也必須回傳 409。
  // 確認查詢使用正確的 playgroundId，且 playground.deleteOne 沒有被呼叫。
  test("returns 409 and keeps the playground when related reviews exist", async () => {
    getAuth.mockReturnValue({ userId: "user-real-owner" });
    const fake = { _id: "p1", ownerId: "user-real-owner", deleteOne: jest.fn() };
    Playground.findById.mockResolvedValue(fake);
    Review.exists.mockResolvedValue({ _id: "review1" });
    const res = await request(app).delete("/api/playgrounds/p1").expect(409);
    expect(res.body).toEqual({ success: false, error: "Cannot delete a playground with reviews" });
    expect(Review.exists).toHaveBeenCalledWith({ playgroundId: "p1" });
    expect(fake.deleteOne).not.toHaveBeenCalled();
  });

  // 模擬資料庫查詢失敗：無法確認是否有評論時，應停止刪除。
  // 對外只回傳通用 500 訊息，不洩漏資料庫錯誤細節。
  test("does not delete when checking related reviews fails", async () => {
    getAuth.mockReturnValue({ userId: "user-real-owner" });
    const fake = { _id: "p1", ownerId: "user-real-owner", deleteOne: jest.fn() };
    Playground.findById.mockResolvedValue(fake);
    Review.exists.mockRejectedValue(new Error("Database unavailable"));
    const res = await request(app).delete("/api/playgrounds/p1").expect(500);
    expect(res.body.error).toBe("Internal server error");
    expect(fake.deleteOne).not.toHaveBeenCalled();
  });

  // 一般非擁有者的刪除請求應被拒絕，不可呼叫 deleteOne。
  test("returns 403 and does not delete when the user is not the owner", async () => {
    getAuth.mockReturnValue({ userId: "user-not-owner" });
    const fake = { ownerId: "user-real-owner", deleteOne: jest.fn() };
    Playground.findById.mockResolvedValue(fake);

    const res = await request(app).delete("/api/playgrounds/p1").expect(403);

    expect(res.body).toEqual({
      success: false,
      error: "Not allowed to delete this playground",
    });
    expect(fake.deleteOne).not.toHaveBeenCalled();
  });

  // 成功情境：登入者是擁有者，而且預設的評論查詢結果為 null。
  // 必須先檢查相關評論，再刪除遊樂場，並回傳 200 與 data: null。
  test("returns 200 and deletes when the user is the owner", async () => {
    getAuth.mockReturnValue({ userId: "user-real-owner" });
    const fake = {
      _id: "p1",
      ownerId: "user-real-owner",
      deleteOne: jest.fn().mockResolvedValue(true),
    };
    Playground.findById.mockResolvedValue(fake);

    const res = await request(app).delete("/api/playgrounds/p1").expect(200);

    expect(fake.deleteOne).toHaveBeenCalled();
    expect(Review.exists).toHaveBeenCalledWith({ playgroundId: "p1" });
    expect(res.body).toEqual({ success: true, data: null });
  });
});
