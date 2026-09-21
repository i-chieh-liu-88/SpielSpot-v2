import { z } from 'zod'

export const playgroundReviewSchema = z.object({
  playgroundName: z.string().trim().min(2, 'Enter a playground name').max(100, 'Playground name must be 100 characters or less'),
  location: z.string().trim().min(2, 'Enter a city or neighbourhood').max(100, 'Location must be 100 characters or less'),
  ageGroup: z.string().min(1, 'Select the best suited age group'),
  facilities: z.array(z.string()).min(1, 'Select at least one available facility'),
  safetyRating: z.string().regex(/^[1-5]$/, 'Choose a safety rating from 1 to 5'),
  overallRating: z.string().regex(/^[1-5]$/, 'Choose an overall rating from 1 to 5'),
  recommendation: z.string().refine((value): boolean => value === 'Yes' || value === 'No', 'Choose whether you recommend this playground'),
  review: z.string().trim().min(20, 'Review must contain at least 20 characters').max(1000, 'Review must be 1,000 characters or less'),
  parentName: z.string().trim().max(60, 'Name must be 60 characters or less'),
})
