import * as React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { ScrollArea, ScrollBar } from "./scroll-area";

/**
 * ============================================================================
 * ScrollArea
 * ============================================================================
 */
describe("ScrollArea", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The ScrollArea root should render with the expected data-slot
   * attribute.
   */
  it("sets the correct data-slot attribute", () => {
    const { container } = render(
      <ScrollArea>
        <div>Order history</div>
      </ScrollArea>,
    );

    expect(
      container.querySelector(
        "[data-slot='scroll-area']",
      ),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Children should be rendered inside the viewport, not directly on the
   * root.
   */
  it("renders its children inside the viewport", () => {
    const { container } = render(
      <ScrollArea>
        <div>Order history</div>
      </ScrollArea>,
    );

    const viewport = container.querySelector(
      "[data-slot='scroll-area-viewport']",
    ) as HTMLElement;

    expect(viewport).toBeInTheDocument();

    expect(viewport).toContainElement(
      screen.getByText("Order history"),
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The root should be positioned so the scrollbar can be overlaid.
   */
  it("applies the default classes", () => {
    const { container } = render(
      <ScrollArea>
        <div>Order history</div>
      </ScrollArea>,
    );

    expect(
      container.querySelector(
        "[data-slot='scroll-area']",
      ),
    ).toHaveClass("relative");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A custom className should be merged with the defaults.
   */
  it("merges a custom className with the defaults", () => {
    const { container } = render(
      <ScrollArea className="h-40">
        <div>Order history</div>
      </ScrollArea>,
    );

    const root = container.querySelector(
      "[data-slot='scroll-area']",
    );

    expect(root).toHaveClass("h-40");
    expect(root).toHaveClass("relative");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Arbitrary props should be forwarded to the root element.
   */
  it("forwards arbitrary props to the root", () => {
    const { container } = render(
      <ScrollArea id="history-scroll">
        <div>Order history</div>
      </ScrollArea>,
    );

    expect(
      container.querySelector(
        "[data-slot='scroll-area']",
      ),
    ).toHaveAttribute("id", "history-scroll");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The children must NOT be attached directly to the root, or they would
   * escape the scrolling viewport.
   */
  it("does not render its children directly on the root", () => {
    const { container } = render(
      <ScrollArea>
        <div>Order history</div>
      </ScrollArea>,
    );

    const root = container.querySelector(
      "[data-slot='scroll-area']",
    ) as HTMLElement;

    const child = screen.getByText("Order history");

    expect(child.parentElement).not.toBe(root);
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Nothing overflows in jsdom, so the scrollbar must NOT be mounted -
   * it should never occupy space when it is not needed.
   */
  it("does not mount a scrollbar when nothing overflows", () => {
    const { container } = render(
      <ScrollArea>
        <div>Order history</div>
      </ScrollArea>,
    );

    expect(
      container.querySelector(
        "[data-slot='scroll-area-scrollbar']",
      ),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The scroll area is a container - it must not be interactive or
   * announced with a role of its own.
   */
  it("does not render as an interactive element", () => {
    const { container } = render(
      <ScrollArea>
        <div>Order history</div>
      </ScrollArea>,
    );

    const root = container.querySelector(
      "[data-slot='scroll-area']",
    ) as HTMLElement;

    expect(root).not.toHaveAttribute("role");
    expect(root).not.toHaveAttribute("tabindex");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A custom className must not remove the positioning the overlaid
   * scrollbar depends on.
   */
  it("does not drop the positioning class when a custom className is given", () => {
    const { container } = render(
      <ScrollArea className="h-40">
        <div>Order history</div>
      </ScrollArea>,
    );

    expect(
      container.querySelector(
        "[data-slot='scroll-area']",
      ),
    ).toHaveClass("relative");
  });
});

/**
 * ============================================================================
 * ScrollBar
 * ============================================================================
 */
describe("ScrollBar", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The scrollbar should default to a vertical orientation.
   */
  it("defaults to a vertical orientation", () => {
    const { container } = render(
      <ScrollArea type="always">
        <ScrollBar />
        <div>Order history</div>
      </ScrollArea>,
    );

    expect(
      container.querySelector(
        "[data-slot='scroll-area-scrollbar']",
      ),
    ).toHaveAttribute(
      "data-orientation",
      "vertical",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The vertical scrollbar should use the vertical sizing classes.
   */
  it("applies the vertical-only classes by default", () => {
    const { container } = render(
      <ScrollArea type="always">
        <ScrollBar />
        <div>Order history</div>
      </ScrollArea>,
    );

    const scrollbar = container.querySelector(
      "[data-slot='scroll-area-scrollbar']",
    );

    expect(scrollbar).toHaveClass("h-full");
    expect(scrollbar).toHaveClass("w-2.5");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The horizontal scrollbar should use the horizontal sizing classes.
   */
  it("applies the horizontal-only classes when asked", () => {
    const { container } = render(
      <ScrollArea type="always">
        <ScrollBar
          orientation="horizontal"
        />
        <div>Order history</div>
      </ScrollArea>,
    );

    const scrollbar = container.querySelectorAll(
      "[data-slot='scroll-area-scrollbar']",
    );

    const horizontal = Array.from(scrollbar).find(
      (element) =>
        element.getAttribute("data-orientation") ===
        "horizontal",
    );

    expect(horizontal).toHaveClass("h-2.5");
    expect(horizontal).toHaveClass("flex-col");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The thumb must NOT be rendered while there is nothing to scroll.
   *
   * Radix sizes the thumb from the real overflow ratio, and jsdom reports
   * zero-sized elements, so no thumb is mounted here. A drag handle that
   * cannot move must never be shown.
   */
  it("does not render a thumb when there is nothing to scroll", () => {
    const { container } = render(
      <ScrollArea type="always">
        <ScrollBar />
        <div>Order history</div>
      </ScrollArea>,
    );

    expect(
      container.querySelector(
        "[data-slot='scroll-area-thumb']",
      ),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A custom className should be merged with the defaults.
   */
  it("merges a custom className with the defaults", () => {
    const { container } = render(
      <ScrollArea type="always">
        <ScrollBar className="w-4" />
        <div>Order history</div>
      </ScrollArea>,
    );

    const scrollbar = container.querySelector(
      "[data-slot='scroll-area-scrollbar']",
    );

    expect(scrollbar).toHaveClass("w-4");
    expect(scrollbar).toHaveClass("touch-none");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A vertical scrollbar must NOT carry the horizontal sizing classes.
   */
  it("does not apply horizontal classes to a vertical scrollbar", () => {
    const { container } = render(
      <ScrollArea type="always">
        <ScrollBar />
        <div>Order history</div>
      </ScrollArea>,
    );

    const scrollbar = container.querySelector(
      "[data-slot='scroll-area-scrollbar']",
    );

    expect(scrollbar).not.toHaveClass("h-2.5");
    expect(scrollbar).not.toHaveClass("flex-col");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The scrollbar must not capture touch gestures meant for the content,
   * which is what the touch-none and select-none classes guarantee.
   */
  it("does not allow touch selection on the scrollbar", () => {
    const { container } = render(
      <ScrollArea type="always">
        <ScrollBar />
        <div>Order history</div>
      </ScrollArea>,
    );

    const scrollbar = container.querySelector(
      "[data-slot='scroll-area-scrollbar']",
    );

    expect(scrollbar).toHaveClass("touch-none");
    expect(scrollbar).toHaveClass("select-none");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A custom className must not remove the scrollbar sizing.
   */
  it("does not drop the default classes when a custom className is given", () => {
    const { container } = render(
      <ScrollArea type="always">
        <ScrollBar className="opacity-50" />
        <div>Order history</div>
      </ScrollArea>,
    );

    const scrollbar = container.querySelector(
      "[data-slot='scroll-area-scrollbar']",
    );

    expect(scrollbar).toHaveClass("opacity-50");
    expect(scrollbar).toHaveClass("flex");
    expect(scrollbar).toHaveClass("touch-none");
  });
});
