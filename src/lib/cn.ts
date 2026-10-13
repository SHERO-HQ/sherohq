import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge about the design-token scales so overrides resolve correctly.
const merge = extendTailwindMerge({
  extend: {
    classGroups: {
      rounded: [{ rounded: ["control", "card"] }],
      "max-w": [{ "max-w": ["site", "measure"] }],
    },
  },
});

/** Join class names; later classes win over conflicting earlier ones. */
export function cn(...inputs: ClassValue[]): string {
  return merge(clsx(inputs));
}
