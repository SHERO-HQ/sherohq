"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { type SupportGuide } from "@/types/guide";
import { useNotifications } from "@/hooks/useNotifications";
import { getErrorMessage } from "@/utils/error";
import {
 useAdminGuides,
 useUpdateGuide,
 useDeleteGuide} from "@/hooks/queries/useGuides";
import { } from "@/context/AdminContext";
import { ArrowLeft } from "lucide-react";

const AdminGuides = () => {
 const router = useRouter();
 const { data: guides = [], isLoading } = useAdminGuides();
 const updateMutation = useUpdateGuide();
 const deleteMutation = useDeleteGuide();

 const [searchQuery, setSearchQuery] = useState("");
 const [deleteTarget, setDeleteTarget] = useState<{
 id: string;
 title: string;
 } | null>(null);
 const [isDeleting, setIsDeleting] = useState(false);
 const { addNotification } = useNotifications();

 async function handleDelete() {
 if (!deleteTarget) return;
 setIsDeleting(true);
 try {
 await deleteMutation.mutateAsync(deleteTarget.id);
 addNotification("Success", "Guide deleted successfully", "success");
 setDeleteTarget(null);
 } catch (error) {
 console.error("Failed to delete guide:", error);
 addNotification("Error", getErrorMessage(error, "Failed to delete guide"), "error");
 } finally {
 setIsDeleting(false);
 }
 }

 async function togglePublished(guide: SupportGuide) {
 try {
 await updateMutation.mutateAsync({
 id: guide.id,
 data: { published: !guide.published }});
 const message = guide.published ? "Guide unpublished" : "Guide published";
 addNotification("Success", message, "success");
 } catch (error) {
 console.error("Failed to update guide:", error);
 addNotification("Error", getErrorMessage(error, "Failed to update guide"), "error");
 }
 }

 const filteredGuides = guides.filter(
 (guide) =>
 guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
 guide.category.toLowerCase().includes(searchQuery.toLowerCase()),
 );

 let renderContent;

 if (isLoading) {
 renderContent = (
 <div className="grid grid-cols-1 gap-4">
 {[1, 2, 3].map((i) => (
 <div
 key={`skeleton-${i}`}
 className="bg-card/40 rounded border border-border p-6 animate-pulse"
 >
 <div className="h-5 bg-muted rounded w-1/3 mb-3" />
 <div className="h-4 bg-muted rounded w-2/3" />
 </div>
 ))}
 </div>
 );
 } else if (filteredGuides.length === 0) {
 renderContent = (
 <div className="text-center py-16 bg-card/40 rounded border border-border">
 <h3 className="text-xl font-semibold text-muted-foreground mb-2">
 No guides found
 </h3>
 <Button
 className="bg-brand-secondary-600 text-slate-100 hover:bg-brand-secondary-500"
 asChild
 >
 <Link href="/admin/guides/new">Create Guide</Link>
 </Button>
 </div>
 );
 } else {
 renderContent = (
 <div className="bg-card/40 rounded border border-border overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-left min-w-[700px]">
 <thead className="bg-accent/50 border-b border-border">
 <tr>
 <th className="px-6 py-4 text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
 Guide
 </th>
 <th className="px-6 py-4 text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
 Category
 </th>
 <th className="px-6 py-4 text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
 Status
 </th>
 <th className="px-6 py-4 text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
 Date
 </th>
 <th className="px-6 py-4 text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground text-right">
 Actions
 </th>
 </tr>
 </thead>
 <tbody className="divide-y divide-white/5">
 {filteredGuides.map((guide) => (
 <tr
 key={guide.id}
 className="hover:bg-accent transition-colors"
 >
 <td className="px-6 py-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-brand-secondary-400">
 {guide.category === "hardware" ? "H" : "S"}
 </div>
 <div>
 <span className="text-foreground font-medium block">
 {guide.title}
 </span>
 <span className="text-muted-foreground text-sm">
 {guide.slug}
 </span>
 </div>
 </div>
 </td>
 <td className="px-6 py-4">
 <Badge
 variant="outline"
 className={
 guide.category === "hardware"
 ? "border-blue-500/50 text-blue-400"
 : "border-purple-500/50 text-purple-400"
 }
 >
 {guide.category}
 </Badge>
 </td>
 <td className="px-6 py-4">
 <button
 onClick={() => togglePublished(guide)}
 className="cursor-pointer"
 >
 <Badge
 className={
 guide.published
 ? "bg-brand-secondary-500/20 text-brand-secondary-400 border-brand-secondary-500/30"
 : "bg-muted text-muted-foreground border-slate-700"
 }
 >
 {guide.published ? "Published" : "Draft"}
 </Badge>
 </button>
 </td>
 <td className="px-6 py-4 text-muted-foreground text-sm">
 {format(new Date(guide.createdAt), "MMM d, yyyy")}
 </td>
 <td className="px-6 py-4">
 <div className="flex items-center justify-end gap-2">
 <Link
 href={`/support/${guide.category}/${guide.slug}`}
 target="_blank"
 className="text-muted-foreground hover:text-foreground"
 >
 View
 </Link>
 <button
 className="text-muted-foreground hover:text-foreground ml-4"
 onClick={() =>
 router.push(`/admin/guides/edit/${guide.id}`)
 }
 >
 Edit
 </button>
 <button
 onClick={() =>
 setDeleteTarget({ id: guide.id, title: guide.title })
 }
 className="text-muted-foreground hover:text-red-400 ml-4"
 >
 Delete
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-8 animate-in fade-in duration-500">
 <div className="flex flex-col gap-4">
 {/* Back Button */}
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
 Support Guides
 </h1>
 <p className="text-muted-foreground mt-1">
 Create and manage hardware & software guides
 </p>
 </div>
 <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
 <Input
 placeholder="Search guides..."
 className="pl-4 w-full sm:w-64 bg-card/50 border-border text-foreground placeholder:text-slate-600"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 />
 <Button
 className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-white"
 asChild
 >
 <Link href="/admin/guides/new">New Guide</Link>
 </Button>
 </div>
 </div>
 </div>

 {renderContent}

 {/* Delete Confirmation Modal */}
 <ConfirmDialog
 isOpen={!!deleteTarget}
 onClose={() => setDeleteTarget(null)}
 onConfirm={handleDelete}
 title="Delete Guide"
 message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
 confirmText="Delete"
 variant="danger"
 isLoading={isDeleting}
 />
 </div>
 );
};

export default AdminGuides;
