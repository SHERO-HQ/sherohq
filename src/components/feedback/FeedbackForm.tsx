"use client";

import { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { m, AnimatePresence } from "motion/react";
import { AlertCircle, Loader2 } from "lucide-react";
import Magnetic from "@/components/motion/Magnetic";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { submitPublicTestimonial, publicUploadImage } from "@/services/api";
import { StarRating } from "./StarRating";
import { FeedbackIdentityFields } from "./FeedbackIdentityFields";
import { FeedbackSuccessView } from "./FeedbackSuccessView";

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

interface FeedbackFormProps {
  className?: string;
  title?: string;
  description?: string;
}

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
                <FeedbackIdentityFields
                  anonymousValue={anonymousValue}
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  imagePreview={imagePreview}
                  fileInputRef={fileInputRef}
                  handleImageChange={handleImageChange}
                  removeImage={removeImage}
                />

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
          <FeedbackSuccessView handleReset={handleReset} />
        )}
      </AnimatePresence>
    </Card>
  );
}
