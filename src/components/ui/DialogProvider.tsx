"use client";
import { useState, useCallback, ReactNode } from "react";
import { DialogContext, DialogOptions, PromptOptions } from "@/context/DialogContext";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface DialogState extends DialogOptions {
  isOpen: boolean;
  isConfirm: boolean;
  isPrompt?: boolean;
  promptValue?: string;
  placeholder?: string;
  inputType?: string;
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
        isPrompt: false,
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
        isPrompt: false,
        resolve,
      });
    });
  }, []);

  const prompt = useCallback((options: PromptOptions | string, defaultValue = "") => {
    return new Promise<string | null>((resolve) => {
      const opts = typeof options === "string" ? { message: options, defaultValue } : options;
      setDialog({
        ...opts,
        isOpen: true,
        isConfirm: true,
        isPrompt: true,
        promptValue: opts.defaultValue ?? defaultValue,
        placeholder: opts.placeholder || "",
        inputType: opts.inputType || "text",
        resolve,
      });
    });
  }, []);

  const handleClose = useCallback(() => {
    setDialog((prev) => ({ ...prev, isOpen: false }));
    if (dialog.isPrompt) {
      dialog.resolve(null);
    } else {
      dialog.resolve(false);
    }
  }, [dialog]);

  const handleConfirm = useCallback(() => {
    setDialog((prev) => ({ ...prev, isOpen: false }));
    if (dialog.isPrompt) {
      dialog.resolve(dialog.promptValue ?? "");
    } else {
      dialog.resolve(true);
    }
  }, [dialog]);

  return (
    <DialogContext.Provider value={{ alert, confirm, prompt }}>
      {children}
      <ConfirmDialog
        isOpen={dialog.isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={dialog.title || (dialog.isPrompt ? "Input Required" : dialog.isConfirm ? "Confirm" : "Notice")}
        message={dialog.message}
        confirmText={dialog.confirmText || (dialog.isPrompt ? "Submit" : dialog.isConfirm ? "Confirm" : "OK")}
        cancelText={dialog.cancelText || "Cancel"}
        variant={dialog.type === "error" ? "danger" : dialog.type === "warning" ? "warning" : dialog.type === "success" ? "success" : "info"}
        showCancel={dialog.isConfirm || dialog.isPrompt}
        isPrompt={dialog.isPrompt}
        promptValue={dialog.promptValue}
        onPromptChange={(val) => setDialog((prev) => ({ ...prev, promptValue: val }))}
        placeholder={dialog.placeholder}
        inputType={dialog.inputType}
      />
    </DialogContext.Provider>
  );
}
