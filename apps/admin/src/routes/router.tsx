import { Suspense, lazy, type ReactNode } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LoadingSpinner } from "@/components/general/LoadingSpinner";
import { ErrorBoundary } from "@/components/general/ErrorBoundary";

// Lazy load pages - handle both named and default exports
const OverviewPage = lazy(() => 
  import("@/pages/screens/OverviewPage").then(module => ({ default: module.OverviewPage }))
);
const UsersPage = lazy(() => 
  import("@/pages/screens/UsersPage").then(module => ({ default: module.UsersPage }))
);
const UserDetailPage = lazy(() => 
  import("@/pages/screens/UserDetailPage").then(module => ({ default: module.UserDetailPage }))
);
const TransactionsPage = lazy(() => 
  import("@/pages/screens/TransactionsPage").then(module => ({ default: module.TransactionsPage }))
);
const TransactionDetailPage = lazy(() => 
  import("@/pages/screens/TransactionDetailPage").then(module => ({ default: module.TransactionDetailPage }))
);
const ValidatorsPage = lazy(() => 
  import("@/pages/screens/ValidatorsPage").then(module => ({ default: module.ValidatorsPage }))
);
const ValidatorDetailPage = lazy(() => 
  import("@/pages/screens/ValidatorDetailPage").then(module => ({ default: module.ValidatorDetailPage }))
);
const CreateValidatorPage = lazy(() => 
  import("@/pages/screens/CreateValidatorPage").then(module => ({ default: module.CreateValidatorPage }))
);
const HealthPage = lazy(() => 
  import("@/pages/screens/HealthPage").then(module => ({ default: module.HealthPage }))
);
const AdminPage = lazy(() => 
  import("@/pages/screens/AdminPage").then(module => ({ default: module.AdminPage }))
);
const SettingsPage = lazy(() => 
  import("@/pages/screens/SettingsPage").then(module => ({ default: module.SettingsPage }))
);
const PublicationsPage = lazy(() => 
  import("@/pages/screens/PublicationsPage").then(module => ({ default: module.PublicationsPage }))
);
const PublicationEditorPage = lazy(() => 
  import("@/pages/screens/PublicationEditorPage").then(module => ({ default: module.PublicationEditorPage }))
);
const CampaignsPage = lazy(() => 
  import("@/pages/screens/CampaignsPage").then(module => ({ default: module.CampaignsPage }))
);
const CampaignUserDetailPage = lazy(() => 
  import("@/pages/screens/CampaignUserDetailPage").then(module => ({ default: module.CampaignUserDetailPage }))
);
const NotFoundPage = lazy(() => 
  import("@/pages/screens/NotFoundPage").then(module => ({ default: module.NotFoundPage }))
);
const AdminLogin = lazy(() => 
  import("@/pages/auth/AdminLogin").then(module => ({ default: module.AdminLogin }))
);
const AdminSignup = lazy(() => 
  import("@/pages/auth/AdminSignup").then(module => ({ default: module.AdminSignup }))
);
const ForgotPasswordPage = lazy(() => import("@/pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPasswordPage"));

const withSuspense = (element: ReactNode) => (
  <Suspense fallback={<LoadingSpinner />}>{element}</Suspense>
);

const withErrorBoundary = (element: ReactNode) => (
  <ErrorBoundary>
    {element}
  </ErrorBoundary>
);

const withSuspenseAndErrorBoundary = (element: ReactNode) => (
  <ErrorBoundary>
    <Suspense fallback={<LoadingSpinner />}>{element}</Suspense>
  </ErrorBoundary>
);

const router = createBrowserRouter([
  // Public routes (auth pages)
  {
    path: "/login",
    element: withSuspenseAndErrorBoundary(<AdminLogin />),
  },
  {
    path: "/signup",
    element: withSuspenseAndErrorBoundary(<AdminSignup />),
  },
  {
    path: "/forgot-password",
    element: withSuspenseAndErrorBoundary(<ForgotPasswordPage />),
  },
  {
    path: "/reset-password",
    element: withSuspenseAndErrorBoundary(<ResetPasswordPage />),
  },
  // Protected routes (require authentication)
  {
    path: "/",
    element: (
      <ErrorBoundary>
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      </ErrorBoundary>
    ),
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            {withSuspenseAndErrorBoundary(<PublicationsPage />)}
          </ProtectedRoute>
        ),
      },
      // {
      //   path: "users",
      //   element: (
      //     <ProtectedRoute>
      //       {withSuspenseAndErrorBoundary(<UsersPage />)}
      //     </ProtectedRoute>
      //   ),
      // },
      // {
      //   path: "users/:userId",
      //   element: (
      //     <ProtectedRoute>
      //       {withSuspenseAndErrorBoundary(<UserDetailPage />)}
      //     </ProtectedRoute>
      //   ),
      // },
      // {
      //   path: "transactions",
      //   element: (
      //     <ProtectedRoute>
      //       {withSuspenseAndErrorBoundary(<TransactionsPage />)}
      //     </ProtectedRoute>
      //   ),
      // },
      // {
      //   path: "transactions/:transactionId",
      //   element: (
      //     <ProtectedRoute>
      //       {withSuspenseAndErrorBoundary(<TransactionDetailPage />)}
      //     </ProtectedRoute>
      //   ),
      // },
      // {
      //   path: "validators",
      //   element: (
      //     <ProtectedRoute>
      //       {withSuspenseAndErrorBoundary(<ValidatorsPage />)}
      //     </ProtectedRoute>
      //   ),
      // },
      // {
      //   path: "validators/create",
      //   element: (
      //     <ProtectedRoute>
      //       {withSuspenseAndErrorBoundary(<CreateValidatorPage />)}
      //     </ProtectedRoute>
      //   ),
      // },
      // {
      //   path: "validators/:validatorId",
      //   element: (
      //     <ProtectedRoute>
      //       {withSuspenseAndErrorBoundary(<ValidatorDetailPage />)}
      //     </ProtectedRoute>
      //   ),
      // },
      // {
      //   path: "health",
      //   element: (
      //     <ProtectedRoute>
      //       {withSuspenseAndErrorBoundary(<HealthPage />)}
      //     </ProtectedRoute>
      //   ),
      // },
      // {
      //   path: "admin",
      //   element: (
      //     <ProtectedRoute>
      //       {withSuspenseAndErrorBoundary(<AdminPage />)}
      //     </ProtectedRoute>
      //   ),
      // },
      {
        path: "settings",
        element: (
          <ProtectedRoute>
            {withSuspenseAndErrorBoundary(<SettingsPage />)}
          </ProtectedRoute>
        ),
      },
      // {
      //   path: "publications",
      //   element: (
      //     <ProtectedRoute>
      //       {withSuspenseAndErrorBoundary(<PublicationsPage />)}
      //     </ProtectedRoute>
      //   ),
      // },
      {
        path: "publications/create",
        element: (
          <ProtectedRoute>
            {withSuspenseAndErrorBoundary(<PublicationEditorPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: "publications/:publicationId",
        element: (
          <ProtectedRoute>
            {withSuspenseAndErrorBoundary(<PublicationEditorPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: "publications/:publicationId/edit",
        element: (
          <ProtectedRoute>
            {withSuspenseAndErrorBoundary(<PublicationEditorPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: "campaigns",
        element: (
          <ProtectedRoute>
            {withSuspenseAndErrorBoundary(<CampaignsPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: "campaigns/:userId",
        element: (
          <ProtectedRoute>
            {withSuspenseAndErrorBoundary(<CampaignUserDetailPage />)}
          </ProtectedRoute>
        ),
      },
    ],
  },
  // 404 page - outside Layout so it doesn't show sidebar/header
  {
    path: "*",
    element: withSuspenseAndErrorBoundary(<NotFoundPage />),
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};

