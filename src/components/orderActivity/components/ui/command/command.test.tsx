import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "./command";

function renderCommand(
  handlers: { onSelect?: () => void } = {},
) {
  return render(
    <Command>
      <CommandInput placeholder="Search orders" />

      <CommandList>
        <CommandEmpty>No results found</CommandEmpty>

        <CommandGroup heading="Orders">
          <CommandItem onSelect={handlers.onSelect}>
            Reorder
            <CommandShortcut>Ctrl R</CommandShortcut>
          </CommandItem>

          <CommandItem>Cancel order</CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Reports">
          <CommandItem disabled>
            Monthly summary
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>,
  );
}

/**
 * ============================================================================
 * Command
 * ============================================================================
 */
describe("Command", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Every command part should render with its own data-slot attribute.
   */
  it("sets the correct data-slot attributes for every part", () => {
    const { container } = renderCommand();

    [
      "command",
      "command-input",
      "command-input-wrapper",
      "command-list",
      "command-group",
      "command-item",
      "command-shortcut",
      "command-separator",
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
   * The palette should be exposed as a searchable listbox.
   */
  it("renders a search box and a list", () => {
    renderCommand();

    expect(
      screen.getByPlaceholderText("Search orders"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("listbox"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * All items should be listed before any search is typed.
   */
  it("lists every item by default", () => {
    renderCommand();

    expect(
      screen.getByText("Reorder"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Cancel order"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Monthly summary"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Typing should narrow the list to matching items.
   */
  it("filters the list as the user types", async () => {
    const user = userEvent.setup();

    renderCommand();

    await user.type(
      screen.getByPlaceholderText("Search orders"),
      "reorder",
    );

    expect(
      screen.getByText("Reorder"),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Cancel order"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A search with no matches should show the empty state.
   */
  it("shows the empty state when nothing matches", async () => {
    const user = userEvent.setup();

    renderCommand();

    await user.type(
      screen.getByPlaceholderText("Search orders"),
      "zzzz",
    );

    expect(
      screen.getByText("No results found"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Group headings should be rendered.
   */
  it("renders its group headings", () => {
    renderCommand();

    expect(
      screen.getByText("Orders"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Reports"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Choosing an item should run its handler.
   */
  it("runs the item handler when selected", async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    renderCommand({ onSelect });

    await user.click(
      screen.getByText("Reorder"),
    );

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A custom className should be merged with the defaults.
   */
  it("merges a custom className with the defaults", () => {
    const { container } = render(
      <Command className="max-w-md">
        <CommandList>
          <CommandItem>Reorder</CommandItem>
        </CommandList>
      </Command>,
    );

    const root = container.querySelector(
      "[data-slot='command']",
    );

    expect(root).toHaveClass("max-w-md");
    expect(root).toHaveClass("flex");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The empty state must NOT be shown while there are matching items.
   */
  it("does not show the empty state while items match", () => {
    renderCommand();

    expect(
      screen.queryByText("No results found"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Filtered out items must be removed from the list, not merely hidden,
   * so the keyboard cannot land on them.
   */
  it("does not keep filtered out items in the list", async () => {
    const user = userEvent.setup();

    renderCommand();

    await user.type(
      screen.getByPlaceholderText("Search orders"),
      "monthly",
    );

    expect(
      screen.queryByText("Reorder"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Cancel order"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A group whose items are all filtered out must NOT stay visible.
   *
   * cmdk keeps the empty group mounted and marks it hidden rather than
   * unmounting it, so the assertion is about visibility.
   */
  it("does not leave an empty group heading visible", async () => {
    const user = userEvent.setup();

    renderCommand();

    await user.type(
      screen.getByPlaceholderText("Search orders"),
      "monthly",
    );

    expect(
      screen.getByText("Orders"),
    ).not.toBeVisible();

    expect(
      screen.getByText("Reports"),
    ).toBeVisible();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A disabled item must not run its handler.
   */
  it("does not run a disabled item", async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    render(
      <Command>
        <CommandList>
          <CommandItem disabled onSelect={onSelect}>
            Monthly summary
          </CommandItem>
        </CommandList>
      </Command>,
    );

    await user.click(
      screen.getByText("Monthly summary"),
    );

    expect(onSelect).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A group heading must NOT be selectable as a command.
   */
  it("does not expose group headings as options", () => {
    renderCommand();

    expect(
      screen.queryByRole("option", {
        name: "Orders",
      }),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The search box must not carry a stale value of its own.
   */
  it("does not start with a value in the search box", () => {
    renderCommand();

    expect(
      screen.getByPlaceholderText("Search orders"),
    ).toHaveValue("");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A keyboard shortcut hint must not be a separate control.
   */
  it("does not make the shortcut hint interactive", () => {
    const { container } = renderCommand();

    const shortcut = container.querySelector(
      "[data-slot='command-shortcut']",
    ) as HTMLElement;

    expect(shortcut.tagName).toBe("SPAN");
    expect(shortcut).not.toHaveAttribute("role");
    expect(shortcut).not.toHaveAttribute("tabindex");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Clearing the search must restore the full list rather than leaving
   * the filtered view behind.
   */
  it("does not stay filtered after the search is cleared", async () => {
    const user = userEvent.setup();

    renderCommand();

    const input = screen.getByPlaceholderText(
      "Search orders",
    );

    await user.type(input, "monthly");
    await user.clear(input);

    expect(
      screen.getByText("Reorder"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Cancel order"),
    ).toBeInTheDocument();
  });
});
