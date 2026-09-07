import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarLabel,
  MenubarItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
} from "./menubar";

type MenubarOverrides = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

function renderMenubar(
  props: MenubarOverrides = {},
  handlers: { onSelect?: () => void } = {},
) {
  return render(
    <Menubar {...props}>
      <MenubarMenu value="orders">
        <MenubarTrigger>Orders</MenubarTrigger>

        <MenubarContent>
          <MenubarLabel>Order actions</MenubarLabel>

          <MenubarSeparator />

          <MenubarGroup>
            <MenubarItem onSelect={handlers.onSelect}>
              Reorder
              <MenubarShortcut>Ctrl R</MenubarShortcut>
            </MenubarItem>

            <MenubarItem disabled>
              Cancel order
            </MenubarItem>
          </MenubarGroup>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu value="reports">
        <MenubarTrigger>Reports</MenubarTrigger>

        <MenubarContent>
          <MenubarItem>Monthly summary</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>,
  );
}

/**
 * ============================================================================
 * Menubar
 * ============================================================================
 */
describe("Menubar", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Every menubar part should render with its own data-slot attribute.
   */
  it("sets the correct data-slot attributes", () => {
    const { container } = renderMenubar();

    expect(
      container.querySelector(
        "[data-slot='menubar']",
      ),
    ).toBeInTheDocument();

    expect(
      container.querySelectorAll(
        "[data-slot='menubar-trigger']",
      ),
    ).toHaveLength(2);
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The bar should be exposed with the menubar role.
   */
  it("renders with the menubar role", () => {
    renderMenubar();

    expect(
      screen.getByRole("menubar"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Clicking a trigger should open its menu.
   */
  it("opens a menu when its trigger is clicked", async () => {
    const user = userEvent.setup();

    renderMenubar();

    await user.click(
      screen.getByRole("menuitem", {
        name: "Orders",
      }),
    );

    expect(
      screen.getByRole("menu"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * defaultValue should open the matching menu.
   */
  it("respects defaultValue", () => {
    renderMenubar({ defaultValue: "orders" });

    expect(
      screen.getByRole("menu"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("menuitem", {
        name: /reorder/i,
      }),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Every menu part should render with its own data-slot attribute.
   */
  it("sets the correct data-slot attributes on the open menu", () => {
    renderMenubar({ defaultValue: "orders" });

    const menu = screen.getByRole("menu");

    expect(menu).toHaveAttribute(
      "data-slot",
      "menubar-content",
    );

    [
      "menubar-label",
      "menubar-separator",
      "menubar-group",
      "menubar-item",
      "menubar-shortcut",
    ].forEach((slot) => {
      expect(
        menu.querySelector(
          `[data-slot='${slot}']`,
        ),
      ).toBeInTheDocument();
    });
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Choosing an item should run its handler and close the menu.
   */
  it("runs the item handler and closes", async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    renderMenubar(
      { defaultValue: "orders" },
      { onSelect },
    );

    await user.click(
      screen.getByRole("menuitem", {
        name: /reorder/i,
      }),
    );

    expect(onSelect).toHaveBeenCalledTimes(1);

    expect(
      screen.queryByRole("menu"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Escape should dismiss the open menu.
   */
  it("closes when Escape is pressed", async () => {
    const user = userEvent.setup();

    renderMenubar({ defaultValue: "orders" });

    await user.keyboard("{Escape}");

    expect(
      screen.queryByRole("menu"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * onValueChange should report which menu opened.
   */
  it("calls onValueChange when a menu opens", async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();

    renderMenubar({ onValueChange });

    await user.click(
      screen.getByRole("menuitem", {
        name: "Orders",
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
   * Checkbox items should report their state.
   */
  it("supports checkbox items", () => {
    render(
      <Menubar defaultValue="view">
        <MenubarMenu value="view">
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem checked>
              Show cancelled
            </MenubarCheckboxItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );

    expect(
      screen.getByRole("menuitemcheckbox"),
    ).toHaveAttribute("aria-checked", "true");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Radio items should report the selected value.
   */
  it("supports radio items", () => {
    render(
      <Menubar defaultValue="sort">
        <MenubarMenu value="sort">
          <MenubarTrigger>Sort</MenubarTrigger>
          <MenubarContent>
            <MenubarRadioGroup value="newest">
              <MenubarRadioItem value="newest">
                Newest first
              </MenubarRadioItem>
              <MenubarRadioItem value="oldest">
                Oldest first
              </MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );

    expect(
      screen.getByRole("menuitemradio", {
        name: "Newest first",
      }),
    ).toHaveAttribute("aria-checked", "true");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * No menu may be open until the user asks for one.
   */
  it("does not open any menu by default", () => {
    renderMenubar();

    expect(
      screen.queryByRole("menu"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Order actions"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Opening one menu must close the other - only one may be open at a
   * time.
   */
  it("does not keep two menus open at once", async () => {
    const user = userEvent.setup();

    renderMenubar({ defaultValue: "orders" });

    await user.click(
      screen.getByRole("menuitem", {
        name: "Reports",
      }),
    );

    expect(
      screen.queryAllByRole("menu").length,
    ).toBeLessThanOrEqual(1);

    expect(
      screen.queryByText("Order actions"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Reorder"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A disabled item must not run its handler or close the menu.
   */
  it("does not run a disabled item", async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    render(
      <Menubar defaultValue="orders">
        <MenubarMenu value="orders">
          <MenubarTrigger>Orders</MenubarTrigger>
          <MenubarContent>
            <MenubarItem disabled onSelect={onSelect}>
              Cancel order
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );

    await user.click(
      screen.getByRole("menuitem", {
        name: "Cancel order",
      }),
    );

    expect(onSelect).not.toHaveBeenCalled();

    expect(
      screen.getByRole("menu"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A label is a heading, not a choice - it must NOT be exposed as a
   * selectable menu item.
   */
  it("does not expose the label as a menu item", () => {
    renderMenubar({ defaultValue: "orders" });

    expect(
      screen.queryByRole("menuitem", {
        name: "Order actions",
      }),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Closing must remove the menu content, not merely hide it.
   */
  it("does not leave the items in the DOM after closing", async () => {
    const user = userEvent.setup();

    renderMenubar({ defaultValue: "orders" });

    await user.keyboard("{Escape}");

    expect(
      screen.queryByText("Reorder"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A controlled menubar must not open a menu on its own.
   */
  it("does not open a controlled menubar without a handler", async () => {
    const user = userEvent.setup();

    renderMenubar({ value: "" });

    await user.click(
      screen.getByRole("menuitem", {
        name: "Orders",
      }),
    );

    expect(
      screen.queryByRole("menu"),
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

    renderMenubar({
      defaultValue: "orders",
      onValueChange,
    });

    expect(onValueChange).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A keyboard shortcut hint must not be a separate control.
   */
  it("does not make the shortcut hint interactive", () => {
    renderMenubar({ defaultValue: "orders" });

    const shortcut = screen
      .getByRole("menu")
      .querySelector(
        "[data-slot='menubar-shortcut']",
      ) as HTMLElement;

    expect(shortcut.tagName).toBe("SPAN");
    expect(shortcut).not.toHaveAttribute("role");
    expect(shortcut).not.toHaveAttribute("tabindex");
  });
});
