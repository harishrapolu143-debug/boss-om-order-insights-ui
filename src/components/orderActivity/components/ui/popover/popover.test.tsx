import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
} from "./popover";

type PopoverOverrides = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function renderPopover(props: PopoverOverrides = {}) {
  return render(
    <Popover {...props}>
      <PopoverTrigger>Show summary</PopoverTrigger>

      <PopoverContent>
        Order summary panel
      </PopoverContent>
    </Popover>,
  );
}

/**
 * ============================================================================
 * Popover
 * ============================================================================
 */
describe("Popover", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The trigger should render with the expected data-slot attribute.
   */
  it("sets the correct data-slot attribute on the trigger", () => {
    renderPopover();

    expect(
      screen.getByRole("button", {
        name: "Show summary",
      }),
    ).toHaveAttribute(
      "data-slot",
      "popover-trigger",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Clicking the trigger should open the popover.
   */
  it("opens when the trigger is clicked", async () => {
    const user = userEvent.setup();

    renderPopover();

    await user.click(
      screen.getByRole("button", {
        name: "Show summary",
      }),
    );

    expect(
      screen.getByText("Order summary panel"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * defaultOpen should render the popover straight away.
   */
  it("respects defaultOpen", () => {
    renderPopover({ defaultOpen: true });

    expect(
      screen.getByText("Order summary panel"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The open content should carry the expected data-slot attribute.
   */
  it("sets the correct data-slot attribute on the content", () => {
    renderPopover({ defaultOpen: true });

    expect(
      screen.getByText("Order summary panel"),
    ).toHaveAttribute(
      "data-slot",
      "popover-content",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The trigger should report the open state.
   */
  it("reports the open state on the trigger", async () => {
    const user = userEvent.setup();

    renderPopover();

    const trigger = screen.getByRole("button", {
      name: "Show summary",
    });

    expect(trigger).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    await user.click(trigger);

    expect(trigger).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Escape should dismiss the popover.
   */
  it("closes when Escape is pressed", async () => {
    const user = userEvent.setup();

    renderPopover({ defaultOpen: true });

    await user.keyboard("{Escape}");

    expect(
      screen.queryByText("Order summary panel"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * onOpenChange should report the new state.
   */
  it("calls onOpenChange when the popover opens", async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();

    renderPopover({ onOpenChange });

    await user.click(
      screen.getByRole("button", {
        name: "Show summary",
      }),
    );

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A separate anchor should be supported for positioning.
   */
  it("supports a separate anchor", () => {
    const { container } = render(
      <Popover defaultOpen>
        <PopoverAnchor>
          <span>Anchor</span>
        </PopoverAnchor>
        <PopoverTrigger>Show summary</PopoverTrigger>
        <PopoverContent>
          Order summary panel
        </PopoverContent>
      </Popover>,
    );

    expect(
      container.querySelector(
        "[data-slot='popover-anchor']",
      ),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A custom className should be merged with the defaults.
   */
  it("merges a custom className with the defaults", () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger>Show summary</PopoverTrigger>
        <PopoverContent className="w-96">
          Order summary panel
        </PopoverContent>
      </Popover>,
    );

    const content = screen.getByText(
      "Order summary panel",
    );

    expect(content).toHaveClass("w-96");
    expect(content).toHaveClass("rounded-md");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The content must NOT be in the DOM until the popover is opened.
   */
  it("does not render the content while closed", () => {
    renderPopover();

    expect(
      screen.queryByText("Order summary panel"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Closing must remove the content, not merely hide it.
   */
  it("does not leave the content in the DOM after closing", async () => {
    const user = userEvent.setup();

    renderPopover({ defaultOpen: true });

    await user.keyboard("{Escape}");

    expect(
      screen.queryByText("Order summary panel"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Clicking inside the popover must not dismiss it.
   */
  it("does not close when the content is clicked", async () => {
    const user = userEvent.setup();

    renderPopover({ defaultOpen: true });

    await user.click(
      screen.getByText("Order summary panel"),
    );

    expect(
      screen.getByText("Order summary panel"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A controlled popover must not open on its own.
   */
  it("does not open a controlled popover without a handler", async () => {
    const user = userEvent.setup();

    renderPopover({ open: false });

    await user.click(
      screen.getByRole("button", {
        name: "Show summary",
      }),
    );

    expect(
      screen.queryByText("Order summary panel"),
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

    renderPopover({
      defaultOpen: true,
      onOpenChange,
    });

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A popover carries role="dialog", but it is NOT modal - it must not
   * trap the page or hide the trigger behind it.
   */
  it("does not trap the page behind it", () => {
    renderPopover({ defaultOpen: true });

    expect(
      screen.getByRole("dialog"),
    ).not.toHaveAttribute("aria-modal", "true");

    expect(
      screen.getByRole("button", {
        name: "Show summary",
      }),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Keys that are not Escape must not dismiss the popover.
   */
  it("does not close when a non-dismiss key is pressed", async () => {
    const user = userEvent.setup();

    renderPopover({ defaultOpen: true });

    await user.keyboard("a");
    await user.keyboard("{ArrowDown}");

    expect(
      screen.getByText("Order summary panel"),
    ).toBeInTheDocument();
  });
});
