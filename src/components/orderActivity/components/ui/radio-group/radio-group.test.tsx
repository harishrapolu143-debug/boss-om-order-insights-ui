import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { RadioGroup, RadioGroupItem } from "./radio-group";

type RadioGroupOverrides = {
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
};

function renderRadioGroup(
  props: RadioGroupOverrides = {},
) {
  return render(
    <RadioGroup {...props}>
      <RadioGroupItem
        value="standard"
        aria-label="Standard"
      />
      <RadioGroupItem
        value="express"
        aria-label="Express"
      />
      <RadioGroupItem
        value="overnight"
        aria-label="Overnight"
        disabled
      />
    </RadioGroup>,
  );
}

/**
 * ============================================================================
 * RadioGroup
 * ============================================================================
 */
describe("RadioGroup", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Every radio group part should render with its own data-slot attribute.
   */
  it("sets the correct data-slot attributes", () => {
    const { container } = renderRadioGroup();

    expect(
      container.querySelector(
        "[data-slot='radio-group']",
      ),
    ).toBeInTheDocument();

    expect(
      container.querySelectorAll(
        "[data-slot='radio-group-item']",
      ),
    ).toHaveLength(3);
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The group and its items should be exposed with the right roles.
   */
  it("exposes a radiogroup with radio items", () => {
    renderRadioGroup();

    expect(
      screen.getByRole("radiogroup"),
    ).toBeInTheDocument();

    expect(
      screen.getAllByRole("radio"),
    ).toHaveLength(3);
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * defaultValue should preselect the matching item.
   */
  it("respects defaultValue", () => {
    renderRadioGroup({ defaultValue: "express" });

    expect(
      screen.getByRole("radio", { name: "Express" }),
    ).toBeChecked();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Clicking an item should select it.
   */
  it("selects an item when clicked", async () => {
    const user = userEvent.setup();

    renderRadioGroup();

    await user.click(
      screen.getByRole("radio", { name: "Express" }),
    );

    expect(
      screen.getByRole("radio", { name: "Express" }),
    ).toBeChecked();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * onValueChange should report the newly selected value.
   */
  it("calls onValueChange with the selected value", async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();

    renderRadioGroup({ onValueChange });

    await user.click(
      screen.getByRole("radio", { name: "Express" }),
    );

    expect(onValueChange).toHaveBeenCalledWith(
      "express",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The indicator should appear on the selected item.
   */
  it("shows the indicator on the selected item", () => {
    const { container } = renderRadioGroup({
      defaultValue: "express",
    });

    expect(
      container.querySelectorAll(
        "[data-slot='radio-group-indicator']",
      ),
    ).toHaveLength(1);
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Arrow keys should move the roving focus within the group.
   */
  it("moves focus with the arrow keys", async () => {
    const user = userEvent.setup();

    renderRadioGroup({ defaultValue: "standard" });

    screen
      .getByRole("radio", { name: "Standard" })
      .focus();

    await user.keyboard("{ArrowDown}");

    expect(
      screen.getByRole("radio", { name: "Express" }),
    ).toHaveFocus();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A controlled group should follow its value prop.
   */
  it("honours a controlled value prop", () => {
    const { rerender } = render(
      <RadioGroup
        value="standard"
        onValueChange={() => {}}
      >
        <RadioGroupItem
          value="standard"
          aria-label="Standard"
        />
        <RadioGroupItem
          value="express"
          aria-label="Express"
        />
      </RadioGroup>,
    );

    expect(
      screen.getByRole("radio", { name: "Standard" }),
    ).toBeChecked();

    rerender(
      <RadioGroup
        value="express"
        onValueChange={() => {}}
      >
        <RadioGroupItem
          value="standard"
          aria-label="Standard"
        />
        <RadioGroupItem
          value="express"
          aria-label="Express"
        />
      </RadioGroup>,
    );

    expect(
      screen.getByRole("radio", { name: "Express" }),
    ).toBeChecked();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A custom className should be merged with the defaults.
   */
  it("merges a custom className with the defaults", () => {
    const { container } = render(
      <RadioGroup className="gap-8">
        <RadioGroupItem
          value="standard"
          aria-label="Standard"
          className="size-6"
        />
      </RadioGroup>,
    );

    expect(
      container.querySelector(
        "[data-slot='radio-group']",
      ),
    ).toHaveClass("gap-8", "grid");

    expect(
      container.querySelector(
        "[data-slot='radio-group-item']",
      ),
    ).toHaveClass("size-6", "rounded-full");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Nothing may be selected until the user chooses.
   */
  it("does not select anything by default", () => {
    renderRadioGroup();

    screen
      .getAllByRole("radio")
      .forEach((radio) => {
        expect(radio).not.toBeChecked();
      });
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The indicator must NOT be rendered on unselected items.
   */
  it("does not render an indicator on unselected items", () => {
    const { container } = renderRadioGroup();

    expect(
      container.querySelector(
        "[data-slot='radio-group-indicator']",
      ),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Selecting one item must deselect the previous one - a radio group is
   * single choice by definition.
   */
  it("does not keep two items selected at once", async () => {
    const user = userEvent.setup();

    renderRadioGroup({ defaultValue: "standard" });

    await user.click(
      screen.getByRole("radio", { name: "Express" }),
    );

    expect(
      screen.getByRole("radio", { name: "Standard" }),
    ).not.toBeChecked();

    expect(
      screen
        .getAllByRole("radio")
        .filter((radio) =>
          radio.getAttribute("aria-checked") ===
          "true",
        ),
    ).toHaveLength(1);
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A disabled item must not become selected.
   */
  it("does not select a disabled item", async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();

    renderRadioGroup({ onValueChange });

    await user.click(
      screen.getByRole("radio", {
        name: "Overnight",
      }),
    );

    expect(
      screen.getByRole("radio", {
        name: "Overnight",
      }),
    ).not.toBeChecked();

    expect(onValueChange).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Disabling the whole group must block every item.
   */
  it("does not select anything while the group is disabled", async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();

    renderRadioGroup({
      disabled: true,
      onValueChange,
    });

    await user.click(
      screen.getByRole("radio", { name: "Express" }),
    );

    expect(
      screen.getByRole("radio", { name: "Express" }),
    ).not.toBeChecked();

    expect(onValueChange).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A controlled group must not change on its own.
   */
  it("does not change a controlled group without a handler", async () => {
    const user = userEvent.setup();

    renderRadioGroup({ value: "standard" });

    await user.click(
      screen.getByRole("radio", { name: "Express" }),
    );

    expect(
      screen.getByRole("radio", { name: "Express" }),
    ).not.toBeChecked();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * onValueChange must not fire on the initial render.
   */
  it("does not call onValueChange on initial render", () => {
    const onValueChange = jest.fn();

    renderRadioGroup({
      defaultValue: "express",
      onValueChange,
    });

    expect(onValueChange).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Radio items are not checkboxes - they must not be exposed with the
   * checkbox role.
   */
  it("does not expose a checkbox role", () => {
    renderRadioGroup();

    expect(
      screen.queryByRole("checkbox"),
    ).not.toBeInTheDocument();
  });
});
