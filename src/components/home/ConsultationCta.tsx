import Link from "next/link";
import { routes } from "@/lib/site";
import { InlineArrow } from "@/components/ui/InlineArrow";

export function ConsultationCta() {
  return (
    <div className="container-site my-16 lg:my-[104px]">
      {/* Stays logo navy in both themes. */}
      <section className="flex flex-col gap-3.5 rounded-md bg-navy-700 px-6 py-9 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:px-16 lg:py-[72px]">
        <div className="flex max-w-[640px] flex-col gap-3.5">
          <h2 className="font-display text-[30px]/[34px] font-bold text-white lg:text-[44px]/[48px] lg:tracking-[-0.025em]">
            Not sure where to start?
          </h2>
          <p className="text-base/[25px] text-on-navy-muted lg:text-lg/7">
            Tell us what&rsquo;s slowing your business down. We&rsquo;ll suggest a practical next step, free.
          </p>
        </div>
        <Link
          href={routes.consultation}
          className="mt-2 flex h-[52px] shrink-0 items-center justify-center whitespace-nowrap rounded-sm bg-white px-6 text-base/5 font-medium text-navy-700 transition-colors duration-150 hover:bg-navy-50 focus-visible:outline-white lg:mt-0 lg:text-[15px]/5"
        >
          Book a free consultation
          <span className="hidden lg:inline">
            <InlineArrow className="ml-1.5" />
          </span>
        </Link>
      </section>
    </div>
  );
}
