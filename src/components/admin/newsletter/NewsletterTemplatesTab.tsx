import { useState } from "react";
import { Mail, MessageCircle, Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { TemplatePreview } from "@/components/admin/newsletter/TemplatePreview";

type TemplateType = "email" | "whatsapp" | "sms";

interface CampaignTemplate {
  id: string;
  name: string;
  description: string | null;
  channel: string;
  content: string | null;
  whatsappTemplateLanguage: string | null;
  expectedParams: string[] | null;
  category: string | null;
  isSync: boolean;
  createdAt: string;
}

interface NewsletterTemplatesTabProps {
  onSelectTemplate: (channel: TemplateType, template: any) => void;
}

export function NewsletterTemplatesTab({
  onSelectTemplate,
}: NewsletterTemplatesTabProps) {
  const [activeType, setActiveType] = useState<TemplateType>("email");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dbTemplates, setDbTemplates] = useState<CampaignTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/templates")
      .then((res) => res.json())
      .then((data) => {
        setDbTemplates(data.templates || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch templates:", err);
        setLoading(false);
      });
  }, []);

  const templates = dbTemplates.filter((t) => t.channel === activeType);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-border pb-4">
        <Button
          variant={activeType === "email" ? "default" : "outline"}
          onClick={() => setActiveType("email")}
          className={cn(
            "gap-2",
            activeType === "email"
              ? "bg-brand-secondary-500 hover:bg-brand-secondary-600 text-white border-transparent"
              : "text-muted-foreground",
          )}
        >
          <Mail className="h-4 w-4" /> Email
        </Button>
        <Button
          variant={activeType === "whatsapp" ? "default" : "outline"}
          onClick={() => setActiveType("whatsapp")}
          className={cn(
            "gap-2",
            activeType === "whatsapp"
              ? "bg-brand-secondary-500 hover:bg-brand-secondary-600 text-white border-transparent"
              : "text-muted-foreground",
          )}
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </Button>
        <Button
          variant={activeType === "sms" ? "default" : "outline"}
          onClick={() => setActiveType("sms")}
          className={cn(
            "gap-2",
            activeType === "sms"
              ? "bg-brand-secondary-500 hover:bg-brand-secondary-600 text-white border-transparent"
              : "text-muted-foreground",
          )}
        >
          <MessageCircle className="h-4 w-4" /> SMS
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template: any) => (
          <div
            key={template.id}
            className="group rounded border border-border/80 bg-card flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 hover:shadow-black/5 transition-all duration-300"
          >
            {/* Card Header & Preview */}
            <div className="flex flex-col flex-1">
              <div className="p-5 border-b border-border/50 bg-accent/10 flex justify-between items-start">
                <div>
                  <h3
                    className="font-bold text-foreground text-lg mb-1 truncate max-w-50"
                    title={template.name}
                  >
                    {template.name}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {template.category && (
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase bg-accent text-muted-foreground border-border"
                      >
                        {template.category}
                      </Badge>
                    )}
                    {template.status === "APPROVED" && (
                      <Badge className="text-[10px] uppercase bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10 shadow-none">
                        APPROVED
                      </Badge>
                    )}
                  </div>
                </div>
                {activeType === "whatsapp" ? (
                  <MessageCircle className="h-5 w-5 text-[#25D366] opacity-80" />
                ) : (
                  <Mail className="h-5 w-5 text-brand-secondary-500 opacity-80" />
                )}
              </div>

              {/* Template Mini-Preview */}
              <div className="flex-1 bg-accent/5 p-4 border-b border-border/50 flex flex-col">
                <p className="text-muted-foreground text-xs mb-3 line-clamp-2 min-h-8">
                  {template.description || "No description provided."}
                </p>
                <div className="relative rounded overflow-hidden border border-border/50 bg-card flex-1 min-h-40 pointer-events-none transform scale-[0.9] origin-top">
                  <TemplatePreview
                    channel={activeType as any}
                    content={template.content || ""}
                    params={Array(5).fill("___")}
                  />
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-4 bg-card flex flex-col gap-3">
              <div className="text-[11px] font-mono bg-accent/40 px-3 py-2 rounded border border-border/50 text-muted-foreground flex flex-wrap gap-1.5 items-center">
                <span className="font-bold uppercase tracking-wider">
                  Params:
                </span>
                {template.expectedParams && template.expectedParams.length > 0
                  ? template.expectedParams.map((p: string, i: number) => (
                      <span
                        key={i}
                        className="bg-card border border-border/50 px-1.5 py-0.5 rounded text-foreground shadow-sm"
                      >
                        {p}
                      </span>
                    ))
                  : "None"}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-1">
                <Button
                  variant="outline"
                  className="w-full text-brand-secondary-600 border-brand-secondary-500/30 hover:bg-brand-secondary-500 hover:text-white rounded shadow-sm transition-all"
                  onClick={() => onSelectTemplate(activeType, template)}
                >
                  Use Template
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-muted-foreground rounded"
                  onClick={() => {
                    const copyText =
                      activeType === "email"
                        ? template.content || ""
                        : activeType === "sms"
                          ? template.content || ""
                          : JSON.stringify(template, null, 2);
                    handleCopy(template.id, copyText);
                  }}
                >
                  {copiedId === template.id ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />{" "}
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" /> Copy Text
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
        {templates.length === 0 && (
          <div className="col-span-full py-10 text-center text-muted-foreground border border-dashed rounded bg-card">
            {loading
              ? "Loading templates..."
              : "No templates found for this channel."}
          </div>
        )}
      </div>
    </div>
  );
}
