"use client";
import { useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { getErrorMessage } from "@/utils/error";
import { Plus, Edit2, Trash2, Briefcase, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const apiRequest = async (url: string, method = "GET", body?: any) => {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data.data !== undefined ? data.data : data;
};

export default function AdminCareers() {
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("jobs");
  
  // Job Form State
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [jobFormData, setJobFormData] = useState({
    title: "",
    department: "",
    location: "",
    type: "Full-time",
    description: "",
    isActive: true
  });

  // Queries
  const { data: jobs = [], isLoading: isLoadingJobs } = useQuery({
    queryKey: ["admin_careers"],
    queryFn: () => apiRequest("/api/admin/careers")
  });

  const { data: applications = [], isLoading: isLoadingApps } = useQuery({
    queryKey: ["admin_applications"],
    queryFn: () => apiRequest("/api/admin/applications")
  });

  // Mutations
  const createJob = useMutation({
    mutationFn: (data: any) => apiRequest("/api/admin/careers", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_careers"] });
      addNotification("Success", "Job created", "success");
      setIsJobModalOpen(false);
    },
    onError: (err) => addNotification("Error", getErrorMessage(err, "Failed to create job"), "error")
  });

  const updateJob = useMutation({
    mutationFn: (data: any) => apiRequest("/api/admin/careers", "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_careers"] });
      addNotification("Success", "Job updated", "success");
      setIsJobModalOpen(false);
    },
    onError: (err) => addNotification("Error", getErrorMessage(err, "Failed to update job"), "error")
  });

  const deleteJob = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/careers?id=${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_careers"] });
      addNotification("Success", "Job deleted", "success");
    },
    onError: (err) => addNotification("Error", getErrorMessage(err, "Failed to delete job"), "error")
  });

  const updateAppStatus = useMutation({
    mutationFn: (data: { id: string, status: string }) => apiRequest("/api/admin/applications", "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_applications"] });
      addNotification("Success", "Status updated", "success");
    },
    onError: (err) => addNotification("Error", getErrorMessage(err, "Failed to update status"), "error")
  });

  const handleJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingJob) {
      updateJob.mutate({ id: editingJob.id, ...jobFormData });
    } else {
      createJob.mutate(jobFormData);
    }
  };

  const openNewJob = () => {
    setEditingJob(null);
    setJobFormData({ title: "", department: "", location: "", type: "Full-time", description: "", isActive: true });
    setIsJobModalOpen(true);
  };

  const openEditJob = (job: any) => {
    setEditingJob(job);
    setJobFormData({
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      description: job.description || "",
      isActive: job.isActive
    });
    setIsJobModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Careers Management</h1>
          <p className="text-muted-foreground text-sm">Manage job postings and review applications</p>
        </div>
        {activeTab === "jobs" && (
          <Button onClick={openNewJob} className="gap-2">
            <Plus className="w-4 h-4" /> New Job
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent p-0 mb-6 h-auto">
          <TabsTrigger value="jobs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-primary-500 data-[state=active]:bg-transparent py-3">
            <Briefcase className="w-4 h-4 mr-2" />
            Job Postings
          </TabsTrigger>
          <TabsTrigger value="apps" className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-primary-500 data-[state=active]:bg-transparent py-3">
            <FileText className="w-4 h-4 mr-2" />
            Applications
            {applications.filter((a: any) => a.status === 'pending').length > 0 && (
              <Badge className="ml-2 bg-brand-primary-500 text-white">
                {applications.filter((a: any) => a.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4 m-0">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 font-medium">Role</th>
                    <th className="px-6 py-4 font-medium">Department</th>
                    <th className="px-6 py-4 font-medium">Type & Location</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoadingJobs ? (
                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading jobs...</td></tr>
                  ) : jobs.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No jobs found</td></tr>
                  ) : jobs.map((job: any) => (
                    <tr key={job.id} className="hover:bg-muted/30">
                      <td className="px-6 py-4 font-medium text-foreground">{job.title}</td>
                      <td className="px-6 py-4 text-muted-foreground">{job.department}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {job.type} &bull; {job.location}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={job.isActive ? "default" : "secondary"} className={job.isActive ? "bg-emerald-500/10 text-emerald-500" : ""}>
                          {job.isActive ? "Active" : "Closed"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditJob(job)}>
                          <Edit2 className="w-4 h-4 text-brand-primary-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => {
                          if (confirm("Delete this job?")) deleteJob.mutate(job.id);
                        }}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="apps" className="space-y-4 m-0">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 font-medium">Applicant</th>
                    <th className="px-6 py-4 font-medium">Job Applied</th>
                    <th className="px-6 py-4 font-medium">Resume</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoadingApps ? (
                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading applications...</td></tr>
                  ) : applications.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No applications found</td></tr>
                  ) : applications.map((app: any) => (
                    <tr key={app.id} className="hover:bg-muted/30">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{app.applicantName}</div>
                        <div className="text-xs text-muted-foreground">{app.applicantEmail}</div>
                        {app.applicantPhone && <div className="text-xs text-muted-foreground">{app.applicantPhone}</div>}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{app.jobTitle}</td>
                      <td className="px-6 py-4">
                        {app.resumeUrl ? (
                          <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="text-brand-primary-500 hover:underline flex items-center gap-1">
                            View Resume <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">No Resume</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          className="bg-background border border-border rounded text-xs p-1 focus:ring-brand-primary-500"
                          value={app.status}
                          onChange={(e) => updateAppStatus.mutate({ id: app.id, status: e.target.value })}
                        >
                          <option value="pending">Pending</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Modal isOpen={isJobModalOpen} onClose={() => setIsJobModalOpen(false)} title={editingJob ? "Edit Job" : "New Job"}>
        <form onSubmit={handleJobSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 text-left">
              <Label htmlFor="title">Job Title</Label>
              <Input id="title" value={jobFormData.title} onChange={(e) => setJobFormData({...jobFormData, title: e.target.value})} required />
            </div>
            <div className="space-y-2 text-left">
              <Label htmlFor="department">Department</Label>
              <Input id="department" value={jobFormData.department} onChange={(e) => setJobFormData({...jobFormData, department: e.target.value})} required />
            </div>
            <div className="space-y-2 text-left">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={jobFormData.location} onChange={(e) => setJobFormData({...jobFormData, location: e.target.value})} required />
            </div>
            <div className="space-y-2 text-left">
              <Select 
                label="Type"
                options={[
                  { label: "Full-time", value: "Full-time" },
                  { label: "Part-time", value: "Part-time" },
                  { label: "Contract", value: "Contract" },
                  { label: "Internship", value: "Internship" }
                ]}
                value={jobFormData.type} 
                onChange={(e) => setJobFormData({...jobFormData, type: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2 text-left">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={jobFormData.description} onChange={(e) => setJobFormData({...jobFormData, description: e.target.value})} rows={4} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" checked={jobFormData.isActive} onChange={(e) => setJobFormData({...jobFormData, isActive: e.target.checked})} className="rounded border-border text-brand-primary-500 focus:ring-brand-primary-500" />
            <Label htmlFor="isActive" className="cursor-pointer">Active / Published</Label>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsJobModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createJob.isPending || updateJob.isPending}>
              {editingJob ? "Save Changes" : "Create Job"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
