import { CheckCircle2, Send, Target, Users } from "lucide-react";
import { cn } from "@/lib/utils";

function MetricTile({
  label,
  value,
  detail,
  icon: Icon,
  tone = "slate",
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: typeof Users;
  tone?: "slate" | "green" | "amber" | "blue";
}) {
  const toneClass = {
    slate: "text-muted-foreground bg-slate-500/10 border-slate-500/15",
    green:
      "text-brand-secondary-300 bg-brand-secondary-500/10 border-brand-secondary-500/20",
    amber: "text-amber-300 bg-amber-500/10 border-amber-500/20",
    blue: "text-sky-300 bg-sky-500/10 border-sky-500/20",
  }[tone];

  return (
    <div className="rounded border border-border bg-slate-950/30 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
        <div className={cn("rounded border p-2", toneClass)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

interface NewsletterStatsProps {
  counts: { total: number; active: number; unsubscribed: number };
  activeRate: number;
  deliveryRate: number;
  deliveryStats: { sent: number; targets: number; failed: number };
  estimatedAudience: number;
  audienceStatus: string;
}

export function NewsletterStats({
  counts,
  activeRate,
  deliveryRate,
  deliveryStats,
  estimatedAudience,
  audienceStatus,
}: NewsletterStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      <MetricTile
        label="Total Subscribers"
        value={counts.total}
        detail={`${activeRate}% active`}
        icon={Users}
        tone="slate"
      />
      <MetricTile
        label="Active Audience"
        value={counts.active}
        detail={`${counts.unsubscribed} unsubscribed`}
        icon={CheckCircle2}
        tone="green"
      />
      <MetricTile
        label="Delivery Rate"
        value={`${deliveryRate}%`}
        detail={`${deliveryStats.sent}/${deliveryStats.targets} delivered`}
        icon={Send}
        tone="blue"
      />
      <MetricTile
        label="Current Target"
        value={estimatedAudience}
        detail={`${audienceStatus} audience`}
        icon={Target}
        tone="amber"
      />
    </div>
  );
}
