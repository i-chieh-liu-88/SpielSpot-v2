import type { Playground } from '../types/content'

export function filterPlaygrounds(playgrounds: Playground[], query?: string) {
  const normalizedQuery = query?.trim().toLocaleLowerCase()
  if (!normalizedQuery) return playgrounds

  return playgrounds.filter((playground) => [
    playground.name,
    playground.location,
    playground.postcode,
    playground.ageRange,
    ...playground.tags,
  ].some((value) => value.toLocaleLowerCase().includes(normalizedQuery)))
}
