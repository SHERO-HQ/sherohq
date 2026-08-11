"use client";

import React from "react";
import { m, useMotionValue, useSpring, useTransform } from "motion/react";


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export interface StatCardItem {
  readonly title: string;
  readonly value: string | number;
  readonly icon: React.ElementType;
  readonly color: string;
  readonly bgColor: string;
  readonly trend: string;
  readonly subtext: string;
}

const MagneticStatCard = ({
  stat,
  index,
  prefersReducedMotion,
}: {
  readonly stat: StatCardItem;
  readonly index: number;
  readonly prefersReducedMotion: boolean;
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = e.clientX - rect.left;
    const mouseYPos = e.clientY - rect.top;
    x.set(mouseXPos / width - 0.5);
    y.set(mouseYPos / height - 0.5);
  };

  const handleMouseLeave = () => {
    if (prefersReducedMotion) return;
    x.set(0);
    y.set(0);
  };

  return (
    <m.div
      initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={
        prefersReducedMotion
          ? {}
          : {
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
            }
      }
      className="perspective-distant"
    >
      <Card className="bg-card/40 border-border hover:border-brand-secondary-500/40 transition-colors duration-500 group relative overflow-hidden h-full">
        <div className="absolute inset-0 bg-radial-gradient from-brand-secondary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {stat.title}
          </CardTitle>
          <div className={cn("p-2 rounded", stat.bgColor)}>
            <stat.icon className={cn("w-4 h-4", stat.color)} />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-2xl font-bold text-foreground mb-1 tracking-tight">
            {stat.value}
          </div>
          <div className="flex items-center gap-2">
            {stat.trend && (
              <span
                className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded",
                  stat.trend.startsWith("+")
                    ? "bg-brand-secondary-500/10 text-brand-secondary-400"
                    : "bg-rose-500/10 text-rose-400",
                )}
              >
                {stat.trend}
              </span>
            )}
            <span className="text-xs text-muted-foreground">{stat.subtext}</span>
          </div>
        </CardContent>
      </Card>
    </m.div>
  );
};

export function DashboardStatsGrid({ statCards }: { statCards: StatCardItem[] }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statCards.map((stat, i) => (
        <MagneticStatCard
          key={stat.title}
          stat={stat}
          index={i}
          prefersReducedMotion={prefersReducedMotion}
        />
      ))}
    </div>
  );
}
