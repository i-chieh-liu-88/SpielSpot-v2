import type { ReactNode } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { playgrounds } from '../../../data/homeContent'
import { PlaygroundMap } from './PlaygroundMap'

const mapMocks = vi.hoisted(() => ({
  flyTo: vi.fn(),
  getBounds: vi.fn(() => ({
    contains: () => true,
    pad: () => ({ contains: () => true }),
  })),
  getCenter: vi.fn(() => ({ lat: 51.05, lng: 13.74 })),
  getMaxZoom: vi.fn(() => 18),
  getZoom: vi.fn(() => 11),
  project: vi.fn(([latitude, longitude]: [number, number]) => ({
    x: latitude * 100000,
    y: longitude * 100000,
  })),
}))

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: ReactNode }) => <div data-testid="playground-map">{children}</div>,
  TileLayer: () => null,
  Marker: ({ title, eventHandlers }: { title: string; eventHandlers?: { click: () => void } }) => <button type="button" onClick={eventHandlers?.click}>{title}</button>,
  useMap: () => mapMocks,
  useMapEvents: () => mapMocks,
}))

describe('PlaygroundMap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders one selectable pin per mapped playground', () => {
    const onSelect = vi.fn()
    render(<PlaygroundMap playgrounds={playgrounds} onSelect={onSelect} />)

    expect(screen.getAllByRole('button')).toHaveLength(playgrounds.length)
    fireEvent.click(screen.getByRole('button', { name: 'Open Wald Abenteuerplatz' }))

    expect(onSelect).toHaveBeenCalledWith('wald-abenteuerplatz')
  })

  it('groups nearby playgrounds and zooms into the cluster', () => {
    const clusteredPlaygrounds = [
      playgrounds[0],
      { ...playgrounds[1], coordinates: playgrounds[0].coordinates },
    ]

    render(<PlaygroundMap playgrounds={clusteredPlaygrounds} onSelect={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Zoom to 2 playgrounds' }))

    expect(mapMocks.flyTo).toHaveBeenCalledWith(playgrounds[0].coordinates, 13)
  })

  it('moves the map to a searched or detected location', () => {
    render(
      <PlaygroundMap
        playgrounds={playgrounds}
        onSelect={vi.fn()}
        focusLocation={{ coordinates: [51.0504, 13.7373], label: 'Dresden' }}
      />,
    )

    expect(mapMocks.flyTo).toHaveBeenCalledWith([51.0504, 13.7373], 15)
    expect(screen.getByRole('button', { name: 'Dresden' })).toBeInTheDocument()
  })

  it('reports the playgrounds visible in the current map area', () => {
    const onAreaChange = vi.fn()

    render(
      <PlaygroundMap
        playgrounds={playgrounds}
        onSelect={vi.fn()}
        onAreaChange={onAreaChange}
      />,
    )

    expect(onAreaChange).toHaveBeenCalledWith({
      playgroundIds: expect.arrayContaining(playgrounds.map(({ id }) => id)),
      zoom: 11,
    })
  })
})
