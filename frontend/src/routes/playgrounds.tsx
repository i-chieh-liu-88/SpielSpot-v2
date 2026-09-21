import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { PlaygroundsPage } from '../pages/PlaygroundsPage/PlaygroundsPage'

const playgroundSearchSchema = z.object({
  q: z.preprocess(
    (value) => value === undefined || value === null ? undefined : String(value),
    z.string().trim().max(100).optional(),
  ).catch(undefined),
  page: z.preprocess(
    (value) => value === undefined || value === null ? undefined : Number(value),
    z.number().int().positive().optional(),
  ).catch(undefined),
})

export const Route = createFileRoute('/playgrounds')({
  validateSearch: (search) => playgroundSearchSchema.parse(search),
  component: PlaygroundsPage,
})
