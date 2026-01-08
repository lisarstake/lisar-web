import React from 'react'
import { Toaster } from 'sonner'
import { AuthProvider } from './contexts/AuthContext'
import { ValidatorProvider } from './contexts/ValidatorContext'
import { TransactionProvider } from './contexts/TransactionContext'
import { HealthProvider } from './contexts/HealthContext'
import { UserProvider } from './contexts/UserContext'
import { PublicationProvider } from './contexts/PublicationContext'
import { CampaignProvider } from './contexts/CampaignContext'
import { AppRouter } from './routes/router'
import { ErrorBoundary } from './components/general/ErrorBoundary'

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ErrorBoundary>
          <ValidatorProvider>
            <ErrorBoundary>
              <TransactionProvider>
                <ErrorBoundary>
                  <UserProvider>
                    <ErrorBoundary>
                      <PublicationProvider>
                        <ErrorBoundary>
                          <CampaignProvider>
                            <ErrorBoundary>
                              <HealthProvider>
                                <AppRouter />
                                <Toaster position="top-right" />
                              </HealthProvider>
                            </ErrorBoundary>
                          </CampaignProvider>
                        </ErrorBoundary>
                      </PublicationProvider>
                    </ErrorBoundary>
                  </UserProvider>
                </ErrorBoundary>
              </TransactionProvider>
            </ErrorBoundary>
          </ValidatorProvider>
        </ErrorBoundary>
      </AuthProvider>
    </ErrorBoundary>
  )
}
