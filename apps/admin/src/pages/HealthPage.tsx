import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const services = [
  { id: 1, name: "API Gateway", status: "Operational", uptime: "99.98%", latency: "120ms" },
  { id: 2, name: "Auth Service", status: "Degraded", uptime: "99.20%", latency: "420ms" },
  { id: 3, name: "Database", status: "Operational", uptime: "99.99%", latency: "85ms" },
  { id: 4, name: "Indexer", status: "Outage", uptime: "96.40%", latency: "-" },
];

const SummaryCard: React.FC<{ value: string; label: string; sub: string; positive?: boolean }> = ({ value, label, sub, positive = true }) => (
  <Card className="bg-white">
    <CardContent className="p-6">
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <p className={`text-sm ${positive ? "text-green-600" : "text-red-600"}`}>{sub}</p>
    </CardContent>
  </Card>
);

export const HealthPage: React.FC = () => {
  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <SummaryCard value="99.95%" label="API Uptime" sub="Past 30 days" />
        <SummaryCard value="160ms" label="Avg Latency" sub="-12ms this week" />
        <SummaryCard value="2" label="Incidents" sub="1 open" positive={false} />
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
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Uptime</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Latency</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {services.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-gray-900 block">{s.name}</span>
                            <span className="text-xs text-gray-500 sm:hidden">{s.uptime} • {s.latency}</span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <Badge className={
                            s.status === "Operational"
                              ? "bg-green-100 text-green-800 border-0 text-xs"
                              : s.status === "Degraded"
                              ? "bg-yellow-100 text-yellow-800 border-0 text-xs"
                              : "bg-red-100 text-red-800 border-0 text-xs"
                          }>
                            {s.status}
                          </Badge>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600 hidden sm:table-cell">{s.uptime}</td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600 hidden md:table-cell">{s.latency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

