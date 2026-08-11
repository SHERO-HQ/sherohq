"use client";

import React from "react";
import { Users, BadgeCheck, Calendar } from "lucide-react";
import type { AdminUserListItem } from "@/services/api";

interface AdminUsersStatsProps {
  total: number;
  users: AdminUserListItem[];
}

export function AdminUsersStats({ total, users }: AdminUsersStatsProps) {
  const verifiedCount = users.filter(
    (u: AdminUserListItem) => u.emailVerified,
  ).length;
  const newThisMonthCount = users.filter((u: AdminUserListItem) => {
    const created = new Date(u.createdAt);
    const now = new Date();
    return (
      created.getMonth() === now.getMonth() &&
      created.getFullYear() === now.getFullYear()
    );
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-muted/30 border border-border rounded p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-secondary-500/20 rounded">
            <Users className="w-5 h-5 text-brand-secondary-400" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Total Customers</p>
            <p className="text-xl font-bold text-foreground">{total}</p>
          </div>
        </div>
      </div>
      <div className="bg-muted/30 border border-border rounded p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded">
            <BadgeCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Verified Users</p>
            <p className="text-xl font-bold text-foreground">{verifiedCount}</p>
          </div>
        </div>
      </div>
      <div className="bg-muted/30 border border-border rounded p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded">
            <Calendar className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">This Month</p>
            <p className="text-xl font-bold text-foreground">{newThisMonthCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
