import { z } from "zod";

// 前端傳送字串評分；只允許 1 至 5，不自動把數字或小數轉成字串。
const rating = z.string().trim().regex(/^[1-5]$/, "rating must be a string from 1 to 5");

export const reviewSchema = z.object({
  playgroundName: z.string().trim().min(1, "playgroundName is required"),
  location: z.string().trim().min(1, "location is required"),
  ageGroup: z.string().trim().min(1, "ageGroup is required"),
  facilities: z.array(z.string()).optional(),
  safetyRating: rating,
  overallRating: rating,
  recommendation: z.string().trim().optional(),
  review: z.string().trim().min(1, "review is required"),
  parentName: z.string().trim().optional(),
});
