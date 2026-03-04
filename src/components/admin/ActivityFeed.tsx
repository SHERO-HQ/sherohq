"use client";
import { type ActivityLog } from "@/services/api";
import {
  Package,
  ShoppingCart,
  Settings,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityFeedProps {
  logs: ActivityLog[];
  isLoading: boolean;
}

const getIcon = (action: string, type: string) => {
  if (action.toLowerCase().includes("product"))
    return <Package className="w-4 h-4" />;
  if (action.toLowerCase().includes("order"))
    return <ShoppingCart className="w-4 h-4" />;
  if (
    action.toLowerCase().includes("profile") ||
    action.toLowerCase().includes("settings")
  )
    return <Settings className="w-4 h-4" />;

  switch (type) {
    case "success":
      return <CheckCircle className="w-4 h-4" />;
    case "warning":
      return <AlertTriangle className="w-4 h-4" />;
    case "error":
      return <XCircle className="w-4 h-4" />;
    default:
      return <Info className="w-4 h-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "success":
      return "text-emerald-400 bg-emerald-400/10";
    case "warning":
      return "text-amber-400 bg-amber-400/10";
    case "error":
      return "text-rose-400 bg-rose-400/10";
    default:
      return "text-blue-400 bg-blue-400/10";
  }
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString();
};

export default function ActivityFeed({ logs, isLoading }: ActivityFeedProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={`skeleton-${i}`} className="flex gap-4 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-slate-800" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-800 rounded w-3/4" />
              <div className="h-3 bg-slate-800 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-20" />
        <p className="text-sm">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative space-y-4 before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-white/5">
        {logs.map((log) => {
          const typeColor = getTypeColor(log.type);
          const icon = getIcon(log.action, log.type);
          return (
            <div key={log.id} className="relative flex gap-4 pl-10">
              <div
                className={cn(
                  "absolute left-0 w-8 h-8 rounded-full flex items-center justify-center z-10",
                  typeColor,
                  "border border-slate-900",
                )}
              >
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                  <p className="text-sm font-medium text-slate-200 truncate">
                    {log.action}
                  </p>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap ml-2">
                    {formatTime(log.createdAt)}
                  </span>
                </div>
                {log.details && (
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {log.details}
                  </p>
                )}
                {log.adminName && (
                  <p className="text-[10px] text-emerald-400 mt-1 uppercase tracking-wider font-bold">
                    By {log.adminName}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
