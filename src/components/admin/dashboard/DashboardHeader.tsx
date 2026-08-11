"use client";

import React from "react";
import Link from "next/link";
import { LayoutDashboard, RefreshCw, TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

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
    <AdminPageHeader
      icon={LayoutDashboard}
      title="Dashboard Overview"
      description={
        <>
          Welcome back,{" "}
          <span className="text-brand-secondary-400 font-semibold">
            {username}
          </span>
          . Here's your store's performance at a glance.
        </>
      }
    >
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
                ? "bg-brand-secondary-600 text-white shadow"
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
    </AdminPageHeader>
  );
}
