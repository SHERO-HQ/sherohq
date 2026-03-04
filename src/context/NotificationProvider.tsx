"use client";
import { useState, useMemo, useCallback, type ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import { type Notification, type NotificationType } from "@/types/notification";
import { NotificationContext } from "./NotificationContextType";

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback(
    (
      title: string,
      message: string,
      type: NotificationType = "info",
      link?: string,
    ) => {
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
    },
    [],
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const contextValue = useMemo(
    () => ({
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearAll,
    }),
    [
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearAll,
    ],
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}
