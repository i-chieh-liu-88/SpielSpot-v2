import { z } from "zod";

export const playgroundEditorSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter a playground name with at least 2 characters.")
    .max(100, "Keep the playground name within 100 characters."),
  location: z
    .string()
    .trim()
    .min(2, "Enter a city or neighbourhood with at least 2 characters.")
    .max(100, "Keep the location within 100 characters."),
  postcode: z
    .string()
    .trim()
    .min(3, "Enter a postcode with at least 3 characters.")
    .max(12, "Keep the postcode within 12 characters."),
  latitude: z
    .string()
    .trim()
    .min(1, "Select a location on the map or enter a latitude.")
    .pipe(
      z.coerce
        .number<string>({ error: "Enter a latitude between -90 and 90." })
        .min(-90, "Enter a latitude between -90 and 90.")
        .max(90, "Enter a latitude between -90 and 90."),
    ),
  longitude: z
    .string()
    .trim()
    .min(1, "Select a location on the map or enter a longitude.")
    .pipe(
      z.coerce
        .number<string>({ error: "Enter a longitude between -180 and 180." })
        .min(-180, "Enter a longitude between -180 and 180.")
        .max(180, "Enter a longitude between -180 and 180."),
    ),
  ageRange: z
    .string()
    .trim()
    .min(3, "Enter an age range with at least 3 characters.")
    .max(60, "Keep the age range within 60 characters."),
  safetyRating: z.coerce
    .number()
    .int("Choose a safety rating from 1 to 5.")
    .min(1, "Choose a safety rating from 1 to 5.")
    .max(5, "Choose a safety rating from 1 to 5."),
  description: z
    .string()
    .trim()
    .min(20, "Describe the playground in at least 20 characters.")
    .max(1000, "Keep the description within 1000 characters."),
  tags: z.array(z.string()).min(1, "Select at least one facility."),
});
