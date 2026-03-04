"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

interface BreadcrumbContextType {
  customLabels: Map<string, string>;
  setLabel: (path: string, label: string) => void;
  clearLabel: (path: string) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | null>(null);

export function BreadcrumbProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [customLabels, setCustomLabels] = useState<Map<string, string>>(
    new Map(),
  );

  const setLabel = useCallback((path: string, label: string) => {
    setCustomLabels((prev) => {
      const next = new Map(prev);
      next.set(path, label);
      return next;
    });
  }, []);

  const clearLabel = useCallback((path: string) => {
    setCustomLabels((prev) => {
      const next = new Map(prev);
      next.delete(path);
      return next;
    });
  }, []);

  const contextValue = useMemo(
    () => ({ customLabels, setLabel, clearLabel }),
    [customLabels, setLabel, clearLabel],
  );

  return (
    <BreadcrumbContext.Provider value={contextValue}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBreadcrumb() {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error("useBreadcrumb must be used within BreadcrumbProvider");
  }
  return context;
}
