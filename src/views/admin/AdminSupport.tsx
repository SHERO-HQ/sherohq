"use client";

import {
  MessageSquare,
  Calendar,
  Headset,
  Search,
  Filter,
  ArrowLeft,
} from "lucide-react";
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
import Link from "next/link";
import { SupportTicketsTab } from "@/components/admin/support/SupportTicketsTab";
import { ConsultationsTab } from "@/components/admin/support/ConsultationsTab";
import { InquiriesTab } from "@/components/admin/support/InquiriesTab";
import {
  DeleteSupportModal,
  RescheduleConsultationModal,
} from "@/components/admin/support/SupportModals";
import { useAdminSupport } from "@/components/admin/support/useAdminSupport";

const AdminSupport = () => {
  const {
    isLoading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    deleteModal,
    setDeleteModal,
    rescheduleModal,
    setRescheduleModal,
    filteredTickets,
    filteredConsultations,
    filteredInquiries,
    isDeleting,
    rescheduleMutation,
    handleResolveTicket,
    handleUpdateStatus,
    confirmDelete,
    handleDelete,
    handleReschedule,
    handleReplyEmail,
  } = useAdminSupport();

  return (
    <div className="flex flex-col h-[calc(100dvh-11rem)] space-y-4">
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col gap-4">
          <div>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-secondary-400 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Dashboard</span>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Support & Inquiries
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Manage user tickets, consultations, and contact messages
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search inquiries..."
                  className="pl-10 w-full sm:w-64 bg-card/50 border-border text-foreground placeholder:text-slate-600 focus:ring-brand-secondary-500/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-border text-muted-foreground hover:text-foreground"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    {statusFilter === "all"
                      ? "Filter"
                      : `Status: ${statusFilter}`}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-card border-border"
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
                  <DropdownMenuItem onSelect={() => setStatusFilter("resolved")}>
                    Resolved
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setStatusFilter("confirmed")}>
                    Confirmed
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setStatusFilter("cancelled")}>
                    Cancelled
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setStatusFilter("responded")}>
                    Responded
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <Tabs defaultValue="tickets" className="w-full">
          <TabsList className="bg-card/50 border border-border p-1 mb-8 flex justify-center items-center flex-wrap sm:flex-nowrap overflow-x-auto scrollbar-hide w-fit">
            <TabsTrigger
              value="tickets"
              className="data-[state=active]:bg-brand-secondary-500 data-[state=active]:text-foreground data-[state=active]:shadow data-[state=active]:shadow-brand-secondary-500/20 px-3 sm:px-6 text-xs sm:text-sm whitespace-nowrap"
            >
              <Headset className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Support </span>Tickets
              <Badge className="ml-1 sm:ml-2 bg-accent text-foreground border-none text-[10px] sm:text-xs">
                {filteredTickets.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="consultations"
              className="data-[state=active]:bg-brand-secondary-500 data-[state=active]:text-foreground data-[state=active]:shadow data-[state=active]:shadow-brand-secondary-500/20 px-3 sm:px-6 text-xs sm:text-sm whitespace-nowrap"
            >
              <Calendar className="w-4 h-4 mr-1 sm:mr-2" />
              Consultations
              <Badge className="ml-1 sm:ml-2 bg-accent text-foreground border-none text-[10px] sm:text-xs">
                {filteredConsultations.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="inquiries"
              className="data-[state=active]:bg-brand-secondary-500 data-[state=active]:text-foreground data-[state=active]:shadow data-[state=active]:shadow-brand-secondary-500/20 px-3 sm:px-6 text-xs sm:text-sm whitespace-nowrap"
            >
              <MessageSquare className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Contact </span>Messages
              <Badge className="ml-1 sm:ml-2 bg-accent text-foreground border-none text-[10px] sm:text-xs">
                {filteredInquiries.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tickets">
            <SupportTicketsTab
              isLoading={isLoading}
              tickets={filteredTickets}
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              handleResolveTicket={handleResolveTicket}
              handleReplyEmail={handleReplyEmail}
            />
          </TabsContent>

          <TabsContent value="consultations">
            <ConsultationsTab
              isLoading={isLoading}
              consultations={filteredConsultations}
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              setRescheduleModal={setRescheduleModal}
              handleUpdateStatus={handleUpdateStatus}
              confirmDelete={confirmDelete}
              handleReplyEmail={handleReplyEmail}
            />
          </TabsContent>

          <TabsContent value="inquiries">
            <InquiriesTab
              isLoading={isLoading}
              inquiries={filteredInquiries}
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              handleUpdateStatus={handleUpdateStatus}
              confirmDelete={confirmDelete}
              handleReplyEmail={handleReplyEmail}
            />
          </TabsContent>
        </Tabs>

        <DeleteSupportModal
          isOpen={deleteModal.isOpen}
          type={deleteModal.type}
          onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />

        <RescheduleConsultationModal
          isOpen={rescheduleModal.isOpen}
          onClose={() =>
            setRescheduleModal({
              isOpen: false,
              id: null,
              currentDate: "",
              currentTime: "",
            })
          }
          currentDate={rescheduleModal.currentDate}
          currentTime={rescheduleModal.currentTime}
          setCurrentDate={(currentDate) =>
            setRescheduleModal((prev) => ({ ...prev, currentDate }))
          }
          setCurrentTime={(currentTime) =>
            setRescheduleModal((prev) => ({ ...prev, currentTime }))
          }
          onSubmit={handleReschedule}
          isRescheduling={rescheduleMutation.isPending}
        />
      </div>
    </div>
  );
};

export default AdminSupport;
