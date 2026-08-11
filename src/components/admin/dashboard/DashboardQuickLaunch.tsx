"use client";

import React from "react";
import Link from "next/link";
import {
  Plus,
  ShoppingCart,
  AlertTriangle,
  Brain,
  Settings,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const quickActions = [
  {
    title: "New Product",
    icon: Plus,
    link: "/admin/products/new",
    color: "bg-brand-secondary-500/10 text-brand-secondary-400",
  },
  {
    title: "View All Orders",
    icon: ShoppingCart,
    link: "/admin/orders",
    color: "bg-blue-500/10 text-blue-400",
  },
  {
    title: "Stock Alerts",
    icon: AlertTriangle,
    link: "/admin/products?stock=low",
    color: "bg-amber-500/10 text-amber-400",
  },
  {
    title: "AI Intelligence Hub",
    icon: Brain,
    link: "/admin/ai-analytics",
    color: "bg-purple-500/10 text-purple-400",
  },
  {
    title: "Admin Settings",
    icon: Settings,
    link: "/admin/profile",
    color: "bg-muted text-muted-foreground",
  },
];

export function DashboardQuickLaunch() {
  return (
    <Card className="bg-card/40 border-border overflow-hidden">
      <div className="p-6 bg-linear-to-br from-brand-secondary-600/20 to-transparent border-b border-border">
        <h3 className="text-lg font-bold text-foreground">Quick Launch</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Common administrative tasks
        </p>
      </div>
      <div className="p-4 space-y-2">
        {quickActions.map((action) => (
          <Link
            key={action.title}
            href={action.link}
            className="flex items-center justify-between p-3 rounded bg-card border border-border hover:border-brand-secondary-500/20 hover:bg-card/50 transition-all duration-300 group"
          >
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded", action.color)}>
                <action.icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {action.title}
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-brand-secondary-500 transition opacity-0 group-hover:opacity-100 group-hover:translate-x-1" />
          </Link>
        ))}
      </div>
    </Card>
  );
}
