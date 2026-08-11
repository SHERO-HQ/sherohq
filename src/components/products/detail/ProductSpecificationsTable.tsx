"use client";

import React from "react";

interface ProductSpecificationsTableProps {
  specifications?: Record<string, any>;
}

export function ProductSpecificationsTable({
  specifications,
}: ProductSpecificationsTableProps) {
  if (!specifications || Object.keys(specifications).length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="flex flex-col items-center mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tighter">
          Technical{" "}
          <span className="text-brand-secondary-500">Specifications</span>
        </h2>
        <div className="h-1.5 w-12 bg-brand-secondary-500 rounded-full mt-2" />
      </div>

      <div className="max-w-4xl mx-auto overflow-hidden rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
              <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Parameter
              </th>
              <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Specification
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {Object.entries(specifications).map(([key, value]) => (
              <tr
                key={`spec-${key}`}
                className="group hover:bg-brand-secondary-500/5 transition-colors"
              >
                <td className="px-8 py-6 text-xs uppercase tracking-wider text-slate-900 dark:text-white w-1/3 border-r border-slate-100 dark:border-white/5">
                  <span className="group-hover:text-brand-secondary-500 transition-colors">
                    {key}
                  </span>
                </td>
                <td className="px-8 py-6 text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {value as string}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
