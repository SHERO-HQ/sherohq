"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { scheduleConsultation } from "@/services/api";

import { getAccraToday } from "@/lib/consultation-time";

export function useSchedulerState() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState(() => {
    return {
      service: "",
      date: getAccraToday() as Date | undefined,
      time: "",
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      message: "",
    };
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success">(
    "idle",
  );

  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (window.innerWidth < 768 && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [step]);

  const nextStep = () => {
    setDirection(1);
    setStep((p) => Math.min(p + 1, 3));
  };

  const prevStep = () => {
    setDirection(-1);
    setStep((p) => Math.max(p - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    try {
      if (!formData.date) {
        throw new Error("Date is required");
      }

      await scheduleConsultation({
        service: formData.service,
        date: formData.date,
        time: formData.time,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
      });

      setStatus("success");
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to schedule consultation. Please check your connection and try again.");
      setStatus("idle");
    }
  };

  const resetForm = () => {
    setStep(1);
    setDirection(0);
    setStatus("idle");
    setFormData({
      service: "",
      date: undefined,
      time: "",
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      message: "",
    });
  };

  const selectService = (service: string) => {
    setFormData((prev) => ({ ...prev, service }));
  };

  const selectDate = (date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, date, time: "" }));
  };

  const selectTime = (time: string) => {
    setFormData((prev) => ({ ...prev, time }));
  };

  const isStep1Valid = !!formData.service;
  const isStep2Valid = !!formData.date && !!formData.time;

  return {
    router,
    step,
    direction,
    scrollRef,
    formData,
    setFormData,
    selectService,
    selectDate,
    selectTime,
    status,
    nextStep,
    prevStep,
    resetForm,
    handleSubmit,
    isStep1Valid,
    isStep2Valid,
  };
}
