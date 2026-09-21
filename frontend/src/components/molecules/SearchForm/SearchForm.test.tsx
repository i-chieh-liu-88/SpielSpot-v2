import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SearchForm } from './SearchForm'

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }))

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigate,
}))

describe('SearchForm', () => {
  it('navigates to the map with a trimmed location query', () => {
    render(<SearchForm />)

    fireEvent.change(screen.getByLabelText('City, postcode, or neighbourhood'), { target: { value: '  Kreuzberg  ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Search' }))

    expect(navigate).toHaveBeenCalledWith({ to: '/playgrounds', search: { q: 'Kreuzberg' } })
  })
})
