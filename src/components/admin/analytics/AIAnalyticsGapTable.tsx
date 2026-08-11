"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface AIAnalyticsGapTableProps {
  topGaps?: Array<{
    keyword: string;
    queryCount: number;
    lastRequested: string;
  }>;
}

export function AIAnalyticsGapTable({ topGaps }: AIAnalyticsGapTableProps) {
  return (
    <Card className="bg-card/40 border-border overflow-hidden relative group">
      <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <CardHeader className="border-b border-border bg-card/30">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-foreground">
              Catalog Deficiency Analysis
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Products or services users asked for that we don't have
            </CardDescription>
          </div>
          <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/40">
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Unmet Need (Keyword)
              </th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Requests
              </th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Last Request
              </th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {topGaps &&
              topGaps.map((gap) => (
                <tr
                  key={gap.keyword}
                  className="border-b border-border last:border-0 hover:bg-accent transition-colors duration-200"
                >
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-foreground capitalize">
                      {gap.keyword}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-brand-secondary-400 font-bold font-mono">
                      {gap.queryCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(gap.lastRequested).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      Investigating
                    </span>
                  </td>
                </tr>
              ))}
            {(!topGaps || topGaps.length === 0) && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center text-muted-foreground italic"
                >
                  No catalog gaps identified yet. Our inventory matching is
                  currently 100%.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
