import AdminClients from "@/views/admin/AdminClients";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partners & Clients | Admin Dashboard",
  description: "Manage client proof logos and solution partners",
};

export default function AdminClientsPage() {
  return <AdminClients />;
}
