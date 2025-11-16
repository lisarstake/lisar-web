import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Info,
  CheckCheck,
  Trash2,
} from "lucide-react";
import { EmptyState } from "@/components/general/EmptyState";
import { useNotification } from "@/contexts/NotificationContext";
import { formatTimeAgo, getNotificationIcon } from "@/lib/notifications";

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    notifications,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch,
  } = useNotification();

  const hasUnread = notifications.some((n) => !n.is_read);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      <div className="flex items-center justify-between px-6 py-8">
        <button
          onClick={handleBackClick}
          className="w-8 h-8 flex items-center justify-center"
        >
          <ChevronLeft color="#C7EF6B" />
        </button>

        <h1 className="text-lg font-medium text-white">Notifications</h1>

        {hasUnread && !isLoading && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs text-[#C7EF6B] hover:text-[#B8E55A] transition-colors"
          >
            Mark all
          </button>
        )}
        {!hasUnread && <div className="w-8"></div>}
      </div>

      {notifications.length === 0 && !isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 mb-32">
          <EmptyState
            icon={Info}
            iconColor="#86B3F7"
            iconBgColor="#2a2a2a"
            title="No notifications yet"
            description="You'll see notifications here when you have activity on your account."
          />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-6 pb-20 scrollbar-hide">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="flex items-start space-x-3 p-4 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]"
                >
                  <div className="w-10 h-10 bg-[#2a2a2a] rounded-full animate-pulse shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#2a2a2a] rounded w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-[#2a2a2a] rounded w-full animate-pulse"></div>
                    <div className="h-3 bg-[#2a2a2a] rounded w-20 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start space-x-3 p-3 rounded-xl border transition-colors ${
                    notification.is_read
                      ? "bg-[#1a1a1a] border-[#2a2a2a]"
                      : "bg-[#1a1a1a] border-[#C7EF6B]/30"
                  }`}
                >
                  <div className="w-10 h-10 bg-[#2a2a2a] rounded-full flex items-center justify-center shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3
                        className={`font-medium ${
                          notification.is_read
                            ? "text-white/70"
                            : "text-white"
                        }`}
                      >
                        {notification.title}
                      </h3>
                      {!notification.is_read && (
                        <div className="w-2.5 h-2.5 bg-red-400 rounded-full shrink-0 mt-1.5"></div>
                      )}
                    </div>
                    <p
                      className={`text-sm mb-2 ${
                        notification.is_read
                          ? "text-gray-500"
                          : "text-gray-400"
                      }`}
                    >
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(notification.created_at)}
                      </span>
                      <div className="flex items-center space-x-3">
                        {!notification.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-xs text-[#C7EF6B] hover:text-[#96C3F7] transition-colors flex items-center space-x-1"
                          >
                            <CheckCheck size={12} />
                            <span>Mark read</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="text-xs text-gray-500 hover:text-red-400 transition-colors flex items-center space-x-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
