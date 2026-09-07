import * as React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "./resizable";

function renderPanels(
  props: {
    direction?: "horizontal" | "vertical";
    withHandle?: boolean;
  } = {},
) {
  return render(
    <ResizablePanelGroup
      direction={props.direction ?? "horizontal"}
    >
      <ResizablePanel defaultSize={50}>
        Order list
      </ResizablePanel>

      <ResizableHandle
        withHandle={props.withHandle}
      />

      <ResizablePanel defaultSize={50}>
        Order detail
      </ResizablePanel>
    </ResizablePanelGroup>,
  );
}

/**
 * ============================================================================
 * Resizable
 * ============================================================================
 */
describe("Resizable", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Every resizable part should render with its own data-slot attribute.
   */
  it("sets the correct data-slot attributes for every part", () => {
    const { container } = renderPanels();

    expect(
      container.querySelector(
        "[data-slot='resizable-panel-group']",
      ),
    ).toBeInTheDocument();

    expect(
      container.querySelectorAll(
        "[data-slot='resizable-panel']",
      ),
    ).toHaveLength(2);

    expect(
      container.querySelector(
        "[data-slot='resizable-handle']",
      ),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The panel content should be rendered.
   */
  it("renders the content of every panel", () => {
    renderPanels();

    expect(
      screen.getByText("Order list"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Order detail"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The group should record its direction so the layout classes resolve.
   */
  it("records a horizontal direction", () => {
    const { container } = renderPanels();

    expect(
      container.querySelector(
        "[data-slot='resizable-panel-group']",
      ),
    ).toHaveAttribute(
      "data-panel-group-direction",
      "horizontal",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A vertical group should record the vertical direction.
   */
  it("records a vertical direction", () => {
    const { container } = renderPanels({
      direction: "vertical",
    });

    expect(
      container.querySelector(
        "[data-slot='resizable-panel-group']",
      ),
    ).toHaveAttribute(
      "data-panel-group-direction",
      "vertical",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The handle should be exposed as a separator so it can be operated by
   * keyboard.
   */
  it("exposes the handle as a separator", () => {
    renderPanels();

    expect(
      screen.getByRole("separator"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The handle should be focusable so it can be dragged with the
   * keyboard.
   */
  it("makes the handle focusable", () => {
    renderPanels();

    expect(
      screen.getByRole("separator"),
    ).toHaveAttribute("tabindex", "0");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * withHandle should render a visible grip.
   */
  it("renders a visible grip when asked", () => {
    const { container } = renderPanels({
      withHandle: true,
    });

    const handle = container.querySelector(
      "[data-slot='resizable-handle']",
    ) as HTMLElement;

    expect(
      handle.querySelector("svg"),
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
      <ResizablePanelGroup
        direction="horizontal"
        className="rounded-lg"
      >
        <ResizablePanel>Order list</ResizablePanel>
        <ResizableHandle className="bg-red-500" />
        <ResizablePanel>Order detail</ResizablePanel>
      </ResizablePanelGroup>,
    );

    expect(
      container.querySelector(
        "[data-slot='resizable-panel-group']",
      ),
    ).toHaveClass("rounded-lg", "flex");

    expect(
      container.querySelector(
        "[data-slot='resizable-handle']",
      ),
    ).toHaveClass("bg-red-500");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The grip is opt in - it must NOT be rendered unless asked for.
   */
  it("does not render a grip by default", () => {
    const { container } = renderPanels();

    const handle = container.querySelector(
      "[data-slot='resizable-handle']",
    ) as HTMLElement;

    expect(
      handle.querySelector("svg"),
    ).not.toBeInTheDocument();

    expect(handle).toBeEmptyDOMElement();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A horizontal group must NOT be marked as vertical, or the sizing
   * classes resolve to the wrong axis.
   */
  it("does not report a vertical direction when horizontal", () => {
    const { container } = renderPanels();

    expect(
      container.querySelector(
        "[data-slot='resizable-panel-group']",
      ),
    ).not.toHaveAttribute(
      "data-panel-group-direction",
      "vertical",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A group with no handle must not invent one.
   */
  it("does not render a handle that was not supplied", () => {
    const { container } = render(
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel>Order list</ResizablePanel>
      </ResizablePanelGroup>,
    );

    expect(
      container.querySelector(
        "[data-slot='resizable-handle']",
      ),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("separator"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The panels must not be nested inside one another - they are siblings
   * within the group.
   */
  it("does not nest one panel inside the other", () => {
    const { container } = renderPanels();

    const [first, second] = Array.from(
      container.querySelectorAll(
        "[data-slot='resizable-panel']",
      ),
    );

    expect(first.contains(second)).toBe(false);
    expect(second.contains(first)).toBe(false);
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The handle must not swallow the panel content - it sits between the
   * panels and holds none of it.
   */
  it("does not put panel content inside the handle", () => {
    const { container } = renderPanels();

    const handle = container.querySelector(
      "[data-slot='resizable-handle']",
    ) as HTMLElement;

    expect(handle).not.toHaveTextContent(
      "Order list",
    );

    expect(handle).not.toHaveTextContent(
      "Order detail",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A custom className must not remove the group layout.
   */
  it("does not drop the default classes when a custom className is given", () => {
    const { container } = render(
      <ResizablePanelGroup
        direction="horizontal"
        className="rounded-lg"
      >
        <ResizablePanel>Order list</ResizablePanel>
      </ResizablePanelGroup>,
    );

    const group = container.querySelector(
      "[data-slot='resizable-panel-group']",
    );

    expect(group).toHaveClass("rounded-lg");
    expect(group).toHaveClass("flex");
    expect(group).toHaveClass("h-full");
  });
});
