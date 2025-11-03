import React from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { ValidatorProvider } from './contexts/ValidatorContext'
import { AppRouter } from './routes/router'

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ValidatorProvider>
        <AppRouter />
      </ValidatorProvider>
    </AuthProvider>
  )
}
