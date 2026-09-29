import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

// Icons come from Lucide only (CLAUDE.md). Unicode arrows, stars, checkmarks,
// bullets and emoji render differently per device and can't be styled.
const unicodeIcon = /[←-⇿•■-◿☀-➿⬀-⯿\u{1F300}-\u{1FAFF}]|&(rarr|larr|darr|uarr|check|bull|star);/u;

const root = join(__dirname, "..");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(name) && !name.includes(".test.") ? [path] : [];
  });
}

describe("icons", () => {
  it("uses Lucide instead of Unicode symbols", () => {
    const hits = sourceFiles(root).flatMap((file) =>
      readFileSync(file, "utf8")
        .split("\n")
        .flatMap((line, i) => (unicodeIcon.test(line) ? [`${relative(root, file)}:${i + 1}  ${line.trim()}`] : [])),
    );
    expect(hits).toEqual([]);
  });
});
