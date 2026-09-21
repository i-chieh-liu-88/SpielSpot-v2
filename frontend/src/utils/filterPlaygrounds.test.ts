import { describe, expect, it } from 'vitest'
import { playgrounds } from '../data/homeContent'
import { filterPlaygrounds } from './filterPlaygrounds'

describe('filterPlaygrounds', () => {
  it.each([
    ['Berlin', 'wald-abenteuerplatz'],
    ['10997', 'wald-abenteuerplatz'],
    ['Altona', 'wasser-spielgarten'],
    ['Munich', 'kletter-insel'],
  ])('finds a mapped playground for %s', (query, playgroundId) => {
    expect(filterPlaygrounds(playgrounds, query).map((playground) => playground.id)).toEqual([playgroundId])
  })

  it('finds the new Dresden playground by postcode', () => {
    expect(filterPlaygrounds(playgrounds, '01099').map((playground) => playground.id)).toEqual([
      'alaunpark-abenteuerplatz',
    ])
  })
})
