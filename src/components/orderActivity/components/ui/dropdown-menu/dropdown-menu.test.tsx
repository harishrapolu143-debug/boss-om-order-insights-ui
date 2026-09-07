import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from "./dropdown-menu";

type MenuOverrides = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function renderMenu(
  props: MenuOverrides = {},
  handlers: { onSelect?: () => void } = {},
) {
  return render(
    <DropdownMenu {...props}>
      <DropdownMenuTrigger>Actions</DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuLabel>
          Order actions
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            onSelect={handlers.onSelect}
          >
            Reorder
            <DropdownMenuShortcut>
              Ctrl R
            </DropdownMenuShortcut>
          </DropdownMenuItem>

          <DropdownMenuItem disabled>
            Cancel order
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>,
  );
}

/**
 * ============================================================================
 * DropdownMenu
 * ============================================================================
 */
describe("DropdownMenu", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The trigger should render with the expected data-slot attribute.
   */
  it("sets the correct data-slot attribute on the trigger", () => {
    renderMenu();

    expect(
      screen.getByRole("button", {
        name: "Actions",
      }),
    ).toHaveAttribute(
      "data-slot",
      "dropdown-menu-trigger",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Clicking the trigger should open the menu.
   */
  it("opens when the trigger is clicked", async () => {
    const user = userEvent.setup();

    renderMenu();

    await user.click(
      screen.getByRole("button", {
        name: "Actions",
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
   * defaultOpen should render the menu straight away.
   */
  it("respects defaultOpen", () => {
    renderMenu({ defaultOpen: true });

    expect(
      screen.getByRole("menu"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Every menu part should render with its own data-slot attribute.
   */
  it("sets the correct data-slot attributes on the open menu", () => {
    renderMenu({ defaultOpen: true });

    const menu = screen.getByRole("menu");

    expect(menu).toHaveAttribute(
      "data-slot",
      "dropdown-menu-content",
    );

    [
      "dropdown-menu-label",
      "dropdown-menu-separator",
      "dropdown-menu-group",
      "dropdown-menu-item",
      "dropdown-menu-shortcut",
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
   * The items should be exposed as menu items.
   */
  it("exposes its items as menu items", () => {
    renderMenu({ defaultOpen: true });

    expect(
      screen.getAllByRole("menuitem"),
    ).toHaveLength(2);
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

    renderMenu({ defaultOpen: true }, { onSelect });

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
   * Escape should dismiss the menu.
   */
  it("closes when Escape is pressed", async () => {
    const user = userEvent.setup();

    renderMenu({ defaultOpen: true });

    await user.keyboard("{Escape}");

    expect(
      screen.queryByRole("menu"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Arrow keys should move between items.
   */
  it("moves between items with the arrow keys", async () => {
    const user = userEvent.setup();

    renderMenu({ defaultOpen: true });

    await user.keyboard("{ArrowDown}");

    expect(
      screen.getByRole("menuitem", {
        name: /reorder/i,
      }),
    ).toHaveFocus();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Checkbox items should report and toggle their state.
   */
  it("supports checkbox items", async () => {
    const user = userEvent.setup();
    const onCheckedChange = jest.fn();

    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem
            checked={false}
            onCheckedChange={onCheckedChange}
          >
            Show cancelled
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const item = screen.getByRole(
      "menuitemcheckbox",
      { name: "Show cancelled" },
    );

    expect(item).toHaveAttribute(
      "aria-checked",
      "false",
    );

    await user.click(item);

    expect(onCheckedChange).toHaveBeenCalledWith(
      true,
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Radio items should report the selected value.
   */
  it("supports radio items", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value="newest">
            <DropdownMenuRadioItem value="newest">
              Newest first
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="oldest">
              Oldest first
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
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
   * The menu must NOT be in the DOM until it is opened.
   */
  it("does not render the menu while closed", () => {
    renderMenu();

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
   * A disabled item must not run its handler or close the menu.
   */
  it("does not run a disabled item", async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            disabled
            onSelect={onSelect}
          >
            Cancel order
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
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
    renderMenu({ defaultOpen: true });

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
   * A separator must NOT be exposed as a selectable menu item.
   */
  it("does not expose the separator as a menu item", () => {
    renderMenu({ defaultOpen: true });

    const separator = screen
      .getByRole("menu")
      .querySelector(
        "[data-slot='dropdown-menu-separator']",
      ) as HTMLElement;

    expect(separator).not.toHaveAttribute(
      "role",
      "menuitem",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Closing must remove the menu content, not merely hide it.
   */
  it("does not leave the items in the DOM after closing", async () => {
    const user = userEvent.setup();

    renderMenu({ defaultOpen: true });

    await user.keyboard("{Escape}");

    expect(
      screen.queryByText("Reorder"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A controlled menu must not open on its own.
   */
  it("does not open a controlled menu without a handler", async () => {
    const user = userEvent.setup();

    renderMenu({ open: false });

    await user.click(
      screen.getByRole("button", {
        name: "Actions",
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
   * onOpenChange must not fire on the initial render.
   */
  it("does not call onOpenChange on initial render", () => {
    const onOpenChange = jest.fn();

    renderMenu({
      defaultOpen: true,
      onOpenChange,
    });

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * An unchecked checkbox item must not report itself as checked.
   */
  it("does not report an unchecked item as checked", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked={false}>
            Show cancelled
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    expect(
      screen.getByRole("menuitemcheckbox"),
    ).not.toBeChecked();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Only one radio item may be selected at a time.
   */
  it("does not select more than one radio item", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value="newest">
            <DropdownMenuRadioItem value="newest">
              Newest first
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="oldest">
              Oldest first
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    expect(
      screen
        .getAllByRole("menuitemradio")
        .filter(
          (item) =>
            item.getAttribute("aria-checked") ===
            "true",
        ),
    ).toHaveLength(1);
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A keyboard shortcut hint must not be a separate control.
   */
  it("does not make the shortcut hint interactive", () => {
    renderMenu({ defaultOpen: true });

    const shortcut = screen
      .getByRole("menu")
      .querySelector(
        "[data-slot='dropdown-menu-shortcut']",
      ) as HTMLElement;

    expect(shortcut.tagName).toBe("SPAN");
    expect(shortcut).not.toHaveAttribute("role");
    expect(shortcut).not.toHaveAttribute("tabindex");
  });
});
