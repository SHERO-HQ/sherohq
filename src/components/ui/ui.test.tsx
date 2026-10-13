import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ButtonLink } from "./Button";
import { Eyebrow } from "./Eyebrow";
import { IllustrationSlot } from "./IllustrationSlot";
import { StatusBadge } from "./StatusBadge";

describe("ButtonLink", () => {
  it("renders an internal link without target", () => {
    render(<ButtonLink href="/contact-us">Book</ButtonLink>);
    const link = screen.getByRole("link", { name: "Book" });
    expect(link).toHaveAttribute("href", "/contact-us");
    expect(link).not.toHaveAttribute("target");
  });

  it("opens external links safely in a new tab", () => {
    render(<ButtonLink href="https://wa.me/1">Chat</ButtonLink>);
    const link = screen.getByRole("link", { name: "Chat" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});

describe("StatusBadge", () => {
  it("names the status in text, not colour alone", () => {
    render(<StatusBadge status="in-development" />);
    expect(screen.getByText("In development")).toBeInTheDocument();
  });
});

describe("Eyebrow", () => {
  it("prefixes the label with //", () => {
    render(<Eyebrow>what we do</Eyebrow>);
    expect(screen.getByText("// what we do")).toBeInTheDocument();
  });
});

describe("IllustrationSlot", () => {
  it("is hidden from assistive technology", () => {
    const { container } = render(<IllustrationSlot label="hero" />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });
});
