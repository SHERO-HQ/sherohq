"use client";

import React from "react";
import Link from "next/link";
import { LayoutDashboard, RefreshCw, TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  username?: string;
  period: "today" | "week" | "month" | "year";
  setPeriod: (p: "today" | "week" | "month" | "year") => void;
  handleManualRefresh: () => Promise<void>;
  isRefreshing: boolean;
}

export function DashboardHeader({
  username,
  period,
  setPeriod,
  handleManualRefresh,
  isRefreshing,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <LayoutDashboard className="w-7 h-7 text-brand-secondary-400" />
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground text-sm">
          Welcome back,{" "}
          <span className="text-brand-secondary-400 font-semibold">
            {username}
          </span>
          . Here's your store's performance at a glance.
        </p>
      </div>
      <div className="flex items-center flex-wrap gap-3">
        <div className="flex bg-card/50 p-1 rounded border border-border">
          {[
            { value: "today", label: "Today" },
            { value: "week", label: "Week" },
            { value: "month", label: "Month" },
            { value: "year", label: "Year" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() =>
                setPeriod(opt.value as "today" | "week" | "month" | "year")
              }
              className={cn(
                "px-3 py-1 text-xs font-semibold rounded transition",
                period === opt.value
                  ? "bg-brand-secondary-600 text-foreground shadow"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="border-border text-muted-foreground hover:text-foreground hover:bg-accent h-9 w-9"
          title="Refresh Data"
        >
          <RefreshCw
            className={cn("h-4 w-4", isRefreshing && "animate-spin")}
          />
        </Button>
        <Button
          variant="outline"
          className="border-border text-foreground hover:bg-accent"
          asChild
        >
          <Link href="/admin/reports">
            <TrendingUp className="mr-2 h-4 w-4" /> View Detailed Reports
          </Link>
        </Button>
        <Button
          className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-foreground font-bold"
          asChild
        >
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Link>
        </Button>
      </div>
    </div>
  );
}
