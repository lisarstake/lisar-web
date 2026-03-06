import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useNotification } from "@/contexts/NotificationContext";
import { getNotificationIcon } from "@/lib/notifications";

type NotificationTab = "all" | "announcements" | "alerts" | "earnings";

const tabs: { id: NotificationTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "announcements", label: "Announcements" },
  { id: "alerts", label: "Security Alerts" },
  { id: "earnings", label: "Earnings" },
];

const formatNotificationDate = (dateString: string): string => {
  const date = new Date(dateString);
  const formatted = date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return formatted.replace(" AM", "AM").replace(" PM", "PM");
};

const isToday = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();

  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
};

const matchesTab = (type: string, tab: NotificationTab) => {
  const normalized = type.toLowerCase();

  if (tab === "all") return true;

  if (tab === "announcements") {
    return ["system", "announcement", "announcements", "promotion", "promotions"].includes(normalized);
  }

  if (tab === "alerts") {
    return ["alert", "alerts", "security", "security_alert", "security alerts"].includes(normalized);
  }

  if (tab === "earnings") {
    return ["reward", "rewards", "earning", "earnings", "referral"].includes(normalized);
  }

  return true;
};

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<NotificationTab>("all");

  const { notifications, isLoading, markAsRead } = useNotification();

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) =>
      matchesTab(notification.type, activeTab),
    );
  }, [notifications, activeTab]);

  const todayNotifications = useMemo(() => {
    return filteredNotifications.filter((notification) =>
      isToday(notification.created_at),
    );
  }, [filteredNotifications]);

  const olderNotifications = useMemo(() => {
    return filteredNotifications.filter(
      (notification) => !isToday(notification.created_at),
    );
  }, [filteredNotifications]);

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="h-10 w-10 rounded-full bg-[#13170a] flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft className="text-white" size={22} />
        </button>
        <h1 className="text-lg font-medium text-white">Notifications</h1>
        <div className="h-12 w-12" />
      </div>

      <div className="px-6">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm transition-colors ${isActive
                  ? "bg-[#13170a] text-white font-semibold"
                  : "text-white/90"
                  }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-8 scrollbar-hide">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`notification-skeleton-${index}`}
                className="h-24 rounded-[26px] bg-[#13170a] animate-pulse"
              />
            ))}
          </div>
        ) : (
          <>
            {todayNotifications.length > 0 && (
              <section>
                <h2 className="text-base font-medium text-white/50">Today</h2>
                <div className="mt-3 space-y-3">
                  {todayNotifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => {
                        if (!notification.is_read) {
                          markAsRead(notification.id).catch(() => {
                            // keep UX silent if API call fails
                          });
                        }
                      }}
                      className="w-full rounded-xl bg-[#13170a] px-5 py-4 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 rounded-full bg-[#3b463b] flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white truncate">
                            {notification.title}
                          </p>
                          <p className="text-xs text-[#8f9893] mt-0.5">
                            {formatNotificationDate(notification.created_at)}
                          </p>
                        </div>

                        <ChevronRight size={20} className="text-[#8f9893]" />
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {olderNotifications.length > 0 && (
              <section className="mt-4">
                <h2 className="text-base font-medium text-white/50">Earlier</h2>
                <div className="mt-3 space-y-3">
                  {olderNotifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => {
                        if (!notification.is_read) {
                          markAsRead(notification.id).catch(() => {
                            // keep UX silent if API call fails
                          });
                        }
                      }}
                      className="w-full rounded-xl bg-[#13170a] px-5 py-4 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 rounded-full bg-[#3b463b] flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white truncate">
                            {notification.title}
                          </p>
                          <p className="text-xs text-[#8f9893] mt-0.5">
                            {formatNotificationDate(notification.created_at)}
                          </p>
                        </div>

                        <ChevronRight size={20} className="text-[#8f9893]" />
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {filteredNotifications.length === 0 && (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-[#8f9893]">No notifications in this category</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
