import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

// Forms are sent by script, but a form submitted before the page's script has
// loaded is sent by the browser. Without method="post" it goes as a GET, which
// puts every field (name, phone, even a password) in the page address, where
// history and analytics see it. Search forms are the one place a GET is meant.

const root = join(__dirname, "..");

function tsxFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return tsxFiles(path);
    return name.endsWith(".tsx") ? [path] : [];
  });
}

/** Each <form …> opening tag, allowing for `=>` and braces inside attributes. */
function openingTags(source: string): string[] {
  const tags: string[] = [];
  for (let start = source.indexOf("<form"); start >= 0; start = source.indexOf("<form", start + 1)) {
    let depth = 0;
    let end = start;
    for (; end < source.length; end++) {
      const c = source[end];
      if (c === "{") depth++;
      else if (c === "}") depth--;
      else if (c === ">" && depth === 0) break;
    }
    tags.push(source.slice(start, end + 1));
  }
  return tags;
}

describe("forms", () => {
  it("never send their fields in the address", () => {
    const unsafe = tsxFiles(root).flatMap((file) =>
      openingTags(readFileSync(file, "utf8"))
        .filter((tag) => !/method="post"|action=\{|role="search"/.test(tag))
        .map((tag) => `${relative(root, file)}: ${tag.split("\n")[0]}`),
    );
    expect(unsafe).toEqual([]);
  });
});
