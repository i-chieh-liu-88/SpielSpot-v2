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
