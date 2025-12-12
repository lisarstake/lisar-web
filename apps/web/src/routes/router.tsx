import { Suspense, type ReactNode } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import App from '@/App'
import { ErrorBoundary } from '@/components/general/ErrorBoundary'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { LoadingSpinner } from '@/components/general/LoadingSpinner'
import { lazyRetry } from '@/lib/lazyRetry'

const HomePage = lazyRetry(() => import('@/screens/home-page'))
const SignupPage = lazyRetry(() => import('@/screens/signup-page'))
const LoginPage = lazyRetry(() => import('@/screens/login-page'))
const ForgotPasswordPage = lazyRetry(() => import('@/screens/forgot-password-page'))
const ResetPasswordPage = lazyRetry(() => import('@/screens/reset-password-page'))
const OTPPage = lazyRetry(() => import('@/screens/otp-page'))
const TOTPSetupPage = lazyRetry(() => import('@/screens/totp-setup-page'))
const WalletPage = lazyRetry(() => import('@/screens/wallet-page'))
const ValidatorPage = lazyRetry(() => import('@/screens/validator-page'))
const ValidatorDetailsPage = lazyRetry(() => import('@/screens/validator-details-page'))
const StakePage = lazyRetry(() => import('@/screens/stake-page'))
const SavePage = lazyRetry(() => import('@/screens/save-page'))
const TiersPage = lazyRetry(() => import('@/screens/tiers-page'))
const WithdrawPage = lazyRetry(() => import('@/screens/withdraw-page'))
const DepositPage = lazyRetry(() => import('@/screens/deposit-page'))
const OnchainDepositPage = lazyRetry(() => import('@/screens/onchain-deposit-page'))
const WithdrawNetworkPage = lazyRetry(() => import('@/screens/withdraw-network-page'))
const ConfirmWithdrawalPage = lazyRetry(() => import('@/screens/confirm-withdrawal-page'))
const UnstakeAmountPage = lazyRetry(() => import('@/screens/unstake-amount-page'))
const ConfirmUnstakePage = lazyRetry(() => import('@/screens/confirm-unstake-page'))
const HistoryPage = lazyRetry(() => import('@/screens/history-page'))
const TransactionDetailPage = lazyRetry(() => import('@/screens/transaction-detail-page'))
const LearnPage = lazyRetry(() => import('@/screens/learn-page'))
const LearnDetailPage = lazyRetry(() => import('@/screens/learn-detail-page'))
const ForecastPage = lazyRetry(() => import('@/screens/forecast-page'))
const EarnPage = lazyRetry(() => import('@/screens/earn-page'))
const PortfolioPage = lazyRetry(() => import('@/screens/portfolio-page'))
const PortfolioSummaryPage = lazyRetry(() => import('@/screens/portfolio-summary-page'))
const PortfolioPositionsPage = lazyRetry(() => import('@/screens/portfolio-positions-page'))
const LeaderboardPage = lazyRetry(() => import('@/screens/leaderboard-page'))
const DashboardPage = lazyRetry(() => import('@/screens/dashboard-page'))
const ProfilePage = lazyRetry(() => import('@/screens/profile-page'))
const NotificationsPage = lazyRetry(() => import('@/screens/notifications-page'))
const BlogPage = lazyRetry(() => import('@/screens/blog-page'))
const BlogDetailPage = lazyRetry(() => import('@/screens/blog-detail-page'))
const NotFoundPage = lazyRetry(() => import('@/screens/NotFoundPage'))

const withSuspense = (element: ReactNode) => (
  <Suspense fallback={<LoadingSpinner />}>{element}</Suspense>
)

const withErrorBoundary = (element: ReactNode) => (
  <ErrorBoundary>
    {element}
  </ErrorBoundary>
)

const withSuspenseAndErrorBoundary = (element: ReactNode) => (
  <ErrorBoundary>
    <Suspense fallback={<LoadingSpinner />}>{element}</Suspense>
  </ErrorBoundary>
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
      { index: true, element: withSuspenseAndErrorBoundary(<HomePage />) },
      { path: 'login', element: withSuspenseAndErrorBoundary(<LoginPage />) },
      { path: 'signup', element: withSuspenseAndErrorBoundary(<SignupPage />) },
      { path: 'verify-otp', element: withSuspenseAndErrorBoundary(<OTPPage />) },
      { path: 'setup-otp', element: withSuspenseAndErrorBoundary(<TOTPSetupPage />) },
      { path: 'dashboard', element: withSuspenseAndErrorBoundary(<DashboardPage />) },
      { path: 'forgot-password', element: withSuspenseAndErrorBoundary(<ForgotPasswordPage />) },
      { path: 'reset-password', element: withSuspenseAndErrorBoundary(<ResetPasswordPage />) },
      { path: 'blog', element: withSuspenseAndErrorBoundary(<BlogPage />) },
      { path: 'blog/:slug', element: withSuspenseAndErrorBoundary(<BlogDetailPage />) },
      
      // Protected routes
      {
        path: 'wallet',
        element: (
          <ProtectedRoute>
            {withSuspenseAndErrorBoundary(<WalletPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'wallet/:walletType',
        element: (
          <ProtectedRoute>
            {withSuspenseAndErrorBoundary(<WalletPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'validator',
        element: (
          <ProtectedRoute>
            {withSuspenseAndErrorBoundary(<ValidatorPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'validator-details/:validatorId',
        element: (
          <ProtectedRoute>
            {withSuspenseAndErrorBoundary(<ValidatorDetailsPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'stake/:validatorId',
        element: (
          <ProtectedRoute>
            {withSuspenseAndErrorBoundary(<StakePage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'save',
        element: (
          <ProtectedRoute>
            {withSuspenseAndErrorBoundary(<SavePage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'savings-tiers',
        element: (
          <ProtectedRoute>
            {withSuspenseAndErrorBoundary(<TiersPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'withdraw',
        element: (
          <ProtectedRoute>
            {withSuspenseAndErrorBoundary(<WithdrawPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'deposit',
        element: (
          <ProtectedRoute>
            {withSuspenseAndErrorBoundary(<DepositPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'deposit/:validatorId',
        element: (
          <ProtectedRoute>
            {withSuspenseAndErrorBoundary(<DepositPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'deposit-address',
        element: (
          <ProtectedRoute>
            {withSuspenseAndErrorBoundary(<OnchainDepositPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'withdraw-network/:validatorId',
        element: (
          <ProtectedRoute>
            {withSuspenseAndErrorBoundary(<WithdrawNetworkPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'confirm-withdrawal/:validatorId',
        element: (
          <ProtectedRoute>
            {withSuspenseAndErrorBoundary(<ConfirmWithdrawalPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'unstake-amount/:validatorId',
        element: (
          <ProtectedRoute>
            {withSuspenseAndErrorBoundary(<UnstakeAmountPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'confirm-unstake/:validatorId',
        element: (
          <ProtectedRoute>
            {withSuspenseAndErrorBoundary(<ConfirmUnstakePage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'history',
        element: (
          <ProtectedRoute>
            {withSuspenseAndErrorBoundary(<HistoryPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'transaction-detail/:transactionId',
        element: (
          <ProtectedRoute>
            {withSuspenseAndErrorBoundary(<TransactionDetailPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'learn',
        element: (
          <ProtectedRoute>
            {withSuspenseAndErrorBoundary(<LearnPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'learn/:slug',
        element: (
          <ProtectedRoute>
            {withSuspenseAndErrorBoundary(<LearnDetailPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'forecast',
        element: (
          <ProtectedRoute>
            {withSuspenseAndErrorBoundary(<ForecastPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'earn',
        element: (
          <ProtectedRoute>
            {withSuspenseAndErrorBoundary(<EarnPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'portfolio',
        element: (
          <ProtectedRoute>
            {withSuspenseAndErrorBoundary(<PortfolioPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'portfolio/summary',
        element: (
          <ProtectedRoute>
            {withSuspenseAndErrorBoundary(<PortfolioSummaryPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'portfolio/positions',
        element: (
          <ProtectedRoute>
            {withSuspenseAndErrorBoundary(<PortfolioPositionsPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'leaderboard',
        element: (
          <ProtectedRoute>
            {withSuspenseAndErrorBoundary(<LeaderboardPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            {withSuspenseAndErrorBoundary(<ProfilePage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'notifications',
        element: (
          <ProtectedRoute>
            {withSuspenseAndErrorBoundary(<NotificationsPage />)}
          </ProtectedRoute>
        ),
      },
      { path: '*', element: withSuspenseAndErrorBoundary(<NotFoundPage />) },
    ],
  },
])


