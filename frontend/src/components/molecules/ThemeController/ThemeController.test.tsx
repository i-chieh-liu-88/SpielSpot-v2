import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ThemeProvider } from '../../../providers/ThemeProvider'
import { ThemeController } from './ThemeController'

describe('ThemeController', () => {
  afterEach(cleanup)

  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = 'light'
    document.documentElement.dataset.theme = 'light'
  })

  it('toggles and persists the SpielSpot theme', () => {
    render(
      <ThemeProvider>
        <ThemeController />
      </ThemeProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: /switch to dark mode/i }))

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(document.documentElement).toHaveClass('dark')
    expect(localStorage.getItem('spielspot-theme')).toBe('dark')
  })
})
