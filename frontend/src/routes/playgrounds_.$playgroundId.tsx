import { createFileRoute } from '@tanstack/react-router'
import { PlaygroundDetailPage } from '../pages/PlaygroundDetailPage/PlaygroundDetailPage'

export const Route = createFileRoute('/playgrounds_/$playgroundId')({
  component: PlaygroundDetailPage,
})
