"use client";

import { useEffect, useRef } from "react";
import PWAInstallBanner from "./PWAInstallBanner";
import Nav from "./NavigationBar";

/**
 * Coordinates banner and nav positioning as a single fixed stack
 * - Banner appears above nav when active
 * - Both move together as a unit
 * - No overlap or coverage
 */
export default function TopBarStack() {
  const stackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stackElement = stackRef.current;
    if (!stackElement) return;

    const setTopBarOffset = () => {
      document.documentElement.style.setProperty(
        "--topbar-offset",
        `${stackElement.offsetHeight}px`,
      );
    };

    setTopBarOffset();

    const resizeObserver = new ResizeObserver(() => {
      setTopBarOffset();
    });

    resizeObserver.observe(stackElement);
    window.addEventListener("resize", setTopBarOffset);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", setTopBarOffset);
      document.documentElement.style.removeProperty("--topbar-offset");
    };
  }, []);

  return (
    <div
      ref={stackRef}
      className="fixed top-0 left-0 right-0 z-50 flex flex-col"
    >
      <PWAInstallBanner />
      <Nav />
    </div>
  );
}
