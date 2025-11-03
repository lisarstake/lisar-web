import React from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { ValidatorProvider } from './contexts/ValidatorContext'
import { TransactionProvider } from './contexts/TransactionContext'
import { HealthProvider } from './contexts/HealthContext'
import { AppRouter } from './routes/router'

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ValidatorProvider>
     
     
      <TransactionProvider>
      
     
      <HealthProvider>
        <AppRouter />
      </HealthProvider>
         </TransactionProvider>
         </ValidatorProvider>
    </AuthProvider>
  )
}
