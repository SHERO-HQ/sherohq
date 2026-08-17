import AdminClients from "@/views/admin/AdminClients";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clients & Partners",
  description: "Manage client proof logos and solution partners",
};

export default function AdminClientsPage() {
  return <AdminClients />;
}
