import { createContext } from "react";
import { type Notification, type NotificationType } from "@/types/notification";

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (
    title: string,
    message: string,
    type?: NotificationType,
    link?: string,
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const NotificationContext = createContext<
  NotificationContextType | undefined
>(undefined);
