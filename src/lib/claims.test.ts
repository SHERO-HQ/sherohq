import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

// Guards the honesty and faceless-brand rules in CLAUDE.md: copy that is
// untrue today, or that claims a team, must never ship. Scans all site code.
const banned: Array<{ pattern: RegExp; why: string }> = [
  { pattern: /24\s*\/\s*7|24 hours a day|round[- ]the[- ]clock/i, why: "support is Mon–Fri, 8:00–18:00" },
  { pattern: /\buptime\b|99(\.\d+)?\s*%/i, why: "no uptime figures" },
  { pattern: /\bauthori[sz]ed\b|\bofficial (reseller|partner|dealer)\b/i, why: "SHERO is not an authorised reseller" },
  { pattern: /\bauthentic\b|\bbrand[- ]new\b/i, why: "devices are refurbished and quality-checked" },
  { pattern: /\b(our|the) team\b|\bfounder\b|\bCEO\b/i, why: "SHERO is faceless; no copy claiming a team" },
  { pattern: /\bcertified\b/i, why: "no certifications that aren't held" },
  { pattern: /\b[1-5](\.\d)?\s*(stars?|★)|\brating\s*[:=]/i, why: "no invented ratings" },
];

const root = join(__dirname, "..");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(tsx?|css)$/.test(name) && !name.includes(".test.") ? [path] : [];
  });
}

describe("site copy keeps the honesty rules", () => {
  const files = sourceFiles(root);

  it("finds the site's source files", () => {
    expect(files.length).toBeGreaterThan(5);
  });

  for (const { pattern, why } of banned) {
    it(`never says ${pattern} (${why})`, () => {
      const hits = files.flatMap((file) =>
        readFileSync(file, "utf8")
          .split("\n")
          .map((line, i) => ({ line, at: `${relative(root, file)}:${i + 1}` }))
          .filter(({ line }) => pattern.test(line))
          .map(({ at, line }) => `${at}  ${line.trim()}`),
      );
      expect(hits).toEqual([]);
    });
  }
});
