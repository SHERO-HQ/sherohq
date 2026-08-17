"use client";
import {
  Target,
  Lightbulb,
  Globe,
  Clover,
  SearchCheck,
  Users,
  Globe2,
  Star,
} from "lucide-react";

import Reveal from "@/components/motion/Reveal";
import { SectionBadge } from "@/components/common/SectionBadge";
import Image from "next/image";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/motion/AnimateSection";

const AboutStory = () => {
  return (
    <section className="py-12 bg-white dark:bg-slate-950 relative overflow-hidden pattern-dots">
      {/* Background Elements */}
      <div className="absolute inset-0 hero-grid-pattern" />

      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center border-b border-slate-200 dark:border-slate-400/50 pb-4 mb-10">
          {/* Image Side */}
          {/* Image Side */}
          <Reveal direction="right" distance={40}>
            <div className="relative">
              <Image
                src="/assets/aboutImg.png"
                alt="SHERO Technologies"
                width={600}
                height={400}
                loading="lazy"
                className="relative w-full object-cover"
              />

              <div className="absolute sm:bottom-48 md:bottom-32 sm:left-4 md:left-0 bottom-24 -left-2 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md py-2 px-3 rounded-full border border-slate-200/50 dark:border-slate-700/50 flex items-center gap-2 sm:gap-3 shadow-md">
                <div className="size-7 sm:size-8 bg-brand-secondary-500 dark:bg-brand-secondary-500/20 rounded-full flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-white dark:text-brand-secondary-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white leading-tight">
                    Possible
                  </p>
                </div>
              </div>

              <div className="absolute sm:top-32 sm:right-8 top-20 right-5 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md py-2 px-3 rounded-full border border-slate-200/50 dark:border-slate-700/50 flex items-center gap-2 sm:gap-3 shadow-md">
                <div className="size-7 sm:size-8 bg-brand-secondary-500 dark:bg-brand-secondary-500/20 rounded-full flex items-center justify-center">
                  <SearchCheck className="w-4 h-4 text-white dark:text-brand-secondary-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white leading-tight">
                    Redefine
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Text Side */}
          <Reveal direction="left" distance={40} delay={0.2}>
            <div className="text-start">
              <SectionBadge icon={Clover} className="mb-4">
                Our Story
              </SectionBadge>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-4 transition-colors duration-300">
                Driven by
                <span className="text-brand-secondary-600 dark:text-brand-secondary-400">
                  {" "}
                  Purpose
                </span>
              </h2>
            </div>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                The world is shaped by the limits we accept.{" "}
                <span className="font-bold text-brand-secondary-700 dark:text-brand-secondary-400">
                  SHERO
                </span>{" "}
                was founded on a simple belief: real progress begins when we challenge assumptions, remove operational friction, and expand what's possible for businesses.
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Technology is our medium for creating value. Whether supplying enterprise-grade hardware, engineering custom software, or managing critical IT infrastructure, everything we build is focused on solving real problems and driving sustainable growth.
              </p>
            </div>
          </Reveal>
        </div>

        {/* Mission, Vision, Values Grid */}
        <StaggerContainer className="grid md:grid-cols-2 gap-8 mb-16 lg:grid-cols-2!">
          {/* Mission */}
          <StaggerItem>
            <div className="group h-full bg-white/60 dark:bg-slate-900/40 backdrop-blur-md p-8 lg:p-10 rounded border border-slate-200/80 dark:border-slate-800/80 hover:border-brand-primary-500/50 dark:hover:border-brand-primary-500/50 transition-all duration-500 shadow-sm hover:shadow-xl hover:-translate-y-1">
              <div className="w-12 h-12 bg-brand-primary-500 rounded flex items-center justify-center mb-4 shadow shadow-brand-primary-500/20 group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg lg:text-xl font-bold text-slate-900 dark:text-white mb-4 tracking-tighter">
                Our Mission
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                Create purposeful technology that removes barriers, expands opportunities, and enables lasting progress.
              </p>
            </div>
          </StaggerItem>

          {/* Vision */}
          <StaggerItem>
            <div className="group h-full bg-white/60 dark:bg-slate-900/40 backdrop-blur-md p-8 lg:p-10 rounded border border-slate-200/80 dark:border-slate-800/80 hover:border-brand-secondary-500/50 dark:hover:border-brand-secondary-500/50 transition-all duration-500 shadow-sm hover:shadow-xl hover:-translate-y-1">
              <div className="w-12 h-12 bg-brand-secondary-500 rounded flex items-center justify-center mb-4 shadow shadow-brand-secondary-500/20 group-hover:scale-110 transition-transform">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg lg:text-xl font-bold text-slate-900 dark:text-white mb-4 tracking-tighter">
                Our Vision
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                A future where technology removes barriers, expands opportunities, and empowers every individual, business, and community to achieve more than they thought possible.
              </p>
            </div>
          </StaggerItem>
        </StaggerContainer>

        {/* What Sets Us Apart */}
        <Reveal direction="up" distance={40}>
          <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md rounded p-8 md:p-12 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
            <div className="flex items-center gap-3 mb-6 justify-center">
              <Star className="size-6 text-brand-secondary-600" />
              <h3 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                What Sets Us Apart
              </h3>
            </div>

            <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
              <div className="pb-8 md:pb-0 md:pr-10">
                <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Target className="size-5 text-brand-secondary-400" />{" "}
                  Complete Solutions
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  From hardware infrastructure and custom software to managed IT support, we deliver complete technology solutions.
                </p>
              </div>
              <div className="py-8 md:py-0 md:px-10">
                <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Globe2 className="size-5 text-brand-secondary-400" />
                  Technical Expertise
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Deep understanding of the African market combined with
                  international best practices.
                </p>
              </div>
              <div className="pt-8 md:pt-0 md:pl-10">
                <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Users className="size-5 text-brand-secondary-400" />{" "}
                  Built on Trust
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  We build long-term partnerships through reliable support, practical guidance, and solutions tailored to your needs.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default AboutStory;
