import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "./collapsible";

type CollapsibleOverrides = {
  open?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function renderCollapsible(
  props: CollapsibleOverrides = {},
) {
  return render(
    <Collapsible {...props}>
      <CollapsibleTrigger>
        Show line items
      </CollapsibleTrigger>

      <CollapsibleContent>
        Two line items
      </CollapsibleContent>
    </Collapsible>,
  );
}

/**
 * ============================================================================
 * Collapsible
 * ============================================================================
 */
describe("Collapsible", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The Collapsible root should render with the expected data-slot
   * attribute.
   */
  it("sets the correct data-slot attribute", () => {
    const { container } = renderCollapsible();

    expect(
      container.querySelector(
        "[data-slot='collapsible']",
      ),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The collapsible should start closed.
   */
  it("is closed by default", () => {
    const { container } = renderCollapsible();

    expect(
      container.querySelector(
        "[data-slot='collapsible']",
      ),
    ).toHaveAttribute("data-state", "closed");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * defaultOpen should start the collapsible open.
   */
  it("respects defaultOpen", () => {
    renderCollapsible({ defaultOpen: true });

    expect(
      screen.getByText("Two line items"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Clicking the trigger should open the content.
   */
  it("opens when the trigger is clicked", async () => {
    const user = userEvent.setup();

    renderCollapsible();

    await user.click(
      screen.getByRole("button", {
        name: "Show line items",
      }),
    );

    expect(
      screen.getByText("Two line items"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A second click should close it again.
   */
  it("closes again on a second click", async () => {
    const user = userEvent.setup();

    renderCollapsible();

    const trigger = screen.getByRole("button", {
      name: "Show line items",
    });

    await user.click(trigger);
    await user.click(trigger);

    expect(
      screen.queryByText("Two line items"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * onOpenChange should report the new state.
   */
  it("calls onOpenChange with the new state", async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();

    renderCollapsible({ onOpenChange });

    await user.click(
      screen.getByRole("button", {
        name: "Show line items",
      }),
    );

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The trigger should report the collapsed state.
   */
  it("reports the collapsed state via aria-expanded", () => {
    renderCollapsible();

    expect(
      screen.getByRole("button", {
        name: "Show line items",
      }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The trigger and content should carry their data-slot attributes.
   */
  it("sets the correct data-slot attributes on the trigger and content", () => {
    const { container } = renderCollapsible({
      defaultOpen: true,
    });

    expect(
      container.querySelector(
        "[data-slot='collapsible-trigger']",
      ),
    ).toBeInTheDocument();

    expect(
      container.querySelector(
        "[data-slot='collapsible-content']",
      ),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A controlled collapsible should follow its open prop.
   */
  it("honours a controlled open prop", () => {
    const { rerender } = render(
      <Collapsible open={false} onOpenChange={() => {}}>
        <CollapsibleTrigger>
          Show line items
        </CollapsibleTrigger>
        <CollapsibleContent>
          Two line items
        </CollapsibleContent>
      </Collapsible>,
    );

    expect(
      screen.queryByText("Two line items"),
    ).not.toBeInTheDocument();

    rerender(
      <Collapsible open onOpenChange={() => {}}>
        <CollapsibleTrigger>
          Show line items
        </CollapsibleTrigger>
        <CollapsibleContent>
          Two line items
        </CollapsibleContent>
      </Collapsible>,
    );

    expect(
      screen.getByText("Two line items"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The collapsible should be operable from the keyboard.
   */
  it("opens with the keyboard", async () => {
    const user = userEvent.setup();

    renderCollapsible();

    await user.tab();
    await user.keyboard("{Enter}");

    expect(
      screen.getByText("Two line items"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The content must NOT be rendered while the collapsible is closed.
   */
  it("does not render the content while collapsed", () => {
    renderCollapsible();

    expect(
      screen.queryByText("Two line items"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A disabled collapsible must not open.
   */
  it("does not open while disabled", async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();

    renderCollapsible({
      disabled: true,
      onOpenChange,
    });

    await user.click(
      screen.getByRole("button", {
        name: "Show line items",
      }),
    );

    expect(
      screen.queryByText("Two line items"),
    ).not.toBeInTheDocument();

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A disabled trigger must not be reachable with the keyboard.
   */
  it("does not receive focus while disabled", async () => {
    const user = userEvent.setup();

    renderCollapsible({ disabled: true });

    await user.tab();

    expect(
      screen.getByRole("button", {
        name: "Show line items",
      }),
    ).not.toHaveFocus();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A controlled collapsible must not change state on its own.
   */
  it("does not open a controlled collapsible without a handler", async () => {
    const user = userEvent.setup();

    renderCollapsible({ open: false });

    await user.click(
      screen.getByRole("button", {
        name: "Show line items",
      }),
    );

    expect(
      screen.queryByText("Two line items"),
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

    renderCollapsible({
      defaultOpen: true,
      onOpenChange,
    });

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Clicking inside the open content must not close it.
   */
  it("does not close when the content is clicked", async () => {
    const user = userEvent.setup();

    renderCollapsible({ defaultOpen: true });

    await user.click(
      screen.getByText("Two line items"),
    );

    expect(
      screen.getByText("Two line items"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Keys that are not activation keys must not open the content.
   */
  it("does not open when a non-activation key is pressed", async () => {
    const user = userEvent.setup();

    renderCollapsible();

    screen
      .getByRole("button", {
        name: "Show line items",
      })
      .focus();

    await user.keyboard("{ArrowDown}");
    await user.keyboard("a");

    expect(
      screen.queryByText("Two line items"),
    ).not.toBeInTheDocument();
  });
});
