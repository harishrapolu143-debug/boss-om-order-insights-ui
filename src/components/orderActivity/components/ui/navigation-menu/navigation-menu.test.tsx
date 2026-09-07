import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "./navigation-menu";

type NavMenuOverrides = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  viewport?: boolean;
};

function renderNavigationMenu(
  props: NavMenuOverrides = {},
) {
  return render(
    <NavigationMenu {...props}>
      <NavigationMenuList>
        <NavigationMenuItem value="orders">
          <NavigationMenuTrigger>
            Orders
          </NavigationMenuTrigger>

          <NavigationMenuContent>
            <NavigationMenuLink href="/orders/open">
              Open orders
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem value="reports">
          <NavigationMenuLink href="/reports">
            Reports
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>,
  );
}

/**
 * ============================================================================
 * NavigationMenu
 * ============================================================================
 */
describe("NavigationMenu", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Every navigation menu part should render with its own data-slot
   * attribute.
   */
  it("sets the correct data-slot attributes", () => {
    const { container } = renderNavigationMenu({
      defaultValue: "orders",
    });

    [
      "navigation-menu",
      "navigation-menu-list",
      "navigation-menu-item",
      "navigation-menu-trigger",
      "navigation-menu-content",
      "navigation-menu-link",
      "navigation-menu-viewport",
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
   * The menu should be a navigation landmark.
   */
  it("renders as a navigation landmark", () => {
    renderNavigationMenu();

    expect(
      screen.getByRole("navigation"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Plain links should navigate directly.
   */
  it("renders a plain link for items with no submenu", () => {
    renderNavigationMenu();

    expect(
      screen.getByRole("link", {
        name: "Reports",
      }),
    ).toHaveAttribute("href", "/reports");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Clicking a trigger should open its submenu.
   */
  it("opens a submenu when its trigger is clicked", async () => {
    const user = userEvent.setup();

    renderNavigationMenu();

    await user.click(
      screen.getByRole("button", {
        name: /orders/i,
      }),
    );

    expect(
      await screen.findByRole("link", {
        name: "Open orders",
      }),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * defaultValue should open the matching submenu.
   */
  it("respects defaultValue", () => {
    renderNavigationMenu({
      defaultValue: "orders",
    });

    expect(
      screen.getByRole("link", {
        name: "Open orders",
      }),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The trigger should report the open state.
   */
  it("reports the open state on the trigger", () => {
    renderNavigationMenu({
      defaultValue: "orders",
    });

    expect(
      screen.getByRole("button", {
        name: /orders/i,
      }),
    ).toHaveAttribute("data-state", "open");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * onValueChange should report which submenu opened.
   */
  it("calls onValueChange when a submenu opens", async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();

    renderNavigationMenu({ onValueChange });

    await user.click(
      screen.getByRole("button", {
        name: /orders/i,
      }),
    );

    expect(onValueChange).toHaveBeenCalledWith(
      "orders",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The shared trigger style helper should produce usable classes.
   */
  it("exposes a reusable trigger style", () => {
    expect(
      navigationMenuTriggerStyle(),
    ).toContain("inline-flex");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A custom className should be merged with the defaults.
   */
  it("merges a custom className with the defaults", () => {
    const { container } = render(
      <NavigationMenu className="w-full">
        <NavigationMenuList className="gap-4">
          <NavigationMenuItem value="reports">
            <NavigationMenuLink href="/reports">
              Reports
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    expect(
      container.querySelector(
        "[data-slot='navigation-menu']",
      ),
    ).toHaveClass("w-full", "relative");

    expect(
      container.querySelector(
        "[data-slot='navigation-menu-list']",
      ),
    ).toHaveClass("gap-4", "flex");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A submenu must NOT be in the DOM until it is opened.
   */
  it("does not render a submenu while closed", () => {
    renderNavigationMenu();

    expect(
      screen.queryByRole("link", {
        name: "Open orders",
      }),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A closed trigger must not report itself as open.
   */
  it("does not report a closed trigger as open", () => {
    renderNavigationMenu();

    expect(
      screen.getByRole("button", {
        name: /orders/i,
      }),
    ).toHaveAttribute("data-state", "closed");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * An item with no submenu must NOT render a trigger button.
   */
  it("does not render a trigger for an item with no submenu", () => {
    renderNavigationMenu();

    expect(
      screen.queryByRole("button", {
        name: /reports/i,
      }),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A submenu trigger must NOT navigate - it opens a panel instead.
   */
  it("does not give the submenu trigger a destination", () => {
    renderNavigationMenu();

    const trigger = screen.getByRole("button", {
      name: /orders/i,
    });

    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger).not.toHaveAttribute("href");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A controlled menu must not open a submenu on its own.
   */
  it("does not open a controlled menu without a handler", async () => {
    const user = userEvent.setup();

    renderNavigationMenu({ value: "" });

    await user.click(
      screen.getByRole("button", {
        name: /orders/i,
      }),
    );

    expect(
      screen.queryByRole("link", {
        name: "Open orders",
      }),
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

    renderNavigationMenu({
      defaultValue: "orders",
      onValueChange,
    });

    expect(onValueChange).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * With the viewport turned off, no viewport element may be rendered.
   */
  it("does not render a viewport when it is turned off", () => {
    const { container } = renderNavigationMenu({
      viewport: false,
    });

    expect(
      container.querySelector(
        "[data-slot='navigation-menu-viewport']",
      ),
    ).not.toBeInTheDocument();
  });
});
