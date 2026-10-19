import { jest } from "@jest/globals";
import request from "supertest";

// Exercise real routing, login checks and controller; isolate external services.
// Route tests mock transaction execution; real database concurrency is separate.
jest.unstable_mockModule("../services/relationshipTransaction.js", () => ({
  runRelationshipTransaction: work => work(),
  lockPlayground: jest.fn(),
  relationshipError: (status, message) => Object.assign(new Error(message), { status, relationship: true }),
}));
jest.unstable_mockModule("../models/Review.js", () => ({
  default: { findById: jest.fn(), create: jest.fn() },
}));
jest.unstable_mockModule("@clerk/express", () => ({
  clerkMiddleware: jest.fn(() => (req, res, next) => next()),
  getAuth: jest.fn(),
}));
jest.unstable_mockModule("../models/Playground.js", () => ({
  default: { findById: jest.fn() },
}));

const { default: app } = await import("../app.js");
const Review = (await import("../models/Review.js")).default;
const Playground = (await import("../models/Playground.js")).default;
const { getAuth } = await import("@clerk/express");
const reviewId = "507f1f77bcf86cd799439011";
const playgroundId = "607f1f77bcf86cd799439099";
const validReviewBody = {
  playgroundName: "Stadtpark Spielplatz",
  location: "Essen",
  ageGroup: "3-8",
  facilities: ["sandbox", "swing"],
  safetyRating: "4",
  overallRating: "5",
  recommendation: "Highly recommend",
  review: "小朋友玩得很開心，設施很新",
  parentName: "Test Parent",
};
let deleteOne;

describe("review rating validation on POST and PATCH", () => {
  // 兩個欄位、兩種寫入路由都必須拒絕非法評分，且不能進入資料庫操作。
  test.each(["0", "6", "3.5", "bad", "", 3, null, ["3"], { value: "3" }])(
    "rejects rating %j on both write routes", async (value) => {
      for (const field of ["safetyRating", "overallRating"]) {
        await request(app).post(`/api/playgrounds/${playgroundId}/reviews`)
          .send({ ...validReviewBody, [field]: value }).expect(400);
        await request(app).patch(`/api/reviews/${reviewId}`)
          .send({ [field]: value }).expect(400);
      }
      expect(Playground.findById).not.toHaveBeenCalled();
      expect(Review.create).not.toHaveBeenCalled();
      expect(Review.findById).not.toHaveBeenCalled();
    },
  );

  test.each(["1", "2", "3", "4", "5", " 3 "])("accepts string rating %s", async (value) => {
    Review.create.mockResolvedValue({ _id: reviewId });
    await request(app).post(`/api/playgrounds/${playgroundId}/reviews`)
      .send({ ...validReviewBody, safetyRating: value, overallRating: value }).expect(201);
    expect(Review.create).toHaveBeenCalledWith(expect.objectContaining({
      safetyRating: value.trim(), overallRating: value.trim(),
    }));
    const fake = { authorId: "user-author", save: jest.fn().mockResolvedValue(true) };
    Review.findById.mockResolvedValue(fake);
    await request(app).patch(`/api/reviews/${reviewId}`)
      .send({ safetyRating: value, overallRating: value }).expect(200);
    expect(fake.safetyRating).toBe(value.trim());
    expect(fake.overallRating).toBe(value.trim());
  });

  test("PATCH can still update text without supplying ratings", async () => {
    const fake = { authorId: "user-author", overallRating: "4", save: jest.fn().mockResolvedValue(true) };
    Review.findById.mockResolvedValue(fake);
    await request(app).patch(`/api/reviews/${reviewId}`).send({ review: "Updated text" }).expect(200);
    expect(fake.overallRating).toBe("4");
    expect(fake.save).toHaveBeenCalledTimes(1);
  });
});

beforeEach(() => {
  jest.resetAllMocks();
  getAuth.mockReturnValue({ userId: "user-author" });
  Playground.findById.mockResolvedValue({ _id: playgroundId }); //預設「存在」
  //因為現在每一個 POST review 的測試都會先經過 Playground.findById，如果沒有預設值，所有 POST 測試都會因為 findById 回傳 undefined 而被誤判成「playground 不存在」，連帶讓本來該成功的測試也失敗。
  deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });
  Review.findById.mockResolvedValue({ authorId: "user-author", deleteOne });
});

/* --------------------------------- DELETE --------------------------------- */
/* --------------------------------- DELETE --------------------------------- */
/* --------------------------------- DELETE --------------------------------- */
describe("DELETE /api/reviews/:id", () => {
  test("author can delete their review", async () => {
    const res = await request(app)
      .delete(`/api/reviews/${reviewId}`)
      .expect(200);
    expect(res.body).toEqual({ success: true, data: null });
    expect(Review.findById).toHaveBeenCalledWith(reviewId);
    expect(deleteOne).toHaveBeenCalledTimes(1);
  });

  test("another user cannot delete the review", async () => {
    getAuth.mockReturnValue({ userId: "user-other" });
    const res = await request(app)
      .delete(`/api/reviews/${reviewId}`)
      .expect(403);
    expect(res.body).toEqual({
      success: false,
      error: "Not allowed to delete this review",
    });
    expect(deleteOne).not.toHaveBeenCalled();
  });

  test("spoofing authorId in the request does not grant permission", async () => {
    getAuth.mockReturnValue({ userId: "user-other" });
    await request(app)
      .delete(`/api/reviews/${reviewId}`)
      .send({ authorId: "user-author" })
      .expect(403);
    expect(deleteOne).not.toHaveBeenCalled();
  });

  test("anonymous requests are rejected before accessing the database", async () => {
    getAuth.mockReturnValue({ userId: null });
    const res = await request(app)
      .delete(`/api/reviews/${reviewId}`)
      .expect(401);
    expect(res.body).toEqual({ success: false, error: "Please login" });
    expect(Review.findById).not.toHaveBeenCalled();
    expect(deleteOne).not.toHaveBeenCalled();
  });

  test("a missing review returns 404 without deleting anything", async () => {
    Review.findById.mockResolvedValue(null);
    const res = await request(app)
      .delete(`/api/reviews/${reviewId}`)
      .expect(404);
    expect(res.body).toEqual({ success: false, error: "Review not found" });
    expect(deleteOne).not.toHaveBeenCalled();
  });
});

/* ---------------------------------- POST ---------------------------------- */
/* ---------------------------------- POST ---------------------------------- */
/* ---------------------------------- POST ---------------------------------- */
describe("POST /api/playgrounds/:id/reviews", () => {
  test("returns 400 when a required field is missing", async () => {
    const { review, ...incomplete } = validReviewBody;
    //用解構賦值把 review 這個欄位單獨挑出來丟掉，incomplete 就是「除了 review 以外的其他欄位」。
    // 這樣送出去一定會被 Zod 擋下來，因為 review 是必填。

    const res = await request(app)
      .post(`/api/playgrounds/${playgroundId}/reviews`)
      .send(incomplete)
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(Review.create).not.toHaveBeenCalled();
  });

  //成功建立
  test("creates the review with the logged-in user as author", async () => {
    //Arrange，先假裝資料庫存好之後會回傳什麼
    Review.create.mockResolvedValue({
      _id: "new-review-id",
      ...validReviewBody,
      authorId: "user-author",
      playgroundId,
    });

    //Act，送出一份完整合法的資料。
    const res = await request(app)
      .post(`/api/playgrounds/${playgroundId}/reviews`)
      .send(validReviewBody)
      .expect(201);

    //Assert
    expect(Review.create).toHaveBeenCalledWith(
      expect.objectContaining({
        authorId: "user-author",
        playgroundId,
      }),
    );
    //這個物件裡至少包含這幾個欄位，其他欄位有沒有不管」。因為 Review.create 實際被呼叫時，
    // 傳入的物件其實是 { ...validReviewBody, playgroundId, authorId }，欄位很多，
    // 我們只關心其中兩個關鍵的：authorId 有沒有正確是登入者、playgroundId 有沒有正確從網址帶進去
    // （而不是要前端自己填）。
    expect(res.body.data.authorId).toBe("user-author");
  });

  //防偽造
  test("spoofing authorId in the body does not override the real author", async () => {
    Review.create.mockResolvedValue({
      _id: "new-review-id",
      ...validReviewBody,
      authorId: "user-author",
      playgroundId,
    });

    await request(app)
      .post(`/api/playgrounds/${playgroundId}/reviews`)
      .send({ ...validReviewBody, authorId: "someone-else" })
      .expect(201);

    expect(Review.create).toHaveBeenCalledWith(
      expect.objectContaining({ authorId: "user-author" }),
    );
  });

  test("returns 404 when the playground does not exist", async () => {
    Playground.findById.mockResolvedValue(null);

    const res = await request(app)
      .post(`/api/playgrounds/${playgroundId}/reviews`)
      .send(validReviewBody)
      .expect(404);

    expect(res.body).toEqual({
      success: false,
      error: "Playground not found",
    });
    expect(Review.create).not.toHaveBeenCalled();
  }); //這個測試在做什麼：故意讓 Playground.findById 回傳 null（模擬 id 不存在），驗證兩件事：
  // 1. 狀態碼是 404，不是之前那種會直接成功建立孤兒資料的 201
  // 2. Review.create 完全沒被呼叫（證明漏洞真的被擋住了，不是只有回應訊息對了但背地裡還是建立了資料）
});

/* ---------------------------------- PATCH --------------------------------- */
/* ---------------------------------- PATCH --------------------------------- */
/* ---------------------------------- PATCH --------------------------------- */

describe("PATCH /api/reviews/:id", () => {
  test("author can update their own review", async () => {
    const fake = {
      authorId: "user-author",
      review: "Old text",
      save: jest.fn().mockResolvedValue(true),
    };
    Review.findById.mockResolvedValue(fake);

    const res = await request(app)
      .patch(`/api/reviews/${reviewId}`)
      .send({ review: "Updated text" })
      .expect(200);

    expect(fake.save).toHaveBeenCalled();
    expect(fake.review).toBe("Updated text");
  });

  test("another user cannot update the review", async () => {
    getAuth.mockReturnValue({ userId: "user-other" });
    const fake = { authorId: "user-author", save: jest.fn() };
    Review.findById.mockResolvedValue(fake);

    const res = await request(app)
      .patch(`/api/reviews/${reviewId}`)
      .send({ review: "Hacked" })
      .expect(403);

    expect(fake.save).not.toHaveBeenCalled();
  });
});
