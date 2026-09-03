import { render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { Separator } from "./separator";

const find = (c: HTMLElement) => c.querySelector("[data-slot='separator-root']");

describe("Separator", () => {
  it("sets the correct data-slot attribute", () => {
    const { container } = render(<Separator />);

    expect(find(container)).toBeInTheDocument();
  });

  it("defaults to a horizontal, decorative separator", () => {
    const { container } = render(<Separator />);

    const separator = find(container);

    expect(separator).toHaveAttribute("data-orientation", "horizontal");
    // Decorative separators are hidden from the accessibility tree.
    expect(separator).toHaveAttribute("role", "none");
  });

  it("renders a vertical separator when asked", () => {
    const { container } = render(<Separator orientation="vertical" />);

    expect(find(container)).toHaveAttribute("data-orientation", "vertical");
  });

  it("exposes a semantic role when not decorative", () => {
    const { container } = render(<Separator decorative={false} />);

    expect(find(container)).toHaveAttribute("role", "separator");
  });

  it("applies the default classes", () => {
    const { container } = render(<Separator />);

    expect(find(container)).toHaveClass("bg-border");
    expect(find(container)).toHaveClass("shrink-0");
  });

  it("merges a custom className with the defaults", () => {
    const { container } = render(<Separator className="my-4" />);

    expect(find(container)).toHaveClass("my-4");
    expect(find(container)).toHaveClass("bg-border");
  });
});
