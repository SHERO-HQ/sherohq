"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  StaggerContainer,
  StaggerItem} from "@/components/motion/AnimateSection";
import Reveal from "@/components/motion/Reveal";
import {
  ShoppingBag,
  Server,
  MessageSquare,
  Code,
  ArrowUpRight,
  Zap,
  CheckCircle,
  Database,
  RefreshCw,
  AlertTriangle} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// ============================================================================
// Custom Mini Interactive Widgets representing real products and capabilities
// ============================================================================

// 1. Hardware & Accessories: Provisioning Terminal Simulation
const HardwareTerminal: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const steps = [
    {
      label: "DEVICE PROVISIONING",
      detail: "Shero Workstation Pro v4",
      status: "Active"},
    {
      label: "CPU CORE TEST",
      detail: "16-Core Xeon Processor",
      status: "[Passed]"},
    {
      label: "ECC MEMORY CONFIG",
      detail: "64GB DDR5 Secure Storage",
      status: "[Passed]"},
    {
      label: "OS SECURE DEPLOYMENT",
      detail: "Fully Provisioned & Encrypted",
      status: "Ready"},
  ];

  return (
    <div className="w-full h-36 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-3 font-mono text-[9px] relative overflow-hidden select-none z-10">
      {/* Scanning laser line */}
      <div className="absolute inset-x-0 h-[2px] bg-brand-secondary-500/20 top-0 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-[bounce_3s_infinite_ease-in-out]" />

      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-800 mb-2">
        <span className="text-brand-secondary-500 font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary-500 animate-ping" />
          SHERO-Hardware
        </span>
        <span className="text-slate-700 dark:text-slate-300">SYS_OK</span>
      </div>

      <div className="space-y-1.5">
        {steps.map((step, idx) => {
          const isActive = idx === activeStep;
          const isDone = idx < activeStep;
          return (
            <div
              key={step.label}
              className={`flex items-center justify-between transition-all duration-300 ${
                isActive
                  ? "text-brand-secondary-400 font-bold translate-x-1"
                  : isDone
                    ? "text-slate-600 dark:text-slate-400"
                    : "text-slate-800 dark:text-slate-200"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span
                  className={`w-1 h-1 rounded-full ${isActive ? "bg-brand-secondary-400" : isDone ? "bg-slate-600 dark:bg-slate-500" : "bg-slate-400 dark:bg-slate-700"}`}
                />
                {step.label}:
              </span>
              <span className="truncate max-w-[100px]">{step.detail}</span>
              <span className="text-[8px] tracking-wide shrink-0">
                {step.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 2. IT Infrastructure: SmartBoutique POS Sync Simulation
const SmartBoutiqueWidget: React.FC = () => {
  const [posState, setPosState] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPosState((prev) => (prev + 1) % 4);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const posCycles = [
    { desc: "Scanning Silk Dress", price: "GH₵ 450.00", badge: "Add Item" },
    { desc: "Loyalty Discount (-10%)", price: "-GH₵ 45.00", badge: "Discount" },
    { desc: "Processing Paystack API", price: "Syncing...", badge: "Payment" },
    { desc: "Invoice Printed & Sent", price: "GH₵ 405.00", badge: "Completed" },
  ];

  return (
    <div className="w-full h-36 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-3 font-mono text-[9px] flex flex-col justify-between select-none z-10">
      <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
        <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
          SmartBoutique POS
        </span>
        <span className="text-slate-600 dark:text-slate-400 text-[8px]">
          5 Star Style, Tamale
        </span>
      </div>

      <div className="relative py-2 flex-1 flex flex-col justify-center gap-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={posState}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            className="space-y-1"
          >
            <div className="flex justify-between items-center">
              <span className="text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[120px]">
                {posCycles[posState].desc}
              </span>
              <span className="inline-flex px-1.5 py-0.5 rounded bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[7px] uppercase font-bold shrink-0">
                {posCycles[posState].badge}
              </span>
            </div>
            <div className="text-[14px] font-bold text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
              {posCycles[posState].price}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[7px] text-slate-600 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
          Branch Stock Sync
        </span>
        <span>Accra: 142 | Kumasi: 88</span>
      </div>
    </div>
  );
};

// 3. Managed Support: Proactive SLA Incident Console
const SupportSlaConsole: React.FC = () => {
  const [alertState, setAlertState] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setAlertState((prev) => (prev + 1) % 4);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const alerts = [
    { msg: "System running smoothly", type: "info", tag: "SYS_OK" },
    {
      msg: "ALERT: Port 443 Latency Spike",
      type: "warning",
      tag: "MIT_PENDING"},
    {
      msg: "SheroAgent auto-failover bridge routing",
      type: "mitigating",
      tag: "RESOLVING"},
    {
      msg: "System stable. Redundant node synced",
      type: "success",
      tag: "RESOLVED"},
  ];

  return (
    <div className="w-full h-36 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-3 font-mono text-[9px] select-none z-10 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
        <span className="text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1">
          Shero-SLA Active
        </span>
        <span className="text-slate-700 dark:text-slate-300">
          Uptime: 99.99%
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center py-1">
        <div
          className={`p-2 rounded border transition-all duration-300 ${
            alertState === 0
              ? "bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400"
              : alertState === 1
                ? "bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-400"
                : alertState === 2
                  ? "bg-purple-50 dark:bg-purple-500/10 border-purple-300 dark:border-purple-500/30 text-purple-700 dark:text-purple-400"
                  : "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[7px] uppercase font-bold tracking-wider text-slate-700 dark:text-slate-300">
              {alerts[alertState].tag}
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                alertState === 0
                  ? "bg-slate-700 dark:bg-slate-600"
                  : alertState === 1
                    ? "bg-amber-500 animate-ping"
                    : alertState === 2
                      ? "bg-purple-500 animate-pulse"
                      : "bg-emerald-500"
              }`}
            />
          </div>
          <p className="leading-normal truncate text-[9px] text-slate-700 dark:text-slate-200">
            {alerts[alertState].msg}
          </p>
        </div>
      </div>

      <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[7px] text-slate-700 dark:text-slate-400">
        <span>SLA Ticket dispatch</span>
        <span>Avg Resp: 4.8m</span>
      </div>
    </div>
  );
};

// 4. Software Engineering: Pharmasyst ERP Landscape Dashboard (wide card)
const PharmasystWidget: React.FC = () => {
  const [stockCycle, setStockCycle] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStockCycle((prev) => (prev + 1) % 2);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-4 font-mono text-[9px] flex flex-col md:flex-row gap-4 select-none z-10">
      {/* Left side: Drug database table */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-800 mb-2">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
            <Database className="w-3.5 h-3.5" />
            Pharmasyst ERP Ledger
          </span>
          <span className="text-[8px] text-slate-600 dark:text-slate-400">
            Active Inventory
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="grid grid-cols-[2fr_1fr_1fr] text-[7px] text-slate-700 dark:text-slate-400 uppercase pb-1 border-b border-slate-300/35 dark:border-slate-800/35">
            <span>Pharmaceutical</span>
            <span className="text-center">Stock</span>
            <span className="text-right">FDA Compliance</span>
          </div>

          {[
            { name: "Amoxicillin (500mg)", qty: 1240, alert: false },
            {
              name: "Paracetamol (500mg)",
              qty: stockCycle === 0 ? 210 : 800,
              alert: stockCycle === 0},
            { name: "Ibuprofen (400mg)", qty: 880, alert: false },
            {
              name: "Ciprofloxacin (500)",
              qty: stockCycle === 0 ? 90 : 450,
              alert: stockCycle === 0},
          ].map((item) => (
            <div
              key={item.name}
              className={`grid grid-cols-[2fr_1fr_1fr] items-center py-0.5 border-b border-slate-300/10 dark:border-slate-800/10 transition-colors duration-300 ${
                item.alert
                  ? "text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 font-semibold"
                  : "text-slate-700 dark:text-slate-400"
              }`}
            >
              <span className="truncate">{item.name}</span>
              <span className="text-center">{item.qty} units</span>
              <span className="text-right flex items-center justify-end gap-1">
                {item.alert ? (
                  <>
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                    Auto-Order
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-2.5 h-2.5 text-emerald-500" />
                    Passed
                  </>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right side: Safety Monitor & Sync Status */}
      <div className="w-full md:w-48 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-300 dark:border-slate-700 pt-3 md:pt-0 md:pl-4">
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[8px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Health Authority Link
            </span>
          </div>

          <div className="p-2.5 rounded bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/30 text-emerald-400 text-[8px] flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-200 dark:text-slate-100 text-[9px] mb-0.5">
                FDA/Pharmacy Council
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                Live Secure Gateway Sync
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-400">100%</span>
          </div>
        </div>

        <div className="mt-3">
          <div className="p-2 rounded bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 dark:border-amber-500/20 text-amber-400/90 text-[7px] leading-normal flex items-start gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <p>
              Batch #FDA-401B Expiry Warning: Auto-Quarantined and flagged in
              vendor portal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Core Bento Pillars Section Component with Blueprint Glow Effects
// ============================================================================

interface PillarsProps {
  header: string;
  subheader: string;
  content: string;
  icon?: React.ReactNode;
  className?: string; // For bento grid spans
  gradient?: string;
  glowColor?: string; // Custom color for hover spotlight
  widget?: React.ReactNode;
}

const PILLARS: PillarsProps[] = [
  {
    header: "Hardware & Accessories",
    subheader: "Curated Shop",
    content:
      "We supply a wide range of high-quality hardware and accessories for your business needs. From Computers to Servers, we have everything you need to get the job done.",
    icon: <ShoppingBag className="w-6 h-6" />,
    className: "md:col-span-1",
    gradient: "from-blue-500/20 to-cyan-500/20",
    glowColor: "rgba(6, 182, 212, 0.12)", // Cyan
    widget: <HardwareTerminal />},
  {
    header: "Custom Softwares",
    subheader: "Tailored Solutions",
    content:
      "Custom software solutions for your business needs. Get one made for your business that integrates seamlessly with your existing systems and workflows.",
    icon: <Server className="w-6 h-6" />,
    className: "md:col-span-1",
    gradient: "from-brand-secondary-500/20 to-green-500/20",
    glowColor: "rgba(59, 130, 246, 0.12)", // Blue
    widget: <SmartBoutiqueWidget />},
  {
    header: "Managed IT Support",
    subheader: "On-Call Expertise",
    content:
      "Proactive infrastructure maintenance, monitoring and support services to keep your business running smoothly.",
    icon: <MessageSquare className="w-6 h-6" />,
    className: "md:col-span-1",
    gradient: "from-purple-500/20 to-pink-500/20",
    glowColor: "rgba(168, 85, 247, 0.12)", // Purple
    widget: <SupportSlaConsole />},
  {
    header: "ERP & Custom Systems",
    subheader: "Digital Ecosystem",
    content:
      "Custom-engineered digital platforms for businesses, designed to integrate with existing systems and workflows.",
    icon: <Code className="w-6 h-6" />,
    className: "md:col-span-3",
    gradient: "from-indigo-500/20 to-violet-500/20",
    glowColor: "rgba(16, 185, 129, 0.12)", // Emerald
    widget: <PharmasystWidget />},
];

// Tactical, Custom-Engineered Bento Card with Cursor-Tracking Spotlight
const BentoPillarCard = ({ pillar }: { pillar: PillarsProps }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top});
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative overflow-hidden rounded bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 p-6 sm:p-8 hover:border-brand-secondary-500/40 dark:hover:border-white/20 transition-all duration-300 hover:-translate-y-0.5 h-full flex flex-col justify-between gap-6"
    >
      {/* 1. Dynamic Cursor Spotlight */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(200px circle at ${coords.x}px ${coords.y}px, ${pillar.glowColor || "rgba(16, 185, 129, 0.08)"}, transparent 70%)`}}
      />

      {/* 2. Sleek Top and Left Laser-Cut Glowing Edges on Hover */}
      <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-brand-secondary-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute left-0 inset-y-0 w-px bg-linear-to-b from-transparent via-brand-secondary-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* 3. Blueprint Coordinate Accent Corners (+) */}
      <div className="absolute top-2.5 left-2.5 font-mono text-[7px] text-slate-300 dark:text-white/10 group-hover:text-brand-secondary-500/40 group-hover:scale-110 transition duration-500 select-none">
        +
      </div>
      <div className="absolute top-2.5 right-2.5 font-mono text-[7px] text-slate-300 dark:text-white/10 group-hover:text-brand-secondary-500/40 group-hover:scale-110 transition duration-500 select-none">
        +
      </div>
      <div className="absolute bottom-2.5 left-2.5 font-mono text-[7px] text-slate-300 dark:text-white/10 group-hover:text-brand-secondary-500/40 group-hover:scale-110 transition duration-500 select-none">
        +
      </div>
      <div className="absolute bottom-2.5 right-2.5 font-mono text-[7px] text-slate-300 dark:text-white/10 group-hover:text-brand-secondary-500/40 group-hover:scale-110 transition duration-500 select-none">
        +
      </div>

      {/* 4. Ambient Gradient Overlay */}
      <div
        className={`absolute inset-0 bg-linear-to-br ${pillar.gradient} opacity-0 group-hover:opacity-10 dark:group-hover:opacity-40 transition-opacity duration-500 pointer-events-none`}
      />

      {/* Content Top */}
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="p-3 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white group-hover:scale-105 transition duration-300">
            {pillar.icon}
          </div>
          <ArrowUpRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-brand-secondary-600 dark:group-hover:text-white transition-colors" />
        </div>

        <div>
          <span className="text-[10px] font-semibold text-brand-secondary-600 dark:text-brand-secondary-400 mb-1 uppercase tracking-wider transition-colors duration-300 block">
            {pillar.subheader}
          </span>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2 transition-colors duration-300">
            {pillar.header}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
            {pillar.content}
          </p>
        </div>
      </div>

      {/* Live Interactive Widget Integration */}
      <div className="relative z-10 w-full">{pillar.widget}</div>

      {/* Decorative noise/texture (only in dark mode for more punch) */}
      <div className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none mix-blend-overlay">
        <svg className="w-full h-full">
          <filter id="noise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.60"
              numOctaves="3"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>
    </div>
  );
};

const LandingPillars = () => {
  return (
    <section className="relative w-full py-12 lg:py-16 bg-white dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-55 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-black transition duration-500 opacity-50 dark:opacity-100" />
      <div className="absolute inset-0 hero-grid-pattern transition-opacity duration-300" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-10">
          <Reveal direction="up" distance={20}>
            <span className="inline-flex items-center gap-2 px-4 py-1 mb-4 text-[10px] font-semibold text-brand-secondary-600 dark:text-brand-secondary-400 bg-brand-secondary-100 dark:bg-brand-secondary-200/20 border border-brand-secondary-500/50 dark:border-brand-secondary-800/50 rounded uppercase transition-colors duration-300">
              <Zap className="size-4" />
              What We've Built
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4 transition-colors duration-300 tracking-tight">
              Proven Platforms & Systems
            </h2>
          </Reveal>
          <Reveal direction="up" distance={40} delay={0.2}>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed transition-colors duration-300">
              A tactile look at the actual custom platforms, enterprise hardware
              systems, and managed support frameworks we build to keep
              operations clear.
            </p>
          </Reveal>
        </div>

        {/* Bento Grid — Staggered Scroll Reveal */}
        <StaggerContainer
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto"
          staggerDelay={0.12}
          threshold={0.08}
        >
          {PILLARS.map((pillar) => (
            <StaggerItem
              key={pillar.header}
              yOffset={20}
              scale={0.98}
              className={pillar.className}
            >
              <BentoPillarCard pillar={pillar} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default LandingPillars;
