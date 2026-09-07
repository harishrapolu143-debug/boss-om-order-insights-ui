import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { Toggle } from "./toggle";

/**
 * ============================================================================
 * Toggle
 * ============================================================================
 */
describe("Toggle", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The Toggle should render with the expected data-slot attribute.
   */
  it("sets the correct data-slot attribute", () => {
    render(<Toggle>Bold</Toggle>);

    expect(
      screen.getByRole("button", { name: "Bold" }),
    ).toHaveAttribute("data-slot", "toggle");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The toggle should render its children.
   */
  it("renders its children", () => {
    render(<Toggle>Bold</Toggle>);

    expect(
      screen.getByRole("button", { name: "Bold" }),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The toggle should start in the off state.
   */
  it("is off by default", () => {
    render(<Toggle>Bold</Toggle>);

    const toggle = screen.getByRole("button", {
      name: "Bold",
    });

    expect(toggle).toHaveAttribute(
      "data-state",
      "off",
    );

    expect(toggle).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Clicking the toggle should turn it on and off again.
   */
  it("toggles when clicked", async () => {
    const user = userEvent.setup();

    render(<Toggle>Bold</Toggle>);

    const toggle = screen.getByRole("button", {
      name: "Bold",
    });

    await user.click(toggle);

    expect(toggle).toHaveAttribute(
      "data-state",
      "on",
    );

    await user.click(toggle);

    expect(toggle).toHaveAttribute(
      "data-state",
      "off",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * defaultPressed should start the toggle in the on state.
   */
  it("respects defaultPressed", () => {
    render(<Toggle defaultPressed>Bold</Toggle>);

    expect(
      screen.getByRole("button", { name: "Bold" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * onPressedChange should report the new state.
   */
  it("calls onPressedChange with the new state", async () => {
    const user = userEvent.setup();
    const onPressedChange = jest.fn();

    render(
      <Toggle onPressedChange={onPressedChange}>
        Bold
      </Toggle>,
    );

    await user.click(
      screen.getByRole("button", { name: "Bold" }),
    );

    expect(onPressedChange).toHaveBeenCalledWith(
      true,
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The toggle should be operable from the keyboard.
   */
  it("toggles with the keyboard", async () => {
    const user = userEvent.setup();

    render(<Toggle>Bold</Toggle>);

    const toggle = screen.getByRole("button", {
      name: "Bold",
    });

    await user.tab();

    expect(toggle).toHaveFocus();

    await user.keyboard(" ");

    expect(toggle).toHaveAttribute(
      "data-state",
      "on",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The default variant and size classes should be applied.
   */
  it("applies the default variant and size classes", () => {
    render(<Toggle>Bold</Toggle>);

    const toggle = screen.getByRole("button", {
      name: "Bold",
    });

    expect(toggle).toHaveClass("bg-transparent");
    expect(toggle).toHaveClass("h-9");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The outline variant should add a border.
   */
  it("applies the outline variant", () => {
    render(
      <Toggle variant="outline">Bold</Toggle>,
    );

    expect(
      screen.getByRole("button", { name: "Bold" }),
    ).toHaveClass("border-input");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A custom className should be merged with the variant classes.
   */
  it("merges a custom className with the variant classes", () => {
    render(
      <Toggle className="w-20">Bold</Toggle>,
    );

    const toggle = screen.getByRole("button", {
      name: "Bold",
    });

    expect(toggle).toHaveClass("w-20");
    expect(toggle).toHaveClass("rounded-md");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A disabled toggle must not change state.
   */
  it("does not toggle while disabled", async () => {
    const user = userEvent.setup();
    const onPressedChange = jest.fn();

    render(
      <Toggle
        disabled
        onPressedChange={onPressedChange}
      >
        Bold
      </Toggle>,
    );

    const toggle = screen.getByRole("button", {
      name: "Bold",
    });

    await user.click(toggle);

    expect(toggle).toHaveAttribute(
      "data-state",
      "off",
    );

    expect(onPressedChange).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A disabled toggle must not be reachable with the keyboard.
   */
  it("does not receive focus while disabled", async () => {
    const user = userEvent.setup();

    render(<Toggle disabled>Bold</Toggle>);

    await user.tab();

    expect(
      screen.getByRole("button", { name: "Bold" }),
    ).not.toHaveFocus();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A controlled toggle must not change state on its own.
   */
  it("does not change a controlled toggle without a handler", async () => {
    const user = userEvent.setup();

    render(<Toggle pressed={false}>Bold</Toggle>);

    const toggle = screen.getByRole("button", {
      name: "Bold",
    });

    await user.click(toggle);

    expect(toggle).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * onPressedChange must not fire on the initial render.
   */
  it("does not call onPressedChange on initial render", () => {
    const onPressedChange = jest.fn();

    render(
      <Toggle
        defaultPressed
        onPressedChange={onPressedChange}
      >
        Bold
      </Toggle>,
    );

    expect(onPressedChange).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A toggle is a pressed button, not a checkbox or switch - it must not
   * be exposed with those roles.
   */
  it("does not expose a checkbox or switch role", () => {
    render(<Toggle>Bold</Toggle>);

    expect(
      screen.queryByRole("checkbox"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("switch"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Choosing one size must NOT leave another size's classes behind.
   */
  it("does not keep the default size classes when another size is used", () => {
    render(<Toggle size="sm">Bold</Toggle>);

    const toggle = screen.getByRole("button", {
      name: "Bold",
    });

    expect(toggle).toHaveClass("h-8");
    expect(toggle).not.toHaveClass("h-9");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The default variant must not draw a border.
   */
  it("does not draw a border for the default variant", () => {
    render(<Toggle>Bold</Toggle>);

    expect(
      screen.getByRole("button", { name: "Bold" }),
    ).not.toHaveClass("border-input");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * An icon inside the toggle must not swallow the toggle's own click.
   */
  it("does not make an inner icon a separate click target", () => {
    render(<Toggle>Bold</Toggle>);

    expect(
      screen.getByRole("button", { name: "Bold" })
        .className,
    ).toContain("[&_svg]:pointer-events-none");
  });
});
