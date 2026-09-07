import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { Badge } from "./badge";

/**
 * ============================================================================
 * Badge
 * ============================================================================
 */
describe("Badge", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The Badge should render with the expected data-slot attribute.
   */
  it("sets the correct data-slot attribute", () => {
    render(<Badge>Shipped</Badge>);

    expect(
      screen.getByText("Shipped"),
    ).toHaveAttribute("data-slot", "badge");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The badge should render its label.
   */
  it("renders its children", () => {
    render(<Badge>Shipped</Badge>);

    expect(
      screen.getByText("Shipped"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The default variant classes should be applied.
   */
  it("applies the default variant classes", () => {
    render(<Badge>Shipped</Badge>);

    const badge = screen.getByText("Shipped");

    expect(badge).toHaveClass("bg-primary");
    expect(badge).toHaveClass("rounded-md");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The secondary variant should be applied when requested.
   */
  it("applies the secondary variant", () => {
    render(
      <Badge variant="secondary">Pending</Badge>,
    );

    expect(
      screen.getByText("Pending"),
    ).toHaveClass("bg-secondary");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The destructive variant should be applied when requested.
   */
  it("applies the destructive variant", () => {
    render(
      <Badge variant="destructive">Failed</Badge>,
    );

    expect(
      screen.getByText("Failed"),
    ).toHaveClass("bg-destructive");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The outline variant should be applied when requested.
   */
  it("applies the outline variant", () => {
    render(<Badge variant="outline">Draft</Badge>);

    expect(
      screen.getByText("Draft"),
    ).toHaveClass("text-foreground");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A custom className should be merged with the variant classes.
   */
  it("merges a custom className with the variant classes", () => {
    render(
      <Badge className="uppercase">Shipped</Badge>,
    );

    const badge = screen.getByText("Shipped");

    expect(badge).toHaveClass("uppercase");
    expect(badge).toHaveClass("bg-primary");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * asChild should render the child element while keeping badge styling.
   */
  it("renders as its child element when asChild is set", () => {
    render(
      <Badge asChild>
        <a href="/orders/shipped">Shipped</a>
      </Badge>,
    );

    const link = screen.getByRole("link", {
      name: "Shipped",
    });

    expect(link).toHaveAttribute(
      "href",
      "/orders/shipped",
    );

    expect(link).toHaveClass("bg-primary");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Arbitrary props should be forwarded to the underlying element.
   */
  it("forwards arbitrary props to the underlying element", () => {
    render(
      <Badge id="status-badge" title="Order status">
        Shipped
      </Badge>,
    );

    const badge = screen.getByText("Shipped");

    expect(badge).toHaveAttribute(
      "id",
      "status-badge",
    );

    expect(badge).toHaveAttribute(
      "title",
      "Order status",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A badge is a label, not a control - by default it must not be
   * interactive or focusable.
   */
  it("does not render as an interactive element by default", async () => {
    const user = userEvent.setup();

    render(<Badge>Shipped</Badge>);

    const badge = screen.getByText("Shipped");

    expect(badge.tagName).toBe("SPAN");
    expect(badge).not.toHaveAttribute("tabindex");

    expect(
      screen.queryByRole("button"),
    ).not.toBeInTheDocument();

    await user.tab();

    expect(badge).not.toHaveFocus();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Choosing one variant must NOT leave another variant's background
   * behind.
   */
  it("does not keep the default variant classes when another variant is used", () => {
    render(
      <Badge variant="secondary">Pending</Badge>,
    );

    const badge = screen.getByText("Pending");

    expect(badge).not.toHaveClass("bg-primary");
    expect(badge).not.toHaveClass("bg-destructive");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The outline variant must not paint a filled background.
   */
  it("does not apply a filled background for the outline variant", () => {
    render(<Badge variant="outline">Draft</Badge>);

    const badge = screen.getByText("Draft");

    expect(badge).not.toHaveClass("bg-primary");
    expect(badge).not.toHaveClass("bg-secondary");
    expect(badge).not.toHaveClass("bg-destructive");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * With asChild set, the component must NOT wrap the child in an extra
   * span element.
   */
  it("does not render a span wrapper when asChild is set", () => {
    const { container } = render(
      <Badge asChild>
        <a href="/orders/shipped">Shipped</a>
      </Badge>,
    );

    expect(
      container.querySelectorAll(
        "[data-slot='badge']",
      ),
    ).toHaveLength(1);

    expect(
      container.querySelector("span"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Long labels must not wrap onto a second line, which is what the
   * whitespace-nowrap and overflow-hidden classes guarantee.
   */
  it("does not allow its label to wrap or overflow", () => {
    render(
      <Badge>
        A very long order status label
      </Badge>,
    );

    const badge = screen.getByText(
      "A very long order status label",
    );

    expect(badge).toHaveClass("whitespace-nowrap");
    expect(badge).toHaveClass("overflow-hidden");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A custom className must not remove the badge shape.
   */
  it("does not drop the default classes when a custom className is given", () => {
    render(
      <Badge className="uppercase">Shipped</Badge>,
    );

    const badge = screen.getByText("Shipped");

    expect(badge).toHaveClass("uppercase");
    expect(badge).toHaveClass("rounded-md");
    expect(badge).toHaveClass("w-fit");
  });
});
