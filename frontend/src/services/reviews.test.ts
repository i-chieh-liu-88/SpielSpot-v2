import { describe, expect, it } from "vitest";
import { createReview } from "./reviews";

describe("preview review service", () => {
  it("rejects writes instead of reporting a successful save", async () => {
    await expect(createReview({
      playgroundName: "Sample", location: "Berlin", ageGroup: "All ages",
      facilities: ["Shade"], safetyRating: "4", overallRating: "4",
      recommendation: "Yes", review: "A sample review for the preview.", parentName: "",
    })).rejects.toThrow("not available in this preview");
  });
});
