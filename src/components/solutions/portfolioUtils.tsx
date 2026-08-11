import React from "react";
import { Code2, Smartphone, Server, Layers } from "lucide-react";

export const getTechColor = (tech: string) => {
  const name = tech.toLowerCase();
  if (name.includes("react") || name.includes("next")) {
    return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25";
  }
  if (name.includes("node") || name.includes("express")) {
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25";
  }
  if (name.includes("aws") || name.includes("cloud") || name.includes("s3")) {
    return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/25";
  }
  if (
    name.includes("postgres") ||
    name.includes("sql") ||
    name.includes("supabase")
  ) {
    return "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/25";
  }
  if (name.includes("tailwind") || name.includes("css")) {
    return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/25";
  }
  return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200/50 dark:border-slate-800/80";
};

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Web Development":
      return <Code2 className="w-4 h-4" />;
    case "Mobile Apps":
      return <Smartphone className="w-4 h-4" />;
    case "Infrastructure":
      return <Server className="w-4 h-4" />;
    case "Custom Software":
      return <Layers className="w-4 h-4" />;
    default:
      return <Layers className="w-4 h-4" />;
  }
};
