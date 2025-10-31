import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const users = [
  { id: 1, name: "Zac Hudson", email: "zac@example.com", role: "Admin", status: "Active", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zac" },
  { id: 2, name: "Alice Johnson", email: "alice@example.com", role: "Moderator", status: "Active", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice" },
  { id: 3, name: "Bob Lee", email: "bob@example.com", role: "User", status: "Suspended", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob" },
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

export const UsersPage: React.FC = () => {
  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <SummaryCard value="12,430" label="Total Users" sub="+2.1% this month" />
        <SummaryCard value="10,982" label="Active Users" sub="+0.8% this month" />
        <SummaryCard value="421" label="New Signups" sub="+5.3% this week" />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Users</h2>
        <Card className="bg-white overflow-hidden py-0">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Role</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                              <AvatarImage src={u.avatar} />
                              <AvatarFallback>{u.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="text-xs sm:text-sm font-medium text-gray-900 block">{u.name}</span>
                              <span className="text-xs text-gray-500 sm:hidden">{u.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600 hidden sm:table-cell">{u.email}</td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600 hidden md:table-cell">{u.role}</td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <Badge className={u.status === "Active" ? "bg-green-100 text-green-800 border-0 text-xs" : "bg-red-100 text-red-800 border-0 text-xs"}>
                            {u.status}
                          </Badge>
                        </td>
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

