import { useState, useMemo, type ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import { type Notification, type NotificationType } from "@/types/notification";
import { NotificationContext } from "./NotificationContextType";

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  function addNotification(
    title: string,
    message: string,
    type: NotificationType = "info",
    link?: string,
  ) {
    const newNotification: Notification = {
      id: uuidv4(),
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
      link,
    };

    setNotifications((prev) => [newNotification, ...prev]);
  }

  function markAsRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }

  function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function clearAll() {
    setNotifications([]);
  }

  // Note: Real-time order notifications would be implemented via WebSocket or SSE
  // when connected to a live order processing system

  return (
    <NotificationContext.Provider
      value={useMemo(
        () => ({
          notifications,
          unreadCount,
          addNotification,
          markAsRead,
          markAllAsRead,
          clearAll,
        }),
        [notifications, unreadCount],
      )}
    >
      {children}
    </NotificationContext.Provider>
  );
}
