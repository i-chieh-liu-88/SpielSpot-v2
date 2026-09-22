import { z } from "zod";

export const playgroundSchema = z.object({
  name: z.string().trim().min(1, "name is required"),
  description: z.string().trim().optional(),
  address: z.string().trim().min(1, "address is required"),
  lat: z.number().min(-90).max(90, "lat must be a valid latitude"),
  lng: z.number().min(-180).max(180, "lng must be a valid longitude"),
  category: z.string().trim().optional(),
  images: z.array(z.string()).optional(),
});
