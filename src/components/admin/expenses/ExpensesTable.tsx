"use client";

import React from "react";
import { format } from "date-fns";
import { FileText, Edit2, Trash2, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  description: string | null;
  adminId: string | null;
  createdAt: string;
}

interface ExpensesTableProps {
  isLoading: boolean;
  filteredExpenses: Expense[];
  handleOpenForm: (expense?: Expense) => void;
  setDeleteConfirmId: (id: string) => void;
  isDeleting: string | null;
}

export function ExpensesTable({
  isLoading,
  filteredExpenses,
  handleOpenForm,
  setDeleteConfirmId,
  isDeleting,
}: ExpensesTableProps) {
  return (
    <Card className="bg-card/40 border-border overflow-hidden">
      <div className="overflow-auto max-h-[calc(100vh-18rem)]">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 text-xs font-bold text-muted-foreground uppercase">
                Expense
              </th>
              <th className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 text-xs font-bold text-muted-foreground uppercase">
                Category
              </th>
              <th className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 text-xs font-bold text-muted-foreground uppercase">
                Date
              </th>
              <th className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 text-xs font-bold text-muted-foreground uppercase text-right">
                Amount
              </th>
              <th className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 text-xs font-bold text-muted-foreground uppercase text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading &&
              ["sk1", "sk2", "sk3", "sk4", "sk5"].map((id) => (
                <tr key={id} className="animate-pulse">
                  <td colSpan={5} className="px-6 py-8">
                    <div className="h-4 bg-muted rounded w-full" />
                  </td>
                </tr>
              ))}

            {!isLoading && filteredExpenses.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-muted-foreground"
                >
                  No expense records found.
                </td>
              </tr>
            )}

            {!isLoading &&
              filteredExpenses.length > 0 &&
              filteredExpenses.map((expense) => (
                <tr
                  key={expense.id}
                  className="hover:bg-accent transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-foreground font-medium">
                          {expense.title}
                        </p>
                        {expense.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {expense.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant="outline"
                      className="bg-blue-500/10 text-blue-400 border-none px-2 py-0"
                    >
                      {expense.category}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {format(new Date(expense.date), "MMM dd, yyyy")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-foreground font-bold">
                      GHS
                      {Number(expense.amount).toLocaleString("en-GH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleOpenForm(expense)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-rose-400"
                        onClick={() => setDeleteConfirmId(expense.id)}
                        disabled={isDeleting === expense.id}
                      >
                        {isDeleting === expense.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
