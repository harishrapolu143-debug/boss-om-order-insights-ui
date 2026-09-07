import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {
  ToggleGroup,
  ToggleGroupItem,
} from "./toggle-group";

type SingleGroupOverrides = {
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
};

function renderSingleGroup(
  props: SingleGroupOverrides = {},
) {
  return render(
    <ToggleGroup type="single" {...props}>
      <ToggleGroupItem value="left">
        Left
      </ToggleGroupItem>
      <ToggleGroupItem value="center">
        Center
      </ToggleGroupItem>
      <ToggleGroupItem value="right" disabled>
        Right
      </ToggleGroupItem>
    </ToggleGroup>,
  );
}

/**
 * ============================================================================
 * ToggleGroup
 * ============================================================================
 */
describe("ToggleGroup", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Every toggle group part should render with its own data-slot
   * attribute.
   */
  it("sets the correct data-slot attributes", () => {
    const { container } = renderSingleGroup();

    expect(
      container.querySelector(
        "[data-slot='toggle-group']",
      ),
    ).toBeInTheDocument();

    expect(
      container.querySelectorAll(
        "[data-slot='toggle-group-item']",
      ),
    ).toHaveLength(3);
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The items should render their labels.
   */
  it("renders every item", () => {
    renderSingleGroup();

    ["Left", "Center", "Right"].forEach((label) => {
      expect(
        screen.getByRole("radio", { name: label }),
      ).toBeInTheDocument();
    });
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * defaultValue should preselect the matching item.
   */
  it("respects defaultValue", () => {
    renderSingleGroup({ defaultValue: "center" });

    expect(
      screen.getByRole("radio", { name: "Center" }),
    ).toHaveAttribute("data-state", "on");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Clicking an item should select it.
   */
  it("selects an item when clicked", async () => {
    const user = userEvent.setup();

    renderSingleGroup();

    await user.click(
      screen.getByRole("radio", { name: "Center" }),
    );

    expect(
      screen.getByRole("radio", { name: "Center" }),
    ).toHaveAttribute("data-state", "on");
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

    renderSingleGroup({ onValueChange });

    await user.click(
      screen.getByRole("radio", { name: "Center" }),
    );

    expect(onValueChange).toHaveBeenCalledWith(
      "center",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A multiple group should allow more than one item to be selected.
   */
  it("allows multiple items to be selected in a multiple group", async () => {
    const user = userEvent.setup();

    render(
      <ToggleGroup type="multiple">
        <ToggleGroupItem value="bold">
          Bold
        </ToggleGroupItem>
        <ToggleGroupItem value="italic">
          Italic
        </ToggleGroupItem>
      </ToggleGroup>,
    );

    await user.click(
      screen.getByRole("button", { name: "Bold" }),
    );

    await user.click(
      screen.getByRole("button", { name: "Italic" }),
    );

    expect(
      screen.getByRole("button", { name: "Bold" }),
    ).toHaveAttribute("data-state", "on");

    expect(
      screen.getByRole("button", { name: "Italic" }),
    ).toHaveAttribute("data-state", "on");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The group variant should be passed down to every item through
   * context.
   */
  it("passes the variant down to its items", () => {
    const { container } = render(
      <ToggleGroup type="single" variant="outline">
        <ToggleGroupItem value="left">
          Left
        </ToggleGroupItem>
      </ToggleGroup>,
    );

    expect(
      container.querySelector(
        "[data-slot='toggle-group']",
      ),
    ).toHaveAttribute("data-variant", "outline");

    expect(
      container.querySelector(
        "[data-slot='toggle-group-item']",
      ),
    ).toHaveAttribute("data-variant", "outline");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The group size should be passed down to every item through context.
   */
  it("passes the size down to its items", () => {
    const { container } = render(
      <ToggleGroup type="single" size="sm">
        <ToggleGroupItem value="left">
          Left
        </ToggleGroupItem>
      </ToggleGroup>,
    );

    expect(
      container.querySelector(
        "[data-slot='toggle-group-item']",
      ),
    ).toHaveAttribute("data-size", "sm");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Arrow keys should move focus between items.
   */
  it("moves focus between items with the arrow keys", async () => {
    const user = userEvent.setup();

    renderSingleGroup({ defaultValue: "left" });

    screen
      .getByRole("radio", { name: "Left" })
      .focus();

    await user.keyboard("{ArrowRight}");

    expect(
      screen.getByRole("radio", { name: "Center" }),
    ).toHaveFocus();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A custom className should be merged with the defaults.
   */
  it("merges a custom className with the defaults", () => {
    const { container } = render(
      <ToggleGroup type="single" className="w-full">
        <ToggleGroupItem
          value="left"
          className="font-bold"
        >
          Left
        </ToggleGroupItem>
      </ToggleGroup>,
    );

    expect(
      container.querySelector(
        "[data-slot='toggle-group']",
      ),
    ).toHaveClass("w-full", "flex");

    expect(
      container.querySelector(
        "[data-slot='toggle-group-item']",
      ),
    ).toHaveClass("font-bold");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Nothing may be selected until the user chooses.
   */
  it("does not select anything by default", () => {
    renderSingleGroup();

    screen
      .getAllByRole("radio")
      .forEach((item) => {
        expect(item).toHaveAttribute(
          "data-state",
          "off",
        );
      });
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A single group must NOT keep two items selected at once.
   */
  it("does not keep two items selected in a single group", async () => {
    const user = userEvent.setup();

    renderSingleGroup({ defaultValue: "left" });

    await user.click(
      screen.getByRole("radio", { name: "Center" }),
    );

    expect(
      screen.getByRole("radio", { name: "Left" }),
    ).toHaveAttribute("data-state", "off");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A multiple group must NOT deselect the previous item when a new one
   * is chosen.
   */
  it("does not deselect the previous item in a multiple group", async () => {
    const user = userEvent.setup();

    render(
      <ToggleGroup
        type="multiple"
        defaultValue={["bold"]}
      >
        <ToggleGroupItem value="bold">
          Bold
        </ToggleGroupItem>
        <ToggleGroupItem value="italic">
          Italic
        </ToggleGroupItem>
      </ToggleGroup>,
    );

    await user.click(
      screen.getByRole("button", { name: "Italic" }),
    );

    expect(
      screen.getByRole("button", { name: "Bold" }),
    ).toHaveAttribute("data-state", "on");
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

    renderSingleGroup({ onValueChange });

    await user.click(
      screen.getByRole("radio", { name: "Right" }),
    );

    expect(
      screen.getByRole("radio", { name: "Right" }),
    ).toHaveAttribute("data-state", "off");

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

    renderSingleGroup({
      disabled: true,
      onValueChange,
    });

    await user.click(
      screen.getByRole("radio", { name: "Center" }),
    );

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

    renderSingleGroup({ value: "left" });

    await user.click(
      screen.getByRole("radio", { name: "Center" }),
    );

    expect(
      screen.getByRole("radio", { name: "Center" }),
    ).toHaveAttribute("data-state", "off");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * onValueChange must not fire on the initial render.
   */
  it("does not call onValueChange on initial render", () => {
    const onValueChange = jest.fn();

    renderSingleGroup({
      defaultValue: "center",
      onValueChange,
    });

    expect(onValueChange).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Items must not keep rounded corners in the middle of the group -
   * only the first and last item are rounded.
   */
  it("does not round the corners of every item", () => {
    const { container } = renderSingleGroup();

    container
      .querySelectorAll(
        "[data-slot='toggle-group-item']",
      )
      .forEach((item) => {
        expect(item).toHaveClass("rounded-none");
      });
  });
});
