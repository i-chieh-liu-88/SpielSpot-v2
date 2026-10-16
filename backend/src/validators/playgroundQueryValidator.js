import { z } from "zod";

// Query 只能是單一字串，拒絕重複參數形成的陣列與未知欄位。
export const playgroundQuerySchema = z.object({
  location: z.string().trim().max(200, "location must be at most 200 characters").optional(),
  ageRange: z.string().trim().max(80, "ageRange must be at most 80 characters").optional(),
  tags: z.string().trim().max(1000, "tags must be at most 1000 characters")
    .refine((value) => {
      const tags = value.split(",").map((tag) => tag.trim()).filter(Boolean);
      return tags.length <= 10 && tags.every((tag) => tag.length <= 80);
    }, "tags must contain at most 10 values of at most 80 characters each")
    .optional(),
}).strict();
