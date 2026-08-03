"use client";
import { motion } from "motion/react"
import {
  Briefcase,
  MapPin,
  Users,
  ArrowRight,
  GraduationCap,
  Rocket,
  Blocks,
  Trophy,
  Building,
  ChevronDown
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { COMPANY_EMAILS } from "@/constants/emails";
import { useQuery } from "@tanstack/react-query";
import { ApplicationFormModal } from "@/components/careers/ApplicationFormModal";
import { useState, useMemo } from "react";
import { SeedSprout } from "@/assets/icons/icons";

const benefits = [
  {
    title: "Meaningful Impact",
    description:
      "Build software and hardware solutions that solve real-world challenges and create lasting value.",
    icon: <Rocket className="w-6 h-6 text-emerald-500" />,
  },
  {
    title: "Ownership",
    description:
      "Take initiative, make decisions, and see your ideas shape products from concept to reality.",
    icon: <Trophy className="w-6 h-6 text-emerald-500" />,
  },
  {
    title: "Continuous Learning",
    description:
      "Grow through hands-on experience, mentorship, and challenging projects that expand your skills.",
    icon: <GraduationCap className="w-6 h-6 text-emerald-500" />,
  },
  {
    title: "Build the Future",
    description:
      "Help create the next generation of software and hardware solutions with a team driven by innovation.",
    icon: <Blocks className="w-6 h-6 text-emerald-500" />,
  },
  {
    title: "Collaborative Culture",
    description:
      "Work alongside curious people who value openness, respect, and continuous improvement.",
    icon: <Users className="w-6 h-6 text-emerald-500" />,
  },
  {
    title: "Room to Grow",
    description:
      "As SHERO grows, you'll have opportunities to grow your career, leadership, and influence with it.",
    icon: <SeedSprout className="w-6 h-6 text-emerald-500" />,
  },
];

// removed hardcoded openRoles

export default function Careers() {
  const router = useRouter();
  const [selectedJob, setSelectedJob] = useState<any>(null);

  const { data: openRoles = [], isLoading } = useQuery({
    queryKey: ["public_careers"],
    queryFn: async () => {
      const res = await fetch("/api/public/careers");
      if (!res.ok) throw new Error("Failed to fetch jobs");
      const data = await res.json();
      return data.data || [];
    }
  });

  const [filterDept, setFilterDept] = useState<string>("All");
  const [openBenefit, setOpenBenefit] = useState<number | null>(0);

  const departments = useMemo(() => {
    const depts = new Set<string>();
    openRoles.forEach((role: any) => {
      if (role.department) depts.add(role.department);
    });
    return ["All", ...Array.from(depts)];
  }, [openRoles]);

  const filteredRoles = useMemo(() => {
    if (filterDept === "All") return openRoles;
    return openRoles.filter((role: any) => role.department === filterDept);
  }, [openRoles, filterDept]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden lg:pt-48 lg:pb-32">
        <div className="absolute inset-0 bg-muted/30 -z-10" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-muted to-transparent opacity-50 -z-10" />

        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-7xl">
                <span className="text-brand-primary-500">Redefine</span> What's <span className="text-brand-secondary-500">Possible.</span> Together.
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-sm text-muted-foreground">
                Join a team that's creating software and hardware solutions to solve real-world problems. Grow your skills, own your work, and help redefine what's possible.              </p>

              <div className="mt-10 flex justify-center gap-4">
                <Button
                  variant="default"
                  size="lg"
                  onClick={() => {
                    document.getElementById('open-roles')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  View Open Roles
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => router.push('/about-us')}
                >
                  Our Story
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values / Culture Section */}
      <section className="py-20 bg-background">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl font-bold text-foreground sm:text-3xl"
            >
              Build With SHERO
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-sm text-muted-foreground"
            >
              Join a team that's redefining what's possible through software and hardware. Together, we're building technology that solves real problems and creates lasting impact.
            </motion.p>
          </div>

          <div className="max-w-2xl mx-auto space-y-4">
            {benefits.map((benefit, index) => {
              const isOpen = openBenefit === index;
              return (
                <div
                  key={index}
                  className="bg-card border border-border rounded overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenBenefit(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left focus:outline-none hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-brand-primary-500/10 rounded flex items-center justify-center shrink-0">
                        {benefit.icon}
                      </div>
                      <h3 className="text-lg font-semibold text-card-foreground">
                        {benefit.title}
                      </h3>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {/* We use an animate presence or just motion div for smooth expand */}
                  <motion.div
                    initial={false}
                    animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 text-muted-foreground leading-relaxed border-t border-border/50 mt-2">
                      {benefit.description}
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Open Roles Section */}
      <section id="open-roles" className="py-20 bg-muted/20 border-t border-border">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-2xl font-bold text-foreground sm:text-3xl"
              >
                Open Positions
              </motion.h2>
              <p className="mt-4 text-sm text-muted-foreground">
                Don't see a perfect fit? Send your CV to <a href={`mailto:${COMPANY_EMAILS.CAREERS}`} className="text-brand-primary-500 hover:underline">{COMPANY_EMAILS.CAREERS}</a>
              </p>
            </div>

            <div className="space-y-12">
              {isLoading ? (
                <div className="text-center py-10 text-muted-foreground">
                  Loading open positions...
                </div>
              ) : openRoles.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  No open positions at the moment. Please check back later.
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap justify-center border-b border-border mb-8">
                    {departments.map((dept) => (
                      <button
                        key={dept}
                        onClick={() => setFilterDept(dept)}
                        className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                          filterDept === dept
                            ? "text-brand-primary-500"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {dept}
                        {filterDept === dept && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary-500"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                  {Object.entries(
                    filteredRoles.reduce((acc: any, role: any) => {
                      if (!acc[role.department]) acc[role.department] = [];
                      acc[role.department].push(role);
                      return acc;
                    }, {})
                  ).map(([department, roles]: [string, any], deptIndex) => (
                  <div key={department} className="mb-10 last:mb-0">
                    <h3 className="text-xl font-bold text-foreground mb-6 pb-2 border-b border-border flex items-center gap-2">
                      <Building className="w-5 h-5 text-brand-primary-500" />
                      {department}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      {roles.map((role: any, index: number) => (
                        <motion.div
                          key={role.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          className="h-full"
                        >
                          <div
                            onClick={() => setSelectedJob(role)}
                            className="group flex flex-col h-full bg-card p-6 sm:p-8 rounded border border-border hover:border-brand-primary-500 hover:shadow-md transition-all duration-300 cursor-pointer"
                          >
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-card-foreground group-hover:text-brand-primary-500 transition-colors">
                                {role.title}
                              </h3>
                              <div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-brand-primary-500" />
                                  {role.location}
                                </span>
                              </div>
                            </div>

                            <div className="mt-8 pt-4 border-t border-border flex items-center justify-between">
                              <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-500">
                                {role.type}
                              </span>
                              <div className="flex items-center gap-2 text-brand-primary-500 font-semibold">
                                View Details
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {selectedJob && (
        <ApplicationFormModal
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          job={selectedJob}
        />
      )}
    </div>
  );
}
