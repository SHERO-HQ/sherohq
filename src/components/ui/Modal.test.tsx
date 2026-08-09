import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "./Modal";

vi.mock("motion/react", async () => {
  const React = await import("react");

  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    m: {
      div: ({ children, ...props }: any) =>
        React.createElement("div", props, children),
    },
  };
});

describe("Modal", () => {
  it("uses a viewport-safe layout that stays scrollable inside the screen", () => {
    render(
      <Modal isOpen onClose={() => {}} title="Test modal">
        <div>Content</div>
      </Modal>,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toContain("fixed");
    expect(dialog.className).toContain("items-center");
    expect(dialog.className).toContain("justify-center");

    const panel = dialog.querySelector(".glass-surface-lg");
    expect(panel).not.toBeNull();
    expect(panel?.className).toContain("flex-col");
    expect(panel?.className).toContain("overflow-hidden");

    const body = panel?.querySelector(".overflow-y-auto");
    expect(body?.className).toContain("overscroll-contain");
  });

  it("locks background scrolling while the dialog is open", () => {
    const { unmount } = render(
      <Modal isOpen onClose={() => {}} title="Test modal">
        <div>Content</div>
      </Modal>,
    );

    expect(document.body.style.overflow).toBe("hidden");

    unmount();
    expect(document.body.style.overflow).toBe("");
  });
});
