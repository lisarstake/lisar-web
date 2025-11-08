import { Suspense, lazy, type ReactNode } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LoadingSpinner } from "@/components/general/LoadingSpinner";

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

const router = createBrowserRouter([
  // Public routes (auth pages)
  {
    path: "/login",
    element: withSuspense(<AdminLogin />),
  },
  {
    path: "/signup",
    element: withSuspense(<AdminSignup />),
  },
  {
    path: "/forgot-password",
    element: withSuspense(<ForgotPasswordPage />),
  },
  {
    path: "/reset-password",
    element: withSuspense(<ResetPasswordPage />),
  },
  // Protected routes (require authentication)
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            {withSuspense(<OverviewPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: "users",
        element: (
          <ProtectedRoute>
            {withSuspense(<UsersPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: "users/:userId",
        element: (
          <ProtectedRoute>
            {withSuspense(<UserDetailPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: "transactions",
        element: (
          <ProtectedRoute>
            {withSuspense(<TransactionsPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: "transactions/:transactionId",
        element: (
          <ProtectedRoute>
            {withSuspense(<TransactionDetailPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: "validators",
        element: (
          <ProtectedRoute>
            {withSuspense(<ValidatorsPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: "validators/create",
        element: (
          <ProtectedRoute>
            {withSuspense(<CreateValidatorPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: "validators/:validatorId",
        element: (
          <ProtectedRoute>
            {withSuspense(<ValidatorDetailPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: "health",
        element: (
          <ProtectedRoute>
            {withSuspense(<HealthPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: "admin",
        element: (
          <ProtectedRoute>
            {withSuspense(<AdminPage />)}
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};

