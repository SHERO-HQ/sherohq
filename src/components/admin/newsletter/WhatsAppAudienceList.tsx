import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TabsContent } from "@/components/ui/tabs";
import { type WhatsAppContact, fetchWhatsAppContacts } from "@/services/api";

const inputClass =
  "border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:border-brand-secondary-500/70 focus-visible:ring-brand-secondary-500/20";

function safeDate(value?: string | null, pattern = "PPP") {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return format(date, pattern);
}

function EmptyState({ title }: { title: string }) {
  return (
    <div className="rounded border border-dashed border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
      {title}
    </div>
  );
}

export function WhatsAppAudienceList() {
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await fetchWhatsAppContacts();
        setContacts(data || []);
      } catch (e) {
        console.error("Failed to load WhatsApp contacts:", e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const filteredContacts = contacts.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q))
    );
  });

  return (
    <TabsContent value="whatsapp" className="mt-5">
      <section className="rounded border border-border bg-card shadow-sm shadow-black/10">
        <div className="flex flex-col gap-4 border-b border-border p-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              WhatsApp Audience
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {filteredContacts.length} total captured contacts
            </p>
          </div>
          <div className="grid grid-cols-1 sm:max-w-70">
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search contacts"
              leftIcon={<Search className="h-4 w-4" />}
              className={inputClass}
            />
          </div>
        </div>

        <div className="p-4">
          {isLoading ? (
            <EmptyState title="Loading contacts..." />
          ) : filteredContacts.length === 0 ? (
            <EmptyState title="No contacts found." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-55 text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-3 font-semibold">Name</th>
                    <th className="px-3 py-3 font-semibold">Phone</th>
                    <th className="px-3 py-3 font-semibold">Last Active</th>
                    <th className="px-3 py-3 font-semibold">Status</th>
                    <th className="px-3 py-3 font-semibold">First Captured</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((contact) => (
                    <tr
                      key={contact.phone}
                      className="border-b border-border text-muted-foreground transition hover:bg-white/5"
                    >
                      <td className="px-3 py-4">
                        <div className="font-medium text-foreground">
                          {contact.name || "Unknown"}
                        </div>
                      </td>
                      <td className="px-3 py-4 font-mono text-xs">
                        +{contact.phone}
                      </td>
                      <td className="px-3 py-4 text-muted-foreground">
                        {safeDate(contact.lastInteraction)}
                      </td>
                      <td className="px-3 py-4">
                        <Badge
                          className={
                            contact.status === "active"
                              ? "border-brand-secondary-500/20 bg-brand-secondary-500/10 text-brand-secondary-300"
                              : "border-amber-500/20 bg-amber-500/10 text-amber-300"
                          }
                        >
                          {contact.status === "active" ? "Active" : "Opted Out"}
                        </Badge>
                      </td>
                      <td className="px-3 py-4 text-muted-foreground">
                        {safeDate(contact.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </TabsContent>
  );
}
