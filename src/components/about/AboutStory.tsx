import { motion } from "motion/react";
import { Target, Heart, Lightbulb, Globe } from "lucide-react";

const AboutStory = () => {
  return (
    <section className="py-24 bg-white dark:bg-slate-950 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-5 dark:opacity-20" />

      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Story */}
        {/* Main Story */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-24">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-emerald-600 rounded rotate-3 opacity-10 dark:opacity-20" />
            <img
              src="/src/assets/about-story.png"
              alt="SHERO Team collaborating in modern office"
              className="relative rounded shadow-2xl border border-slate-200 dark:border-slate-800 w-full object-cover aspect-[4/3]"
            />
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -right-6 bg-white dark:bg-slate-900 p-4 rounded shadow-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Passionate Team
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Driving Innovation
                </p>
              </div>
            </div>
          </motion.div>

          {/* Text Side */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-sora font-bold text-slate-900 dark:text-white mb-6">
              Our Story
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Founded with a vision to bridge the digital divide in Ghana and
                across Africa,{" "}
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  SHERO Technologies
                </span>{" "}
                began as a small team of passionate technologists who believed
                that access to quality technology should not be a privilege, but
                a right.
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                What started as a modest hardware supply operation has evolved
                into a comprehensive technology solutions provider. We've grown
                from serving local businesses to partnering with organizations
                across West Africa, delivering not just products, but complete
                digital transformation solutions.
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Today, we stand at the intersection of hardware excellence and
                software innovation, offering everything from premium laptops
                and networking equipment to custom software development and
                cloud infrastructure services. Our commitment remains unchanged:
                empowering businesses and individuals with the tools and
                knowledge they need to thrive in the digital age.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Mission, Vision, Values Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/10 dark:to-slate-900 p-8 rounded border border-emerald-200 dark:border-emerald-800/30"
          >
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
          </motion.div>

          {/* Vision */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/10 dark:to-slate-900 p-8 rounded border border-blue-200 dark:border-blue-800/30"
          >
            <div className="w-14 h-14 bg-blue-600 dark:bg-blue-500 rounded flex items-center justify-center mb-6">
              <Globe className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold font-sora text-slate-900 dark:text-white mb-4">
              Our Vision
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              To become West Africa's most trusted technology partner,
              recognized for our commitment to quality, innovation, and customer
              success. We envision a future where every business has the
              technological foundation to innovate and grow.
            </p>
          </motion.div>
        </div>

        {/* What Sets Us Apart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-slate-50 dark:bg-slate-900/50 rounded p-8 md:p-12 border border-slate-200 dark:border-slate-800"
        >
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
        </motion.div>

        {/* Commitment Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-6">
            <Heart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              Our Commitment
            </span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold font-sora text-slate-900 dark:text-white mb-4">
            Building the Digital Future, Together
          </h3>
          <p className="text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Every product we deliver, every line of code we write, and every
            service we provide is backed by our unwavering commitment to your
            success. We measure our achievements not just in revenue, but in the
            growth and transformation of the businesses we serve.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutStory;
