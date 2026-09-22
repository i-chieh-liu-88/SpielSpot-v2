import { z } from "zod";

export const playgroundSchema = z.object({
  name: z.string().trim().min(1, "name is required"),
  description: z.string().trim().optional(),
  location: z.string().trim().min(1, "location is required"),
  postcode: z.string().trim().optional(),
  latitude: z.number().min(-90).max(90, "latitude must be valid"),
  longitude: z.number().min(-180).max(180, "longitude must be valid"),
  ageRange: z.string().trim().optional(),
  safetyRating: z.number().min(1).max(5).optional(),
  tags: z.array(z.string()).optional(),
});
