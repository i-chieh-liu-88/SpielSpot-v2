import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Pagination } from './Pagination'

describe('Pagination', () => {
  afterEach(cleanup)

  it('changes pages and exposes the current page accessibly', () => {
    const onPageChange = vi.fn()
    render(<Pagination currentPage={2} totalPages={4} onPageChange={onPageChange} />)

    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page')

    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(onPageChange).toHaveBeenCalledWith(3)

    fireEvent.click(screen.getByRole('button', { name: 'Page 4' }))
    expect(onPageChange).toHaveBeenCalledWith(4)
  })

  it('disables previous and next at the boundaries', () => {
    const { rerender } = render(<Pagination currentPage={1} totalPages={4} onPageChange={() => undefined} />)
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()

    rerender(<Pagination currentPage={4} totalPages={4} onPageChange={() => undefined} />)
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })

  it('shows a compact page range for large result sets', () => {
    render(<Pagination currentPage={63} totalPages={129} onPageChange={() => undefined} />)

    expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Page 62' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Page 63' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Page 64' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Page 129' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Page 61' })).not.toBeInTheDocument()
    expect(screen.getAllByText('…')).toHaveLength(2)
  })
})
