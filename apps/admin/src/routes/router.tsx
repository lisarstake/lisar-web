import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { OverviewPage } from "@/pages/OverviewPage";
import { UsersPage } from "@/pages/UsersPage";
import { TransactionsPage } from "@/pages/TransactionsPage";
import { ValidatorsPage } from "@/pages/ValidatorsPage";
import { HealthPage } from "@/pages/HealthPage";
import { AdminPage } from "@/pages/AdminPage";
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
      { path: "health", element: <HealthPage /> },
      { path: "admin", element: <AdminPage /> },
    ],
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};

