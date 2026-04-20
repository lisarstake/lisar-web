import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { useNotification } from "@/contexts/NotificationContext";
import { Notification } from "@/services/notifications/types";
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
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

  const { notifications, isLoading, markAsRead, deleteNotification } =
    useNotification();

  const retentionThreshold = useMemo(
    () => Date.now() - 90 * 24 * 60 * 60 * 1000,
    [],
  );

  const recentNotifications = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          new Date(notification.created_at).getTime() >= retentionThreshold,
      ),
    [notifications, retentionThreshold],
  );

  const outdatedNotifications = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          new Date(notification.created_at).getTime() < retentionThreshold,
      ),
    [notifications, retentionThreshold],
  );

  useEffect(() => {
    if (!outdatedNotifications.length) return;

    Promise.all(
      outdatedNotifications.map((notification) =>
        deleteNotification(notification.id),
      ),
    ).catch(() => {
      // keep UI stable even if cleanup fails
    });
  }, [deleteNotification, outdatedNotifications]);

  const filteredNotifications = useMemo(() => {
    return recentNotifications.filter((notification) =>
      matchesTab(notification.type, activeTab),
    );
  }, [recentNotifications, activeTab]);

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

  const handleNotificationSelect = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        await markAsRead(notification.id);
      } catch {
        // ignore failures
      }
    }

    setSelectedNotification(notification);
  };

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="h-10 w-10 rounded-full bg-[#2a2a2a] flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft className="text-white" size={22} />
        </button>
        {/* <h1 className="text-lg font-medium text-white">Notifications</h1> */}
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
                  ? "bg-[#2a2a2a] text-white font-semibold"
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
                className="h-24 rounded-[26px] bg-[#2a2a2a] animate-pulse"
              />
            ))}
          </div>
        ) : (
          <>
            {todayNotifications.length > 0 && (
              <section className="mt-4">
                <h2 className="text-sm font-medium text-white/50">Today</h2>
                <div className="mt-3 space-y-3">
                  {todayNotifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationSelect(notification)}
                      className="w-full rounded-xl bg-[#2a2a2a] px-5 py-4 text-left"
                    >
                      <div className="relative flex items-center gap-3">
                        {!notification.is_read && (
                          <span className="absolute top-5 right-0 h-2.5 w-2.5 rounded-full bg-red-400" />
                        )}
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
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {olderNotifications.length > 0 && (
              <section className="mt-4">
                <h2 className="text-sm font-medium text-white/50">Earlier</h2>
                <div className="mt-3 space-y-3">
                  {olderNotifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationSelect(notification)}
                      className="w-full rounded-xl bg-[#2a2a2a] px-5 py-4 text-left"
                    >
                      <div className="relative flex items-center gap-3">
                        {!notification.is_read && (
                          <span className="absolute top-2 right-3 h-2.5 w-2.5 rounded-full bg-[#ff4b4b]" />
                        )}
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
      <NotificationDetailsDrawer
        notification={selectedNotification}
        isOpen={selectedNotification !== null}
        onClose={() => setSelectedNotification(null)}
      />
    </div>
  );
};

interface NotificationDetailsDrawerProps {
  notification: Notification | null;
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDetailsDrawer: React.FC<NotificationDetailsDrawerProps> = ({
  notification,
  isOpen,
  onClose,
}) => {
  if (!notification) return null;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-[#050505] border-[#505050] px-4">
        <DrawerHeader className="mb-5">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-base font-medium text-white text-left">
              {notification.title}
            </DrawerTitle>
            <DrawerClose className="h-8 w-8 rounded-full bg-[#1a1a1a] flex items-center justify-center">
              <X className="text-white" size={18} />
            </DrawerClose>
          </div>
        </DrawerHeader>



        <div className="rounded-lg bg-white/10 py-2 px-2">
          <p className="text-sm leading-relaxed text-white">
            {notification.message}
          </p>
          <p className="text-xs text-white/60 mt-2.5">
            {formatNotificationDate(notification.created_at)}
          </p>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
