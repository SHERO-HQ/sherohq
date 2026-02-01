import {
  Target,
  Heart,
  Lightbulb,
  Globe,
  Clover,
  SearchCheck,
} from "lucide-react";
import aboutImage from "@/assets/aboutImg.png";
import Reveal from "@/components/motion/Reveal";
import Float from "@/components/motion/Float";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/motion/AnimateSection";

const AboutStory = () => {
  return (
    <section className="py-24 bg-white dark:bg-slate-950 relative overflow-hidden pattern-dots">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-24">
          {/* Image Side */}
          {/* Image Side */}
          <Reveal direction="right" distance={40}>
            <div className="relative">
              <img
                src={aboutImage}
                alt="SHERO Technologies"
                className="relative w-full object-cover rounded shadow-2xl"
              />
              {/* Floating Badge 1 - Bottom Left */}
              <Float
                distance={8}
                duration={3}
                className="absolute -bottom-4 -left-2 sm:bottom-0 sm:left-0 lg:-left-4 z-20"
              >
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-2 sm:px-4 rounded border border-slate-200 dark:border-slate-800 flex items-center gap-2 sm:gap-3">
                  <div className="size-8 sm:size-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                    <SearchCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      Possibilities
                    </p>
                    <p className="text-[8px] sm:text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      All round
                    </p>
                  </div>
                </div>
              </Float>

              {/* Floating Badge 2 - Top Right */}
              <Float
                distance={12}
                duration={4}
                delay={0.5}
                className="absolute top-20 -right-2 sm:-right-2 lg:-right-4 z-20"
              >
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-2 sm:px-4 rounded border border-slate-200 dark:border-slate-800 flex items-center gap-2 sm:gap-3">
                  <div className="size-8 sm:size-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      Redefining
                    </p>
                    <p className="text-[8px] sm:text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Driven Innovation
                    </p>
                  </div>
                </div>
              </Float>
            </div>
          </Reveal>

          {/* Text Side */}
          <Reveal direction="left" distance={40} delay={0.2}>
            <div className="text-start">
              <span className="inline-flex items-center gap-2 px-4 py-1 mb-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-500/50 dark:border-emerald-800/50 rounded-full uppercase">
                <Clover className="size-4" />
                Our Story
              </span>
              <h2 className="text-3xl md:text-5xl font-sora font-bold text-slate-900 dark:text-white mb-6">
                Driven by Purpose
              </h2>
            </div>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Founded to bridge Africa's digital divide,{" "}
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
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
            <div className="h-full bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/10 dark:to-slate-900 p-8 rounded border border-emerald-200 dark:border-emerald-800/30">
              <div className="w-14 h-14 bg-emerald-600 dark:bg-emerald-500 rounded flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold font-sora text-slate-900 dark:text-white mb-4">
                Our Mission
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                To democratize access to enterprise-grade technology solutions
                across Africa, empowering businesses of all sizes to compete
                globally through innovative hardware, software, and IT services.
              </p>
            </div>
          </StaggerItem>

          {/* Vision */}
          <StaggerItem>
            <div className="h-full bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/10 dark:to-slate-900 p-8 rounded border border-blue-200 dark:border-blue-800/30">
              <div className="w-14 h-14 bg-blue-600 dark:bg-blue-500 rounded flex items-center justify-center mb-6">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold font-sora text-slate-900 dark:text-white mb-4">
                Our Vision
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
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
              <Lightbulb className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-2xl md:text-3xl font-bold font-sora text-slate-900 dark:text-white">
                What Sets Us Apart
              </h3>
            </div>

            <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
              <div className="pb-8 md:pb-0 md:pr-10">
                <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <span>🎯</span> End-to-End Solutions
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  From hardware procurement to custom software development and
                  ongoing IT support—we're your complete technology partner.
                </p>
              </div>
              <div className="py-8 md:py-0 md:px-10">
                <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <span>💡</span> Local Expertise, Global Standards
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Deep understanding of the African market combined with
                  international best practices and cutting-edge technology.
                </p>
              </div>
              <div className="pt-8 md:pt-0 md:pl-10">
                <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <span>🤝</span> Customer-Centric Approach
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
            <div className="inline-flex items-center gap-2 px-4 py-1 mb-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-500/50 dark:border-emerald-800/50 rounded-full uppercase">
              <Heart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                Our Commitment
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold font-sora text-slate-900 dark:text-white mb-4">
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
