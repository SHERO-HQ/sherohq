"use client";
import { useState, useCallback, ReactNode } from "react";
import { DialogContext, DialogOptions } from "@/context/DialogContext";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface DialogState extends DialogOptions {
  isOpen: boolean;
  isConfirm: boolean;
  resolve: (value: any) => void;
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogState>({
    isOpen: false,
    isConfirm: false,
    message: "",
    resolve: () => {},
  });

  const alert = useCallback((options: DialogOptions | string) => {
    return new Promise<void>((resolve) => {
      const opts = typeof options === "string" ? { message: options } : options;
      setDialog({
        ...opts,
        isOpen: true,
        isConfirm: false,
        resolve,
      });
    });
  }, []);

  const confirm = useCallback((options: DialogOptions | string) => {
    return new Promise<boolean>((resolve) => {
      const opts = typeof options === "string" ? { message: options } : options;
      setDialog({
        ...opts,
        isOpen: true,
        isConfirm: true,
        resolve,
      });
    });
  }, []);

  const handleClose = useCallback(() => {
    setDialog((prev) => ({ ...prev, isOpen: false }));
    dialog.resolve(false);
  }, [dialog]);

  const handleConfirm = useCallback(() => {
    setDialog((prev) => ({ ...prev, isOpen: false }));
    dialog.resolve(true);
  }, [dialog]);

  return (
    <DialogContext.Provider value={{ alert, confirm }}>
      {children}
      <ConfirmDialog
        isOpen={dialog.isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={dialog.title || (dialog.isConfirm ? "Confirm" : "Notice")}
        message={dialog.message}
        confirmText={dialog.confirmText || (dialog.isConfirm ? "Confirm" : "OK")}
        cancelText={dialog.cancelText}
        variant={dialog.type === "error" ? "danger" : dialog.type === "warning" ? "warning" : "info"}
        showCancel={dialog.isConfirm}
      />
    </DialogContext.Provider>
  );
}
