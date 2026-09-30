import type { deviceChecks } from "@/db/schema";

export type DeviceCheck = typeof deviceChecks.$inferSelect;

export const deviceTests = [
  { key: "screen", label: "Screen" },
  { key: "keyboard", label: "Keyboard" },
  { key: "trackpad", label: "Trackpad" },
  { key: "ports", label: "Ports" },
  { key: "speakers", label: "Speakers" },
  { key: "camera", label: "Camera" },
  { key: "wifi", label: "Wi-Fi" },
  { key: "charging", label: "Charging" },
] as const;

/**
 * Why a listing can't go In stock yet, or an empty list if it can.
 * Rule (CLAUDE.md, admin scope): the device check is complete, every test
 * passed, and battery health meets the Grade A++ minimum from Settings.
 * Devices without a battery skip the battery part (owner, 30 Sep 2026).
 */
export function inStockBlockers(check: DeviceCheck | null | undefined, minBatteryHealth: number): string[] {
  if (!check) return ["The device check hasn't been started."];

  const problems: string[] = [];
  for (const test of deviceTests) {
    const result = check[test.key];
    if (result === null) problems.push(`${test.label} hasn't been tested.`);
    else if (result === false) problems.push(`${test.label} failed its test.`);
  }

  if (check.hasBattery) {
    if (check.batteryHealth === null) problems.push("Battery health isn't recorded.");
    else if (check.batteryHealth < minBatteryHealth)
      problems.push(`Battery health is ${check.batteryHealth}%; the minimum is ${minBatteryHealth}%.`);
    if (check.batteryReplaced === null) problems.push("Record whether the battery was replaced.");
  }
  if (check.cosmeticCondition === null) problems.push("Cosmetic condition isn't recorded.");
  if (check.cleanedAndReset !== true) problems.push("The device hasn't been cleaned and reset.");
  if (!check.serialLast4) problems.push("The last four characters of the serial number are missing.");

  return problems;
}

/** One-line spec for tables and order snapshots: "i5-8350U · 8GB · 256GB SSD". */
export function specSummary(specs: { processor?: string; ram?: string; storage?: string }): string {
  return [specs.processor, specs.ram, specs.storage].filter(Boolean).join(" · ");
}

export type CheckSummary = { label: string; tone: "done" | "todo" | "problem" | "none" };

/**
 * The device check at a glance, for the admin's Listings table: complete,
 * how much is left, or that something didn't pass.
 */
export function checkSummary(check: DeviceCheck | null | undefined, minBatteryHealth: number): CheckSummary {
  if (!check) return { label: "not started", tone: "todo" };
  const failed =
    deviceTests.some((test) => check[test.key] === false) ||
    (check.hasBattery && check.batteryHealth !== null && check.batteryHealth < minBatteryHealth);
  if (failed) return { label: "doesn't pass", tone: "problem" };
  const left = inStockBlockers(check, minBatteryHealth).length;
  if (left === 0) return { label: "complete", tone: "done" };
  const started =
    deviceTests.some((test) => check[test.key] !== null) || check.batteryHealth !== null || check.cosmeticCondition !== null;
  return started ? { label: `${left} left`, tone: "todo" } : { label: "not started", tone: "todo" };
}
