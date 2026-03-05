import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Info,
  CircleQuestionMark,
} from "lucide-react";
import { EmptyState } from "@/components/general/EmptyState";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { ConfirmDrawer } from "@/components/ui/ConfirmDrawer";
import { useNotification } from "@/contexts/NotificationContext";
import { useTransactions } from "@/contexts/TransactionContext";
import { TransactionList } from "@/components/transactions/TransactionList";
import { TransactionData } from "@/services/transactions/types";
import { formatTimeAgo, getNotificationIcon } from "@/lib/notifications";

type ViewMode = "notifications" | "history";

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("notifications");
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    notificationId: string | null;
    notificationTitle: string;
  }>({
    isOpen: false,
    notificationId: null,
    notificationTitle: "",
  });
  const [clearAllConfirm, setClearAllConfirm] = useState(false);
  const swipeStartRef = useRef<{ x: number; id: string } | null>(null);

  const {
    notifications,
    isLoading: isLoadingNotifications,
    error: notificationError,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    refetch: refetchNotifications,
  } = useNotification();

  const {
    transactions,
    isLoading: isLoadingTransactions,
    error: transactionError,
    refetch: refetchTransactions,
  } = useTransactions();

  const hasUnread = notifications.some((n) => !n.is_read);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch (error) {
      // Mark as read failed - silent fail
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      // Mark all as read failed - silent fail
    }
  };

  const handleDeleteClick = (id: string, title: string) => {
    setDeleteConfirm({
      isOpen: true,
      notificationId: id,
      notificationTitle: title,
    });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.notificationId) {
      try {
        await deleteNotification(deleteConfirm.notificationId);
        setDeleteConfirm({
          isOpen: false,
          notificationId: null,
          notificationTitle: "",
        });
      } catch (error) {
       
      }
    }
  };

  const handleTransactionClick = (transaction: TransactionData) => {
    navigate(`/transaction-detail/${transaction.id}`);
  };

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  const handleClearAllClick = () => {
    setClearAllConfirm(true);
  }; 

  const handleClearAllConfirm = async () => {
    try {
      await clearAllNotifications();
      setClearAllConfirm(false);
    } catch (error) {
      
    }
  };

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-8">
        <button
          onClick={handleBackClick}
          className="w-8 h-8 flex items-center justify-center"
        >
          <ChevronLeft color="#C7EF6B" />
        </button>

        <h1 className="text-lg font-medium text-white">
          {viewMode === "notifications" ? "Notifications" : "History"}
        </h1>

        <div className="flex items-center gap-3">
          {viewMode === "notifications" && !isLoadingNotifications && notifications.length > 0 && (
            hasUnread ? (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-[#C7EF6B] hover:text-[#B8E55A] transition-colors"
              >
                Read all
              </button>
            ) : (
              <button
                onClick={handleClearAllClick}
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Clear all
              </button>
            )
          )}
          {viewMode === "history" && (
            <button
              onClick={handleHelpClick}
              className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center"
            >
              <CircleQuestionMark color="#86B3F7" size={16} />
            </button>
          )}
        </div>
      </div>


      {/* Content */}
      {viewMode === "notifications" ? (
        <>
          {notifications.length === 0 && !isLoadingNotifications ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 mb-32">
              <EmptyState
                icon={Info}
                iconColor="#86B3F7"
                iconBgColor="#2a2a2a"
                title="No notifications"
                description="You'll see notifications here when you have activity on your account."
              />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-6 pb-20 scrollbar-hide">
              {isLoadingNotifications ? (
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
                      className={`flex items-start space-x-3 p-3 rounded-xl border transition-colors touch-none select-none ${
                        notification.is_read
                          ? "bg-[#1a1a1a] border-[#2a2a2a]"
                          : "bg-[#1a1a1a] border-[#C7EF6B]/30"
                      }`}
                      onTouchStart={(e) => {
                        swipeStartRef.current = {
                          x: e.touches[0].clientX,
                          id: notification.id,
                        };
                      }}
                      onTouchEnd={(e) => {
                        if (!swipeStartRef.current || swipeStartRef.current.id !== notification.id) return;
                        const deltaX = e.changedTouches[0].clientX - swipeStartRef.current.x;
                        if (deltaX > 60) {
                          handleDeleteClick(notification.id, notification.title);
                        }
                        swipeStartRef.current = null;
                      }}
                      onPointerDown={(e) => {
                        if (e.pointerType === "mouse") return;
                        swipeStartRef.current = {
                          x: e.clientX,
                          id: notification.id,
                        };
                      }}
                      onPointerUp={(e) => {
                        if (e.pointerType === "mouse" || !swipeStartRef.current || swipeStartRef.current.id !== notification.id) return;
                        const deltaX = e.clientX - swipeStartRef.current.x;
                        if (deltaX > 60) {
                          handleDeleteClick(notification.id, notification.title);
                        }
                        swipeStartRef.current = null;
                      }}
                    >
                      <div className="w-10 h-10 bg-[#2a2a2a] rounded-full flex items-center justify-center shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-medium text-sm mb-1 ${
                            notification.is_read
                              ? "text-white/70"
                              : "text-white"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        <p
                          className={`text-[13px] ${
                            notification.is_read
                              ? "text-gray-500"
                              : "text-gray-400"
                          }`}
                        >
                          {notification.message}
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(notification.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          {transactions.length === 0 && !isLoadingTransactions && !transactionError ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 mb-32">
              <TransactionList
                transactions={transactions}
                isLoading={isLoadingTransactions}
                error={transactionError}
                onRetry={refetchTransactions}
                onTransactionClick={handleTransactionClick}
                skeletonCount={5}
              />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-6 pb-20 scrollbar-hide">
              <TransactionList
                transactions={transactions}
                isLoading={isLoadingTransactions}
                error={transactionError}
                onRetry={refetchTransactions}
                onTransactionClick={handleTransactionClick}
                skeletonCount={5}
              />
            </div>
          )}
        </>
      )}

      {/* Fixed Toggle at Bottom */}
      <div className="fixed bottom-12 left-0 right-0 px-6 z-10">
        <div className="flex items-center justify-center">
          <div className="bg-[#1a1a1a] rounded-full p-1 border border-[#2a2a2a]">
            <button
              onClick={() => setViewMode("notifications")}
              className={`px-3 py-2 rounded-full text-xs font-medium transition-colors ${
                viewMode === "notifications"
                  ? "bg-[#C7EF6B] text-black"
                  : "text-white hover:text-[#C7EF6B]"
              }`}
            >
              Notifications
            </button>
            <button
              onClick={() => setViewMode("history")}
              className={`px-3 py-2 rounded-full text-xs font-medium transition-colors ${
                viewMode === "history"
                  ? "bg-[#C7EF6B] text-black"
                  : "text-white hover:text-[#C7EF6B]"
              }`}
            >
              History
            </button>
          </div>
        </div>
      </div>

      {viewMode === "history" && (
        <HelpDrawer
          isOpen={showHelpDrawer}
          onClose={() => setShowHelpDrawer(false)}
          title="History Guide"
          content={[
            "View all your staking activities and transactions in one place.",
            "Green arrows show money coming in, red arrows show money going out.",
            "Click any transaction to see details like date, amount, and status.",
          ]}
        />
      )}

      <ConfirmDrawer
        isOpen={deleteConfirm.isOpen}
        onClose={() =>
          setDeleteConfirm({
            isOpen: false,
            notificationId: null,
            notificationTitle: "",
          })
        }
        onConfirm={handleDeleteConfirm}
        title="Delete Notification"
        message={`Are you sure you want to delete? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      <ConfirmDrawer
        isOpen={clearAllConfirm}
        onClose={() => setClearAllConfirm(false)}
        onConfirm={handleClearAllConfirm}
        title="Clear All Notifications"
        message="Are you sure you want to delete all notifications? This action cannot be undone."
        confirmText="Clear All"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};
