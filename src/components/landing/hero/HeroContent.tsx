import React from "react";
import NavLink from "@/components/common/NavLink";
import { getAbsoluteUrl } from "@/utils/subdomain";
import { RocketIcon } from "@/assets/icons/icons";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionBadge } from "@/components/common/SectionBadge";

interface HeroContentProps {
  headlineLead: string;
  headlineAccent: string;
  subHeader: string;
}

export const HeroContent = ({
  headlineLead,
  headlineAccent,
  subHeader,
}: HeroContentProps) => {
  return (
    <div className="w-full max-w-4xl">
      <div className="flex flex-col items-center gap-5 sm:gap-6 text-center">
        {/* Top Badge */}
        <div>
          <SectionBadge icon={RocketIcon}>
            Trusted Technology Partner
          </SectionBadge>
        </div>

        {/* Main Headline */}
        <h1 className="font-bold leading-[1.15] text-3xl sm:text-5xl md:text-6xl px-2 sm:px-0 tracking-tighter text-slate-900 dark:text-white font-sora">
          <span>{headlineLead} </span>
          <br className="hidden sm:block" />
          <span className="text-brand-secondary-600 dark:text-brand-secondary-400">
            {headlineAccent}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="sm:text-base text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed mx-auto">
          {subHeader}
        </p>

        {/* CTA Button */}
        <div className="flex items-center justify-center pt-2 sm:pt-4 w-full">
          <Button
            asChild
            variant="brandSecondary"
            size="lg"
            className="font-medium w-full text-sm sm:w-auto bg-brand-primary h-11 px-8 group transition-all hover:-translate-y-0.5 hover:bg-brand-primary-600 shadow-sm active:scale-95"
          >
            <NavLink href={getAbsoluteUrl("/work")}>
              <span>See Our Work</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </NavLink>
          </Button>
        </div>
      </div>
    </div>
  );
};
