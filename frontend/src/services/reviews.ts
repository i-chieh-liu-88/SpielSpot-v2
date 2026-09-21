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

export async function createReview(review: CreateReviewInput): Promise<void> {
  void review;
  throw new Error("Reviews are not available in this preview.");
}
