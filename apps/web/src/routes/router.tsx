import { Suspense, lazy, type ReactNode } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import App from '@/App'
import { ErrorBoundary } from '@/components/general/ErrorBoundary'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

const HomePage = lazy(() => import('@/screens/home-page'))
const OnboardingPage = lazy(() => import('@/screens/onboarding-page'))
const SignupPage = lazy(() => import('@/screens/signup-page'))
const LoginPage = lazy(() => import('@/screens/login-page'))
const ForgotPasswordPage = lazy(() => import('@/screens/forgot-password-page'))
const ResetPasswordPage = lazy(() => import('@/screens/reset-password-page'))
const WalletPage = lazy(() => import('@/screens/wallet-page'))
const ValidatorPage = lazy(() => import('@/screens/validator-page'))
const ValidatorDetailsPage = lazy(() => import('@/screens/validator-details-page'))
const StakePage = lazy(() => import('@/screens/stake-page'))
const DepositPage = lazy(() => import('@/screens/deposit-page'))
const WithdrawNetworkPage = lazy(() => import('@/screens/withdraw-network-page'))
const ConfirmWithdrawalPage = lazy(() => import('@/screens/confirm-withdrawal-page'))
const WithdrawalSuccessPage = lazy(() => import('@/screens/withdrawal-success-page'))
const UnstakeAmountPage = lazy(() => import('@/screens/unstake-amount-page'))
const ConfirmUnstakePage = lazy(() => import('@/screens/confirm-unstake-page'))
const HistoryPage = lazy(() => import('@/screens/history-page'))
const TransactionDetailPage = lazy(() => import('@/screens/transaction-detail-page'))
const LearnPage = lazy(() => import('@/screens/learn-page'))
const LearnDetailPage = lazy(() => import('@/screens/learn-detail-page'))
const ForecastPage = lazy(() => import('@/screens/forecast-page'))
const EarnPage = lazy(() => import('@/screens/earn-page'))
const PortfolioPage = lazy(() => import('@/screens/portfolio-page'))
const LeaderboardPage = lazy(() => import('@/screens/leaderboard-page'))
const DashboardPage = lazy(() => import('@/screens/dashboard-page'))
const ProfilePage = lazy(() => import('@/screens/profile-page'))
const NotificationsPage = lazy(() => import('@/screens/notifications-page'))
const NotFoundPage = lazy(() => import('@/screens/NotFoundPage'))

const withSuspense = (element: ReactNode) => (
  <Suspense fallback={<div>Loading...</div>}>{element}</Suspense>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    ),
    children: [
      // Public routes
      { index: true, element: withSuspense(<HomePage />) },
      { path: 'login', element: withSuspense(<LoginPage />) },
      { path: 'signup', element: withSuspense(<SignupPage />) },
      { path: 'dashboard', element: withSuspense(<DashboardPage />) },
      { path: 'forgot-password', element: withSuspense(<ForgotPasswordPage />) },
      { path: 'reset-password', element: withSuspense(<ResetPasswordPage />) },
      
      // Protected routes
      {
        path: 'onboarding',
        element: (
          <ProtectedRoute>
            {withSuspense(<OnboardingPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'wallet',
        element: (
          <ProtectedRoute>
            {withSuspense(<WalletPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'validator',
        element: (
          <ProtectedRoute>
            {withSuspense(<ValidatorPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'validator-details/:validatorId',
        element: (
          <ProtectedRoute>
            {withSuspense(<ValidatorDetailsPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'stake/:validatorId',
        element: (
          <ProtectedRoute>
            {withSuspense(<StakePage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'deposit/:validatorId',
        element: (
          <ProtectedRoute>
            {withSuspense(<DepositPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'withdraw-network/:validatorId',
        element: (
          <ProtectedRoute>
            {withSuspense(<WithdrawNetworkPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'confirm-withdrawal/:validatorId',
        element: (
          <ProtectedRoute>
            {withSuspense(<ConfirmWithdrawalPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'withdrawal-success/:validatorId',
        element: (
          <ProtectedRoute>
            {withSuspense(<WithdrawalSuccessPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'unstake-amount/:validatorId',
        element: (
          <ProtectedRoute>
            {withSuspense(<UnstakeAmountPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'confirm-unstake/:validatorId',
        element: (
          <ProtectedRoute>
            {withSuspense(<ConfirmUnstakePage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'history',
        element: (
          <ProtectedRoute>
            {withSuspense(<HistoryPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'transaction-detail/:transactionId',
        element: (
          <ProtectedRoute>
            {withSuspense(<TransactionDetailPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'learn',
        element: (
          <ProtectedRoute>
            {withSuspense(<LearnPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'learn/:slug',
        element: (
          <ProtectedRoute>
            {withSuspense(<LearnDetailPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'forecast',
        element: (
          <ProtectedRoute>
            {withSuspense(<ForecastPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'earn',
        element: (
          <ProtectedRoute>
            {withSuspense(<EarnPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'portfolio',
        element: (
          <ProtectedRoute>
            {withSuspense(<PortfolioPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'leaderboard',
        element: (
          <ProtectedRoute>
            {withSuspense(<LeaderboardPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            {withSuspense(<ProfilePage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'notifications',
        element: (
          <ProtectedRoute>
            {withSuspense(<NotificationsPage />)}
          </ProtectedRoute>
        ),
      },
      { path: '*', element: withSuspense(<NotFoundPage />) },
    ],
  },
])


