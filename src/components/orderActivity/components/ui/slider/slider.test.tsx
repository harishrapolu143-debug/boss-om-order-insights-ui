import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { Slider } from "./slider";

const findRoot = (container: HTMLElement) =>
  container.querySelector(
    "[data-slot='slider']",
  ) as HTMLElement;

const findThumbs = (container: HTMLElement) =>
  container.querySelectorAll(
    "[data-slot='slider-thumb']",
  );

/**
 * ============================================================================
 * Slider
 * ============================================================================
 */
describe("Slider", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Every slider part should render with its own data-slot attribute.
   */
  it("sets the correct data-slot attributes for every part", () => {
    const { container } = render(
      <Slider defaultValue={[50]} />,
    );

    [
      "slider",
      "slider-track",
      "slider-range",
      "slider-thumb",
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
   * The thumb should be exposed with the slider role.
   */
  it("exposes the thumb with the slider role", () => {
    render(
      <Slider
        defaultValue={[50]}
        aria-label="Order value"
      />,
    );

    expect(
      screen.getByRole("slider"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The current value and bounds should be exposed.
   */
  it("exposes the current value and bounds", () => {
    render(
      <Slider
        defaultValue={[50]}
        aria-label="Order value"
      />,
    );

    const slider = screen.getByRole("slider");

    expect(slider).toHaveAttribute(
      "aria-valuenow",
      "50",
    );

    expect(slider).toHaveAttribute(
      "aria-valuemin",
      "0",
    );

    expect(slider).toHaveAttribute(
      "aria-valuemax",
      "100",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A range slider should render one thumb per value.
   */
  it("renders one thumb per value", () => {
    const { container } = render(
      <Slider defaultValue={[20, 80]} />,
    );

    expect(findThumbs(container)).toHaveLength(2);
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The arrow keys should change the value.
   */
  it("increases the value with the arrow keys", async () => {
    const user = userEvent.setup();

    render(
      <Slider
        defaultValue={[50]}
        aria-label="Order value"
      />,
    );

    const slider = screen.getByRole("slider");

    slider.focus();

    await user.keyboard("{ArrowRight}");

    expect(slider).toHaveAttribute(
      "aria-valuenow",
      "51",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * onValueChange should report the new value.
   */
  it("calls onValueChange with the new value", async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();

    render(
      <Slider
        defaultValue={[50]}
        aria-label="Order value"
        onValueChange={onValueChange}
      />,
    );

    screen.getByRole("slider").focus();

    await user.keyboard("{ArrowRight}");

    expect(onValueChange).toHaveBeenCalledWith([
      51,
    ]);
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Custom bounds should be respected.
   */
  it("respects custom min and max bounds", () => {
    render(
      <Slider
        defaultValue={[5]}
        min={0}
        max={10}
        aria-label="Order value"
      />,
    );

    expect(
      screen.getByRole("slider"),
    ).toHaveAttribute("aria-valuemax", "10");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A vertical slider should be marked as vertical.
   */
  it("supports a vertical orientation", () => {
    const { container } = render(
      <Slider
        defaultValue={[50]}
        orientation="vertical"
      />,
    );

    expect(findRoot(container)).toHaveAttribute(
      "data-orientation",
      "vertical",
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
      <Slider
        defaultValue={[50]}
        className="max-w-sm"
      />,
    );

    const root = findRoot(container);

    expect(root).toHaveClass("max-w-sm");
    expect(root).toHaveClass("relative");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A disabled slider must not change value.
   */
  it("does not change value while disabled", async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();

    render(
      <Slider
        defaultValue={[50]}
        disabled
        aria-label="Order value"
        onValueChange={onValueChange}
      />,
    );

    const slider = screen.getByRole("slider");

    slider.focus();

    await user.keyboard("{ArrowRight}");

    expect(slider).toHaveAttribute(
      "aria-valuenow",
      "50",
    );

    expect(onValueChange).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The value must not go past the maximum.
   */
  it("does not move the value past the maximum", async () => {
    const user = userEvent.setup();

    render(
      <Slider
        defaultValue={[100]}
        aria-label="Order value"
      />,
    );

    const slider = screen.getByRole("slider");

    slider.focus();

    await user.keyboard("{ArrowRight}");
    await user.keyboard("{ArrowRight}");

    expect(slider).toHaveAttribute(
      "aria-valuenow",
      "100",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The value must not go below the minimum.
   */
  it("does not move the value below the minimum", async () => {
    const user = userEvent.setup();

    render(
      <Slider
        defaultValue={[0]}
        aria-label="Order value"
      />,
    );

    const slider = screen.getByRole("slider");

    slider.focus();

    await user.keyboard("{ArrowLeft}");
    await user.keyboard("{ArrowLeft}");

    expect(slider).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A controlled slider must not change on its own.
   */
  it("does not change a controlled slider without a handler", async () => {
    const user = userEvent.setup();

    render(
      <Slider
        value={[50]}
        aria-label="Order value"
      />,
    );

    const slider = screen.getByRole("slider");

    slider.focus();

    await user.keyboard("{ArrowRight}");

    expect(slider).toHaveAttribute(
      "aria-valuenow",
      "50",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * onValueChange must not fire on the initial render.
   */
  it("does not call onValueChange on initial render", () => {
    const onValueChange = jest.fn();

    render(
      <Slider
        defaultValue={[50]}
        onValueChange={onValueChange}
      />,
    );

    expect(onValueChange).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A single-value slider must not render a second thumb.
   */
  it("does not render extra thumbs for a single value", () => {
    const { container } = render(
      <Slider defaultValue={[50]} />,
    );

    expect(findThumbs(container)).toHaveLength(1);
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The filled range must not spill outside the track, which is what the
   * overflow-hidden class on the track guarantees.
   */
  it("does not let the range overflow the track", () => {
    const { container } = render(
      <Slider defaultValue={[50]} />,
    );

    expect(
      container.querySelector(
        "[data-slot='slider-track']",
      ),
    ).toHaveClass("overflow-hidden");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Dragging the slider must not select surrounding text, which is what
   * the select-none and touch-none classes guarantee.
   */
  it("does not allow text selection while dragging", () => {
    const { container } = render(
      <Slider defaultValue={[50]} />,
    );

    const root = findRoot(container);

    expect(root).toHaveClass("select-none");
    expect(root).toHaveClass("touch-none");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A horizontal slider must not be marked as vertical.
   */
  it("does not report a vertical orientation when horizontal", () => {
    const { container } = render(
      <Slider defaultValue={[50]} />,
    );

    expect(findRoot(container)).toHaveAttribute(
      "data-orientation",
      "horizontal",
    );
  });
});
