"use client";

import React from "react";
import { m, AnimatePresence } from "motion/react";
import { ShieldCheck, ShieldOff, Glasses, User, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form";

interface FeedbackIdentityFieldsProps {
  anonymousValue: boolean;
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  setValue: UseFormSetValue<any>;
  imagePreview: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: () => void;
}

export function FeedbackIdentityFields({
  anonymousValue,
  register,
  errors,
  setValue,
  imagePreview,
  fileInputRef,
  handleImageChange,
  removeImage,
}: FeedbackIdentityFieldsProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
          {anonymousValue ? (
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          ) : (
            <ShieldOff className="h-4 w-4 text-slate-400" />
          )}
          Identity
        </h4>
        <button
          type="button"
          onClick={() => setValue("anonymous", !anonymousValue)}
          className={cn(
            "flex items-center gap-2 text-[10px] font-medium px-4 py-1 rounded transition-all duration-300 border shadow-sm active:scale-95",
            anonymousValue
              ? "bg-emerald-500 text-white border-emerald-600 shadow-emerald-500/20"
              : "bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10",
          )}
        >
          {anonymousValue && <Glasses className="h-3 w-3" />}
          {anonymousValue ? "Anonymous" : "Public"}
        </button>
        <input type="hidden" {...register("anonymous")} />
      </div>

      <AnimatePresence mode="popLayout">
        {!anonymousValue ? (
          <m.div
            key="identity-fields"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                className="bg-transparent border-slate-200 dark:border-white/10 rounded"
                {...register("name")}
                error={errors.name?.message as string}
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="john@shero.com"
                className="bg-transparent border-slate-200 dark:border-white/10 rounded"
                {...register("email")}
                error={errors.email?.message as string}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Role"
                placeholder="e.g. Designer"
                className="bg-transparent border-slate-200 dark:border-white/10 rounded"
                {...register("role")}
              />
              <Input
                label="Company"
                placeholder="e.g. Acme"
                className="bg-transparent border-slate-200 dark:border-white/10 rounded"
                {...register("company")}
              />
            </div>

            {/* Profile Picture Upload */}
            <div className="flex items-center gap-4 p-4 rounded bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 shadow-inner">
              <div className="relative group">
                <div className="w-16 h-16 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center overflow-hidden shadow-sm">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover scale-110"
                    />
                  ) : (
                    <User className="h-6 w-6 text-slate-300" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 p-2 bg-brand-secondary-600 text-white rounded shadow-lg hover:bg-brand-secondary-500 transition-all hover:rotate-6 active:scale-90"
                >
                  <Camera className="h-3 w-3" />
                </button>
              </div>
              <div className="flex-1">
                <Label className="text-xs font-bold uppercase tracking-widest opacity-50">
                  Profile Picture
                </Label>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">
                  Add a photo to make your feedback feel more personal. (Optional)
                </p>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-1.5 hover:underline"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </m.div>
        ) : (
          <m.div
            key="anonymous-notice"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex gap-4 p-4 rounded bg-emerald-500/5 border border-emerald-500/20 space-y-2"
          >
            <ShieldCheck className="h-8 w-8 text-emerald-500" />
            <div className="flex flex-col gap-2">
              <h5 className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Anonymous Mode
              </h5>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Your identity will be protected and no personal information
                will be stored or displayed.
              </p>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
