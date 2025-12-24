import React, { ReactElement } from "react";
import { Gift, Bell } from "lucide-react";

export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) {
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    return `${diffInMins}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays === 1) {
    return "Yesterday";
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
};

export const getNotificationIcon = (type: string): ReactElement => {
  switch (type) {
    case "reward":
      return <Gift size={18} color="#C7EF6B" />;
    case "system":
      return <Bell size={18} color="#86B3F7" />;
    default:
      return <Bell size={18} color="#86B3F7" />;
  }
};

