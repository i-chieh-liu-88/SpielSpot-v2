import { z } from "zod";

export const reviewSchema = z.object({
  playgroundName: z.string().trim().min(1, "playgroundName is required"),
  location: z.string().trim().min(1, "location is required"),
  ageGroup: z.string().trim().min(1, "ageGroup is required"),
  facilities: z.array(z.string()).optional(),
  safetyRating: z.string().trim().min(1, "safetyRating is required"),
  overallRating: z.string().trim().min(1, "overallRating is required"),
  recommendation: z.string().trim().optional(),
  review: z.string().trim().min(1, "review is required"),
  parentName: z.string().trim().optional(),
});
