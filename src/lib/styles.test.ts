import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

// Sizes, spacing and colours come from design/system/tokens.json, never from
// one-off values in components. A one-off `text-[30px]` drifts from the scale
// and has to be hunted down page by page when the design changes.
//
// Allowed arbitrary values: grid track lists and aspect ratios, which describe
// a layout's shape rather than a design value.
const arbitrary = /(?<![\w-])(?![\w:-]*(?:grid-cols|grid-rows|aspect)-\[)[\w:-]+-\[[^\]\s]+\]|\/\[[^\]\s]+\]/g;
const hex = /#[0-9a-fA-F]{3,8}\b/g;
// Type comes only from the design-system scale (text-display … text-meta), which
// also sets line height and letter spacing; Tailwind's default scale is off limits.
const defaultType = /(?<![\w-])(?:[\w-]+:)*(?:text-(?:xs|sm|base|lg|[2-9]?xl)|leading-[\w.-]+|tracking-[\w.-]+)(?![\w-])/g;

// The share image is drawn by next/og, and the browser theme colour is page
// metadata; neither can read CSS variables.
const hexAllowed = new Set(["app/opengraph-image.tsx", "app/layout.tsx"]);

const root = join(__dirname, "..");

function componentFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return componentFiles(path);
    return name.endsWith(".tsx") ? [path] : [];
  });
}

function findAll(pattern: RegExp, skip: (file: string) => boolean = () => false) {
  return componentFiles(root).flatMap((file) => {
    const name = relative(root, file);
    if (skip(name)) return [];
    return readFileSync(file, "utf8")
      .split("\n")
      .flatMap((line, i) => [...line.matchAll(pattern)].map((m) => `${name}:${i + 1}  ${m[0]}`));
  });
}

describe("styles", () => {
  it("uses design tokens instead of one-off sizes", () => {
    expect(findAll(arbitrary)).toEqual([]);
  });

  it("uses the design-system type scale", () => {
    expect(findAll(defaultType)).toEqual([]);
  });

  // Tailwind silently drops a class it doesn't know, so a custom utility that
  // goes missing from globals.css fails quietly. Every one in use must exist.
  it("only uses custom utilities that globals.css defines", () => {
    const css = readFileSync(join(root, "app/globals.css"), "utf8");
    const defined = new Set([
      ...[...css.matchAll(/@utility ([\w-]+)/g)].map((m) => m[1]),
      ...[...css.matchAll(/--animate-([\w-]+):/g)].map((m) => `animate-${m[1]}`),
    ]);
    const custom = /(?<![\w-])(?:[\w-]+:)*((?:bg-dots|mask-fade|animate)(?:-[\w-]+)?|slant|container-site)(?![\w-])/g;
    const missing = findAll(custom).filter((hit) => {
      const name = hit.split("  ")[1].split(":").pop()!;
      return !defined.has(name);
    });
    expect(missing).toEqual([]);
  });

  it("uses colour tokens instead of hex values", () => {
    expect(findAll(hex, (name) => hexAllowed.has(name))).toEqual([]);
  });
});
