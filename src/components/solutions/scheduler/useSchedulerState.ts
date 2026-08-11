"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { scheduleConsultation } from "@/services/api";

export function useSchedulerState() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    service: "",
    date: undefined as Date | undefined,
    time: "",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    message: "",
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
      setStatus("success");
    }
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
    status,
    nextStep,
    prevStep,
    handleSubmit,
    isStep1Valid,
    isStep2Valid,
  };
}
