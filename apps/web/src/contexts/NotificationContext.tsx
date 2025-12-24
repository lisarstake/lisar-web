import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import {
  Notification,
  PaginatedNotificationsResponse,
  UnreadCountResponse,
} from "@/services/notifications/types";
import { notificationService } from "@/services";
import { useAuth } from "./AuthContext";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  total: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: (limit?: number, offset?: number) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAllAsRead: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { state } = useAuth();

  const fetchNotifications = useCallback(
    async (limit: number = 50, offset: number = 0) => {
      if (!state.isAuthenticated) {
        setNotifications([]);
        setTotal(0);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await notificationService.getNotifications({
          limit,
          offset,
        });

        if (response.success && response.data) {
          setNotifications(response.data.notifications);
          setTotal(response.data.total);
        } else {
          throw new Error(response.message || "Failed to fetch notifications");
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load notifications");
        console.warn("Notifications fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [state.isAuthenticated]
  );

  const fetchUnreadCount = useCallback(async () => {
    if (!state.isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await notificationService.getUnreadCount();

      if (response.success && response.data) {
        setUnreadCount(response.data.unread_count);
      }
    } catch (err: any) {
      console.warn("Unread count fetch error:", err);
    }
  }, [state.isAuthenticated]);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await notificationService.markAllAsRead();

      if (response.success) {
        // Update local state - mark all notifications as read
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, is_read: true }))
        );
        setUnreadCount(0);
        // Optionally refetch to get updated data
        await fetchUnreadCount();
      } else {
        throw new Error(response.message || "Failed to mark all as read");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to mark all as read");
      throw err;
    }
  }, [fetchUnreadCount]);

  const markAsRead = useCallback(
    async (id: string) => {
      try {
        const response = await notificationService.markAsRead({ id });

        if (response.success) {
          // Update local state
          setNotifications((prev) =>
            prev.map((notif) =>
              notif.id === id ? { ...notif, is_read: true } : notif
            )
          );
          // Update unread count
          setUnreadCount((prev) => Math.max(0, prev - 1));
        } else {
          throw new Error(response.message || "Failed to mark as read");
        }
      } catch (err: any) {
        setError(err?.message || "Failed to mark as read");
        throw err;
      }
    },
    []
  );

  const deleteNotification = useCallback(
    async (id: string) => {
      try {
        const response = await notificationService.deleteNotification({ id });

        if (response.success) {
          // Update local state - remove deleted notification
          setNotifications((prev) => prev.filter((notif) => notif.id !== id));
          setTotal((prev) => Math.max(0, prev - 1));
          // Check if deleted notification was unread
          const deletedNotif = notifications.find((n) => n.id === id);
          if (deletedNotif && !deletedNotif.is_read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        } else {
          throw new Error(response.message || "Failed to delete notification");
        }
      } catch (err: any) {
        setError(err?.message || "Failed to delete notification");
        throw err;
      }
    },
    [notifications]
  );

  const refetch = useCallback(async () => {
    await Promise.all([fetchNotifications(), fetchUnreadCount()]);
  }, [fetchNotifications, fetchUnreadCount]);

  // Fetch notifications and unread count when user is authenticated
  useEffect(() => {
    if (state.isAuthenticated && !state.isLoading) {
      fetchNotifications();
      fetchUnreadCount();
    } else if (!state.isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      setTotal(0);
    }
  }, [state.isAuthenticated, state.isLoading, fetchNotifications, fetchUnreadCount]);

  const value = useMemo<NotificationContextType>(
    () => ({
      notifications,
      unreadCount,
      total,
      isLoading,
      error,
      fetchNotifications,
      fetchUnreadCount,
      markAllAsRead,
      markAsRead,
      deleteNotification,
      refetch,
    }),
    [
      notifications,
      unreadCount,
      total,
      isLoading,
      error,
      fetchNotifications,
      fetchUnreadCount,
      markAllAsRead,
      markAsRead,
      deleteNotification,
      refetch,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

