import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useHealth } from "@/contexts/HealthContext";
import { getStatusColor } from "@/lib/formatters";
import {
  SummaryCard,
  SummaryCardSkeleton,
} from "@/components/screens/SummaryCard";

interface ServiceItem {
  name: string;
  status: string;
  displayStatus: string;
}

const getDisplayStatus = (status: string): string => {
  const normalized = status.toLowerCase();
  if (normalized === "ok" || normalized === "connected") {
    return "Operational";
  } else if (normalized === "unknown") {
    return "Unknown";
  } else {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

const formatTimestamp = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  } catch {
    return timestamp;
  }
};

export const HealthPage: React.FC = () => {
  const { state, refreshDashboardHealth, refreshAdminHealth } = useHealth();
  const { dashboardHealth, adminHealth, isLoading, error } = state;

  // Fetch data on mount if not already present
  React.useEffect(() => {
    if (!dashboardHealth && !isLoading) {
      refreshDashboardHealth();
    }
    if (!adminHealth && !isLoading) {
      refreshAdminHealth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const services: ServiceItem[] = dashboardHealth
    ? [
        {
          name: "Onramp",
          status: dashboardHealth.onramp,
          displayStatus: getDisplayStatus(dashboardHealth.onramp),
        },
        {
          name: "Privy",
          status: dashboardHealth.privy,
          displayStatus: getDisplayStatus(dashboardHealth.privy),
        },
        {
          name: "Subgraph",
          status: dashboardHealth.subgraph,
          displayStatus: getDisplayStatus(dashboardHealth.subgraph),
        },
        {
          name: "Supabase",
          status: dashboardHealth.supabase,
          displayStatus: getDisplayStatus(dashboardHealth.supabase),
        },
      ]
    : [];

  const operationalCount = services.filter(
    (s) =>
      s.status.toLowerCase() === "ok" || s.status.toLowerCase() === "connected"
  ).length;
  const totalServices = services.length;
  const healthPercentage =
    totalServices > 0
      ? Math.round((operationalCount / totalServices) * 100)
      : 0;

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3x">
        {isLoading ? (
          <>
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
          </>
        ) : (
          <>
            <SummaryCard
              title="Services Operational"
              subtitle={
                isLoading
                  ? undefined
                  : `${operationalCount} of ${totalServices} services`
              }
              value={`${healthPercentage}%`}
              color="green"
              isLoading={isLoading}
            />
            <SummaryCard
              title="Healthy Services"
              subtitle={
                isLoading ? undefined : `${totalServices - operationalCount} with issues`
              }
              value={operationalCount.toString()}
              color="lime"
              isLoading={isLoading}
            />
            <SummaryCard
              title="Total Services"
              subtitle="Monitored services"
              value={totalServices.toString()}
              color="orange"
              isLoading={isLoading}
            />
          </>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Services</h2>
        <Card className="bg-white overflow-hidden py-0">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      Array.from({ length: 4 }).map((_, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <span className="text-xs sm:text-sm font-medium text-gray-900">
                              {
                                ["Onramp", "Privy", "Subgraph", "Supabase"][
                                  index
                                ]
                              }
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <Skeleton className="h-6 w-20 rounded-full" />
                          </td>
                        </tr>
                      ))
                    ) : error ? (
                      <tr>
                        <td
                          colSpan={2}
                          className="px-3 sm:px-6 py-8 text-center text-sm text-gray-500"
                        >
                          {error}
                        </td>
                      </tr>
                    ) : (
                      services.map((s, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <span className="text-xs sm:text-sm font-medium text-gray-900">
                              {s.name}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <Badge className={getStatusColor(s.status)}>
                              {s.displayStatus}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Health Section */}
      <div className="mt-6 md:mt-2 flex flex-col items-center justify-center sm:flex-row sm:items-center sm:justify-start gap-0 sm:gap-1.5 w-full">
        {isLoading && !adminHealth ? (
          <Skeleton className="h-5 w-72 sm:w-96" />
        ) : adminHealth ? (
          <>
            <p className="text-sm italic text-gray-500 text-center sm:text-left">
              {adminHealth.message}
            </p>
            <p className="hidden md:block">-</p>
            <p className="text-xs md:text-sm italic text-gray-500 text-center sm:text-left">
              Last checked: {formatTimestamp(adminHealth.timestamp)}
            </p>
          </>
        ) : (
          <p className="text-sm italic text-gray-500 text-center sm:text-left">
            Admin health information unavailable
          </p>
        )}
      </div>
    </div>
  );
};
