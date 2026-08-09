"use client";

import React, { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { m, AnimatePresence } from "motion/react";
import {
  Star,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCcw,
  Camera,
  User,
  ShieldCheck,
  ShieldOff,
  HatGlasses,
} from "lucide-react";
import Magnetic from "@/components/motion/Magnetic";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { submitPublicTestimonial, publicUploadImage } from "@/services/api";

const feedbackSchema = z
  .object({
    name: z.string(),
    email: z.string(),
    anonymous: z.boolean(),
    rating: z.number().min(1).max(5),
    message: z
      .string()
      .min(10, "Feedback must be at least 10 characters long")
      .max(1000, "Feedback is too long"),
    role: z.string(),
    company: z.string(),
  })
  .superRefine((data, ctx) => {
    if (!data.anonymous) {
      if (!data.name || data.name.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Name is required",
          path: ["name"],
        });
      }
      if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Valid email is required",
          path: ["email"],
        });
      }
    }
  });

type FeedbackValues = z.infer<typeof feedbackSchema>;

const ratingOptions = [
  { value: 5, label: "Excellent", description: "Beyond expectations" },
  { value: 4, label: "Great", description: "Very satisfied" },
  { value: 3, label: "Good", description: "Met expectations" },
  { value: 2, label: "Fair", description: "Needs improvement" },
  { value: 1, label: "Poor", description: "Disappointing" },
];

interface FeedbackFormProps {
  className?: string;
  title?: string;
  description?: string;
}

/**
 * Premium Star Rating Component
 */
const StarRating = ({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (val: number) => void;
  disabled?: boolean;
}) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <m.button
            key={star}
            type="button"
            disabled={disabled}
            whileHover={!disabled ? { scale: 1.2, rotate: 5 } : {}}
            whileTap={!disabled ? { scale: 0.9 } : {}}
            onMouseEnter={() => !disabled && setHovered(star)}
            onMouseLeave={() => !disabled && setHovered(null)}
            onClick={() => onChange(star)}
            className={cn(
              "p-1.5 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary-500 rounded-full",
              disabled && "cursor-not-allowed opacity-50",
            )}
            aria-label={`Rate ${star} stars`}
          >
            <Star
              className={cn(
                "h-6 w-6 sm:h-8 sm:w-8 transition-all duration-500",
                (hovered !== null ? star <= hovered : star <= value)
                  ? (hovered || value) <= 2
                    ? "fill-rose-500 text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]"
                    : (hovered || value) === 3
                      ? "fill-amber-500 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                      : "fill-emerald-500 text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                  : "text-slate-200 dark:text-slate-800",
              )}
            />
          </m.button>
        ))}
      </div>
      <div className="text-center h-10">
        <AnimatePresence mode="wait">
          <m.div
            key={hovered || value}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex flex-col"
          >
            <span className="text-sm font-medium uppercase text-slate-900 dark:text-white">
              {
                ratingOptions.find((opt) => opt.value === (hovered || value))
                  ?.label
              }
            </span>
            <span className="text-xs font-medium text-slate-400">
              {
                ratingOptions.find((opt) => opt.value === (hovered || value))
                  ?.description
              }
            </span>
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default function FeedbackForm({
  className,
  title = "Share Your Experience",
  description = "Your voice helps us shape the future of SHERO.",
}: FeedbackFormProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FeedbackValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      rating: 5,
      anonymous: false,
      message: "",
      name: "",
      email: "",
      role: "",
      company: "",
    },
  });

  const {
    rating: ratingValue,
    anonymous: anonymousValue,
    message: messageValue,
    // eslint-disable-next-line react-hooks/incompatible-library
  } = watch();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setServerError("Image too large. Please select an image under 2MB.");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const onSubmit = async (data: FeedbackValues) => {
    setServerError(null);
    try {
      let imageUrl = "";
      if (imageFile) {
        const uploadRes = await publicUploadImage(imageFile);
        if (uploadRes.success) imageUrl = uploadRes.imageUrl;
      }

      await submitPublicTestimonial({
        quote: data.message,
        author: data.anonymous ? "Anonymous" : data.name || "Guest",
        rating: data.rating,
        image: imageUrl,
        role: data.role || "Verified Customer",
        company: data.company || "Direct Feedback",
      });

      setIsSuccess(true);
      reset();
      removeImage();
    } catch {
      setServerError("Unable to send feedback. Please check your connection.");
    }
  };

  const handleReset = useCallback(() => {
    setIsSuccess(false);
    setServerError(null);
    reset();
    removeImage();
  }, [reset, removeImage]);

  return (
    <Card
      className={cn(
        "border-none shadow-md dark:bg-slate-950/80 backdrop-blur-2xl ring-1 ring-white/10 overflow-hidden w-full rounded",
        className,
      )}
    >
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <m.div
            key="form-step"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="w-full"
          >
            <CardHeader className="text-center pb-2 relative px-4 sm:px-6">
              <CardTitle className="text-xl font-semibold tracking-tighter">
                {title}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                {description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-8 px-4 sm:px-6 pt-2 sm:pt-4 pb-6 sm:pb-10">
              <form
                id="feedback-form"
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4 sm:space-y-8"
              >
                {/* Visual Separator & Rating */}
                <div className="space-y-4">
                  <div className="relative flex items-center">
                    <div className="grow border-t border-slate-200 dark:border-white/5"></div>
                    <span className="shrink mx-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                      Experience
                    </span>
                    <div className="grow border-t border-slate-200 dark:border-white/5"></div>
                  </div>
                  <div className="relative z-10">
                    <StarRating
                      value={ratingValue}
                      onChange={(val) => setValue("rating", val)}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Identity Section */}
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
                      {anonymousValue && <HatGlasses className="h-3 w-3" />}
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
                            error={errors.name?.message}
                          />
                          <Input
                            label="Email Address"
                            type="email"
                            placeholder="john@shero.com"
                            className="bg-transparent border-slate-200 dark:border-white/10 rounded"
                            {...register("email")}
                            error={errors.email?.message}
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

                        {/* Image Profile with Privacy Avatar for Anonymous */}
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
                              Add a photo to make your feedback feel more
                              personal. (Optional)
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
                            Your identity will be protected and no personal
                            information will be stored or displayed.
                          </p>
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Message Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold tracking-widest text-slate-900 dark:text-white">
                      Your Message
                    </p>
                    <span
                      className={cn(
                        "text-[10px] font-mono tracking-widest",
                        messageValue.length > 950
                          ? "text-red-500 font-bold"
                          : "text-slate-400",
                      )}
                    >
                      {messageValue.length}/1000
                    </span>
                  </div>
                  <Textarea
                    placeholder="Tell us what you love or how we can improve..."
                    className="min-h-40 resize-none bg-transparent border-slate-200 dark:border-white/10 rounded focus:ring-4 focus:ring-brand-secondary-500/10 transition-all text-base py-4"
                    {...register("message")}
                    error={errors.message?.message}
                  />
                </div>

                {serverError && (
                  <m.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 rounded bg-red-500/5 text-red-500 text-xs font-bold border border-red-500/20"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{serverError}</span>
                  </m.div>
                )}
              </form>
            </CardContent>
            <CardFooter className="px-4 sm:px-6 pb-8 flex justify-center">
              <Magnetic strength={0.1}>
                <Button
                  type="submit"
                  form="feedback-form"
                  disabled={isSubmitting}
                  variant="brandPrimary"
                  className="w-full sm:w-75 h-12 text-sm font-semibold rounded shadow-[0_10px_20px_rgba(var(--brand-secondary-rgb),0.3)] hover:shadow-[0_15px_25px_rgba(var(--brand-secondary-rgb),0.4)] transition-all active:scale-95 disabled:shadow-none"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-3">
                      Submit Feedback
                    </span>
                  )}
                </Button>
              </Magnetic>
            </CardFooter>
          </m.div>
        ) : (
          <m.div
            key="success-step"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 py-8 sm:py-20 text-center space-y-6 sm:space-y-8"
          >
            <div className="relative">
              <m.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="h-24 w-24 sm:h-32 sm:w-32 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20"
              >
                <CheckCircle2 className="h-12 w-12 sm:h-16 sm:w-16 text-emerald-500" />
              </m.div>
              <m.div
                animate={{ scale: [1, 1.4, 1], opacity: [0, 0.3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-emerald-400 rounded-full"
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-3xl font-bold uppercase tracking-tighter text-slate-900 dark:text-white">
                Gratitude!
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-65 font-medium leading-relaxed">
                Your input has been secured. We truly appreciate the time you
                took to help us improve.
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-60">
              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full h-12 rounded font-bold uppercase tracking-widest text-xs border-slate-200 dark:border-white/10"
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Write Another
              </Button>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
