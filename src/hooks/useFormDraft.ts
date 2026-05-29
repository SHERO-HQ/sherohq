"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useNotifications } from "@/hooks/useNotifications";

export interface UseFormDraftOptions<T> {
  storageKey: string;
  currentData: T;
  isMeaningful: (data: T) => boolean;
  serialize: (data: T) => string;
  deserialize: (text: string) => T;
  onRestore: (restored: T) => void;
  isLoading: boolean;
  debounceMs?: number;
}

const STORAGE_PREFIX = "sherotech:admin";
const lastRestoredTime = new Map<string, number>();

const checkStorageQuota = (): boolean => {
  if (typeof window === "undefined") return true;
  const test = "__quota_test__";
  try {
    const testData = new Array(1024 * 512).join("x"); // 512KB test
    localStorage.setItem(test, testData);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

const cleanupOldDrafts = (): void => {
  if (typeof window === "undefined") return;
  try {
    const drafts: Array<{ key: string; timestamp: number }> = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith(STORAGE_PREFIX) || key.includes("product-form") || key.includes("project-form") || key.includes("guide-editor"))) {
        if (!key.endsWith(":savedAt")) {
          const timestampKey = `${key}:savedAt`;
          const timestampStr = localStorage.getItem(timestampKey);
          const timestamp = timestampStr ? new Date(timestampStr).getTime() : 0;
          drafts.push({ key, timestamp });
        }
      }
    }
    drafts.sort((a, b) => a.timestamp - b.timestamp);
    const toRemove = Math.ceil(drafts.length / 2);
    for (let i = 0; i < toRemove; i++) {
      localStorage.removeItem(drafts[i].key);
      localStorage.removeItem(`${drafts[i].key}:savedAt`);
    }
  } catch (e) {
    console.error("Failed to clean up old drafts:", e);
  }
};

export function useFormDraft<T>({
  storageKey,
  currentData,
  isMeaningful,
  serialize,
  deserialize,
  onRestore,
  isLoading,
  debounceMs = 400,
}: UseFormDraftOptions<T>) {
  const { addNotification } = useNotifications();
  const [hasDraft, setHasDraft] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const initialSnapshotRef = useRef<string>("");

  const clearDraft = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(storageKey);
    localStorage.removeItem(`${storageKey}:savedAt`);
    setHasDraft(false);
    setDraftSavedAt(null);
    initialSnapshotRef.current = serialize(currentData);
  }, [storageKey, serialize, currentData]);

  const persistDraft = useCallback((data: T) => {
    if (typeof window === "undefined") return;
    if (!isMeaningful(data)) {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(`${storageKey}:savedAt`);
      setHasDraft(false);
      setDraftSavedAt(null);
      return;
    }
    try {
      localStorage.setItem(storageKey, serialize(data));
      const savedAt = new Date().toISOString();
      localStorage.setItem(`${storageKey}:savedAt`, savedAt);
      setHasDraft(true);
      setDraftSavedAt(savedAt);

      if (!checkStorageQuota()) {
        cleanupOldDrafts();
      }
    } catch (e) {
      console.error("Failed to save draft:", e);
    }
  }, [storageKey, serialize, isMeaningful]);

  // Restoration Effect
  useEffect(() => {
    if (typeof window === "undefined" || isLoading || draftLoaded) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const savedAt = localStorage.getItem(`${storageKey}:savedAt`);
        const parsed = deserialize(saved);
        onRestore(parsed);
        setHasDraft(true);
        setDraftSavedAt(savedAt);

        // Prevent duplicate notifications during React Strict Mode double-mount
        const now = Date.now();
        const lastTime = lastRestoredTime.get(storageKey) || 0;
        if (now - lastTime > 1000) {
          lastRestoredTime.set(storageKey, now);
          addNotification(
            "Draft restored",
            "We restored your locally saved draft in this browser.",
            "info"
          );
        }
      }
    } catch (e) {
      console.error("Failed to restore draft:", e);
      clearDraft();
    } finally {
      setDraftLoaded(true);
    }
  }, [isLoading, draftLoaded, storageKey, deserialize, onRestore, addNotification, clearDraft]);

  // Capture clean/initial state snapshot once restored
  useEffect(() => {
    if (!draftLoaded || initialSnapshotRef.current) return;
    initialSnapshotRef.current = serialize(currentData);
  }, [currentData, draftLoaded, serialize]);

  // Debounced auto-save effect
  useEffect(() => {
    if (!draftLoaded || isLoading) return;
    const snapshot = serialize(currentData);
    if (snapshot === initialSnapshotRef.current) return;

    const timeout = setTimeout(() => {
      persistDraft(currentData);
    }, debounceMs);

    return () => clearTimeout(timeout);
  }, [currentData, draftLoaded, isLoading, persistDraft, serialize, debounceMs]);

  return {
    hasDraft,
    draftSavedAt,
    persistDraft,
    clearDraft,
  };
}
