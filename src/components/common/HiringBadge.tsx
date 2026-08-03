"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

export function HiringBadge() {
  const { data: careers = [] } = useQuery({
    queryKey: ["public_careers"],
    queryFn: async () => {
      const res = await fetch("/api/public/careers");
      if (!res.ok) throw new Error("Failed to fetch careers");
      const json = await res.json();
      return json.data || [];
    },
  });

  if (careers.length === 0) return null;

  return (
    <Badge variant="secondary" className="text-[9px] -ml-1 tracking-wider py-0 px-1 h-auto">
      Hiring
    </Badge>
  );
}
