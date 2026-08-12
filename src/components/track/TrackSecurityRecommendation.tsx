"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TrackSecurityRecommendationProps {
  isAuthenticated: boolean;
}

export function TrackSecurityRecommendation({
  isAuthenticated,
}: TrackSecurityRecommendationProps) {
  if (isAuthenticated) return null;

  return (
    <Card className="p-5 border-amber-200/70 bg-amber-50/60 dark:bg-amber-500/5 dark:border-amber-500/20">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <AlertCircle className="w-4 h-4" />
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Security Recommendation
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            For safer access to your order history and easier tracking across
            devices, create an account and place future orders while signed in.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-500/30 dark:text-amber-300 dark:hover:bg-amber-500/10"
            asChild
          >
            <Link href="/signup">Create Account</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
