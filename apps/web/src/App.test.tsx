import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { queryClient } from '@/providers/queryClient'

describe('App', () => {
  it('renders header', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    )
    expect(screen.getByRole('heading', { name: /lisa/i })).toBeInTheDocument()
  })
})


