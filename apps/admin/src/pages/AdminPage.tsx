import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface AdminUser {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

function getCurrentAdmin(): AdminUser {
  try {
    const raw = localStorage.getItem("adminUser");
    if (raw) {
      return JSON.parse(raw) as AdminUser;
    }
  } catch (_) {}
  // Fallback demo admin
  return {
    name: "Zac Hudson",
    email: "zac@example.com",
    role: "Administrator",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zac",
  };
}

export const AdminPage: React.FC = () => {
  const admin = getCurrentAdmin();
  const initials = admin.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className="space-y-6 lg:space-y-8">
      <Card className="bg-white w-full max-w-xl mx-auto lg:mx-0">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <Avatar className="w-12 h-12 sm:w-14 sm:h-14">
              {admin.avatarUrl ? <AvatarImage src={admin.avatarUrl} /> : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-base sm:text-lg font-semibold text-gray-900">
                {admin.name}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">{admin.email}</p>
              <p className="text-xs sm:text-sm font-medium text-gray-800">{admin.role}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
