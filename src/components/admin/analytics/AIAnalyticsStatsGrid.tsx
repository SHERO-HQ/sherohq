"use client";

import React from "react";
import { MessageSquare, Activity, Camera, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AIAnalyticsStatsGridProps {
  totalInteractions: number;
  avgDailyVolume: number;
  imageUsageRate: number;
  resolutionRate: number;
}

export function AIAnalyticsStatsGrid({
  totalInteractions,
  avgDailyVolume,
  imageUsageRate,
  resolutionRate,
}: AIAnalyticsStatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-400" /> Total AI
            Interactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {totalInteractions}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Past 30 days volume</p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" /> Avg Daily Load
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {avgDailyVolume.toFixed(1)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Conversations per day</p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Camera className="w-4 h-4 text-purple-400" /> Image-Assisted
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {imageUsageRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Image-assisted sessions
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-secondary-400" />{" "}
            Resolution Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {resolutionRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Non-fallback response ratio
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
