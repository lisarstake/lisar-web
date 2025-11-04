import React from 'react'
import { Toaster } from 'sonner'
import { AuthProvider } from './contexts/AuthContext'
import { ValidatorProvider } from './contexts/ValidatorContext'
import { TransactionProvider } from './contexts/TransactionContext'
import { HealthProvider } from './contexts/HealthContext'
import { UserProvider } from './contexts/UserContext'
import { AppRouter } from './routes/router'

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ValidatorProvider>
        <TransactionProvider>
          <UserProvider>
            <HealthProvider>
              <AppRouter />
              <Toaster position="top-right" />
            </HealthProvider>
          </UserProvider>
        </TransactionProvider>
      </ValidatorProvider>
    </AuthProvider>
  )
}
