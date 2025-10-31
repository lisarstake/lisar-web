import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const transactions = [
  { id: "0x3f0b...fdec", user: "Zac Hudson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zac", type: "Deposit", amount: "$1,250.00", status: "Successful", date: "2 hours ago" },
  { id: "0x7b2a...9a10", user: "Alice Johnson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice", type: "Stake", amount: "$700.00", status: "Pending", date: "Yesterday" },
  { id: "0x91cc...ab11", user: "Bob Lee", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob", type: "Withdraw", amount: "$300.00", status: "Failed", date: "2 days ago" },
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

export const TransactionsPage: React.FC = () => {
  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <SummaryCard value="$1.2M" label="Total Volume" sub="+3.2% this month" />
        <SummaryCard value="8,421" label="Successful" sub="+1.1% this month" />
        <SummaryCard value="143" label="Failed" sub="-0.4% this month" positive={false} />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Transactions</h2>
        <Card className="bg-white overflow-hidden py-0">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Tx Hash</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Type</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-mono text-gray-700 hidden md:table-cell">{t.id}</td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                              <AvatarImage src={t.avatar} />
                              <AvatarFallback>{t.user.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="text-xs sm:text-sm font-medium text-gray-900 block">{t.user}</span>
                              <span className="text-xs text-gray-500 md:hidden">{t.id}</span>
                              <span className="text-xs text-gray-500 lg:hidden">{t.type}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600 hidden lg:table-cell">{t.type}</td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 font-medium">{t.amount}</td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <Badge className={
                            t.status === "Successful"
                              ? "bg-green-100 text-green-800 border-0 text-xs"
                              : t.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800 border-0 text-xs"
                              : "bg-red-100 text-red-800 border-0 text-xs"
                          }>
                            {t.status}
                          </Badge>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600 hidden sm:table-cell">{t.date}</td>
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

