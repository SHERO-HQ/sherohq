import React, { useState } from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SchedulerStep2DateTime } from "./SchedulerStep2DateTime";

function TestSchedulerStep2Wrapper({
  initialDate = undefined as Date | undefined,
  initialTime = "",
}) {
  const [date, setDate] = useState<Date | undefined>(initialDate);
  const [time, setTime] = useState(initialTime);
  const nextStep = vi.fn();
  const prevStep = vi.fn();

  return (
    <SchedulerStep2DateTime
      date={date}
      time={time}
      onSelectDate={setDate}
      onSelectTime={setTime}
      nextStep={nextStep}
      prevStep={prevStep}
      isValid={!!date && !!time}
    />
  );
}

describe("SchedulerStep2DateTime", () => {
  it("renders the date & time step correctly with GMT+0 Accra banner", () => {
    render(<TestSchedulerStep2Wrapper />);
    expect(screen.getByText("Choose Date & Time")).toBeDefined();
    expect(screen.getByText("Available Times")).toBeDefined();
    expect(screen.getByText(/Accra \/ GMT\+0 \(UTC\)/i)).toBeDefined();
  });

  it("allows selecting a future date and time slot, enabling the continue button", async () => {
    // Tomorrow as initial date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    if (tomorrow.getDay() === 0) {
      tomorrow.setDate(tomorrow.getDate() + 1); // skip sunday
    }

    const { rerender } = render(
      <TestSchedulerStep2Wrapper initialDate={tomorrow} initialTime="" />,
    );

    // Available times should be visible
    expect(screen.getByText("Available Times")).toBeDefined();

    // Look for time slot button with title matching 10:00 AM GMT
    const slotButton = screen.getByTitle(/^10:00 AM GMT/i);
    expect(slotButton).toBeDefined();

    // Clicking time slot
    await act(async () => {
      fireEvent.click(slotButton);
    });

    // Re-render with selected time to test continue button
    rerender(
      <TestSchedulerStep2Wrapper
        initialDate={tomorrow}
        initialTime="10:00 AM"
      />,
    );

    const continueButton = screen.getByRole("button", { name: /Continue/i });
    expect(continueButton.hasAttribute("disabled")).toBe(false);
  });

  it("selects a date when clicking a day button in the calendar", async () => {
    const onSelectDate = vi.fn();
    const onSelectTime = vi.fn();
    render(
      <SchedulerStep2DateTime
        date={undefined}
        time=""
        onSelectDate={onSelectDate}
        onSelectTime={onSelectTime}
        nextStep={vi.fn()}
        prevStep={vi.fn()}
        isValid={false}
      />,
    );

    const dayButtons = screen.getAllByRole("button");
    const futureDayButton = dayButtons.find((btn) => {
      const text = btn.textContent?.trim();
      return (
        text &&
        !isNaN(Number(text)) &&
        Number(text) >= 20 &&
        !btn.hasAttribute("disabled")
      );
    });

    expect(futureDayButton).toBeDefined();
    if (futureDayButton) {
      await act(async () => {
        fireEvent.click(futureDayButton);
      });
      expect(onSelectDate).toHaveBeenCalled();
    }
  });

  it("disables time slots that have already passed for today in UTC time", () => {
    const mockNow = new Date(Date.UTC(2026, 7, 14, 14, 0, 0));
    vi.useFakeTimers();
    vi.setSystemTime(mockNow);

    const today = new Date(2026, 7, 14);
    render(<TestSchedulerStep2Wrapper initialDate={today} initialTime="" />);

    const morningSlot = screen.queryByTitle(/^09:00 AM GMT/i);
    if (morningSlot) {
      expect(morningSlot.hasAttribute("disabled")).toBe(true);
    }

    const eveningSlot = screen.queryByTitle(/^06:00 PM GMT/i);
    if (eveningSlot) {
      expect(eveningSlot.hasAttribute("disabled")).toBe(false);
    }

    vi.useRealTimers();
  });
});
