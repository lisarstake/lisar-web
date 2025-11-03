import React from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { HealthProvider } from './contexts/HealthContext'
import { AppRouter } from './routes/router'

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <HealthProvider>
        <AppRouter />
      </HealthProvider>
    </AuthProvider>
  )
}
