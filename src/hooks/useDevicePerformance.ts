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
    // @ts-ignore
    const deviceMemory = navigator.deviceMemory || 4;
    
    // Determine if the device is a low-end tier
    if (hardwareConcurrency <= 4 && deviceMemory <= 4) {
      setPerformance({
        isLowEnd: true,
        reason: "hardware_constraints",
      });
    }
  }, []);

  return performance;
};
