import { describe, expect, it } from "vitest";
import { createReview } from "./reviews";

describe("review service", () => {
  it("rejects a review without a playground ID", async () => {
    await expect(
      createReview(
        {
          playgroundName: "Sample",
          location: "Berlin",
          ageGroup: "All ages",
          facilities: ["Shade"],
          safetyRating: "4",
          overallRating: "4",
          recommendation: "Yes",
          review: "A sample review for the preview.",
          parentName: "",
        },
        "test-token",
      ),
    ).rejects.toThrow("playgroundId is required");
  });
});
