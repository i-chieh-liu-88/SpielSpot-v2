import { describe, expect, it } from "vitest";
import { playgroundEditorSchema } from "./PlaygroundForm.schema";

const validPlayground = {
  name: "Riverside Play Park",
  location: "Dresden",
  postcode: "01067",
  latitude: "51.05",
  longitude: "13.74",
  ageRange: "Ages 2–12",
  safetyRating: "4",
  description: "A community playground beside the river.",
  tags: ["Fenced"],
};

describe("playgroundEditorSchema", () => {
  it.each(["", "   "])("rejects blank coordinates: %j", (blank) => {
    const result = playgroundEditorSchema.safeParse({
      ...validPlayground,
      latitude: blank,
      longitude: blank,
    });
    expect(result.success).toBe(false);
  });

  it("accepts explicitly entered zero coordinates", () => {
    expect(
      playgroundEditorSchema.parse({
        ...validPlayground,
        latitude: "0",
        longitude: "0",
      }),
    ).toMatchObject({ latitude: 0, longitude: 0 });
  });
  it("coerces valid map coordinates and ratings", () => {
    expect(playgroundEditorSchema.parse(validPlayground)).toMatchObject({
      latitude: 51.05,
      longitude: 13.74,
      safetyRating: 4,
    });
  });

  it("rejects invalid coordinates and an empty facility list", () => {
    const result = playgroundEditorSchema.safeParse({
      ...validPlayground,
      latitude: "100",
      tags: [],
    });

    expect(result.success).toBe(false);
  });
});
