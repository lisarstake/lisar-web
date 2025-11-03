import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { OverviewPage } from "@/pages/screens/OverviewPage";
import { UsersPage } from "@/pages/screens/UsersPage";
import { TransactionsPage } from "@/pages/screens/TransactionsPage";
import { ValidatorsPage } from "@/pages/screens/ValidatorsPage";
import { ValidatorDetailPage } from "@/pages/screens/ValidatorDetailPage";
import { CreateValidatorPage } from "@/pages/screens/CreateValidatorPage";
import { HealthPage } from "@/pages/screens/HealthPage";
import { AdminPage } from "@/pages/screens/AdminPage";
import { AdminLogin } from "@/pages/auth/AdminLogin";
import { AdminSignup } from "@/pages/auth/AdminSignup";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <AdminLogin />,
  },
  {
    path: "/signup",
    element: <AdminSignup />,
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: "users", element: <UsersPage /> },
      { path: "transactions", element: <TransactionsPage /> },
      { path: "validators", element: <ValidatorsPage /> },
      { path: "validators/create", element: <CreateValidatorPage /> },
      { path: "validators/:validatorId", element: <ValidatorDetailPage /> },
      { path: "health", element: <HealthPage /> },
      { path: "admin", element: <AdminPage /> },
    ],
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};

