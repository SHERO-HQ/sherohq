"use client";
import { useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { useDialog } from "@/hooks/useDialog";
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
import { Search } from "lucide-react";
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
  const dialog = useDialog();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("jobs");

  // Job Form State
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [jobFormData, setJobFormData] = useState({
    title: "", department: "", location: "", type: "Full-time", description: "", requirements: "", isActive: true
  });
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

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
    setJobFormData({ title: "", department: "", location: "", type: "Full-time", description: "", requirements: "", isActive: true });
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
      requirements: job.requirements || "",
      isActive: job.isActive
    });
    setIsJobModalOpen(true);
  };
  const filteredJobs = jobs.filter((job: any) => {
    const searchMatch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase());
    const deptMatch = deptFilter === "all" || job.department === deptFilter;
    const typeMatch = typeFilter === "all" || job.type === typeFilter;
    return searchMatch && deptMatch && typeMatch;
  });

  const filteredApps = applications.filter((app: any) => {
    const searchMatch = app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicantEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const jobMatch = jobFilter === "all" || app.jobId === jobFilter;
    const statusMatch = statusFilter === "all" || app.status === statusFilter;
    return searchMatch && jobMatch && statusMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Careers Management</h1>
          <p className="text-muted-foreground text-sm">Manage job postings and review applications</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          {activeTab === "jobs" && (
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full">
              <Select
                options={[
                  { label: "All Depts", value: "all" },
                  ...Array.from(new Set(jobs.map((j: any) => j.department))).map(d => ({ label: String(d), value: String(d) }))
                ]}
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              />
              <Select
                options={[
                  { label: "All Types", value: "all" },
                  { label: "Full-time", value: "Full-time" },
                  { label: "Part-time", value: "Part-time" },
                  { label: "Contract", value: "Contract" },
                  { label: "Internship", value: "Internship" }
                ]}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              />
              <Button onClick={openNewJob} className="gap-2 shrink-0">
                <Plus className="w-4 h-4" /> New Job
              </Button>
            </div>
          )}
          {activeTab === "apps" && (
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full">
              <Select
                options={[
                  { label: "All Jobs", value: "all" },
                  ...jobs.map((j: any) => ({ label: j.title, value: j.id }))
                ]}
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
              />
              <Select
                options={[
                  { label: "All Statuses", value: "all" },
                  { label: "Pending", value: "pending" },
                  { label: "Reviewed", value: "reviewed" },
                  { label: "Accepted", value: "accepted" },
                  { label: "Rejected", value: "rejected" }
                ]}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              />
            </div>
          )}
        </div>
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
              <Badge className="ml-2 bg-brand-primary-500 text-foreground">
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
                  ) : filteredJobs.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No jobs found</td></tr>
                  ) : filteredJobs.map((job: any) => (
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
                        <Button variant="ghost" size="icon" onClick={async () => {
                          if (await dialog.confirm({ title: "Delete Job?", message: "Are you sure you want to delete this job?", confirmText: "Delete", type: "error" })) deleteJob.mutate(job.id);
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
                  ) : filteredApps.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No applications found</td></tr>
                  ) : filteredApps.map((app: any) => (
                    <tr key={app.id} className="hover:bg-muted/30">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedApplication(app);
                            setIsAppModalOpen(true);
                          }}
                          className="font-medium text-brand-primary-500 hover:underline text-left block"
                        >
                          {app.applicantName}
                        </button>
                        <div className="text-xs text-muted-foreground">{app.applicantEmail}</div>
                        {app.applicantPhone && <div className="text-xs text-muted-foreground">{app.applicantPhone}</div>}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{app.jobTitle}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          {app.resumeUrl ? (
                            <a href={`/api/admin/resume-url?path=${encodeURIComponent(app.resumeUrl)}`} target="_blank" rel="noreferrer" className="text-brand-primary-500 hover:underline flex items-center gap-1">
                              View Resume <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground">No Resume</span>
                          )}

                          {app.portfolioUrl && (
                            <a href={app.portfolioUrl} target="_blank" rel="noreferrer" className="text-brand-secondary-600 hover:underline flex items-center gap-1 text-sm">
                              Portfolio/GitHub <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          className="bg-transparent border border-border rounded text-xs p-1 focus:ring-brand-primary-500"
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
              <Input id="title" value={jobFormData.title} onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })} required />
            </div>
            <div className="space-y-2 text-left">
              <Label htmlFor="department">Department</Label>
              <Input id="department" value={jobFormData.department} onChange={(e) => setJobFormData({ ...jobFormData, department: e.target.value })} required />
            </div>
            <div className="space-y-2 text-left">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={jobFormData.location} onChange={(e) => setJobFormData({ ...jobFormData, location: e.target.value })} required />
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
                onChange={(e) => setJobFormData({ ...jobFormData, type: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2 text-left">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={jobFormData.description} onChange={(e) => setJobFormData({ ...jobFormData, description: e.target.value })} rows={15} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" checked={jobFormData.isActive} onChange={(e) => setJobFormData({ ...jobFormData, isActive: e.target.checked })} className="rounded border-border text-brand-primary-500 focus:ring-brand-primary-500" />
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

      <Modal isOpen={isAppModalOpen} onClose={() => setIsAppModalOpen(false)} title="Application Details">
        {selectedApplication && (
          <div className="space-y-6 text-left">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Applicant</h4>
                <p className="text-base font-semibold">{selectedApplication.applicantName}</p>
                <p className="text-sm text-muted-foreground">{selectedApplication.applicantEmail}</p>
                {selectedApplication.applicantPhone && <p className="text-sm text-muted-foreground">{selectedApplication.applicantPhone}</p>}
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Job</h4>
                <p className="text-base font-semibold">{selectedApplication.jobTitle}</p>
                <p className="text-sm text-muted-foreground">Applied: {new Date(selectedApplication.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {(selectedApplication.resumeUrl || selectedApplication.portfolioUrl) && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Links & Documents</h4>
                <div className="flex gap-4">
                  {selectedApplication.resumeUrl && (
                    <a href={`/api/admin/resume-url?path=${encodeURIComponent(selectedApplication.resumeUrl)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary-50 text-brand-primary-700 rounded text-sm font-medium hover:bg-brand-primary-100 transition-colors">
                      <ExternalLink className="w-4 h-4" /> View Resume
                    </a>
                  )}
                  {selectedApplication.portfolioUrl && (
                    <a href={selectedApplication.portfolioUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-secondary-50 text-brand-secondary-700 rounded text-sm font-medium hover:bg-brand-secondary-100 transition-colors">
                      <ExternalLink className="w-4 h-4" /> Portfolio / GitHub
                    </a>
                  )}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Cover Letter / Message</h4>
              {selectedApplication.coverLetter ? (
                <div className="p-4 bg-muted/30 rounded text-sm whitespace-pre-wrap border border-border">
                  {selectedApplication.coverLetter}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No cover letter provided.</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
