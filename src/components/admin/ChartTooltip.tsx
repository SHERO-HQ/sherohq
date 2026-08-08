import React from "react";

const parseLabel = (label: any) => {
  if (!label) return "";
  const parsed = Date.parse(label);
  if (!isNaN(parsed) && String(label).includes("-")) {
    return new Date(parsed).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  return String(label);
};

export const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card backdrop-blur-md border border-border p-3 rounded shadow-[0_10px_25px_rgba(0,0,0,0.5)] space-y-1.5 animate-in fade-in zoom-in-95 duration-100 select-none">
        {label && (
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider font-mono">
            {parseLabel(label)}
          </p>
        )}
        <div className="space-y-1">
          {payload.map((item: any, index: number) => {
            const name = String(item.name || "");
            const isCurrency =
              name.toLowerCase().includes("revenue") ||
              name.toLowerCase().includes("expenses") ||
              name.toLowerCase().includes("profit");

            let displayName = name;
            if (name === "count") displayName = "Interactions";
            if (name === "queryCount") displayName = "Queries";

            const formattedValue = isCurrency
              ? `GHS${(item.value || 0).toLocaleString("en-GH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
              : (typeof item.value === "number" ? item.value.toLocaleString("en-US") : item.value);

            const rawColors = [item.color, item.stroke, item.fill];
            let dotColor = rawColors.find(c => typeof c === 'string' && !c.includes("url("));
            
            if (!dotColor) {
              const n = name.toLowerCase();
              if (n.includes("revenue")) dotColor = "#3b82f6"; // AdminReports Bar Chart
              else if (n.includes("order")) dotColor = "#3b82f6";
              else if (n.includes("query")) dotColor = "#f59e0b"; // AIAnalytics Gap Pressure (queryCount)
              else if (n.includes("count")) dotColor = "#10b981"; // AIAnalytics Interaction Volume (count)
              else dotColor = "#8884d8";
            }

            return (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full shadow-xs"
                  style={{ backgroundColor: dotColor }}
                />
                <span className="text-xs text-muted-foreground font-medium capitalize">
                  {displayName}:
                </span>
                <span className="text-xs text-foreground font-bold font-mono">
                  {formattedValue}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};
