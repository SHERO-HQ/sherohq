"use client";
import { useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { getErrorMessage } from "@/utils/error";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UploadCloud, CheckCircle2 } from "lucide-react";

interface ApplicationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: any;
}

export function ApplicationFormModal({ isOpen, onClose, job }: ApplicationFormModalProps) {
  const { addNotification } = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    applicantName: "",
    applicantEmail: "",
    applicantPhone: "",
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
      setFormData({ applicantName: "", applicantEmail: "", applicantPhone: "", coverLetter: "" });
      setResumeFile(null);
    }, 300);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={isSuccess ? "Application Submitted" : `Apply for ${job?.title}`}
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
            <div className="flex items-center gap-4">
              <Input 
                id="resume" 
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)} 
                required
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary-50 file:text-brand-primary-700 hover:file:bg-brand-primary-100 cursor-pointer"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <UploadCloud className="w-3 h-3" /> Max size: 5MB
            </p>
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
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
