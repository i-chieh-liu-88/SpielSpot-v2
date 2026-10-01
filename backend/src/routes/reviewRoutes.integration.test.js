import { jest } from "@jest/globals";
import request from "supertest";

// Exercise real routing, login checks and controller; isolate external services.
jest.unstable_mockModule("../models/Review.js", () => ({
  default: { findById: jest.fn(), create: jest.fn() },
}));
jest.unstable_mockModule("@clerk/express", () => ({
  clerkMiddleware: jest.fn(() => (req, res, next) => next()),
  getAuth: jest.fn(),
}));

const { default: app } = await import("../app.js");
const Review = (await import("../models/Review.js")).default;
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

beforeEach(() => {
  jest.resetAllMocks();
  getAuth.mockReturnValue({ userId: "user-author" });
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
});
