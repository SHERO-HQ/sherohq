"use client";
import { useState, useEffect, useCallback } from "react";
import { useNotifications } from "./useNotifications";

/**
 * A hook to persist and restore form data from localStorage.
 * 
 * @param key The localStorage key to use
 * @param initialData The initial data if no draft exists
 * @returns [data, setData, clearDraft]
 */
export function useFormDraft<T>(key: string, initialData: T) {
  const [data, setData] = useState<T>(initialData);
  const { addNotification } = useNotifications();

  // Load draft on mount
  useEffect(() => {
    const saved = localStorage.getItem(`shoro_draft_${key}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData((prev) => ({ ...prev, ...parsed }));
        addNotification("Draft Restored", "Continuing from your last session.", "success");
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
  }, [key, addNotification]);

  // Sync draft on change
  useEffect(() => {
    if (JSON.stringify(data) !== JSON.stringify(initialData)) {
      localStorage.setItem(`shoro_draft_${key}`, JSON.stringify(data));
    }
  }, [key, data, initialData]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(`shoro_draft_${key}`);
  }, [key]);

  return [data, setData, clearDraft] as const;
}
