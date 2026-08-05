"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Ticket, AlertCircle, Clock, CheckCircle2, MessageSquare, Tag, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

type Props = {
  params: Promise<{ ticketId: string }>;
};

type TicketData = {
  id: string;
  ticket_no: number;
  status: string;
  category: string;
  subject: string;
  createdAt: string;
};

export default function TrackTicketPage({ params }: Props) {
  const { ticketId } = use(params);
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticketId) return;

    const fetchTicket = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/tickets/track/${ticketId}`);
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch ticket");
        }
        
        setTicket(data);
        setError(null);
      } catch (err: any) {
        console.error("Tracking Error:", err);
        setError("We couldn't find a ticket with that number. Please check the link and try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-brand-primary-500/20 border-t-brand-primary-500 rounded-full animate-spin"></div>
            <Ticket className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-brand-primary-500" />
          </div>
          <p className="text-slate-500 font-medium animate-pulse">
            Locating your ticket...
          </p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="max-w-md mx-auto px-6 py-20 text-center space-y-6">
          <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10 text-rose-500" />
          </div>
          <h1 className="text-2xl font-bold dark:text-white">Ticket Not Found</h1>
          <p className="text-slate-500 dark:text-slate-400">{error}</p>
          <div className="pt-4">
            <Button asChild className="bg-brand-primary-600 hover:bg-brand-primary-700">
              <Link href="/support">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
      case "pending":
        return "bg-amber-500 text-white";
      case "in_progress":
        return "bg-blue-500 text-white";
      case "resolved":
      case "closed":
        return "bg-emerald-500 text-white";
      default:
        return "bg-slate-500 text-white";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
      case "pending":
        return <Clock className="w-4 h-4 mr-1.5" />;
      case "in_progress":
        return <Clock className="w-4 h-4 mr-1.5" />;
      case "resolved":
      case "closed":
        return <CheckCircle2 className="w-4 h-4 mr-1.5" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <div className="max-w-3xl mx-auto px-6 pt-26 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
              <Ticket className="w-8 h-8 text-brand-primary-500" />
              Ticket #{ticket.ticket_no}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Track the status of your support request
            </p>
          </div>
        </div>

        <Card className="p-6 md:p-8 dark:bg-slate-900 border-none shadow-sm space-y-8 border">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Subject
                </h3>
                <p className="text-lg font-medium text-slate-800 dark:text-slate-200">
                  {ticket.subject}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4" /> Category
                </h3>
                <p className="text-slate-700 dark:text-slate-300">
                  {ticket.category}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Status
                </h3>
                <Badge className={`px-3 py-1 text-sm font-medium ${getStatusColor(ticket.status)}`}>
                  <span className="flex items-center">
                    {getStatusIcon(ticket.status)}
                    {ticket.status.replace("_", " ").toUpperCase()}
                  </span>
                </Badge>
              </div>
              
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Created On
                </h3>
                <p className="text-slate-700 dark:text-slate-300">
                  {format(new Date(ticket.createdAt), "PPP 'at' p")}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              <strong>Note:</strong> To protect your privacy, only limited details of your ticket are shown on this public tracking page. Our support team will reply directly to your email address regarding this inquiry.
            </p>
          </div>
        </Card>

        <div className="flex justify-center pt-8">
          <Button variant="outline" asChild>
            <Link href="/support">Return to Support Center</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
