"use client";

import React from "react";
import { format } from "date-fns";
import { MessageSquare, Mail, ArrowRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Inquiry } from "@/services/api";

const getStatusBadge = (status: string) => {
  const s = status.toLowerCase();
  if (s === "pending") {
    return (
      <Badge className="bg-amber-500/10 w-fit text-amber-500 border-amber-500/20 rounded">
        Pending
      </Badge>
    );
  }
  if (s === "resolved" || s === "completed") {
    return (
      <Badge className="bg-brand-secondary-500/10 w-fit text-brand-secondary-500 border-brand-secondary-500/20 rounded">
        Resolved
      </Badge>
    );
  }
  if (s === "in-progress") {
    return (
      <Badge className="bg-blue-500/10 w-fit text-blue-500 border-blue-500/20 rounded">
        In Progress
      </Badge>
    );
  }
  if (s === "confirmed") {
    return (
      <Badge className="bg-brand-secondary-500/10 w-fit text-brand-secondary-500 border-brand-secondary-500/20 rounded">
        Confirmed
      </Badge>
    );
  }
  if (s === "cancelled") {
    return (
      <Badge className="bg-red-500/10 w-fit text-red-500 border-red-500/20 rounded">
        Cancelled
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="rounded w-fit">
      {status}
    </Badge>
  );
};

interface InquiriesTabProps {
  isLoading: boolean;
  inquiries: Inquiry[];
  searchQuery: string;
  statusFilter: string;
  handleUpdateStatus: (
    type: "consultation" | "inquiry",
    id: string,
    status: string,
  ) => Promise<void>;
  confirmDelete: (type: "consultation" | "inquiry", id: string) => void;
  handleReplyEmail: (email: string, subject: string, name: string) => void;
}

export function InquiriesTab({
  isLoading,
  inquiries,
  searchQuery,
  statusFilter,
  handleUpdateStatus,
  confirmDelete,
  handleReplyEmail,
}: InquiriesTabProps) {
  return (
    <div className="bg-card/40 rounded border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-200">
          <thead className="bg-accent/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
                Contact
              </th>
              <th className="px-6 py-4 text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
                Subject
              </th>
              <th className="px-6 py-4 text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
                Message
              </th>
              <th className="px-6 py-4 text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
                Date
              </th>
              <th className="px-6 py-4 text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={6} className="px-6 py-6 h-20" />
                </tr>
              ))
            ) : inquiries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-foreground font-medium">
                    {searchQuery || statusFilter !== "all"
                      ? "No matching messages found"
                      : "No contact messages"}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {searchQuery || statusFilter !== "all"
                      ? "Try adjusting your search or filters"
                      : "General inquiries will appear here"}
                  </p>
                </td>
              </tr>
            ) : (
              inquiries.map((inquiry) => (
                <tr
                  key={inquiry.id}
                  className="hover:bg-accent transition-colors group"
                >
                  <td className="px-6 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-foreground">
                        {inquiry.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {inquiry.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <Badge
                      variant="outline"
                      className="border-border text-muted-foreground font-mono text-[10px] tracking-tight truncate max-w-37.5"
                    >
                      {inquiry.subject || "No Subject"}
                    </Badge>
                  </td>
                  <td className="px-6 py-6 max-w-md">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {inquiry.message}
                    </p>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(inquiry.createdAt), "MMM d, yyyy")}
                    </span>
                  </td>
                  <td className="px-6 py-6">{getStatusBadge(inquiry.status)}</td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        onClick={() =>
                          handleReplyEmail(
                            inquiry.email,
                            inquiry.subject || "Your Inquiry",
                            inquiry.name,
                          )
                        }
                        title="Reply via Email"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground group-hover:bg-accent"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      {inquiry.status !== "Responded" && (
                        <Button
                          variant="ghost"
                          onClick={() =>
                            void handleUpdateStatus(
                              "inquiry",
                              inquiry.id,
                              "Responded",
                            )
                          }
                          title="Mark as Responded"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-brand-secondary-500 group-hover:bg-accent"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        onClick={() => confirmDelete("inquiry", inquiry.id)}
                        className="h-8 w-8 p-0 text-red-500/60 hover:text-red-500 group-hover:bg-accent"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
