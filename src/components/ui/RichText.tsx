import { toBlocks } from "@/lib/richText";
import { cn } from "@/lib/cn";

/** Renders owner-written plain text as paragraphs and lists. */
export function RichText({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn("space-y-4 text-ink-secondary", className)}>
      {toBlocks(text).map((b, i) => {
        if (b.type === "p") return <p key={i}>{b.text}</p>;
        const List = b.type;
        return (
          <List key={i} className={cn("space-y-2 pl-6", b.type === "ol" ? "list-decimal" : "list-disc", "marker:text-accent")}>
            {b.items.map((item) => (
              <li key={item} className="pl-1">
                {item}
              </li>
            ))}
          </List>
        );
      })}
    </div>
  );
}
