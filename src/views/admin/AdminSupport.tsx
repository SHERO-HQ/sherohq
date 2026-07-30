"use client";
import { useState, useMemo } from "react";
import { getErrorMessage } from "@/utils/error";
import {
  MessageSquare,
  MessageCircle,
  Calendar,
  Headset,
  Search,
  Filter,
  MoreVertical,
  Clock,
  Mail,
  Phone,
  PhoneCall,
  ArrowRight,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";

import {
  useSupportTickets,
  useConsultations,
  useInquiries,
  useUpdateTicketStatus,
  useUpdateConsultationStatus,
  useDeleteConsultation,
  useUpdateInquiryStatus,
  useDeleteInquiry,
} from "@/hooks/queries/useSupport";
import { useNotifications } from "@/hooks/useNotifications";
import { ADMIN_POLLING_INTERVAL } from "@/constants/admin";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Modal } from "@/components/ui/Modal";
import Link from "next/link";

const AdminSupport = () => {
  const { data: tickets = [], isLoading: ticketsLoading } = useSupportTickets(
    ADMIN_POLLING_INTERVAL,
  );
  const { data: consultations = [], isLoading: consultationsLoading } =
    useConsultations(ADMIN_POLLING_INTERVAL);
  const { data: inquiries = [], isLoading: inquiriesLoading } = useInquiries(
    ADMIN_POLLING_INTERVAL,
  );

  const resolveTicketMutation = useUpdateTicketStatus();
  const updateConsultationStatusMutation = useUpdateConsultationStatus();
  const updateInquiryStatusMutation = useUpdateInquiryStatus();
  const deleteConsultationMutation = useDeleteConsultation();
  const deleteInquiryMutation = useDeleteInquiry();

  const isLoading = ticketsLoading || consultationsLoading || inquiriesLoading;

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { addNotification } = useNotifications();

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: "consultation" | "inquiry" | null;
    id: string | null;
  }>({
    isOpen: false,
    type: null,
    id: null,
  });

  const handleResolveTicket = async (id: string) => {
    try {
      await resolveTicketMutation.mutateAsync({ id, status: "Resolved" });
      addNotification("Success", "Ticket marked as resolved", "success");
    } catch (err) {
      console.error("Failed to resolve ticket:", err);
      addNotification(
        "Error",
        getErrorMessage(err, "Failed to resolve ticket"),
        "error",
      );
    }
  };

  const handleUpdateStatus = async (
    type: "consultation" | "inquiry",
    id: string,
    status: string,
  ) => {
    try {
      if (type === "consultation") {
        await updateConsultationStatusMutation.mutateAsync({ id, status });
      } else {
        await updateInquiryStatusMutation.mutateAsync({ id, status });
      }
      addNotification("Success", `Status updated to ${status}`, "success");
    } catch (err) {
      console.error("Failed to update status:", err);
      addNotification(
        "Error",
        getErrorMessage(err, "Failed to update status"),
        "error",
      );
    }
  };

  const confirmDelete = (type: "consultation" | "inquiry", id: string) => {
    setDeleteModal({ isOpen: true, type, id });
  };

  const handleDelete = async () => {
    const { type, id } = deleteModal;
    if (!type || !id) return;

    try {
      if (type === "consultation") {
        await deleteConsultationMutation.mutateAsync(id);
      } else {
        await deleteInquiryMutation.mutateAsync(id);
      }
      setDeleteModal({ isOpen: false, type: null, id: null });
      addNotification("Success", `${type} deleted successfully`, "success");
    } catch (err) {
      console.error("Failed to delete support item:", err);
      addNotification("Error", `Failed to delete ${type}`, "error");
    }
  };

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

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const handleReplyEmail = (email: string, subject: string, name: string) => {
    const mailtoLink = `mailto:${email}?subject=RE: ${subject}&body=Hi ${name},%0D%0A%0D%0AThank you for contacting SHERO Technologies support.%0D%0A%0D%0A`;
    // eslint-disable react-hooks/rules-of-hooks
    window.location.href = mailtoLink;
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesSearch =
        t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.ticket_no.toString().includes(searchQuery);

      const matchesStatus =
        statusFilter === "all" ||
        t.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [tickets, searchQuery, statusFilter]);

  const filteredConsultations = useMemo(() => {
    return consultations.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.service.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        c.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [consultations, searchQuery, statusFilter]);

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((i) => {
      const matchesSearch =
        i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (i.subject || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.message.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        i.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [inquiries, searchQuery, statusFilter]);

  return (
    <div className="flex flex-col h-[calc(100dvh-11rem)] space-y-4">
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col gap-4">
          {/* Back Button */}
          <div>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-brand-secondary-400 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Dashboard</span>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Support & Inquiries
              </h1>
              <p className="text-slate-400 mt-1 text-sm">
                Manage user tickets, consultations, and contact messages
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  placeholder="Search inquiries..."
                  className="pl-10 w-full sm:w-64 bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600 focus:ring-brand-secondary-500/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-white/10 text-slate-300 hover:text-white"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    {statusFilter === "all"
                      ? "Filter"
                      : `Status: ${statusFilter}`}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-slate-900 border-white/10"
                >
                  <DropdownMenuItem onSelect={() => setStatusFilter("all")}>
                    All Statuses
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setStatusFilter("open")}>
                    Open
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setStatusFilter("pending")}>
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => setStatusFilter("resolved")}
                  >
                    Resolved
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => setStatusFilter("confirmed")}
                  >
                    Confirmed
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => setStatusFilter("cancelled")}
                  >
                    Cancelled
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => setStatusFilter("responded")}
                  >
                    Responded
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <Tabs defaultValue="tickets" className="w-full">
          <TabsList className="bg-slate-900/50 border border-white/5 p-1 mb-8 flex justify-center items-center flex-wrap sm:flex-nowrap overflow-x-auto scrollbar-hide w-fit">
            <TabsTrigger
              value="tickets"
              className="data-[state=active]:bg-brand-secondary-500 data-[state=active]:text-white data-[state=active]:shadow data-[state=active]:shadow-brand-secondary-500/20 px-3 sm:px-6 text-xs sm:text-sm whitespace-nowrap"
            >
              <Headset className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Support </span>Tickets
              <Badge className="ml-1 sm:ml-2 bg-white/10 text-white border-none text-[10px] sm:text-xs">
                {filteredTickets.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="consultations"
              className="data-[state=active]:bg-brand-secondary-500 data-[state=active]:text-white data-[state=active]:shadow data-[state=active]:shadow-brand-secondary-500/20 px-3 sm:px-6 text-xs sm:text-sm whitespace-nowrap"
            >
              <Calendar className="w-4 h-4 mr-1 sm:mr-2" />
              Consultations
              <Badge className="ml-1 sm:ml-2 bg-white/10 text-white border-none text-[10px] sm:text-xs">
                {filteredConsultations.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="inquiries"
              className="data-[state=active]:bg-brand-secondary-500 data-[state=active]:text-white data-[state=active]:shadow data-[state=active]:shadow-brand-secondary-500/20 px-3 sm:px-6 text-xs sm:text-sm whitespace-nowrap"
            >
              <MessageSquare className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Contact </span>Messages
              <Badge className="ml-1 sm:ml-2 bg-white/10 text-white border-none text-[10px] sm:text-xs">
                {filteredInquiries.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Support Tickets Content */}
          <TabsContent value="tickets">
            <div className="grid grid-cols-1 gap-4">
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-32 bg-slate-900/40 rounded animate-pulse border border-white/5"
                  />
                ))
              ) : filteredTickets.length === 0 ? (
                <Card className="bg-slate-900/40 border-dashed border-white/10 text-center py-12">
                  <Headset className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <h3 className="text-white font-medium">
                    {searchQuery || statusFilter !== "all"
                      ? "No matching tickets found"
                      : "No support tickets found"}
                  </h3>
                  <p className="text-slate-500 text-sm">
                    {searchQuery || statusFilter !== "all"
                      ? "Try adjusting your search or filters"
                      : "Tickets created by users will appear here"}
                  </p>
                </Card>
              ) : (
                filteredTickets.map((ticket) => (
                  <Card
                    key={ticket.id}
                    className={`bg-slate-900/40 hover:bg-slate-900/60 border-white/10 transition group ${selectedTicketId === ticket.id ? "ring-1 ring-brand-secondary-500/50" : ""}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row justify-between gap-6">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-3">
                            {getStatusBadge(ticket.status)}
                            <Badge
                              variant="outline"
                              className="border-white/10 text-slate-400 capitalize"
                            >
                              {ticket.category}
                            </Badge>
                            <span className="text-xs text-slate-500 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {format(new Date(ticket.createdAt), "PPP")}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-brand-secondary-500 font-mono font-bold">
                                #{ticket.ticket_no}
                              </span>
                              <h3 className="text-lg font-bold text-white group-hover:text-brand-secondary-400 transition-colors uppercase tracking-tight">
                                {ticket.subject}
                              </h3>
                            </div>
                            <p
                              className={`text-slate-400 text-sm mt-1 ${selectedTicketId === ticket.id ? "" : "line-clamp-2"}`}
                            >
                              {ticket.message}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-white/5">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-brand-secondary-500/10 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-brand-secondary-500">
                                  {ticket.name.charAt(0)}
                                </span>
                              </div>
                              <span className="text-xs font-medium text-slate-300">
                                {ticket.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="w-3 h-3 text-slate-500" />
                              <span className="text-xs text-slate-500">
                                {ticket.email}
                              </span>
                            </div>
                            {ticket.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-3 h-3 text-slate-500" />
                                <span className="text-xs text-slate-500">
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
                                selectedTicketId === ticket.id
                                  ? null
                                  : ticket.id,
                              )
                            }
                            className="text-slate-400 hover:text-white hover:bg-white/5"
                          >
                            {selectedTicketId === ticket.id
                              ? "Hide Details"
                              : "View Details"}
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() =>
                              handleReplyEmail(
                                ticket.email,
                                ticket.subject,
                                ticket.name,
                              )
                            }
                            className="text-slate-400 hover:text-white hover:bg-white/5"
                          >
                            <Mail className="w-4 h-4 mr-1" />
                            Email
                          </Button>
                          {ticket.phone && (
                            <>
                              <a
                                href={`tel:${ticket.phone}`}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                              >
                                <PhoneCall className="w-4 h-4" />
                                Call
                              </a>
                              <a
                                href={`https://wa.me/${ticket.phone.replace(/^0/, '233').replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-slate-400 hover:text-green-400 hover:bg-white/5 rounded-md transition-colors"
                              >
                                <MessageCircle className="w-4 h-4" />
                                WhatsApp
                              </a>
                            </>
                          )}
                          {ticket.status !== "Resolved" && (
                            <Button
                              onClick={() => handleResolveTicket(ticket.id)}
                              className="bg-brand-secondary-500 hover:bg-brand-secondary-600 text-white rounded px-6"
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Consultations Content */}
          <TabsContent value="consultations">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-80 bg-slate-900/40 rounded animate-pulse border border-white/5"
                  />
                ))
              ) : filteredConsultations.length === 0 ? (
                <div className="col-span-full">
                  <Card className="bg-slate-900/40 border-dashed border-white/10 text-center py-12">
                    <Calendar className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <h3 className="text-white font-medium">
                      {searchQuery || statusFilter !== "all"
                        ? "No matching consultations found"
                        : "No consultations scheduled"}
                    </h3>
                    <p className="text-slate-500 text-sm">
                      {searchQuery || statusFilter !== "all"
                        ? "Try adjusting your search or filters"
                        : "Booking requests will appear here"}
                    </p>
                  </Card>
                </div>
              ) : (
                filteredConsultations.map((c) => (
                  <Card
                    key={c.id}
                    className="bg-slate-900/40 border-white/10 hover:border-brand-secondary-500/30 transition flex flex-col h-full"
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
                              className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-slate-900 border-white/10"
                          >
                            <DropdownMenuItem
                              onSelect={() =>
                                addNotification(
                                  "Info",
                                  "Reschedule feature coming soon",
                                  "info",
                                )
                              }
                              className="text-slate-300 hover:text-white focus:bg-white/5"
                            >
                              Reschedule
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() =>
                                handleUpdateStatus(
                                  "consultation",
                                  c.id,
                                  "Cancelled",
                                )
                              }
                              className="text-slate-300 hover:text-white focus:bg-white/5"
                            >
                              Cancel
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() =>
                                confirmDelete("consultation", c.id)
                              }
                              className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <CardTitle className="text-white text-lg">
                        {c.name}
                      </CardTitle>
                      <CardDescription className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Requested on {format(new Date(c.createdAt), "PP")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1">
                      <div className="bg-slate-950/50 rounded p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">
                            Date
                          </span>
                          <span className="text-xs font-bold text-white">
                            {format(new Date(c.date), "PPP")}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">
                            Time
                          </span>
                          <span className="text-xs font-bold text-white">
                            {c.time}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <button
                          onClick={() =>
                            handleReplyEmail(
                              c.email,
                              `Consultation: ${c.service}`,
                              c.name,
                            )
                          }
                          className="flex items-center gap-2 text-sm text-slate-400 hover:text-brand-secondary-400 transition-colors w-full text-left"
                        >
                          <Mail className="w-4 h-4 text-brand-secondary-500" />
                          {c.email}
                        </button>
                        {c.phone && (
                          <>
                            <a
                              href={`tel:${c.phone}`}
                              className="flex items-center gap-2 text-sm text-slate-400 hover:text-brand-secondary-400 transition-colors w-full text-left"
                            >
                              <PhoneCall className="w-4 h-4 text-brand-secondary-500" />
                              {c.phone}
                            </a>
                            <a
                              href={`https://wa.me/${c.phone.replace(/^0/, '233').replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-slate-400 hover:text-green-400 transition-colors w-full text-left"
                            >
                              <MessageCircle className="w-4 h-4 text-green-500" />
                              WhatsApp
                            </a>
                          </>
                        )}
                      </div>
                      {c.message && (
                        <div className="pt-4 border-t border-white/5 mt-auto">
                          <p className="text-xs text-slate-500 italic">
                            "{c.message}"
                          </p>
                        </div>
                      )}
                    </CardContent>
                    <div className="p-4 pt-0">
                      {c.status !== "Confirmed" && (
                        <Button
                          variant="outline"
                          onClick={() =>
                            handleUpdateStatus(
                              "consultation",
                              c.id,
                              "Confirmed",
                            )
                          }
                          className="w-full border-brand-secondary-500/20 text-brand-secondary-400 hover:bg-brand-secondary-500/10 rounded group"
                        >
                          Confirm Appointment
                          <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Inquiries Content */}
          <TabsContent value="inquiries">
            <div className="bg-slate-900/40 rounded border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-200">
                  <thead className="bg-white/5 border-b border-white/5">
                    <tr>
                      <th className="px-6 py-4 text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
                        Subject
                      </th>
                      <th className="px-6 py-4 text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
                        Message
                      </th>
                      <th className="px-6 py-4 text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
                        Date
                      </th>
                      <th className="px-6 py-4 text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
                        Status
                      </th>
                      <th className="px-6 py-4 text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
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
                    ) : filteredInquiries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-20 text-center">
                          <MessageSquare className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                          <h3 className="text-white font-medium">
                            {searchQuery || statusFilter !== "all"
                              ? "No matching messages found"
                              : "No contact messages"}
                          </h3>
                          <p className="text-slate-500 text-sm">
                            {searchQuery || statusFilter !== "all"
                              ? "Try adjusting your search or filters"
                              : "General inquiries will appear here"}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredInquiries.map((inquiry) => (
                        <tr
                          key={inquiry.id}
                          className="hover:bg-white/5 transition-colors group"
                        >
                          <td className="px-6 py-6">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white">
                                {inquiry.name}
                              </span>
                              <span className="text-xs text-slate-500">
                                {inquiry.email}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <Badge
                              variant="outline"
                              className="border-white/10 text-slate-300 font-mono text-[10px] tracking-tight truncate max-w-37.5"
                            >
                              {inquiry.subject || "No Subject"}
                            </Badge>
                          </td>
                          <td className="px-6 py-6 max-w-md">
                            <p className="text-sm text-slate-400 line-clamp-2">
                              {inquiry.message}
                            </p>
                          </td>
                          <td className="px-6 py-6">
                            <span className="text-xs text-slate-500">
                              {format(
                                new Date(inquiry.createdAt),
                                "MMM d, yyyy",
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-6">
                            {getStatusBadge(inquiry.status)}
                          </td>
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
                                className="h-8 w-8 p-0 text-slate-500 hover:text-white group-hover:bg-white/10"
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                              {inquiry.status !== "Responded" && (
                                <Button
                                  variant="ghost"
                                  onClick={() =>
                                    handleUpdateStatus(
                                      "inquiry",
                                      inquiry.id,
                                      "Responded",
                                    )
                                  }
                                  title="Mark as Responded"
                                  className="h-8 w-8 p-0 text-slate-500 hover:text-brand-secondary-500 group-hover:bg-white/10"
                                >
                                  <ArrowRight className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                onClick={() =>
                                  confirmDelete("inquiry", inquiry.id)
                                }
                                className="h-8 w-8 p-0 text-red-500/60 hover:text-red-500 group-hover:bg-white/10"
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
          </TabsContent>
        </Tabs>

        <Modal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
          title={`Delete ${deleteModal.type === "consultation" ? "Consultation" : "Inquiry"}`}
        >
          <div className="space-y-4">
            <p className="text-slate-300">
              Are you sure you want to delete this{" "}
              {deleteModal.type === "consultation" ? "consultation" : "inquiry"}
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  setDeleteModal({ ...deleteModal, isOpen: false })
                }
                className="border-white/10 text-slate-300 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default AdminSupport;
