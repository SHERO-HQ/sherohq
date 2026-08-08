import { useState } from "react";
import { Mail, MessageCircle, Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

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

export function NewsletterTemplatesTab({ onSelectTemplate }: NewsletterTemplatesTabProps) {
  const [activeType, setActiveType] = useState<TemplateType>("email");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dbTemplates, setDbTemplates] = useState<CampaignTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/templates")
      .then(res => res.json())
      .then(data => {
        setDbTemplates(data.templates || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch templates:", err);
        setLoading(false);
      });
  }, []);

  const templates = dbTemplates.filter(t => t.channel === activeType);

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
            activeType === "email" ? "bg-brand-secondary-500 hover:bg-brand-secondary-600 text-white border-transparent" : "text-muted-foreground"
          )}
        >
          <Mail className="h-4 w-4" /> Email Templates
        </Button>
        <Button
          variant={activeType === "whatsapp" ? "default" : "outline"}
          onClick={() => setActiveType("whatsapp")}
          className={cn(
            "gap-2",
            activeType === "whatsapp" ? "bg-brand-secondary-500 hover:bg-brand-secondary-600 text-white border-transparent" : "text-muted-foreground"
          )}
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp Templates
        </Button>
        <Button
          variant={activeType === "sms" ? "default" : "outline"}
          onClick={() => setActiveType("sms")}
          className={cn(
            "gap-2",
            activeType === "sms" ? "bg-brand-secondary-500 hover:bg-brand-secondary-600 text-white border-transparent" : "text-muted-foreground"
          )}
        >
          <MessageCircle className="h-4 w-4" /> SMS Templates
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template: any) => (
          <div key={template.id} className="rounded border border-border bg-card p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-foreground text-lg">{template.name}</h3>
                {template.category && (
                  <Badge variant="outline" className="text-xs uppercase bg-accent text-muted-foreground border-border">
                    {template.category}
                  </Badge>
                )}
              </div>
              
              {template.subject && (
                <div className="mb-2 text-sm">
                  <span className="text-muted-foreground font-medium">Subject:</span> <span className="text-foreground">{template.subject}</span>
                </div>
              )}
              
              <p className="text-muted-foreground text-sm mb-4">
                {template.description}
              </p>

              <div className="mb-4 text-xs font-mono bg-accent/50 p-2 rounded border border-border/50 text-muted-foreground flex flex-wrap gap-1">
                <span className="font-semibold">Params:</span> 
                {template.expectedParams && template.expectedParams.length > 0 
                  ? template.expectedParams.join(", ") 
                  : "None"}
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-brand-secondary-400 border-brand-secondary-500/20 hover:bg-brand-secondary-500/10"
                onClick={() => onSelectTemplate(activeType, template)}
              >
                Use Template
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full text-muted-foreground"
                onClick={() => {
                  const copyText = activeType === "email" ? (template.content || "") : 
                                   activeType === "sms" ? (template.content || "") :
                                   JSON.stringify(template, null, 2);
                  handleCopy(template.id, copyText);
                }}
              >
                {copiedId === template.id ? (
                  <><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Copied</>
                ) : (
                  <><Copy className="mr-2 h-4 w-4" /> Copy Content</>
                )}
              </Button>
            </div>
          </div>
        ))}
        {templates.length === 0 && (
          <div className="col-span-full py-10 text-center text-muted-foreground border border-dashed rounded bg-card">
            {loading ? "Loading templates..." : "No templates found for this channel."}
          </div>
        )}
      </div>
    </div>
  );
}
