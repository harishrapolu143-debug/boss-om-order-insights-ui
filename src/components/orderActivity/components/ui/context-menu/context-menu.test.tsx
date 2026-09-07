import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
} from "./context-menu";

type MenuOverrides = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function renderContextMenu(
  props: MenuOverrides = {},
  handlers: { onSelect?: () => void } = {},
) {
  return render(
    <ContextMenu {...props}>
      <ContextMenuTrigger>
        Order row
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuLabel>
          Order actions
        </ContextMenuLabel>

        <ContextMenuSeparator />

        <ContextMenuGroup>
          <ContextMenuItem
            onSelect={handlers.onSelect}
          >
            Reorder
            <ContextMenuShortcut>
              Ctrl R
            </ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuItem disabled>
            Cancel order
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>,
  );
}

async function openContextMenu(
  user: ReturnType<typeof userEvent.setup>,
) {
  await user.pointer({
    keys: "[MouseRight]",
    target: screen.getByText("Order row"),
  });
}

/**
 * ============================================================================
 * ContextMenu
 * ============================================================================
 */
describe("ContextMenu", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The trigger should render with the expected data-slot attribute.
   */
  it("sets the correct data-slot attribute on the trigger", () => {
    renderContextMenu();

    expect(
      screen.getByText("Order row"),
    ).toHaveAttribute(
      "data-slot",
      "context-menu-trigger",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A right click should open the menu.
   */
  it("opens on a right click", async () => {
    const user = userEvent.setup();

    renderContextMenu();

    await openContextMenu(user);

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
  it("sets the correct data-slot attributes on the open menu", async () => {
    const user = userEvent.setup();

    renderContextMenu();

    await openContextMenu(user);

    const menu = screen.getByRole("menu");

    expect(menu).toHaveAttribute(
      "data-slot",
      "context-menu-content",
    );

    [
      "context-menu-label",
      "context-menu-separator",
      "context-menu-group",
      "context-menu-item",
      "context-menu-shortcut",
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
  it("exposes its items as menu items", async () => {
    const user = userEvent.setup();

    renderContextMenu();

    await openContextMenu(user);

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

    renderContextMenu({}, { onSelect });

    await openContextMenu(user);

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

    renderContextMenu();

    await openContextMenu(user);

    await user.keyboard("{Escape}");

    expect(
      screen.queryByRole("menu"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * onOpenChange should report the new state.
   */
  it("calls onOpenChange when the menu opens", async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();

    renderContextMenu({ onOpenChange });

    await openContextMenu(user);

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Checkbox items should report their state.
   */
  it("supports checkbox items", async () => {
    const user = userEvent.setup();

    render(
      <ContextMenu>
        <ContextMenuTrigger>Order row</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuCheckboxItem checked>
            Show cancelled
          </ContextMenuCheckboxItem>
        </ContextMenuContent>
      </ContextMenu>,
    );

    await openContextMenu(user);

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
  it("supports radio items", async () => {
    const user = userEvent.setup();

    render(
      <ContextMenu>
        <ContextMenuTrigger>Order row</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuRadioGroup value="newest">
            <ContextMenuRadioItem value="newest">
              Newest first
            </ContextMenuRadioItem>
            <ContextMenuRadioItem value="oldest">
              Oldest first
            </ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>,
    );

    await openContextMenu(user);

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
    renderContextMenu();

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
   * A plain left click must NOT open a context menu.
   */
  it("does not open on a left click", async () => {
    const user = userEvent.setup();

    renderContextMenu();

    await user.click(
      screen.getByText("Order row"),
    );

    expect(
      screen.queryByRole("menu"),
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
      <ContextMenu>
        <ContextMenuTrigger>Order row</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem disabled onSelect={onSelect}>
            Cancel order
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );

    await openContextMenu(user);

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
  it("does not expose the label as a menu item", async () => {
    const user = userEvent.setup();

    renderContextMenu();

    await openContextMenu(user);

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

    renderContextMenu();

    await openContextMenu(user);

    await user.keyboard("{Escape}");

    expect(
      screen.queryByText("Reorder"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A disabled trigger must not open the menu.
   *
   * Note that ContextMenu has no controlled `open` prop - the browser
   * gesture is the only way in - so disabling the trigger is how a
   * caller suppresses the menu.
   */
  it("does not open from a disabled trigger", async () => {
    const user = userEvent.setup();

    render(
      <ContextMenu>
        <ContextMenuTrigger disabled>
          Order row
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Reorder</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );

    await openContextMenu(user);

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

    renderContextMenu({ onOpenChange });

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A keyboard shortcut hint must not be a separate control.
   */
  it("does not make the shortcut hint interactive", async () => {
    const user = userEvent.setup();

    renderContextMenu();

    await openContextMenu(user);

    const shortcut = screen
      .getByRole("menu")
      .querySelector(
        "[data-slot='context-menu-shortcut']",
      ) as HTMLElement;

    expect(shortcut.tagName).toBe("SPAN");
    expect(shortcut).not.toHaveAttribute("role");
    expect(shortcut).not.toHaveAttribute("tabindex");
  });
});
