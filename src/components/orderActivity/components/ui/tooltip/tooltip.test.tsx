import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "./tooltip";

type TooltipOverrides = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function renderTooltip(props: TooltipOverrides = {}) {
  return render(
    <Tooltip {...props}>
      <TooltipTrigger>Order status</TooltipTrigger>
      <TooltipContent>
        Shipped two days ago
      </TooltipContent>
    </Tooltip>,
  );
}

/**
 * ============================================================================
 * Tooltip
 * ============================================================================
 */
describe("Tooltip", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The trigger should render with the expected data-slot attribute.
   */
  it("sets the correct data-slot attribute on the trigger", () => {
    renderTooltip();

    expect(
      screen.getByRole("button", {
        name: "Order status",
      }),
    ).toHaveAttribute(
      "data-slot",
      "tooltip-trigger",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The Tooltip supplies its own provider, so it works standalone without
   * the caller having to wrap it.
   */
  it("works without an explicit provider", () => {
    renderTooltip({ defaultOpen: true });

    expect(
      screen.getByRole("tooltip"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The built in provider must NOT add a wrapper element to the page -
   * it is context only, so it cannot disturb the trigger's layout.
   */
  it("does not render a DOM wrapper for its provider", () => {
    const { container } = renderTooltip();

    expect(
      container.querySelector(
        "[data-slot='tooltip-provider']",
      ),
    ).not.toBeInTheDocument();

    expect(
      container.firstElementChild,
    ).toHaveAttribute(
      "data-slot",
      "tooltip-trigger",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * defaultOpen should render the tooltip straight away.
   */
  it("respects defaultOpen", () => {
    renderTooltip({ defaultOpen: true });

    expect(
      screen.getByRole("tooltip"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Focusing the trigger should reveal the tooltip.
   */
  it("opens when the trigger receives focus", async () => {
    const user = userEvent.setup();

    renderTooltip();

    await user.tab();

    expect(
      await screen.findByRole("tooltip"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The tooltip text should be rendered when open.
   */
  it("renders its content when open", () => {
    renderTooltip({ defaultOpen: true });

    expect(
      screen.getAllByText(
        "Shipped two days ago",
      ).length,
    ).toBeGreaterThan(0);
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The trigger should be described by the tooltip.
   */
  it("describes the trigger with the tooltip", () => {
    renderTooltip({ defaultOpen: true });

    expect(
      screen.getByRole("button", {
        name: "Order status",
      }),
    ).toHaveAttribute("aria-describedby");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Escape should dismiss the tooltip.
   */
  it("closes when Escape is pressed", async () => {
    const user = userEvent.setup();

    renderTooltip({ defaultOpen: true });

    await user.keyboard("{Escape}");

    expect(
      screen.queryByRole("tooltip"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A shared provider should also work.
   */
  it("works inside an explicit provider", () => {
    render(
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger>Order status</TooltipTrigger>
          <TooltipContent>
            Shipped two days ago
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    expect(
      screen.getByRole("tooltip"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A custom className should be merged with the defaults.
   */
  it("merges a custom className with the defaults", () => {
    const { container } = render(
      <Tooltip defaultOpen>
        <TooltipTrigger>Order status</TooltipTrigger>
        <TooltipContent className="max-w-xs">
          Shipped two days ago
        </TooltipContent>
      </Tooltip>,
    );

    const content = document.querySelector(
      "[data-slot='tooltip-content']",
    );

    expect(content).toHaveClass("max-w-xs");
    expect(content).toHaveClass("rounded-md");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The tooltip must NOT be in the DOM until it is opened.
   */
  it("does not render the tooltip while closed", () => {
    renderTooltip();

    expect(
      screen.queryByRole("tooltip"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Shipped two days ago"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Closing must remove the tooltip, not merely hide it.
   */
  it("does not leave the tooltip in the DOM after closing", async () => {
    const user = userEvent.setup();

    renderTooltip({ defaultOpen: true });

    await user.keyboard("{Escape}");

    expect(
      screen.queryByText("Shipped two days ago"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A tooltip is a hint, not a dialog - it must NOT be announced with the
   * dialog role or trap the page.
   */
  it("does not expose a dialog role", () => {
    renderTooltip({ defaultOpen: true });

    expect(
      screen.queryByRole("dialog"),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Order status",
      }),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The tooltip must not become the accessible name of its trigger - the
   * trigger keeps its own label and is only described by the tooltip.
   */
  it("does not replace the accessible name of the trigger", () => {
    renderTooltip({ defaultOpen: true });

    expect(
      screen.getByRole("button", {
        name: "Order status",
      }),
    ).not.toHaveAttribute("aria-labelledby");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A controlled tooltip must not open on its own.
   */
  it("does not open a controlled tooltip without a handler", async () => {
    const user = userEvent.setup();

    renderTooltip({ open: false });

    await user.tab();
    await user.hover(
      screen.getByRole("button", {
        name: "Order status",
      }),
    );

    expect(
      screen.queryByRole("tooltip"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * onOpenChange must not fire on the initial render.
   */
  it("does not call onOpenChange on initial render", () => {
    const onOpenChange = jest.fn();

    renderTooltip({
      defaultOpen: true,
      onOpenChange,
    });

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The tooltip arrow must not be announced as content.
   */
  it("does not add the arrow to the tooltip text", () => {
    renderTooltip({ defaultOpen: true });

    expect(
      screen.getByRole("tooltip"),
    ).toHaveTextContent("Shipped two days ago");
  });
});
