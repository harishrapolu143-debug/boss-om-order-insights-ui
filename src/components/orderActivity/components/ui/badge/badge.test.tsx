import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { Badge, badgeVariants } from "./badge";

describe("Badge", () => {
  it("renders its children", () => {
    render(<Badge>Active</Badge>);

    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("sets the correct data-slot attribute", () => {
    render(<Badge>Active</Badge>);

    expect(screen.getByText("Active")).toHaveAttribute("data-slot", "badge");
  });

  it("renders a span by default", () => {
    render(<Badge>Active</Badge>);

    expect(screen.getByText("Active").tagName).toBe("SPAN");
  });

  it("applies the default variant", () => {
    render(<Badge>Active</Badge>);

    const badge = screen.getByText("Active");

    expect(badge).toHaveClass("bg-primary");
    expect(badge).toHaveClass("text-primary-foreground");
  });

  it("applies the secondary variant", () => {
    render(<Badge variant="secondary">Pending</Badge>);

    expect(screen.getByText("Pending")).toHaveClass("bg-secondary");
    expect(screen.getByText("Pending")).toHaveClass("text-secondary-foreground");
  });

  it("applies the destructive variant", () => {
    render(<Badge variant="destructive">Failed</Badge>);

    expect(screen.getByText("Failed")).toHaveClass("bg-destructive");
    expect(screen.getByText("Failed")).toHaveClass("text-white");
  });

  it("applies the outline variant", () => {
    render(<Badge variant="outline">Draft</Badge>);

    expect(screen.getByText("Draft")).toHaveClass("text-foreground");
  });

  it("merges a custom className with the variant classes", () => {
    render(<Badge className="uppercase">Active</Badge>);

    expect(screen.getByText("Active")).toHaveClass("uppercase");
    expect(screen.getByText("Active")).toHaveClass("bg-primary");
  });

  it("renders as the child element when asChild is set", () => {
    render(
      <Badge asChild>
        <a href="/orders">Orders</a>
      </Badge>,
    );

    const link = screen.getByRole("link", { name: "Orders" });

    expect(link).toHaveAttribute("href", "/orders");
    expect(link).toHaveAttribute("data-slot", "badge");
  });

  describe("badgeVariants", () => {
    it("returns the default variant classes when called with no args", () => {
      expect(badgeVariants()).toContain("bg-primary");
    });

    it("returns the requested variant classes", () => {
      expect(badgeVariants({ variant: "destructive" })).toContain(
        "bg-destructive",
      );
    });
  });
});
