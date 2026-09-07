import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { Checkbox } from "./checkbox";

const findIndicator = (container: HTMLElement) =>
  container.querySelector(
    "[data-slot='checkbox-indicator']",
  );

/**
 * ============================================================================
 * Checkbox
 * ============================================================================
 */
describe("Checkbox", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The Checkbox should be exposed with the checkbox role.
   */
  it("renders with the checkbox role", () => {
    render(<Checkbox aria-label="Include cancelled" />);

    expect(
      screen.getByRole("checkbox"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The Checkbox should render with the expected data-slot attribute.
   */
  it("sets the correct data-slot attribute", () => {
    const { container } = render(
      <Checkbox aria-label="Include cancelled" />,
    );

    expect(
      container.querySelector(
        "[data-slot='checkbox']",
      ),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The checkbox should start unchecked.
   */
  it("is unchecked by default", () => {
    render(<Checkbox aria-label="Include cancelled" />);

    const checkbox = screen.getByRole("checkbox");

    expect(checkbox).not.toBeChecked();

    expect(checkbox).toHaveAttribute(
      "data-state",
      "unchecked",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The tick should appear once the checkbox is checked.
   */
  it("shows the indicator once checked", async () => {
    const user = userEvent.setup();

    const { container } = render(
      <Checkbox aria-label="Include cancelled" />,
    );

    await user.click(screen.getByRole("checkbox"));

    expect(
      findIndicator(container),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * defaultChecked should start the checkbox checked.
   */
  it("respects defaultChecked", () => {
    render(
      <Checkbox
        defaultChecked
        aria-label="Include cancelled"
      />,
    );

    expect(
      screen.getByRole("checkbox"),
    ).toBeChecked();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Clicking the checkbox should toggle it both ways.
   */
  it("toggles when clicked", async () => {
    const user = userEvent.setup();

    render(<Checkbox aria-label="Include cancelled" />);

    const checkbox = screen.getByRole("checkbox");

    await user.click(checkbox);

    expect(checkbox).toBeChecked();

    await user.click(checkbox);

    expect(checkbox).not.toBeChecked();
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
      <Checkbox
        aria-label="Include cancelled"
        onCheckedChange={onCheckedChange}
      />,
    );

    await user.click(screen.getByRole("checkbox"));

    expect(onCheckedChange).toHaveBeenCalledWith(
      true,
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The checkbox should be operable from the keyboard.
   */
  it("toggles with the keyboard", async () => {
    const user = userEvent.setup();

    render(<Checkbox aria-label="Include cancelled" />);

    const checkbox = screen.getByRole("checkbox");

    await user.tab();

    expect(checkbox).toHaveFocus();

    await user.keyboard(" ");

    expect(checkbox).toBeChecked();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A controlled checkbox should follow its checked prop.
   */
  it("honours a controlled checked prop", async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <Checkbox
        checked={false}
        onCheckedChange={() => {}}
        aria-label="Include cancelled"
      />,
    );

    const checkbox = screen.getByRole("checkbox");

    await user.click(checkbox);

    expect(checkbox).not.toBeChecked();

    rerender(
      <Checkbox
        checked
        onCheckedChange={() => {}}
        aria-label="Include cancelled"
      />,
    );

    expect(checkbox).toBeChecked();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The mixed state should be exposed for a partially selected group.
   */
  it("supports the indeterminate state", () => {
    render(
      <Checkbox
        checked="indeterminate"
        onCheckedChange={() => {}}
        aria-label="Include cancelled"
      />,
    );

    expect(
      screen.getByRole("checkbox"),
    ).toHaveAttribute("data-state", "indeterminate");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A custom className should be merged with the defaults.
   */
  it("merges a custom className with the defaults", () => {
    const { container } = render(
      <Checkbox
        className="size-6"
        aria-label="Include cancelled"
      />,
    );

    const root = container.querySelector(
      "[data-slot='checkbox']",
    );

    expect(root).toHaveClass("size-6");
    expect(root).toHaveClass("shrink-0");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The tick must NOT be rendered while the checkbox is unchecked.
   */
  it("does not render the indicator while unchecked", () => {
    const { container } = render(
      <Checkbox aria-label="Include cancelled" />,
    );

    expect(
      findIndicator(container),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A disabled checkbox must not toggle.
   */
  it("does not toggle while disabled", async () => {
    const user = userEvent.setup();
    const onCheckedChange = jest.fn();

    render(
      <Checkbox
        disabled
        aria-label="Include cancelled"
        onCheckedChange={onCheckedChange}
      />,
    );

    const checkbox = screen.getByRole("checkbox");

    await user.click(checkbox);

    expect(checkbox).not.toBeChecked();
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A disabled checkbox must not be reachable with the keyboard.
   */
  it("does not receive focus while disabled", async () => {
    const user = userEvent.setup();

    render(
      <Checkbox
        disabled
        aria-label="Include cancelled"
      />,
    );

    await user.tab();

    expect(
      screen.getByRole("checkbox"),
    ).not.toHaveFocus();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A controlled checkbox must not change state on its own.
   */
  it("does not change a controlled checkbox without a handler", async () => {
    const user = userEvent.setup();

    render(
      <Checkbox
        checked={false}
        aria-label="Include cancelled"
      />,
    );

    const checkbox = screen.getByRole("checkbox");

    await user.click(checkbox);

    expect(checkbox).not.toBeChecked();
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
      <Checkbox
        defaultChecked
        aria-label="Include cancelled"
        onCheckedChange={onCheckedChange}
      />,
    );

    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * An indeterminate checkbox must not report itself as checked.
   */
  it("does not report an indeterminate checkbox as checked", () => {
    render(
      <Checkbox
        checked="indeterminate"
        onCheckedChange={() => {}}
        aria-label="Include cancelled"
      />,
    );

    const checkbox = screen.getByRole("checkbox");

    expect(checkbox).not.toBeChecked();

    expect(checkbox).toHaveAttribute(
      "aria-checked",
      "mixed",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A checkbox is not a switch - it must not be exposed with the
   * switch role.
   */
  it("does not expose a switch role", () => {
    render(<Checkbox aria-label="Include cancelled" />);

    expect(
      screen.queryByRole("switch"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A custom className must not remove the checkbox shape.
   */
  it("does not drop the default classes when a custom className is given", () => {
    const { container } = render(
      <Checkbox
        className="size-6"
        aria-label="Include cancelled"
      />,
    );

    const root = container.querySelector(
      "[data-slot='checkbox']",
    );

    expect(root).toHaveClass("size-6");
    expect(root).toHaveClass("rounded-[4px]");
    expect(root).toHaveClass("shrink-0");
  });
});
