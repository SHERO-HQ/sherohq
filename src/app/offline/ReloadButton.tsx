"use client";

export function ReloadButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg
        bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90
        transition-colors"
    >
      Try Again
    </button>
  );
}
