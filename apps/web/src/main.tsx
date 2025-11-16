import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { router } from '@/routes/router'
import { queryClient } from '@/providers/queryClient'
import './styles/index.css'

// Handle chunk loading errors globally
window.addEventListener('error', (event) => {
  // Check if it's a chunk loading error
  if (
    event.message.includes('Failed to fetch dynamically imported module') ||
    event.message.includes('Importing a module script failed') ||
    event.message.includes('error loading dynamically imported module')
  ) {
    const hasReloaded = sessionStorage.getItem('chunk-error-reloaded')
    
    if (!hasReloaded) {
      sessionStorage.setItem('chunk-error-reloaded', 'true')
      window.location.reload()
    } else {
      sessionStorage.removeItem('chunk-error-reloaded')
    }
  }
})

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


