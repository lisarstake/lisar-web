import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { router } from '@/routes/router'
import { queryClient } from '@/providers/queryClient'
import './styles/index.css'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element with id "root" not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
)


