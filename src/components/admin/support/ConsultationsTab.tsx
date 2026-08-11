"use client";

import React from "react";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  MoreVertical,
  MessageSquare,
  Mail,
  PhoneCall,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Consultation } from "@/services/api";

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

interface ConsultationsTabProps {
  isLoading: boolean;
  consultations: Consultation[];
  searchQuery: string;
  statusFilter: string;
  setRescheduleModal: (val: {
    isOpen: boolean;
    id: string | null;
    currentDate: string;
    currentTime: string;
  }) => void;
  handleUpdateStatus: (
    type: "consultation" | "inquiry",
    id: string,
    status: string,
  ) => Promise<void>;
  confirmDelete: (type: "consultation" | "inquiry", id: string) => void;
  handleReplyEmail: (email: string, subject: string, name: string) => void;
}

export function ConsultationsTab({
  isLoading,
  consultations,
  searchQuery,
  statusFilter,
  setRescheduleModal,
  handleUpdateStatus,
  confirmDelete,
  handleReplyEmail,
}: ConsultationsTabProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-80 bg-card/40 rounded animate-pulse border border-border"
          />
        ))}
      </div>
    );
  }

  if (consultations.length === 0) {
    return (
      <Card className="bg-card/40 border-dashed border-border text-center py-12">
        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-foreground font-medium">
          {searchQuery || statusFilter !== "all"
            ? "No matching consultations found"
            : "No consultations scheduled"}
        </h3>
        <p className="text-muted-foreground text-sm">
          {searchQuery || statusFilter !== "all"
            ? "Try adjusting your search or filters"
            : "Booking requests will appear here"}
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {consultations.map((c) => (
        <Card
          key={c.id}
          className="bg-card/40 border-border hover:border-brand-secondary-500/30 transition flex flex-col h-full"
        >
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-2">
                <Badge className="bg-brand-secondary-500/10 text-brand-secondary-500 border-brand-secondary-500/20 max-w-fit">
                  {c.service}
                </Badge>
                {getStatusBadge(c.status)}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-border">
                  <DropdownMenuItem
                    onSelect={() =>
                      setRescheduleModal({
                        isOpen: true,
                        id: c.id,
                        currentDate: c.date,
                        currentTime: c.time,
                      })
                    }
                    className="text-muted-foreground hover:text-foreground focus:bg-accent/50 cursor-pointer"
                  >
                    Reschedule
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() =>
                      void handleUpdateStatus("consultation", c.id, "Cancelled")
                    }
                    className="text-muted-foreground hover:text-foreground focus:bg-accent/50"
                  >
                    Cancel
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => confirmDelete("consultation", c.id)}
                    className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CardTitle className="text-foreground text-lg">{c.name}</CardTitle>
            <CardDescription className="text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Requested on {format(new Date(c.createdAt), "PP")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <div className="bg-card rounded p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
                  Date
                </span>
                <span className="text-xs font-bold text-foreground">
                  {format(new Date(c.date), "PPP")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
                  Time
                </span>
                <span className="text-xs font-bold text-foreground">{c.time}</span>
              </div>
            </div>
            <div className="space-y-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-muted-foreground hover:text-foreground border-border bg-card hover:bg-accent rounded group"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contact Customer
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 bg-card border-border">
                  <DropdownMenuItem
                    onSelect={() =>
                      handleReplyEmail(c.email, `Consultation: ${c.service}`, c.name)
                    }
                    className="text-muted-foreground hover:text-foreground focus:bg-accent/50 cursor-pointer"
                  >
                    <Mail className="w-4 h-4 mr-2 text-brand-secondary-500" />
                    Email ({c.email})
                  </DropdownMenuItem>
                  {c.phone && (
                    <>
                      <DropdownMenuItem
                        asChild
                        className="text-muted-foreground hover:text-foreground focus:bg-accent/50 cursor-pointer"
                      >
                        <a href={`tel:${c.phone}`}>
                          <PhoneCall className="w-4 h-4 mr-2 text-brand-secondary-500" />
                          Call ({c.phone})
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        asChild
                        className="text-muted-foreground hover:text-foreground focus:bg-accent/50 cursor-pointer"
                      >
                        <a
                          href={`https://wa.me/${c.phone.replace(/^0/, "233").replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle className="w-4 h-4 mr-2 text-green-500" />
                          WhatsApp
                        </a>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {c.message && (
              <div className="pt-4 border-t border-border mt-auto">
                <p className="text-xs text-muted-foreground italic">"{c.message}"</p>
              </div>
            )}
          </CardContent>
          <div className="p-4 pt-0">
            {c.status !== "Confirmed" && (
              <Button
                variant="outline"
                onClick={() =>
                  void handleUpdateStatus("consultation", c.id, "Confirmed")
                }
                className="w-full border-brand-secondary-500/20 text-brand-secondary-400 hover:bg-brand-secondary-500/10 rounded group"
              >
                Confirm Appointment
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
