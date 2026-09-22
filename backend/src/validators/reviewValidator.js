import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5, "rating must be between 1 and 5"),
  comment: z.string().trim().max(500, "comment too long").optional(),
});
