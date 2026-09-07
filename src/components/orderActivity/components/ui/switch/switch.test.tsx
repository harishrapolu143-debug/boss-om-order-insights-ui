import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { Switch } from "./switch";

/**
 * ============================================================================
 * Switch
 * ============================================================================
 */
describe("Switch", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The Switch should be exposed with the switch role.
   */
  it("renders with the switch role", () => {
    render(<Switch aria-label="Notifications" />);

    expect(
      screen.getByRole("switch"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Both the root and the thumb should carry their data-slot attributes.
   */
  it("sets the correct data-slot attributes", () => {
    const { container } = render(
      <Switch aria-label="Notifications" />,
    );

    expect(
      container.querySelector(
        "[data-slot='switch']",
      ),
    ).toBeInTheDocument();

    expect(
      container.querySelector(
        "[data-slot='switch-thumb']",
      ),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The switch should start in the off state.
   */
  it("is unchecked by default", () => {
    render(<Switch aria-label="Notifications" />);

    const switchEl = screen.getByRole("switch");

    expect(switchEl).not.toBeChecked();

    expect(switchEl).toHaveAttribute(
      "data-state",
      "unchecked",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * defaultChecked should start the switch in the on state.
   */
  it("respects defaultChecked", () => {
    render(
      <Switch
        defaultChecked
        aria-label="Notifications"
      />,
    );

    expect(
      screen.getByRole("switch"),
    ).toBeChecked();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Clicking the switch should toggle it.
   */
  it("toggles when clicked", async () => {
    const user = userEvent.setup();

    render(<Switch aria-label="Notifications" />);

    const switchEl = screen.getByRole("switch");

    await user.click(switchEl);

    expect(switchEl).toBeChecked();

    await user.click(switchEl);

    expect(switchEl).not.toBeChecked();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The thumb state should follow the switch state.
   */
  it("moves the thumb state along with the switch", async () => {
    const user = userEvent.setup();

    const { container } = render(
      <Switch aria-label="Notifications" />,
    );

    const thumb = container.querySelector(
      "[data-slot='switch-thumb']",
    ) as HTMLElement;

    expect(thumb).toHaveAttribute(
      "data-state",
      "unchecked",
    );

    await user.click(screen.getByRole("switch"));

    expect(thumb).toHaveAttribute(
      "data-state",
      "checked",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * onCheckedChange should report the new state.
   */
  it("calls onCheckedChange with the new state", async () => {
    const user = userEvent.setup();
    const onCheckedChange = jest.fn();

    render(
      <Switch
        aria-label="Notifications"
        onCheckedChange={onCheckedChange}
      />,
    );

    await user.click(screen.getByRole("switch"));

    expect(onCheckedChange).toHaveBeenCalledWith(
      true,
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The switch should be operable from the keyboard.
   */
  it("toggles with the keyboard", async () => {
    const user = userEvent.setup();

    render(<Switch aria-label="Notifications" />);

    const switchEl = screen.getByRole("switch");

    await user.tab();

    expect(switchEl).toHaveFocus();

    await user.keyboard(" ");

    expect(switchEl).toBeChecked();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A controlled switch should follow its checked prop.
   */
  it("honours a controlled checked prop", async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <Switch
        checked={false}
        onCheckedChange={() => {}}
        aria-label="Notifications"
      />,
    );

    const switchEl = screen.getByRole("switch");

    await user.click(switchEl);

    expect(switchEl).not.toBeChecked();

    rerender(
      <Switch
        checked
        onCheckedChange={() => {}}
        aria-label="Notifications"
      />,
    );

    expect(switchEl).toBeChecked();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A custom className should be merged with the defaults.
   */
  it("merges a custom className with the defaults", () => {
    const { container } = render(
      <Switch
        className="scale-125"
        aria-label="Notifications"
      />,
    );

    const root = container.querySelector(
      "[data-slot='switch']",
    );

    expect(root).toHaveClass("scale-125");
    expect(root).toHaveClass("rounded-full");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A disabled switch must not toggle.
   */
  it("does not toggle while disabled", async () => {
    const user = userEvent.setup();
    const onCheckedChange = jest.fn();

    render(
      <Switch
        disabled
        aria-label="Notifications"
        onCheckedChange={onCheckedChange}
      />,
    );

    const switchEl = screen.getByRole("switch");

    await user.click(switchEl);

    expect(switchEl).not.toBeChecked();
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A disabled switch must not be reachable with the keyboard.
   */
  it("does not receive focus while disabled", async () => {
    const user = userEvent.setup();

    render(
      <Switch disabled aria-label="Notifications" />,
    );

    await user.tab();

    expect(
      screen.getByRole("switch"),
    ).not.toHaveFocus();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A disabled switch must not respond to the keyboard either.
   */
  it("does not toggle with the keyboard while disabled", async () => {
    const user = userEvent.setup();

    render(
      <Switch disabled aria-label="Notifications" />,
    );

    const switchEl = screen.getByRole("switch");

    switchEl.focus();

    await user.keyboard(" ");

    expect(switchEl).not.toBeChecked();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A controlled switch must not change state on its own.
   */
  it("does not change a controlled switch without a handler", async () => {
    const user = userEvent.setup();

    render(
      <Switch
        checked={false}
        aria-label="Notifications"
      />,
    );

    const switchEl = screen.getByRole("switch");

    await user.click(switchEl);

    expect(switchEl).not.toBeChecked();

    expect(switchEl).toHaveAttribute(
      "data-state",
      "unchecked",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * onCheckedChange must not fire on the initial render.
   */
  it("does not call onCheckedChange on initial render", () => {
    const onCheckedChange = jest.fn();

    render(
      <Switch
        defaultChecked
        aria-label="Notifications"
        onCheckedChange={onCheckedChange}
      />,
    );

    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The thumb must never be a click target of its own, otherwise it would
   * swallow the switch's click.
   */
  it("does not make the thumb a separate click target", () => {
    const { container } = render(
      <Switch aria-label="Notifications" />,
    );

    expect(
      container.querySelector(
        "[data-slot='switch-thumb']",
      ),
    ).toHaveClass("pointer-events-none");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A switch is not a checkbox - it must not be exposed with the
   * checkbox role.
   */
  it("does not expose a checkbox role", () => {
    render(<Switch aria-label="Notifications" />);

    expect(
      screen.queryByRole("checkbox"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A custom className must not remove the switch shape.
   */
  it("does not drop the default classes when a custom className is given", () => {
    const { container } = render(
      <Switch
        className="scale-125"
        aria-label="Notifications"
      />,
    );

    const root = container.querySelector(
      "[data-slot='switch']",
    );

    expect(root).toHaveClass("scale-125");
    expect(root).toHaveClass("rounded-full");
    expect(root).toHaveClass("inline-flex");
  });
});
