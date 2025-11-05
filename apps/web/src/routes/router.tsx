import { Suspense, lazy, type ReactNode } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import App from '@/App'
import { ErrorBoundary } from '@/components/general/ErrorBoundary'

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
      { index: true, element: withSuspense(<HomePage />) },
      { path: 'onboarding', element: withSuspense(<OnboardingPage />) },
      { path: 'signup', element: withSuspense(<SignupPage />) },
      { path: 'login', element: withSuspense(<LoginPage />) },
      { path: 'forgot-password', element: withSuspense(<ForgotPasswordPage />) },
      { path: 'reset-password', element: withSuspense(<ResetPasswordPage />) },
      { path: 'wallet', element: withSuspense(<WalletPage />) },
      { path: 'validator', element: withSuspense(<ValidatorPage />) },
      { path: 'validator-details/:validatorId', element: withSuspense(<ValidatorDetailsPage />) },
      { path: 'stake/:validatorId', element: withSuspense(<StakePage />) },
      { path: 'deposit/:validatorId', element: withSuspense(<DepositPage />) },
      { path: 'withdraw-network/:validatorId', element: withSuspense(<WithdrawNetworkPage />) },
      { path: 'confirm-withdrawal/:validatorId', element: withSuspense(<ConfirmWithdrawalPage />) },
      { path: 'withdrawal-success/:validatorId', element: withSuspense(<WithdrawalSuccessPage />) },
      { path: 'unstake-amount/:validatorId', element: withSuspense(<UnstakeAmountPage />) },
      { path: 'confirm-unstake/:validatorId', element: withSuspense(<ConfirmUnstakePage />) },
      { path: 'history', element: withSuspense(<HistoryPage />) },
      { path: 'transaction-detail/:transactionId', element: withSuspense(<TransactionDetailPage />) },
      { path: 'learn', element: withSuspense(<LearnPage />) },
      { path: 'learn/:slug', element: withSuspense(<LearnDetailPage />) },
      { path: 'forecast', element: withSuspense(<ForecastPage />) },
      { path: 'earn', element: withSuspense(<EarnPage />) },
      { path: 'portfolio', element: withSuspense(<PortfolioPage />) },
      { path: 'leaderboard', element: withSuspense(<LeaderboardPage />) },
      { path: 'dashboard', element: withSuspense(<DashboardPage />) },
      { path: 'profile', element: withSuspense(<ProfilePage />) },
      { path: 'notifications', element: withSuspense(<NotificationsPage />) },
      { path: '*', element: withSuspense(<NotFoundPage />) },
    ],
  },
])


