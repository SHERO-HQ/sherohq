import { createContext } from "react";

export interface DialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "info" | "warning" | "error" | "success";
}

export interface PromptOptions extends DialogOptions {
  defaultValue?: string;
  placeholder?: string;
  inputType?: string;
}

export interface DialogContextType {
  alert: (options: DialogOptions | string) => Promise<void>;
  confirm: (options: DialogOptions | string) => Promise<boolean>;
  prompt: (options: PromptOptions | string, defaultValue?: string) => Promise<string | null>;
}

export const DialogContext = createContext<DialogContextType | undefined>(undefined);
