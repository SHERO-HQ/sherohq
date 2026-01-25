import { useState, useEffect, useMemo, type ReactNode } from "react";
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

  // Poll for simulated new orders (Demonstration purposes)
  useEffect(() => {
    const interval = setInterval(() => {
      // 10% chance to simulate a new order every 30s
      if (Math.random() > 0.9) {
        const amount = (Math.random() * 500 + 50).toFixed(2);
        addNotification(
          "New Order Received",
          `Customer placed an order for $${amount}`,
          "success",
          "/admin/orders",
        );
      }
    }, 10000); // Check every 10s for demo speed

    return () => clearInterval(interval);
  }, []);

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
