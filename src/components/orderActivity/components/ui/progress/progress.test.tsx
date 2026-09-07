import * as React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { Progress } from "./progress";

const findRoot = (container: HTMLElement) =>
  container.querySelector(
    "[data-slot='progress']",
  ) as HTMLElement;

const findIndicator = (container: HTMLElement) =>
  container.querySelector(
    "[data-slot='progress-indicator']",
  ) as HTMLElement;

/**
 * ============================================================================
 * Progress
 * ============================================================================
 */
describe("Progress", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The Progress should be exposed with the progressbar role.
   */
  it("renders with the progressbar role", () => {
    render(<Progress value={40} />);

    expect(
      screen.getByRole("progressbar"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Both the root and the indicator should carry their data-slot
   * attributes.
   */
  it("sets the correct data-slot attributes", () => {
    const { container } = render(
      <Progress value={40} />,
    );

    expect(findRoot(container)).toBeInTheDocument();

    expect(
      findIndicator(container),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * KNOWN GAP - the value is NOT exposed to assistive technology.
   *
   * Progress destructures `value` out of its props and uses it only for
   * the indicator transform, so it is never forwarded to the Radix root.
   * Radix therefore always sees value = null and reports the bar as
   * indeterminate.
   *
   * This test documents the current behaviour. Once `value` is forwarded
   * to ProgressPrimitive.Root it should be replaced with a positive test
   * asserting aria-valuenow.
   */
  it("does not expose the value to assistive technology", () => {
    render(<Progress value={40} />);

    const progressbar =
      screen.getByRole("progressbar");

    expect(progressbar).not.toHaveAttribute(
      "aria-valuenow",
    );

    expect(progressbar).toHaveAttribute(
      "data-state",
      "indeterminate",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The indicator should be translated to represent the value.
   */
  it("translates the indicator to match the value", () => {
    const { container } = render(
      <Progress value={40} />,
    );

    expect(
      findIndicator(container),
    ).toHaveStyle(
      "transform: translateX(-60%)",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A completed bar should be fully translated into view.
   */
  it("fully reveals the indicator at 100", () => {
    const { container } = render(
      <Progress value={100} />,
    );

    expect(
      findIndicator(container),
    ).toHaveStyle(
      "transform: translateX(-0%)",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A custom className should be merged with the defaults.
   */
  it("merges a custom className with the defaults", () => {
    const { container } = render(
      <Progress value={40} className="h-4" />,
    );

    const root = findRoot(container);

    expect(root).toHaveClass("h-4");
    expect(root).toHaveClass("rounded-full");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Arbitrary props should be forwarded to the underlying element.
   */
  it("forwards arbitrary props to the underlying element", () => {
    const { container } = render(
      <Progress
        value={40}
        id="upload-progress"
        aria-label="Upload progress"
      />,
    );

    const root = findRoot(container);

    expect(root).toHaveAttribute(
      "id",
      "upload-progress",
    );

    expect(root).toHaveAttribute(
      "aria-label",
      "Upload progress",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * With no value the bar must NOT pretend to show progress - it must sit
   * at the empty position.
   */
  it("does not show progress when no value is given", () => {
    const { container } = render(<Progress />);

    expect(
      findIndicator(container),
    ).toHaveStyle(
      "transform: translateX(-100%)",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * With no value the bar is indeterminate, so it must not report a
   * concrete value.
   */
  it("does not report a value while indeterminate", () => {
    render(<Progress />);

    expect(
      screen.getByRole("progressbar"),
    ).not.toHaveAttribute("aria-valuenow");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A value of zero must not be treated as "no value" and must not fill
   * the bar.
   */
  it("does not fill the bar at a value of zero", () => {
    const { container } = render(
      <Progress value={0} />,
    );

    expect(
      findIndicator(container),
    ).toHaveStyle(
      "transform: translateX(-100%)",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Different values must produce different indicator positions - this
   * guards against the value prop being ignored.
   */
  it("does not render the same indicator position for different values", () => {
    const { container: low } = render(
      <Progress value={10} />,
    );

    const { container: high } = render(
      <Progress value={90} />,
    );

    expect(
      findIndicator(low).style.transform,
    ).not.toBe(
      findIndicator(high).style.transform,
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The indicator must not spill outside the track, which is what the
   * overflow-hidden class guarantees.
   */
  it("does not allow the indicator to overflow the track", () => {
    const { container } = render(
      <Progress value={40} />,
    );

    expect(findRoot(container)).toHaveClass(
      "overflow-hidden",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A progress bar is an output, not a control - it must never be
   * focusable.
   */
  it("does not render as a focusable control", () => {
    const { container } = render(
      <Progress value={40} />,
    );

    const root = findRoot(container);

    expect(root).not.toHaveAttribute("tabindex");
    expect(root.tagName).not.toBe("BUTTON");
    expect(root.tagName).not.toBe("INPUT");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A custom className must not remove the track shape.
   */
  it("does not drop the default classes when a custom className is given", () => {
    const { container } = render(
      <Progress value={40} className="h-4" />,
    );

    const root = findRoot(container);

    expect(root).toHaveClass("h-4");
    expect(root).toHaveClass("w-full");
    expect(root).toHaveClass("relative");
  });
});
