"use client";
import React, { useState, useRef } from "react";
import { ArrowUpRight } from "lucide-react";

export interface PillarProps {
  header: string;
  subheader: string;
  content: string;
  icon?: React.ReactNode;
  className?: string;
  gradient?: string;
  glowColor?: string;
  widget?: React.ReactNode;
}

export const PillarCard = ({ pillar }: { pillar: PillarProps }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
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
          background: `radial-gradient(200px circle at ${coords.x}px ${coords.y}px, ${pillar.glowColor || "rgba(16, 185, 129, 0.08)"}, transparent 70%)`
        }}
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

      {/* Decorative noise/texture */}
      <div
        className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none mix-blend-overlay"
        style={{ filter: "url(#pillar-noise)" }}
      />
    </div>
  );
};
