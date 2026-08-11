"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { type Notification, type NotificationType } from "@/types/notification";
import { toast } from "sonner";

const NOTIFICATIONS_KEY = ["notifications"];

export function useNotifications() {
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: () => [],
    initialData: [],
    staleTime: Infinity,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback(
    (
      title: string,
      message: string,
      type: NotificationType = "info",
      link?: string
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

      queryClient.setQueryData<Notification[]>(NOTIFICATIONS_KEY, (prev = []) => [
        newNotification,
        ...prev,
      ]);

      // Trigger sonner toast
      if (type === "success") {
        toast.success(title, { description: message });
      } else if (type === "error") {
        toast.error(title, { description: message });
      } else if (type === "warning") {
        toast.warning(title, { description: message });
      } else {
        toast.info(title, { description: message });
      }
    },
    [queryClient]
  );

  const markAsRead = useCallback(
    (id: string) => {
      queryClient.setQueryData<Notification[]>(NOTIFICATIONS_KEY, (prev = []) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    },
    [queryClient]
  );

  const markAllAsRead = useCallback(() => {
    queryClient.setQueryData<Notification[]>(NOTIFICATIONS_KEY, (prev = []) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  }, [queryClient]);

  const clearAll = useCallback(() => {
    queryClient.setQueryData<Notification[]>(NOTIFICATIONS_KEY, []);
  }, [queryClient]);

  return useMemo(
    () => ({
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearAll,
    }),
    [notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearAll]
  );
}
