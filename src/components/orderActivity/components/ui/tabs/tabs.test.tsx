import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "./tabs";

type TabsOverrides = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

function renderTabs(props: TabsOverrides = {}) {
  return render(
    <Tabs defaultValue="details" {...props}>
      <TabsList>
        <TabsTrigger value="details">
          Details
        </TabsTrigger>
        <TabsTrigger value="shipments">
          Shipments
        </TabsTrigger>
        <TabsTrigger value="invoices" disabled>
          Invoices
        </TabsTrigger>
      </TabsList>

      <TabsContent value="details">
        Order details panel
      </TabsContent>

      <TabsContent value="shipments">
        Shipments panel
      </TabsContent>

      <TabsContent value="invoices">
        Invoices panel
      </TabsContent>
    </Tabs>,
  );
}

/**
 * ============================================================================
 * Tabs
 * ============================================================================
 */
describe("Tabs", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Every tabs part should render with its own data-slot attribute.
   */
  it("sets the correct data-slot attributes for every part", () => {
    const { container } = renderTabs();

    [
      "tabs",
      "tabs-list",
      "tabs-trigger",
      "tabs-content",
    ].forEach((slot) => {
      expect(
        container.querySelector(
          `[data-slot='${slot}']`,
        ),
      ).toBeInTheDocument();
    });
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The triggers should be exposed as tabs inside a tablist.
   */
  it("exposes the triggers as tabs in a tablist", () => {
    renderTabs();

    expect(
      screen.getByRole("tablist"),
    ).toBeInTheDocument();

    expect(screen.getAllByRole("tab")).toHaveLength(
      3,
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * defaultValue should select the matching tab.
   */
  it("selects the default tab", () => {
    renderTabs();

    expect(
      screen.getByRole("tab", { name: "Details" }),
    ).toHaveAttribute("aria-selected", "true");

    expect(
      screen.getByText("Order details panel"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Clicking a tab should switch to its panel.
   */
  it("switches panels when a tab is clicked", async () => {
    const user = userEvent.setup();

    renderTabs();

    await user.click(
      screen.getByRole("tab", { name: "Shipments" }),
    );

    expect(
      screen.getByText("Shipments panel"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * onValueChange should report the newly selected tab.
   */
  it("calls onValueChange with the selected value", async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();

    renderTabs({ onValueChange });

    await user.click(
      screen.getByRole("tab", { name: "Shipments" }),
    );

    expect(onValueChange).toHaveBeenCalledWith(
      "shipments",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The active panel should be linked to its tab.
   */
  it("links the active tab to its panel", () => {
    renderTabs();

    const tab = screen.getByRole("tab", {
      name: "Details",
    });

    const panel = screen.getByRole("tabpanel");

    expect(tab).toHaveAttribute(
      "aria-controls",
      panel.id,
    );

    expect(panel).toHaveAttribute(
      "aria-labelledby",
      tab.id,
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Arrow keys should move between tabs.
   */
  it("moves between tabs with the arrow keys", async () => {
    const user = userEvent.setup();

    renderTabs();

    const details = screen.getByRole("tab", {
      name: "Details",
    });

    const shipments = screen.getByRole("tab", {
      name: "Shipments",
    });

    details.focus();

    await user.keyboard("{ArrowRight}");

    expect(shipments).toHaveFocus();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A controlled value should select the matching tab.
   */
  it("honours a controlled value prop", () => {
    renderTabs({
      value: "shipments",
      onValueChange: () => {},
    });

    expect(
      screen.getByText("Shipments panel"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A custom className should be merged with the defaults.
   */
  it("merges a custom className on every part", () => {
    const { container } = render(
      <Tabs
        defaultValue="details"
        className="custom-tabs"
      >
        <TabsList className="custom-list">
          <TabsTrigger
            value="details"
            className="custom-trigger"
          >
            Details
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="details"
          className="custom-content"
        >
          Order details panel
        </TabsContent>
      </Tabs>,
    );

    expect(
      container.querySelector("[data-slot='tabs']"),
    ).toHaveClass("custom-tabs", "flex-col");

    expect(
      container.querySelector(
        "[data-slot='tabs-list']",
      ),
    ).toHaveClass("custom-list", "bg-muted");

    expect(
      container.querySelector(
        "[data-slot='tabs-trigger']",
      ),
    ).toHaveClass("custom-trigger", "rounded-xl");

    expect(
      container.querySelector(
        "[data-slot='tabs-content']",
      ),
    ).toHaveClass("custom-content", "flex-1");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Only the active panel may be rendered - inactive panels must NOT be
   * in the DOM.
   */
  it("does not render inactive panels", () => {
    renderTabs();

    expect(
      screen.queryByText("Shipments panel"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Invoices panel"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Selecting a new tab must NOT leave the previous panel behind.
   */
  it("does not keep the previous panel open when another tab is selected", async () => {
    const user = userEvent.setup();

    renderTabs();

    await user.click(
      screen.getByRole("tab", { name: "Shipments" }),
    );

    expect(
      screen.queryByText("Order details panel"),
    ).not.toBeInTheDocument();

    expect(
      screen.getAllByRole("tabpanel"),
    ).toHaveLength(1);
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A disabled tab must not become selected.
   */
  it("does not select a disabled tab", async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();

    renderTabs({ onValueChange });

    await user.click(
      screen.getByRole("tab", { name: "Invoices" }),
    );

    expect(
      screen.queryByText("Invoices panel"),
    ).not.toBeInTheDocument();

    expect(onValueChange).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Arrow navigation must skip a disabled tab rather than parking focus
   * on it.
   */
  it("does not move focus onto a disabled tab", async () => {
    const user = userEvent.setup();

    renderTabs();

    screen
      .getByRole("tab", { name: "Shipments" })
      .focus();

    await user.keyboard("{ArrowRight}");

    expect(
      screen.getByRole("tab", { name: "Invoices" }),
    ).not.toHaveFocus();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A controlled tabs group must not change on its own.
   */
  it("does not switch a controlled tabs group without a handler", async () => {
    const user = userEvent.setup();

    renderTabs({ value: "details" });

    await user.click(
      screen.getByRole("tab", { name: "Shipments" }),
    );

    expect(
      screen.getByText("Order details panel"),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Shipments panel"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * onValueChange must not fire on the initial render.
   */
  it("does not call onValueChange on initial render", () => {
    const onValueChange = jest.fn();

    renderTabs({ onValueChange });

    expect(onValueChange).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * An unknown value must not render any panel.
   */
  it("does not render a panel for an unknown value", () => {
    renderTabs({
      value: "returns",
      onValueChange: () => {},
    });

    expect(
      screen.queryByRole("tabpanel"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Inactive tabs must not report themselves as selected.
   */
  it("does not mark inactive tabs as selected", () => {
    renderTabs();

    expect(
      screen.getByRole("tab", { name: "Shipments" }),
    ).toHaveAttribute("aria-selected", "false");

    expect(
      screen.getByRole("tab", { name: "Invoices" }),
    ).toHaveAttribute("aria-selected", "false");
  });
});
