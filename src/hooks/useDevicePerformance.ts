"use client";
import { useState, useEffect } from "react";

export interface DevicePerformance {
  isLowEnd: boolean;
  reason: string;
}

export const useDevicePerformance = (): DevicePerformance => {
  const [performance, setPerformance] = useState<DevicePerformance>({
    isLowEnd: false,
    reason: "unknown",
  });

  useEffect(() => {
    // 1. Check logical cores
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    // 2. Check Device Memory (RAM in GB) if available
    const deviceMemory =
      (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;

    // Determine if the device is a low-end tier
    if (hardwareConcurrency <= 4 && deviceMemory <= 4) {
      if (!performance.isLowEnd) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPerformance({
          isLowEnd: true,
          reason: "hardware_constraints",
        });
      }
    }
  }, [performance.isLowEnd]);

  return performance;
};
