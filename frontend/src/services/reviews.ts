import { apiFetch } from "./apiClient";

export type CreateReviewInput = {
  playgroundId?: string;
  playgroundName: string;
  location: string;
  ageGroup: string;
  facilities: string[];
  safetyRating: string;
  overallRating: string;
  recommendation: string;
  review: string;
  parentName: string;
};

export async function createReview(
  review: CreateReviewInput,
  token: string,
): Promise<void> {
  if (!review.playgroundId) {
    throw new Error("playgroundId is required");
  }
  await apiFetch(
    `/api/playgrounds/${review.playgroundId}/reviews`,
    {
      method: "POST",
      body: JSON.stringify(review),
    },
    token,
  );
}
