"use client";
import {
  Target,
  Heart,
  Lightbulb,
  Globe,
  Clover,
  SearchCheck,
  Users,
  Globe2,
} from "lucide-react";

import Reveal from "@/components/motion/Reveal";
import Image from "next/image";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/motion/AnimateSection";

const AboutStory = () => {
  return (
    <section className="py-24 bg-white dark:bg-slate-950 relative overflow-hidden pattern-dots">
      {/* Background Elements */}
      <div className="absolute inset-0 hero-grid-pattern" />

      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center border-b border-slate-200 dark:border-slate-400/50 pb-5 mb-16">
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

              <div className="absolute sm:bottom-46 md:bottom-35 sm:-left-4 md:-left-20 -bottom-5 -left-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-2 rounded border border-slate-200 dark:border-slate-800 flex items-center gap-2 sm:gap-3">
                <div className="size-8 sm:size-10 bg-brand-secondary-100 dark:bg-brand-secondary-900/30 rounded flex items-center justify-center">
                  <SearchCheck className="w-4 h-4 sm:w-5 sm:h-5 text-brand-secondary-700 dark:text-brand-secondary-400" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    Possibilities
                  </p>
                  <p className="text-[8px] sm:text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    All round
                  </p>
                </div>
              </div>

              <div className="absolute sm:top-20 sm:right-5 -top-5 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-2 rounded border border-slate-200 dark:border-slate-800 flex items-center gap-2 sm:gap-3">
                <div className="size-8 sm:size-10 bg-brand-secondary-100 dark:bg-brand-secondary-900/30 rounded flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-brand-secondary-700 dark:text-brand-secondary-400" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    Redefining
                  </p>
                  <p className="text-[8px] sm:text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Driven Innovation
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Text Side */}
          <Reveal direction="left" distance={40} delay={0.2}>
            <div className="text-start">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-xs font-semibold text-brand-secondary-700 dark:text-brand-secondary-300 bg-brand-secondary-100 dark:bg-brand-secondary-900/30 border border-brand-secondary-600/50 dark:border-brand-secondary-800/50 rounded uppercase">
                <Clover className="size-4" />
                Our Story
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                Driven by
                <span className="text-brand-secondary-600 dark:text-brand-secondary-400">
                  {" "}
                  Purpose
                </span>
              </h2>
            </div>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Founded to bridge Africa's digital divide,{" "}
                <span className="font-bold text-brand-secondary-700 dark:text-brand-secondary-400">
                  SHERO Technologies
                </span>{" "}
                is making quality technology accessible. We have evolved into a
                comprehensive technology partner, equipping people, businesses
                and communities across West Africa with world-class digital
                solutions.
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                We lead at the intersection of hardware excellence and software
                innovation, from networking to custom development. Our mission
                remains constant: to equip our community with the transformative
                tools and knowledge needed to thrive today.
              </p>
            </div>
          </Reveal>
        </div>

        {/* Mission, Vision, Values Grid */}
        <StaggerContainer className="grid md:grid-cols-2 gap-8 mb-16 lg:grid-cols-2!">
          {/* Mission */}
          <StaggerItem>
            <div className="group h-full bg-linear-to-br from-white to-slate-50 dark:from-slate-900/40 dark:to-slate-950 p-8 lg:p-10 rounded border border-slate-200 dark:border-white/5 hover:border-emerald-500/30 transition duration-500 shadow-sm hover:shadow hover:shadow-emerald-500/5">
              <div className="w-12 h-12 bg-brand-primary-500 rounded flex items-center justify-center mb-4 shadow shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">
                Our Mission
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                To democratize access to enterprise-grade technology solutions
                across Africa, empowering businesses of all sizes to compete
                globally through innovative hardware, software, and IT services.
              </p>
            </div>
          </StaggerItem>

          {/* Vision */}
          <StaggerItem>
            <div className="group h-full bg-linear-to-br from-white to-slate-50 dark:from-slate-900/40 dark:to-slate-950 p-8 lg:p-10 rounded border border-slate-200 dark:border-white/5 hover:border-blue-500/30 transition duration-500 shadow-sm hover:shadow hover:shadow-blue-500/5">
              <div className="w-12 h-12 bg-brand-secondary-500 rounded flex items-center justify-center mb-4 shadow shadow-blue-600/20 group-hover:scale-110 transition-transform">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">
                Our Vision
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                To become West Africa's most trusted technology partner,
                recognized for our commitment to quality, innovation, and
                customer success. We envision a future where every business has
                the technological foundation to innovate and grow.
              </p>
            </div>
          </StaggerItem>
        </StaggerContainer>

        {/* What Sets Us Apart */}
        <Reveal direction="up" distance={40}>
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded p-8 md:p-12 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-6 justify-center">
              <Lightbulb className="w-8 h-8 text-brand-secondary-700 dark:text-brand-secondary-400" />
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                What Sets Us Apart
              </h3>
            </div>

            <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
              <div className="pb-8 md:pb-0 md:pr-10">
                <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Target className="size-5 text-brand-secondary-600" />{" "}
                  End-to-End Solutions
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  From hardware procurement to custom software development and
                  ongoing IT support—we're your complete technology partner.
                </p>
              </div>
              <div className="py-8 md:py-0 md:px-10">
                <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Globe2 className="size-5 text-brand-secondary-600" /> Local
                  Expert, Global Standard
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Deep understanding of the African market combined with
                  international best practices and cutting-edge technology.
                </p>
              </div>
              <div className="pt-8 md:pt-0 md:pl-10">
                <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Users className="size-5 text-brand-secondary-600" />{" "}
                  Customer-Centric Approach
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  We don't just sell products—we build long-term partnerships,
                  offering training, support, and strategic guidance.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Commitment Statement */}
        <Reveal direction="up" distance={30} delay={0.4} blur>
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-xs font-semibold text-brand-secondary-700 dark:text-brand-secondary-300 bg-brand-secondary-100 dark:bg-brand-secondary-900/30 border border-brand-secondary-600/50 dark:border-brand-secondary-800/50 rounded uppercase">
              <Heart className="w-5 h-5 text-brand-secondary-700 dark:text-brand-secondary-400" />
              <span className="text-xs font-semibold text-brand-secondary-700 dark:text-brand-secondary-300">
                Our Commitment
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Building the Digital Future, Together
            </h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Every product we deliver, every line of code we write, and every
              service we provide is backed by our unwavering commitment to your
              success. We measure our achievements not just in revenue, but in
              the growth and transformation of the businesses we serve.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default AboutStory;
