import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as illustrations from "./index";

const all = Object.values(illustrations);

describe("illustrations", () => {
  it.each(all.map((A) => [A.name, A]))("%s is decorative and uses theme colours only", (_, Art) => {
    const { container } = render(<Art />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    // No hard-coded colours: everything follows the light and dark tokens.
    expect(container.innerHTML).not.toMatch(/(fill|stroke)="#/);
  });
});
