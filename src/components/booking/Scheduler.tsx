"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Briefcase, CalendarDays, Check, ChevronLeft, ChevronRight, Clock, Globe2, Mail, MessageCircle, User } from "lucide-react";
import { booking, type BookingServiceId } from "@/content/booking";
import { site, whatsappLink } from "@/content/site";
import {
  BOOKING_WINDOW_DAYS,
  type BookingRequest,
  type Day,
  addDays,
  bookingMessage,
  formatDay,
  isBookableDay,
  isSlotPast,
  localEquivalent,
  toDay,
} from "@/lib/booking";
import { cn } from "@/lib/cn";
import { Calendar } from "./Calendar";
import { useClientValue } from "./useClientValue";

type Step = 1 | 2 | 3;
type Details = Pick<BookingRequest, "firstName" | "lastName" | "email" | "phone" | "note">;

const STEPS = [
  { id: 1, label: "Service", icon: Briefcase },
  { id: 2, label: "Time", icon: Clock },
  { id: 3, label: "Details", icon: User },
] as const;

const ALL_SLOTS = Object.values(booking.slots).flat();

const button = {
  primary:
    "inline-flex h-9 items-center justify-center gap-2 rounded-control bg-primary px-4 text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50",
  ghost: "inline-flex h-9 items-center justify-center gap-2 rounded-control px-3 text-sm font-medium text-ink-secondary hover:bg-surface hover:text-ink",
};

function serviceFromUrl(): string {
  return new URLSearchParams(window.location.search).get("service") ?? "";
}

function resolveService(id: string | null): BookingServiceId | null {
  if (!id) return null;
  const mapped = booking.serviceAliases[id] ?? id;
  return booking.services.some((s) => s.id === mapped) ? (mapped as BookingServiceId) : null;
}

/**
 * The three-step booking flow from the previous site. There is no booking
 * backend yet, so confirming sends the request to SHERO on WhatsApp (or by
 * email), and SHERO replies to confirm the time.
 */
export function Scheduler() {
  const minute = useClientValue(() => Math.floor(Date.now() / 60_000));
  const timeZone = useClientValue(() => Intl.DateTimeFormat().resolvedOptions().timeZone);
  const urlService = useClientValue(serviceFromUrl);

  const [step, setStep] = useState<Step>(1);
  const [picked, setPicked] = useState<BookingServiceId | null>(null);
  const [day, setDay] = useState<Day | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [details, setDetails] = useState<Details>({ firstName: "", lastName: "", email: "", phone: "", note: "" });
  const [sent, setSent] = useState<BookingRequest | null>(null);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  useEffect(() => {
    if (!moved.current) return;
    headingRef.current?.focus();
  }, [step, sent]);

  const now = minute === null ? null : new Date(minute * 60_000);
  const service = picked ?? resolveService(urlService);
  const serviceTitle = booking.services.find((s) => s.id === service)?.title ?? "";

  const go = (next: Step) => {
    moved.current = true;
    setStep(next);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!day || !slot) return;
    const request = { service: serviceTitle, day, slot, ...details };
    window.open(whatsappLink(bookingMessage(request)), "_blank", "noopener,noreferrer");
    moved.current = true;
    setSent(request);
  };

  const reset = () => {
    moved.current = true;
    setSent(null);
    setStep(1);
    setPicked(null);
    setDay(null);
    setSlot(null);
  };

  if (sent) {
    return <BookingSent request={sent} headingRef={headingRef} onReset={reset} />;
  }

  return (
    <div className="grid overflow-hidden rounded-card border border-border bg-surface-raised md:grid-cols-[17rem_1fr]">
      <aside className="border-b border-border bg-surface p-5 md:border-r md:border-b-0 md:p-8">
        <p className="font-display text-lg font-semibold text-heading">Consultation</p>
        <p className="mt-1 hidden text-sm text-ink-secondary md:block">Schedule your meeting in 3 easy steps.</p>
        <ol className="mt-5 flex justify-between gap-2 md:mt-8 md:flex-col md:gap-6" aria-label="Booking steps">
          {STEPS.map((s) => {
            const done = step > s.id;
            const current = step === s.id;
            const Icon = done ? Check : s.icon;
            return (
              <li key={s.id} aria-current={current ? "step" : undefined} className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full border",
                    current && "border-primary bg-primary text-on-primary",
                    done && "border-accent bg-accent-subtle text-accent",
                    !current && !done && "border-border text-ink-muted",
                  )}
                >
                  <Icon aria-hidden="true" size={16} />
                </span>
                <span className={cn("text-sm font-medium", current ? "text-ink" : "text-ink-muted")}>
                  {s.label}
                  {done && <span className="sr-only"> (done)</span>}
                </span>
              </li>
            );
          })}
        </ol>
        {step > 1 && (
          <dl className="mt-8 hidden space-y-2 rounded-card border border-border bg-surface-raised p-4 text-sm md:block">
            <dt className="sr-only">Service</dt>
            <dd className="flex items-center gap-2 font-medium text-ink">
              <Briefcase aria-hidden="true" size={16} className="text-accent" />
              {serviceTitle}
            </dd>
            {day && (
              <>
                <dt className="sr-only">Date</dt>
                <dd className="flex items-center gap-2 text-ink-secondary">
                  <CalendarDays aria-hidden="true" size={16} className="text-accent" />
                  {formatDay(day, "short")}
                </dd>
              </>
            )}
            {day && slot && (
              <>
                <dt className="sr-only">Time</dt>
                <dd className="flex items-center gap-2 text-ink-secondary">
                  <Clock aria-hidden="true" size={16} className="text-accent" />
                  {slot} GMT (Accra)
                </dd>
              </>
            )}
          </dl>
        )}
      </aside>

      <div className="flex min-h-[28rem] flex-col p-5 sm:p-8">
        {step === 1 && (
          <StepFrame title="Select a Service" headingRef={headingRef}>
            <fieldset>
              <legend className="sr-only">Service</legend>
              <div className="grid gap-3">
                {booking.services.map((s) => {
                  const checked = service === s.id;
                  return (
                    <label
                      key={s.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-4 rounded-card border p-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
                        checked ? "border-primary bg-surface" : "border-border hover:border-border-strong",
                      )}
                    >
                      <input
                        type="radio"
                        name="service"
                        value={s.id}
                        checked={checked}
                        onChange={() => setPicked(s.id)}
                        className="sr-only"
                      />
                      <span className="flex-1">
                        <span className="block font-medium text-ink">{s.title}</span>
                        <span className="mt-0.5 block text-sm text-ink-secondary">{s.description}</span>
                      </span>
                      <span
                        aria-hidden="true"
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-full border",
                          checked ? "border-primary bg-primary text-on-primary" : "border-border-strong",
                        )}
                      >
                        {checked && <Check size={12} strokeWidth={3} />}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
            <StepNav>
              <span />
              <button type="button" className={button.primary} disabled={!service} onClick={() => go(2)}>
                Continue <ChevronRight aria-hidden="true" size={16} />
              </button>
            </StepNav>
          </StepFrame>
        )}

        {step === 2 && (
          <StepFrame
            title="Choose Date & Time"
            intro="Select your preferred consultation window. Official times are in GMT+0 (Accra), Monday to Friday."
            headingRef={headingRef}
          >
            {now && timeZone ? (
              <TimePicker
                now={now}
                timeZone={timeZone}
                day={day}
                slot={slot}
                onDay={(d) => {
                  setDay(d);
                  setSlot(null);
                }}
                onSlot={setSlot}
              />
            ) : (
              <p className="text-ink-secondary">Loading available times…</p>
            )}
            <StepNav>
              <button type="button" className={button.ghost} onClick={() => go(1)}>
                <ChevronLeft aria-hidden="true" size={16} /> Back
              </button>
              <button type="button" className={button.primary} disabled={!day || !slot} onClick={() => go(3)}>
                Continue <ChevronRight aria-hidden="true" size={16} />
              </button>
            </StepNav>
          </StepFrame>
        )}

        {step === 3 && day && slot && (
          <StepFrame title="Your Information" headingRef={headingRef}>
            <p className="mb-6 rounded-card border border-border bg-surface p-4 text-sm text-ink-secondary md:hidden">
              <span className="block font-medium text-ink">{serviceTitle}</span>
              {formatDay(day, "short")} at {slot} GMT (Accra)
            </p>
            <form onSubmit={submit} className="flex flex-1 flex-col">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name" name="firstName" autoComplete="given-name" value={details.firstName} onChange={setDetails} />
                <Field label="Last name" name="lastName" autoComplete="family-name" value={details.lastName} onChange={setDetails} />
                <Field label="Email address" name="email" type="email" autoComplete="email" value={details.email} onChange={setDetails} />
                <Field label="Phone number" name="phone" type="tel" autoComplete="tel" value={details.phone} onChange={setDetails} />
                <Field label="Note (optional)" name="note" multiline required={false} value={details.note} onChange={setDetails} className="sm:col-span-2" />
              </div>
              <p className="mt-4 text-sm text-ink-muted">
                Confirming opens WhatsApp with your request ready to send. We reply within working hours to confirm the
                time and share the call link.
              </p>
              <StepNav>
                <button type="button" className={button.ghost} onClick={() => go(2)}>
                  <ChevronLeft aria-hidden="true" size={16} /> Back
                </button>
                <button type="submit" className={button.primary}>
                  Confirm Booking
                </button>
              </StepNav>
            </form>
          </StepFrame>
        )}
      </div>
    </div>
  );
}

function StepFrame({
  title,
  intro,
  headingRef,
  children,
}: {
  title: string;
  intro?: string;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <h3 ref={headingRef} tabIndex={-1} className="text-xl tracking-[-0.01em] outline-none sm:text-2xl">
        {title}
      </h3>
      {intro && <p className="mt-1 text-sm text-ink-secondary">{intro}</p>}
      <div className="mt-6 flex flex-1 flex-col">{children}</div>
    </div>
  );
}

function StepNav({ children }: { children: ReactNode }) {
  return (
    <div className="mt-auto pt-8">
      <div className="flex items-center justify-between gap-4 border-t border-border pt-6">{children}</div>
    </div>
  );
}

function TimePicker({
  now,
  timeZone,
  day,
  slot,
  onDay,
  onSlot,
}: {
  now: Date;
  timeZone: string;
  day: Day | null;
  slot: string | null;
  onDay: (d: Day) => void;
  onSlot: (s: string) => void;
}) {
  const today = toDay(now);
  const showLocal = localEquivalent(today, "12:00", timeZone) !== null;

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
      <div>
        <Calendar
          today={today}
          lastDay={addDays(today, BOOKING_WINDOW_DAYS)}
          selected={day}
          isAvailable={(d) => isBookableDay(d, now, ALL_SLOTS)}
          onSelect={onDay}
        />
        <p className="mt-3 flex items-center gap-2 text-xs text-ink-muted">
          <Globe2 aria-hidden="true" size={14} />
          {showLocal ? `Times are in Accra (GMT). Your time zone: ${timeZone}.` : "Your clock matches Accra time (GMT)."}
        </p>
      </div>
      <div>
        {!day ? (
          <div className="flex h-full min-h-48 flex-col items-center justify-center rounded-card border border-dashed border-border p-6 text-center">
            <Clock aria-hidden="true" size={24} className="text-ink-muted" />
            <p className="mt-2 font-medium text-ink">Choose a date on the calendar</p>
            <p className="mt-1 text-sm text-ink-secondary">Times will populate based on your selected date.</p>
          </div>
        ) : (
          <fieldset>
            <legend className="text-sm font-medium text-ink">Available times · {formatDay(day, "short")}</legend>
            {Object.entries(booking.slots).map(([period, slots]) => (
              <div key={period} className="mt-4">
                <p className="mb-2 text-xs font-medium text-ink-muted">{period} (GMT)</p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
                  {slots.map((s) => {
                    const past = isSlotPast(day, s, now);
                    const local = showLocal ? localEquivalent(day, s, timeZone) : null;
                    const selected = slot === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={past}
                        aria-pressed={selected}
                        aria-label={`${s} GMT${local ? `, ${local} your time` : ""}${past ? ", passed" : ""}`}
                        onClick={() => onSlot(s)}
                        className={cn(
                          "flex min-h-9 flex-col items-center justify-center rounded-control border px-2 py-1.5 text-sm font-medium tabular-nums transition-colors",
                          "disabled:cursor-not-allowed disabled:border-border disabled:text-ink-muted/50 disabled:line-through",
                          selected
                            ? "border-primary bg-primary text-on-primary"
                            : "border-border text-ink enabled:hover:border-primary",
                        )}
                      >
                        {s}
                        {local && !past && (
                          <span className={cn("text-[11px] font-normal", selected ? "text-on-primary" : "text-ink-muted")}>
                            {local}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {slot && (
              <p role="status" className="mt-5 flex items-center gap-2 rounded-card bg-accent-subtle p-3 text-sm text-ink">
                <Check aria-hidden="true" size={16} className="shrink-0 text-accent" />
                Selected: {formatDay(day)} at {slot} GMT
              </p>
            )}
          </fieldset>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  autoComplete,
  multiline,
  required = true,
  className,
}: {
  label: string;
  name: keyof Details;
  value: string;
  onChange: React.Dispatch<React.SetStateAction<Details>>;
  type?: string;
  autoComplete?: string;
  multiline?: boolean;
  required?: boolean;
  className?: string;
}) {
  const id = `booking-${name}`;
  const control =
    "w-full rounded-control border border-border-strong bg-page px-3 text-ink placeholder:text-ink-muted focus-visible:border-focus";
  const update = (v: string) => onChange((d) => ({ ...d, [name]: v }));
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      {multiline ? (
        <textarea id={id} name={name} rows={3} value={value} onChange={(e) => update(e.target.value)} className={cn(control, "py-2")} />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => update(e.target.value)}
          className={cn(control, "h-9")}
        />
      )}
    </div>
  );
}

function BookingSent({
  request,
  headingRef,
  onReset,
}: {
  request: BookingRequest;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onReset: () => void;
}) {
  const message = bookingMessage(request);
  return (
    <div className="mx-auto max-w-xl rounded-card border border-border bg-surface-raised p-6 text-center sm:p-10">
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent-subtle text-accent">
        <Check aria-hidden="true" size={28} />
      </span>
      <h3 ref={headingRef} tabIndex={-1} className="mt-5 text-2xl outline-none sm:text-3xl">
        Almost done: send your request
      </h3>
      <p className="mt-3 text-ink-secondary">
        Your <strong className="font-semibold text-ink">{request.service}</strong> consultation request for
      </p>
      <p className="mt-3 rounded-card border border-border bg-surface p-3 font-semibold text-heading">
        {formatDay(request.day)} at {request.slot} GMT (Accra)
      </p>
      <p className="mt-4 text-ink-secondary">
        is ready in WhatsApp. Send it there and we&apos;ll reply to confirm the time and share the call link, {site.hours.long}.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a href={whatsappLink(message)} target="_blank" rel="noopener noreferrer" className={button.primary}>
          <MessageCircle aria-hidden="true" size={16} /> Open WhatsApp again
        </a>
        <a
          href={`mailto:${site.email}?subject=${encodeURIComponent(`Consultation request: ${request.service}`)}&body=${encodeURIComponent(message)}`}
          className={cn(button.ghost, "border border-border-strong")}
        >
          <Mail aria-hidden="true" size={16} /> Send by email instead
        </a>
      </div>
      <button type="button" onClick={onReset} className="mt-6 text-sm font-medium text-link underline-offset-4 hover:underline">
        Book another session
      </button>
    </div>
  );
}
