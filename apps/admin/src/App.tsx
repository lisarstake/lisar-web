import React from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { TransactionProvider } from './contexts/TransactionContext'
import { HealthProvider } from './contexts/HealthContext'
import { AppRouter } from './routes/router'

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <TransactionProvider>
      
     
      <HealthProvider>
        <AppRouter />
      </HealthProvider>
         </TransactionProvider>
    </AuthProvider>
  )
}
