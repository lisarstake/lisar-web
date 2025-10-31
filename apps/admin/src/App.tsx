import React from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { AppRouter } from './routes/router'

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}
