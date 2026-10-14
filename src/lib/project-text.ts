export type TextBlock = { type: "p"; text: string } | { type: "ol" | "ul"; items: string[] };

const ORDERED = /^\d+[.)]\s+/;
const BULLET = /^[-*•]\s+/;

/**
 * Turns plain text from the admin into paragraphs and lists.
 * "1." lines become a numbered list, "-", "*" or "•" lines a bulleted one.
 * A bullet that runs on from the sentence before it ("... • Feature") is split out.
 */
export function toBlocks(text: string): TextBlock[] {
  const blocks: TextBlock[] = [];
  const lines = text
    .replace(/\r\n/g, "\n")
    .replace(/([^\n])\s+•\s+/g, "$1\n• ")
    .split("\n");
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const listType = ORDERED.test(line) ? "ol" : BULLET.test(line) ? "ul" : null;
    if (listType) {
      const item = line.replace(listType === "ol" ? ORDERED : BULLET, "");
      const last = blocks[blocks.length - 1];
      if (last && last.type === listType) last.items.push(item);
      else blocks.push({ type: listType, items: [item] });
    } else {
      blocks.push({ type: "p", text: line });
    }
  }
  return blocks;
}

/** The first sentence of a project's challenge, for cards. Drops a leading "Challenge:" label. */
export function firstSentence(text: string | null | undefined): string {
  const flat = (text ?? "")
    .replace(/\s+/g, " ")
    .replace(/^\s*(the\s+)?challenge\s*[:\-–]\s*/i, "")
    .trim();
  const match = flat.match(/^.*?[.!?](\s|$)/);
  return (match ? match[0] : flat).trim();
}

/** True when the saved image value looks like a usable URL or path. */
export function hasImage(image: string | null | undefined): image is string {
  return !!image && (image.startsWith("http") || image.startsWith("/") || image.includes("."));
}

/** Logos and marks (SVG) sit inside the frame; screenshots fill it from the top. */
export function isMark(image: string): boolean {
  return /\.svg(\?|$)/i.test(image);
}
