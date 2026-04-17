"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useNotifications } from "@/hooks/useNotifications";
import {
 Search,
 Plus,
 Edit2,
 Trash2,
 ExternalLink,
 ChevronLeft,
 ChevronRight,
 RefreshCw,
 MoreVertical,
 Briefcase,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { Button } from "@/components/ui/button";
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useProjects, useDeleteProject } from "@/hooks/queries/useProjects";
import { Card } from "@/components/ui/card";

export default function AdminProjects() {
 const { addNotification } = useNotifications();

 // Filters
 const [search, setSearch] = useState("");
 const [selectedCategory, setSelectedCategory] = useState("all");

 // Pagination
 const [currentPage, setCurrentPage] = useState(1);
 const itemsPerPage = 10;

 // React Query Hooks
 const categoryFilter =
 selectedCategory === "all" ? undefined : selectedCategory;
 const {
 data: allProjects = [],
 isLoading,
 refetch,
 isFetching,
 } = useProjects(categoryFilter);

 const deleteMutation = useDeleteProject();

 // Filtered projects
 const filteredProjects = useMemo(() => {
 return allProjects.filter((project) => {
 const matchesSearch =
 project.title.toLowerCase().includes(search.toLowerCase()) ||
 (project.client || "").toLowerCase().includes(search.toLowerCase()) ||
 (project.description || "")
 .toLowerCase()
 .includes(search.toLowerCase());
 return matchesSearch;
 });
 }, [allProjects, search]);

 // Client-side pagination
 const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
 const paginatedProjects = filteredProjects.slice(
 (currentPage - 1) * itemsPerPage,
 currentPage * itemsPerPage,
 );

 const handleDelete = async (id: string) => {
 if (!globalThis.confirm?.("Are you sure you want to delete this project?"))
 return;

 try {
 await deleteMutation.mutateAsync(id);
 addNotification("Success", "Project deleted successfully", "success");
 } catch {
 addNotification("Error", "Failed to delete project", "error");
 }
 };

 const categories = [
 "Web Development",
 "Mobile Apps",
 "Infrastructure",
 "Custom Software",
 ];

 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <h1 className="text-2xl font-bold text-white">
 Projects
 </h1>
 <p className="text-slate-400 text-sm">
 Showcase your successful solutions and portfolios
 </p>
 </div>
 <div className="flex items-center gap-3">
 <Button
 variant="outline"
 size="icon"
 onClick={() => refetch()}
 disabled={isFetching}
 className="bg-slate-800/50 border-white/5"
 >
 <RefreshCw
 className={cn("w-4 h-4", isFetching && "animate-spin")}
 />
 </Button>

 <Button
 className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4"
 asChild
 >
 <Link href="/admin/projects/new">
 <Plus className="w-4 h-4 mr-2" />
 Add Project
 </Link>
 </Button>
 </div>
 </div>

 {/* Filters */}
 <Card className="bg-slate-900/40 backdrop-blur-sm border-white/10 p-4">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="relative col-span-2">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
 <Input
 placeholder="Search projects..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="pl-9 bg-slate-800/50 border-white/5 text-white"
 />
 </div>
 <select
 value={selectedCategory}
 onChange={(e) => {
 setSelectedCategory(e.target.value);
 setCurrentPage(1);
 }}
 className="bg-slate-800/50 border border-white/5 rounded text-sm text-white p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
 >
 <option value="all">All Categories</option>
 {categories.map((cat) => (
 <option key={cat} value={cat}>
 {cat}
 </option>
 ))}
 </select>
 </div>
 </Card>

 {/* Projects Table */}
 <div className="bg-slate-900/40 backdrop-blur-sm border border-white/10 rounded overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-left">
 <thead>
 <tr className="bg-slate-800/50 border-b border-white/5">
 <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
 Project
 </th>
 <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
 Category
 </th>
 <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
 Client
 </th>
 <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">
 Actions
 </th>
 </tr>
 </thead>
 <tbody className="divide-y divide-white/5">
 {isLoading &&
 [1, 2, 3, 4, 5].map((i) => (
 <tr key={`skeleton-${i}`} className="animate-pulse">
 <td colSpan={4} className="px-6 py-8">
 <div className="h-4 bg-slate-800 rounded w-full" />
 </td>
 </tr>
 ))}

 {!isLoading && paginatedProjects.length === 0 && (
 <tr>
 <td
 colSpan={4}
 className="px-6 py-12 text-center text-slate-500"
 >
 No projects found.
 </td>
 </tr>
 )}

 {!isLoading &&
 paginatedProjects.length > 0 &&
 paginatedProjects.map((project) => (
 <tr
 key={project.id}
 className="hover:bg-white/5 transition-colors group"
 >
 <td className="px-6 py-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center shrink-0 border border-white/5">
 <Briefcase className="w-5 h-5 text-emerald-500" />
 </div>
 <div>
 <p className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
 {project.title}
 </p>
 <p className="text-xs text-slate-500 line-clamp-1 max-w-xs">
 {project.description}
 </p>
 </div>
 </div>
 </td>
 <td className="px-6 py-4">
 <Badge
 variant="outline"
 className="bg-emerald-500/10 text-emerald-400 border-none whitespace-nowrap"
 >
 {project.category}
 </Badge>
 </td>
 <td className="px-6 py-4 text-sm text-slate-300">
 {project.client || "N/A"}
 </td>
 <td className="px-6 py-4 text-right">
 <div className="flex items-center justify-end gap-2">
 <Button
 size="icon"
 variant="ghost"
 className="h-8 w-8 text-slate-400 hover:text-white"
 asChild
 >
 <Link
 href={`/admin/projects/${project.id}/edit`}
 >
 <Edit2 className="w-4 h-4" />
 </Link>
 </Button>
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button
 size="icon"
 variant="ghost"
 className="h-8 w-8 text-slate-400 hover:text-white"
 >
 <MoreVertical className="w-4 h-4" />
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent
 className="bg-slate-900 border-white/10 text-white"
 align="end"
 >
 <DropdownMenuItem
 className="hover:bg-white/5 cursor-pointer"
 asChild
 >
 <a
 href={`/solutions`}
 target="_blank"
 rel="noreferrer"
 >
 <ExternalLink className="w-4 h-4 mr-2" /> View
 on Site
 </a>
 </DropdownMenuItem>
 <DropdownMenuItem
 className="text-rose-400 hover:bg-rose-500/10 cursor-pointer"
 onClick={() => handleDelete(project.id)}
 >
 <Trash2 className="w-4 h-4 mr-2" /> Delete
 Project
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 {/* Pagination */}
 {!isLoading && totalPages > 1 && (
 <div className="px-6 py-4 bg-slate-800/30 border-t border-white/5 flex items-center justify-between">
 <p className="text-sm text-slate-400">
 Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
 {Math.min(currentPage * itemsPerPage, filteredProjects.length)}{" "}
 of {filteredProjects.length} projects
 </p>
 <div className="flex items-center gap-2">
 <Button
 variant="outline"
 size="icon"
 className="h-8 w-8 border-white/10"
 disabled={currentPage === 1}
 onClick={() => setCurrentPage((p) => p - 1)}
 >
 <ChevronLeft className="h-4 w-4 text-white" />
 </Button>
 <Button
 variant="outline"
 size="icon"
 className="h-8 w-8 border-white/10"
 disabled={currentPage === totalPages}
 onClick={() => setCurrentPage((p) => p + 1)}
 >
 <ChevronRight className="h-4 w-4 text-white" />
 </Button>
 </div>
 </div>
 )}
 </div>
  </div>
  );
}
