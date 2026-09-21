import type { z } from 'zod'
import type { playgroundReviewSchema } from './ReviewForm.schema'

export type PlaygroundReview = z.infer<typeof playgroundReviewSchema>
export type ReviewFormErrors = Partial<Record<keyof PlaygroundReview, string>>
