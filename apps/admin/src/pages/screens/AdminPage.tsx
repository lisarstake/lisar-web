import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

export const AdminPage: React.FC = () => {
  const { state } = useAuth();
  const user = state.user;
  
  if (!user) {
    return (
      <div className="space-y-6 lg:space-y-8">
        <p className="text-gray-600">No user data available</p>
      </div>
    );
  }

  // Generate initials from email (take first letter of email username)
  const emailName = user.email.split("@")[0];
  const initials = emailName
    .split(/[.\-_]/)
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-6 lg:space-y-8">
      <Card className="bg-white w-full max-w-xl mx-auto lg:mx-0">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <Avatar className="w-12 h-12 sm:w-14 sm:h-14">
              <AvatarFallback>{initials || "A"}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-base sm:text-lg font-semibold text-gray-900">
                {emailName}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">{user.email}</p>
              <p className="text-xs sm:text-sm font-medium text-gray-800">
                {user.role || "Administrator"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
