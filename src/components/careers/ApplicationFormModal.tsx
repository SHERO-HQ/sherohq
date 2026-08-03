"use client";
import { useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { getErrorMessage } from "@/utils/error";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UploadCloud, CheckCircle2, Briefcase, MapPin, Clock, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ApplicationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: any;
}

export function ApplicationFormModal({ isOpen, onClose, job }: ApplicationFormModalProps) {
  const { addNotification } = useNotifications();
  const [viewMode, setViewMode] = useState<"details" | "form">("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    applicantName: "",
    applicantEmail: "",
    applicantPhone: "",
    portfolioUrl: "",
    coverLetter: "",
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    setIsSubmitting(true);
    try {
      let resumeUrl = "";

      // 1. Upload Resume if provided
      if (resumeFile) {
        const uploadData = new FormData();
        uploadData.append("resume", resumeFile);

        const uploadRes = await fetch("/api/upload/resume", {
          method: "POST",
          body: uploadData,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          throw new Error(errorData.error || "Failed to upload resume");
        }

        const uploadResult = await uploadRes.json();
        resumeUrl = uploadResult.resumeUrl;
      }

      // 2. Submit Application
      const applicationData = {
        jobId: job.id,
        ...formData,
        resumeUrl,
      };

      const res = await fetch("/api/public/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(applicationData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to submit application");
      }

      setIsSuccess(true);
      addNotification("Success", "Your application has been submitted!", "success");
    } catch (error) {
      addNotification("Error", getErrorMessage(error, "Failed to submit application"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset state after close animation
    setTimeout(() => {
      setIsSuccess(false);
      setViewMode("details");
      setFormData({ applicantName: "", applicantEmail: "", applicantPhone: "", portfolioUrl: "", coverLetter: "" });
      setResumeFile(null);
    }, 300);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={isSuccess ? "Application Submitted" : viewMode === "details" ? job?.title : `Apply for ${job?.title}`}
    >
      {isSuccess ? (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Thank you for applying!</h3>
          <p className="text-muted-foreground max-w-sm">
            We've received your application for the {job?.title} position. Our team will review it and get back to you soon.
          </p>
          <Button onClick={handleClose} className="mt-4">
            Close
          </Button>
        </div>
      ) : viewMode === "details" ? (
        <div className="space-y-6 text-left">
          <div className="sticky -top-6 z-10 -mt-6 -mx-6 px-6 py-3 bg-background/95 backdrop-blur-md flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-border shadow-sm">
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded">
                <Briefcase className="w-4 h-4 text-brand-primary-500" />
                {job?.department}
              </span>
              <span className="flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded">
                <MapPin className="w-4 h-4 text-brand-primary-500" />
                {job?.location}
              </span>
              <span className="flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded">
                <Clock className="w-4 h-4 text-brand-primary-500" />
                {job?.type}
              </span>
            </div>
            <Button onClick={() => setViewMode("form")} className="shrink-0 w-full sm:w-auto">Apply Now</Button>
          </div>

          {job?.description && (
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground text-lg">About the Role</h4>
              <div className="text-sm text-muted-foreground leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ node, ...props }) => <p className="mb-3 last:mb-0" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc ml-5 mb-3 space-y-1" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal ml-5 mb-3 space-y-1" {...props} />,
                    li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                    a: ({ node, ...props }) => <a className="text-brand-primary-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-semibold text-foreground" {...props} />,
                    h1: ({ node, ...props }) => <h1 className="text-xl font-bold text-foreground mt-6 mb-3" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-lg font-bold text-foreground mt-5 mb-2" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-base font-bold text-foreground mt-4 mb-2" {...props} />,
                    h4: ({ node, ...props }) => <h4 className="text-sm font-bold text-foreground mt-3 mb-1" {...props} />,
                  }}
                >
                  {job.description}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {job?.requirements && job.requirements.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground text-lg">Requirements</h4>
              <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                {job.requirements.map((req: string, i: number) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-border mt-6">
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button onClick={() => setViewMode("form")}>Apply Now</Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2 text-left">
              <Label htmlFor="applicantName">Full Name <span className="text-red-500">*</span></Label>
              <Input 
                id="applicantName" 
                value={formData.applicantName} 
                onChange={(e) => setFormData({...formData, applicantName: e.target.value})} 
                required 
                placeholder="Jane Doe"
              />
            </div>
            <div className="space-y-2 text-left">
              <Label htmlFor="applicantEmail">Email Address <span className="text-red-500">*</span></Label>
              <Input 
                id="applicantEmail" 
                type="email"
                value={formData.applicantEmail} 
                onChange={(e) => setFormData({...formData, applicantEmail: e.target.value})} 
                required 
                placeholder="jane@example.com"
              />
            </div>
          </div>
          <div className="space-y-2 text-left">
            <Label htmlFor="applicantPhone">Phone Number</Label>
            <Input 
              id="applicantPhone" 
              type="tel"
              value={formData.applicantPhone} 
              onChange={(e) => setFormData({...formData, applicantPhone: e.target.value})} 
              placeholder="+233 55 123 4567"
            />
          </div>
          <div className="space-y-2 text-left">
            <Label htmlFor="resume">Resume (PDF, DOCX) <span className="text-red-500">*</span></Label>
            {resumeFile ? (
              <div className="flex items-center justify-between p-3 border border-border rounded-md bg-secondary/30">
                <div className="flex items-center gap-2 overflow-hidden">
                  <UploadCloud className="w-4 h-4 text-brand-primary-500 shrink-0" />
                  <span className="text-sm font-medium truncate">{resumeFile.name}</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setResumeFile(null)} 
                  className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <input 
                  id="resume" 
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)} 
                  required
                  className="w-full text-sm text-muted-foreground file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-1 file:text-sm file:font-semibold file:bg-brand-primary-50 file:text-brand-primary-700 hover:file:bg-brand-primary-100 cursor-pointer focus:outline-none"
                />
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <UploadCloud className="w-3 h-3" /> Max size: 5MB
            </p>
          </div>
          <div className="space-y-2 text-left">
            <Label htmlFor="portfolioUrl">Portfolio / GitHub URL</Label>
            <Input 
              id="portfolioUrl" 
              type="url"
              value={formData.portfolioUrl} 
              onChange={(e) => setFormData({...formData, portfolioUrl: e.target.value})} 
              placeholder="https://github.com/janedoe"
            />
          </div>
          <div className="space-y-2 text-left">
            <Label htmlFor="coverLetter">Cover Letter / Message</Label>
            <Textarea 
              id="coverLetter" 
              value={formData.coverLetter} 
              onChange={(e) => setFormData({...formData, coverLetter: e.target.value})} 
              rows={4} 
              placeholder="Tell us why you're a great fit for this role..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setViewMode("details")}>Back</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
