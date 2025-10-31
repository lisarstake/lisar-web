import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const validators = [
  { id: 1, name: "Orchestrator One", address: "0x12ab...cd34", status: "Active", stake: "45,000 LPT", commission: "5%" },
  { id: 2, name: "Orchestrator Two", address: "0x98ef...a100", status: "Inactive", stake: "0 LPT", commission: "-" },
  { id: 3, name: "Orchestrator Three", address: "0x77aa...ee11", status: "Active", stake: "12,500 LPT", commission: "8%" },
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

export const ValidatorsPage: React.FC = () => {
  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <SummaryCard value="128" label="Total Validators" sub="+3 new this week" />
        <SummaryCard value="117" label="Active" sub="-1 this month" />
        <SummaryCard value="2" label="Slashed" sub="0 this week" positive={false} />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Validators</h2>
        <Card className="bg-white overflow-hidden py-0">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Address</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Stake</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Commission</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {validators.map((v) => (
                      <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-gray-900 block">{v.name}</span>
                            <span className="text-xs text-gray-500 md:hidden">{v.address}</span>
                            <span className="text-xs text-gray-500 lg:hidden">{v.stake} • {v.commission}</span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-mono text-gray-700 hidden md:table-cell">{v.address}</td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <Badge className={v.status === "Active" ? "bg-green-100 text-green-800 border-0 text-xs" : "bg-gray-100 text-gray-800 border-0 text-xs"}>{v.status}</Badge>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 font-medium hidden lg:table-cell">{v.stake}</td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600 hidden lg:table-cell">{v.commission}</td>
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

