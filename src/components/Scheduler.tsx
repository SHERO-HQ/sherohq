import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Briefcase,
  Search,
  Code2,
  BarChart,
  User,
  Mail,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

// --- Types ---

type ServiceType = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

const services: ServiceType[] = [
  {
    id: "discovery",
    title: "Discovery Call",
    description: "Discuss your project goals and requirements.",
    icon: <Search className="w-6 h-6" />,
  },
  {
    id: "consultation",
    title: "Technical Consultation",
    description: "Deep dive into architecture and tech stack.",
    icon: <Code2 className="w-6 h-6" />,
  },
  {
    id: "audit",
    title: "System Audit",
    description: "Review existing codebase and performance.",
    icon: <BarChart className="w-6 h-6" />,
  },
];

const timeSlots = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
];

// --- Scheduler Component ---

const Scheduler = () => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    service: "",
    date: undefined as Date | undefined,
    time: "",
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success">(
    "idle"
  );

  // Auto-scroll to top on step change for mobile
  useEffect(() => {
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
    // Simulate API
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setStatus("success");
  };

  const isStep1Valid = !!formData.service;
  const isStep2Valid = !!formData.date && !!formData.time;

  if (status === "success") {
    return (
      <div className="max-w-xl mx-auto p-8 md:p-10 bg-white dark:bg-slate-900 rounded shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
        </motion.div>
        <h2 className="text-2xl md:text-3xl font-bold font-sora text-slate-900 dark:text-slate-100 mb-4">
          Booking Confirmed!
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8 mx-auto leading-relaxed">
          Your{" "}
          <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
            {services.find((s) => s.id === formData.service)?.title}
          </strong>
          <br />
          is scheduled for <br />
          <span className="font-semibold text-primary dark:text-blue-600 block text-lg mt-1">
            {formData.date && format(formData.date, "MMMM do, yyyy")} at{" "}
            {formData.time}
          </span>
        </p>
        <p className="text-sm text-slate-500 mb-6">
          A confirmation email has been sent to {formData.email}
        </p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="rounded"
        >
          Book Another Session
        </Button>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="max-w-[1240px] mx-auto bg-white dark:bg-slate-900 rounded shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col justify-center md:flex-row min-h-[500px] md:min-h-[600px]"
    >
      {/* Sidebar / Progress */}
      <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-950 p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
        <div className="mb-6 md:mb-8">
          <h3 className="text-lg font-bold font-sora text-slate-900 dark:text-slate-100">
            Consultation
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 hidden md:block mt-1">
            Schedule your meeting in 3 simple steps.
          </p>
        </div>

        {/* Horizontal Steps on Mobile / Vertical on Desktop */}
        <div className="flex md:flex-col justify-between md:justify-start gap-4 md:space-y-8 relative mb-4 md:mb-0 isolate">
          {/* Vertical Line for Desktop */}
          <div className="hidden md:block absolute left-4 top-2 bottom-1 w-0.5 bg-slate-200 dark:bg-slate-800 -z-10">
            <div
              className="w-full bg-emerald-500 transition-all duration-500 ease-out"
              style={{ height: `${((step - 1) / 2) * 100}%` }}
            />
          </div>

          {/* Horizontal Line for Mobile */}
          <div className="md:hidden absolute top-4 left-12 right-12 h-0.5 bg-slate-200 dark:bg-slate-800 -z-10">
            <div
              className="h-full bg-emerald-500 transition-all duration-500 ease-out"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />
          </div>

          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="relative flex md:items-center gap-3 md:gap-4 flex-1 md:flex-none flex-col md:flex-row items-center text-center md:text-left"
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold relative z-10 transition-all duration-300 shrink-0 border-2",
                  step === s
                    ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/30 ring-4 ring-emerald-50 dark:ring-emerald-900/20"
                    : step > s
                    ? "bg-emerald-100 dark:bg-emerald-900 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                    : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500"
                )}
              >
                {step > s ? (
                  <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
                ) : (
                  s
                )}
              </div>
              <div>
                <p
                  className={cn(
                    "text-xs md:text-sm font-medium whitespace-nowrap",
                    step === s
                      ? "text-slate-900 dark:text-slate-100"
                      : "text-slate-500 dark:text-slate-400"
                  )}
                >
                  {s === 1 ? "Service" : s === 2 ? "Time" : "Details"}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Summary (Desktop Only) */}
        {step > 1 && (
          <div className="hidden md:block mt-auto p-4 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Booking Summary
            </h4>
            {formData.service && (
              <div className="flex items-center gap-2 mb-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                <Briefcase className="w-4 h-4 text-emerald-500" />
                {services.find((s) => s.id === formData.service)?.title}
              </div>
            )}
            {formData.date && (
              <div className="flex items-center font-semibold gap-2 mb-2 text-sm text-slate-600 dark:text-slate-300">
                <CalendarIcon className="w-4 h-4 text-emerald-500" />
                {format(formData.date, "MMM do, yyyy")}
              </div>
            )}
            {formData.time && (
              <div className="flex items-center font-semibold gap-2 text-sm text-slate-600 dark:text-slate-300">
                <Clock className="w-4 h-4 text-emerald-500" />
                {formData.time}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="w-full flex-1 justify-center p-3 sm:p-6 md:p-10 relative bg-white dark:bg-slate-900 flex flex-col">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * 10, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: direction * -10, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex-1 flex flex-col"
          >
            {/* STEP 1: SERVICE */}
            {step === 1 && (
              <div className="flex flex-col h-full">
                <h2 className="text-xl md:text-2xl font-bold font-sora text-slate-900 dark:text-slate-100 mb-6">
                  Select a Service
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() =>
                        setFormData({ ...formData, service: service.id })
                      }
                      className={cn(
                        "flex items-start md:items-center p-4 rounded border-2 transition-all duration-200 text-left hover:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 group relative overflow-hidden cursor-pointer",
                        formData.service === service.id
                          ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10 shadow-sm"
                          : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
                      )}
                    >
                      <div
                        className={cn(
                          "w-10 h-10 md:w-12 md:h-12 rounded flex items-center justify-center mr-4 transition-colors shrink-0",
                          formData.service === service.id
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-emerald-500"
                        )}
                      >
                        {service.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm md:text-base">
                          {service.title}
                        </h3>
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                          {service.description}
                        </p>
                      </div>
                      <div
                        className={cn(
                          "ml-3 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-1 md:mt-0",
                          formData.service === service.id
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-slate-200 dark:border-slate-700"
                        )}
                      >
                        {formData.service === service.id && (
                          <CheckCircle2 className="w-3 h-3" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-8 md:mt-auto pt-4 flex justify-end">
                  <Button
                    onClick={nextStep}
                    disabled={!isStep1Valid}
                    size="lg"
                    className="w-full md:w-auto rounded px-8 dark:text-slate-200"
                  >
                    Continue <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: DATE & TIME */}
            {step === 2 && (
              <div className="flex flex-col h-full">
                <h2 className="text-xl md:text-2xl font-bold font-sora text-slate-900 dark:text-slate-100 mb-6">
                  Choose Date & Time
                </h2>

                <div className="flex flex-col xl:flex-row gap-8">
                  <div className="flex-1 mx-auto max-w-[350px] xl:max-w-none">
                    <div className="border border-slate-200 dark:border-slate-800 rounded p-1 sm:p-3 bg-slate-50/50 dark:bg-slate-900/50">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) =>
                          setFormData({ ...formData, date, time: "" })
                        }
                        disabled={(date) =>
                          date.getDay() === 0 || // Disable Sundays
                          date < new Date() ||
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        className="rounded mx-auto"
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium font-sora text-slate-700 dark:text-slate-300 mb-3  xl:block">
                      Available Times
                    </label>
                    {!formData.date ? (
                      <div className="h-32 xl:h-64 flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded text-slate-400 text-sm bg-slate-50/50 dark:bg-slate-900/50">
                        Select a date to see times
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
                        {(formData.date.getDay() === 6
                          ? timeSlots.filter((t) => t !== "04:00 PM")
                          : timeSlots
                        ).map((time) => (
                          <button
                            key={time}
                            onClick={() => setFormData({ ...formData, time })}
                            className={cn(
                              "px-3 py-2.5 rounded text-sm font-medium transition-all text-center border cursor-pointer",
                              formData.time === time
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20 scale-105"
                                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-500"
                            )}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 md:mt-auto pt-8 flex justify-between items-center gap-4">
                  <Button
                    onClick={prevStep}
                    variant="ghost"
                    size="lg"
                    className="rounded px-6"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button
                    onClick={nextStep}
                    disabled={!isStep2Valid}
                    size="lg"
                    className="flex-1 md:flex-none rounded dark:text-slate-100 px-8"
                  >
                    Continue <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: DETAILS */}
            {step === 3 && (
              <div className="flex flex-col h-full">
                <h2 className="text-xl md:text-2xl font-bold font-sora text-slate-900 dark:text-slate-100 mb-6">
                  Your Information
                </h2>

                {/* Mobile Summary in Step 3 */}
                <div className="md:hidden mb-6 p-4 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase className="w-4 h-4 text-emerald-500" />
                    <span className="font-semibold">
                      {services.find((s) => s.id === formData.service)?.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-emerald-500" />
                    <span>
                      {formData.date && format(formData.date, "MMM do")} at{" "}
                      {formData.time}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <User className="w-4 h-4" /> Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
                      placeholder="jane@company.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" /> Note (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                      placeholder="Anything specific to discuss?"
                    />
                  </div>

                  <div className="mt-auto pt-6 flex justify-between items-center gap-4">
                    <Button
                      type="button"
                      onClick={prevStep}
                      variant="ghost"
                      size="lg"
                      className="rounded px-6"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={status === "submitting"}
                      size="lg"
                      className="flex-1 md:flex-none rounded px-8 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/30"
                    >
                      {status === "submitting"
                        ? "Confirming..."
                        : "Confirm Booking"}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Scheduler;
