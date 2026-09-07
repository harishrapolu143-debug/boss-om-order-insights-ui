import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "./hover-card";

type HoverCardOverrides = {
  open?: boolean;
  defaultOpen?: boolean;
  openDelay?: number;
  closeDelay?: number;
  onOpenChange?: (open: boolean) => void;
};

function renderHoverCard(
  props: HoverCardOverrides = {},
) {
  return render(
    <HoverCard {...props}>
      <HoverCardTrigger href="#customer">
        Acme Ltd
      </HoverCardTrigger>

      <HoverCardContent>
        Customer since 2019
      </HoverCardContent>
    </HoverCard>,
  );
}

/**
 * ============================================================================
 * HoverCard
 * ============================================================================
 */
describe("HoverCard", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The trigger should render with the expected data-slot attribute.
   */
  it("sets the correct data-slot attribute on the trigger", () => {
    renderHoverCard();

    expect(
      screen.getByText("Acme Ltd"),
    ).toHaveAttribute(
      "data-slot",
      "hover-card-trigger",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * defaultOpen should render the card straight away.
   */
  it("respects defaultOpen", () => {
    renderHoverCard({ defaultOpen: true });

    expect(
      screen.getByText("Customer since 2019"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The open content should carry the expected data-slot attribute.
   */
  it("sets the correct data-slot attribute on the content", () => {
    renderHoverCard({ defaultOpen: true });

    expect(
      screen.getByText("Customer since 2019"),
    ).toHaveAttribute(
      "data-slot",
      "hover-card-content",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Hovering the trigger should reveal the card.
   */
  it("opens when the trigger is hovered", async () => {
    const user = userEvent.setup();

    renderHoverCard({ openDelay: 0 });

    await user.hover(
      screen.getByText("Acme Ltd"),
    );

    expect(
      await screen.findByText(
        "Customer since 2019",
      ),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Escape should dismiss the card.
   */
  it("closes when Escape is pressed", async () => {
    const user = userEvent.setup();

    renderHoverCard({ defaultOpen: true });

    await user.keyboard("{Escape}");

    expect(
      screen.queryByText("Customer since 2019"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * onOpenChange should report the new state.
   */
  it("calls onOpenChange when the card opens", async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();

    renderHoverCard({
      openDelay: 0,
      onOpenChange,
    });

    await user.hover(
      screen.getByText("Acme Ltd"),
    );

    await screen.findByText(
      "Customer since 2019",
    );

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A custom className should be merged with the defaults.
   */
  it("merges a custom className with the defaults", () => {
    render(
      <HoverCard defaultOpen>
        <HoverCardTrigger href="#customer">
          Acme Ltd
        </HoverCardTrigger>
        <HoverCardContent className="w-96">
          Customer since 2019
        </HoverCardContent>
      </HoverCard>,
    );

    const content = screen.getByText(
      "Customer since 2019",
    );

    expect(content).toHaveClass("w-96");
    expect(content).toHaveClass("rounded-md");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The content must NOT be in the DOM until the card is opened.
   */
  it("does not render the content while closed", () => {
    renderHoverCard();

    expect(
      screen.queryByText("Customer since 2019"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The card must NOT open on a plain click - hovering is the only
   * gesture that reveals it.
   */
  it("does not open when the trigger is clicked", async () => {
    const user = userEvent.setup();

    renderHoverCard();

    await user.click(
      screen.getByText("Acme Ltd"),
    );

    expect(
      screen.queryByText("Customer since 2019"),
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

    renderHoverCard({ defaultOpen: true });

    await user.keyboard("{Escape}");

    expect(
      screen.queryByText("Customer since 2019"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A hover card is supplementary - it must NOT be announced as a dialog
   * or trap the page.
   */
  it("does not expose a dialog role", () => {
    renderHoverCard({ defaultOpen: true });

    expect(
      screen.queryByRole("dialog"),
    ).not.toBeInTheDocument();

    expect(
      screen.getByText("Acme Ltd"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A controlled hover card must not open on its own.
   */
  it("does not open a controlled card without a handler", async () => {
    const user = userEvent.setup();

    renderHoverCard({ open: false, openDelay: 0 });

    await user.hover(
      screen.getByText("Acme Ltd"),
    );

    expect(
      screen.queryByText("Customer since 2019"),
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

    renderHoverCard({
      defaultOpen: true,
      onOpenChange,
    });

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The card content must not become the accessible name of the trigger.
   */
  it("does not relabel the trigger with the card content", () => {
    renderHoverCard({ defaultOpen: true });

    expect(
      screen.getByText("Acme Ltd"),
    ).toHaveTextContent("Acme Ltd");

    expect(
      screen.getByText("Acme Ltd"),
    ).not.toHaveTextContent(
      "Customer since 2019",
    );
  });
});
