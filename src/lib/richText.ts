export type Block = { type: "p"; text: string } | { type: "ol" | "ul"; items: string[] };

const ORDERED = /^\d+[.)]\s+/;
const BULLET = /^[-*•]\s+/;

/** Turns owner-written plain text into paragraphs and lists. Blank lines separate paragraphs. */
export function toBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  for (const raw of text.replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const listType = ORDERED.test(line) ? "ol" : BULLET.test(line) ? "ul" : null;
    if (listType) {
      const item = line.replace(listType === "ol" ? ORDERED : BULLET, "");
      const last = blocks.at(-1);
      if (last && last.type === listType) last.items.push(item);
      else blocks.push({ type: listType, items: [item] });
    } else {
      blocks.push({ type: "p", text: line });
    }
  }
  return blocks;
}
