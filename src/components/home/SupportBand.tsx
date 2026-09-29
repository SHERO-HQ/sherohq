import { cn } from "@/lib/cn";

/**
 * Full-width band. The design leaves room for a photo behind the line.
 * TODO(owner): a photo of SHERO setting up or supporting a client site
 * (no team or founder faces: SHERO is faceless).
 */
export function SupportBand({ className }: { className?: string }) {
  return (
    <section className={cn("relative mt-16 h-60 bg-band lg:mt-28 lg:h-[300px]", className)}>
      <div className="container-site absolute inset-x-0 bottom-8 lg:bottom-14">
        <div className="flex max-w-[640px] flex-col gap-2 lg:gap-3">
          <p className="font-display text-2xl/[31px] font-semibold tracking-[-0.015em] text-white lg:text-[34px]/[42px] lg:tracking-[-0.02em]">
            Set up and supported by SHERO, from the first call to the last fix.
          </p>
          <span className="text-[13px]/[18px] text-on-navy-muted lg:text-sm/5">Tamale, Ghana</span>
        </div>
      </div>
    </section>
  );
}
