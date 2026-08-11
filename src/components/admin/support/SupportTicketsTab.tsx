"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import {
  Headset,
  Clock,
  Mail,
  Phone,
  PhoneCall,
  MessageSquare,
  MessageCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SupportTicket } from "@/services/api";

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

interface SupportTicketsTabProps {
  isLoading: boolean;
  tickets: SupportTicket[];
  searchQuery: string;
  statusFilter: string;
  handleResolveTicket: (id: string) => Promise<void>;
  handleReplyEmail: (email: string, subject: string, name: string) => void;
}

export function SupportTicketsTab({
  isLoading,
  tickets,
  searchQuery,
  statusFilter,
  handleResolveTicket,
  handleReplyEmail,
}: SupportTicketsTabProps) {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 bg-card/40 rounded animate-pulse border border-border"
          />
        ))}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <Card className="bg-card/40 border-dashed border-border text-center py-12">
        <Headset className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-foreground font-medium">
          {searchQuery || statusFilter !== "all"
            ? "No matching tickets found"
            : "No support tickets found"}
        </h3>
        <p className="text-muted-foreground text-sm">
          {searchQuery || statusFilter !== "all"
            ? "Try adjusting your search or filters"
            : "Tickets created by users will appear here"}
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {tickets.map((ticket) => (
        <Card
          key={ticket.id}
          className={`bg-card/40 hover:bg-card/60 border-border transition group ${
            selectedTicketId === ticket.id ? "ring-1 ring-brand-secondary-500/50" : ""
          }`}
        >
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  {getStatusBadge(ticket.status)}
                  <Badge
                    variant="outline"
                    className="border-border text-muted-foreground capitalize"
                  >
                    {ticket.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {format(new Date(ticket.createdAt), "PPP")}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-brand-secondary-500 font-mono font-bold">
                      #{ticket.ticket_no}
                    </span>
                    <h3 className="text-lg font-bold text-foreground group-hover:text-brand-secondary-400 transition-colors uppercase tracking-tight">
                      {ticket.subject}
                    </h3>
                  </div>
                  <p
                    className={`text-muted-foreground text-sm mt-1 ${
                      selectedTicketId === ticket.id ? "" : "line-clamp-2"
                    }`}
                  >
                    {ticket.message}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-brand-secondary-500/10 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-brand-secondary-500">
                        {ticket.name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {ticket.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {ticket.email}
                    </span>
                  </div>
                  {ticket.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {ticket.phone}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-row lg:flex-col justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() =>
                    setSelectedTicketId(
                      selectedTicketId === ticket.id ? null : ticket.id,
                    )
                  }
                  className="text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  {selectedTicketId === ticket.id ? "Hide Details" : "View Details"}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-muted-foreground hover:text-foreground hover:bg-accent"
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Contact
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card border-border">
                    <DropdownMenuItem
                      onSelect={() =>
                        handleReplyEmail(ticket.email, ticket.subject, ticket.name)
                      }
                      className="text-muted-foreground hover:text-foreground focus:bg-accent/50 cursor-pointer"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </DropdownMenuItem>
                    {ticket.phone && (
                      <>
                        <DropdownMenuItem
                          asChild
                          className="text-muted-foreground hover:text-foreground focus:bg-accent/50 cursor-pointer"
                        >
                          <a href={`tel:${ticket.phone}`}>
                            <PhoneCall className="w-4 h-4 mr-2" />
                            Call
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          asChild
                          className="text-muted-foreground hover:text-foreground focus:bg-accent/50 cursor-pointer"
                        >
                          <a
                            href={`https://wa.me/${ticket.phone.replace(/^0/, "233").replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MessageCircle className="w-4 h-4 mr-2 text-brand-secondary-500" />
                            WhatsApp
                          </a>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                {ticket.status !== "Resolved" && (
                  <Button
                    onClick={() => void handleResolveTicket(ticket.id)}
                    className="bg-brand-secondary-500 hover:bg-brand-secondary-600 text-white rounded px-6"
                  >
                    Resolve
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
