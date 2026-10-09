import { describe, expect, it, vi } from "vitest";
import { createReview, updateReview } from "./reviews";

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

  it("sends an authenticated PATCH when editing a review", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { _id: "r1" } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    try {
      await updateReview("r1", "Updated test review", 4, "test-token");

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/reviews\/r1$/),
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({
            review: "Updated test review",
            overallRating: "4",
          }),
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
        }),
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
