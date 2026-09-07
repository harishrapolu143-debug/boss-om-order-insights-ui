import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectSeparator,
} from "./select";

type SelectOverrides = {
  open?: boolean;
  defaultOpen?: boolean;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
};

function renderSelect(
  props: SelectOverrides = {},
  triggerProps: { isLoading?: boolean } = {},
) {
  return render(
    <Select {...props}>
      <SelectTrigger
        aria-label="Shipping method"
        {...triggerProps}
      >
        <SelectValue placeholder="Choose a method" />
      </SelectTrigger>

      <SelectContent>
        <SelectGroup>
          <SelectLabel>Domestic</SelectLabel>

          <SelectItem value="standard">
            Standard
          </SelectItem>

          <SelectItem value="express">
            Express
          </SelectItem>
        </SelectGroup>

        <SelectSeparator />

        <SelectItem value="overnight" disabled>
          Overnight
        </SelectItem>
      </SelectContent>
    </Select>,
  );
}

/**
 * ============================================================================
 * Select
 * ============================================================================
 */
describe("Select", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The trigger should render with the expected data-slot attribute.
   */
  it("sets the correct data-slot attribute on the trigger", () => {
    renderSelect();

    expect(
      screen.getByRole("combobox"),
    ).toHaveAttribute(
      "data-slot",
      "select-trigger",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The trigger should be exposed as a combobox.
   */
  it("renders the trigger as a combobox", () => {
    renderSelect();

    expect(
      screen.getByRole("combobox", {
        name: "Shipping method",
      }),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The placeholder should be shown until something is chosen.
   */
  it("shows the placeholder while nothing is selected", () => {
    renderSelect();

    expect(
      screen.getByText("Choose a method"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * defaultValue should be shown on the trigger.
   */
  it("shows the default value on the trigger", () => {
    renderSelect({ defaultValue: "express" });

    expect(
      screen.getByRole("combobox"),
    ).toHaveTextContent("Express");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Clicking the trigger should open the listbox.
   */
  it("opens when the trigger is clicked", async () => {
    const user = userEvent.setup();

    renderSelect();

    await user.click(screen.getByRole("combobox"));

    expect(
      screen.getByRole("listbox"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Every select part should render with its own data-slot attribute.
   */
  it("sets the correct data-slot attributes on the open list", () => {
    renderSelect({ defaultOpen: true });

    const list = screen.getByRole("listbox");

    expect(list).toHaveAttribute(
      "data-slot",
      "select-content",
    );

    [
      "select-group",
      "select-label",
      "select-item",
      "select-separator",
    ].forEach((slot) => {
      expect(
        list.querySelector(
          `[data-slot='${slot}']`,
        ),
      ).toBeInTheDocument();
    });
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The options should be exposed as options.
   */
  it("exposes its items as options", () => {
    renderSelect({ defaultOpen: true });

    expect(
      screen.getAllByRole("option"),
    ).toHaveLength(3);
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Choosing an option should select it and close the list.
   */
  it("selects an option and closes", async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();

    renderSelect({
      defaultOpen: true,
      onValueChange,
    });

    await user.click(
      screen.getByRole("option", {
        name: "Express",
      }),
    );

    expect(onValueChange).toHaveBeenCalledWith(
      "express",
    );

    expect(
      screen.queryByRole("listbox"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The selected option should be marked.
   */
  it("marks the selected option", () => {
    renderSelect({
      defaultOpen: true,
      defaultValue: "express",
    });

    expect(
      screen.getByRole("option", {
        name: "Express",
      }),
    ).toHaveAttribute("data-state", "checked");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Escape should dismiss the list.
   */
  it("closes when Escape is pressed", async () => {
    const user = userEvent.setup();

    renderSelect({ defaultOpen: true });

    await user.keyboard("{Escape}");

    expect(
      screen.queryByRole("listbox"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The loading state should replace the chevron with a spinner.
   */
  it("renders a spinner while loading", () => {
    const { container } = renderSelect(
      {},
      { isLoading: true },
    );

    expect(
      container.querySelector(".animate-spin"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The trigger size should be reflected for styling.
   */
  it("reflects the trigger size", () => {
    render(
      <Select>
        <SelectTrigger
          size="sm"
          aria-label="Shipping method"
        >
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="standard">
            Standard
          </SelectItem>
        </SelectContent>
      </Select>,
    );

    expect(
      screen.getByRole("combobox"),
    ).toHaveAttribute("data-size", "sm");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The list must NOT be in the DOM until it is opened.
   */
  it("does not render the list while closed", () => {
    renderSelect();

    expect(
      screen.queryByRole("listbox"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("option"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A disabled select must not open.
   */
  it("does not open while disabled", async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();

    renderSelect({
      disabled: true,
      onOpenChange,
    });

    await user.click(screen.getByRole("combobox"));

    expect(
      screen.queryByRole("listbox"),
    ).not.toBeInTheDocument();

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A disabled option must not become the value.
   */
  it("does not select a disabled option", async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();

    renderSelect({
      defaultOpen: true,
      onValueChange,
    });

    await user.click(
      screen.getByRole("option", {
        name: "Overnight",
      }),
    );

    expect(onValueChange).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A group label is a heading, not a choice - it must NOT be exposed as
   * a selectable option.
   */
  it("does not expose the group label as an option", () => {
    renderSelect({ defaultOpen: true });

    expect(
      screen.queryByRole("option", {
        name: "Domestic",
      }),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Only one option may be selected at a time.
   */
  it("does not mark more than one option as selected", () => {
    renderSelect({
      defaultOpen: true,
      defaultValue: "express",
    });

    expect(
      screen
        .getAllByRole("option")
        .filter(
          (option) =>
            option.getAttribute("data-state") ===
            "checked",
        ),
    ).toHaveLength(1);
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The placeholder must NOT be treated as a chosen value.
   */
  it("does not treat the placeholder as a value", () => {
    renderSelect();

    expect(
      screen.getByRole("combobox"),
    ).toHaveAttribute("data-placeholder");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A controlled select must not change on its own.
   */
  it("does not change a controlled select without a handler", async () => {
    const user = userEvent.setup();

    renderSelect({
      value: "standard",
      defaultOpen: true,
    });

    await user.click(
      screen.getByRole("option", {
        name: "Express",
      }),
    );

    expect(
      screen.getByRole("combobox"),
    ).toHaveTextContent("Standard");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * onValueChange must not fire on the initial render.
   */
  it("does not call onValueChange on initial render", () => {
    const onValueChange = jest.fn();

    renderSelect({
      defaultValue: "express",
      onValueChange,
    });

    expect(onValueChange).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The chevron icon must not be a click target of its own, otherwise it
   * would swallow the trigger's click.
   */
  it("does not make the trigger icon a separate click target", () => {
    renderSelect();

    expect(
      screen.getByRole("combobox").className,
    ).toContain("[&_svg]:pointer-events-none");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The loading spinner must not be shown once loading has finished.
   */
  it("does not render a spinner when not loading", () => {
    const { container } = renderSelect();

    expect(
      container.querySelector(".animate-spin"),
    ).not.toBeInTheDocument();
  });
});
