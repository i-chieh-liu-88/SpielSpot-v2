import { z } from "zod";

export const playgroundEditorSchema = z.object({
  name: z.string().trim().min(2).max(100),
  location: z.string().trim().min(2).max(100),
  postcode: z.string().trim().min(3).max(12),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  ageRange: z.string().trim().min(3).max(60),
  safetyRating: z.coerce.number().int().min(1).max(5),
  description: z.string().trim().min(20).max(1000),
  tags: z.array(z.string()).min(1),
});
