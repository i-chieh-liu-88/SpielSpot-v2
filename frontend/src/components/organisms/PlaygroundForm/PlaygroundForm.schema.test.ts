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
