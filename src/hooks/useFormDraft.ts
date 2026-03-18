import { useState, useEffect, useCallback, useRef } from "react";
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
  const initialDataRef = useRef(initialData);

  // Load draft on mount or key change
  useEffect(() => {
    // Reset data to initial whenever the key changes to prevent crosstalk
    setData(initialDataRef.current);

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
    // Only save if data is actually different from initial state
    const isDefault = JSON.stringify(data) === JSON.stringify(initialDataRef.current);
    
    if (!isDefault) {
      localStorage.setItem(`shoro_draft_${key}`, JSON.stringify(data));
    }
  }, [key, data]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(`shoro_draft_${key}`);
    setData(initialDataRef.current);
  }, [key]);

  return [data, setData, clearDraft] as const;
}
