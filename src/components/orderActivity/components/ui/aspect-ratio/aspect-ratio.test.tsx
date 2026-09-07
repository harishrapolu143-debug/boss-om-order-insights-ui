import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { AspectRatio } from "./aspect-ratio";

const findSlot = (container: HTMLElement) =>
  container.querySelector(
    "[data-slot='aspect-ratio']",
  ) as HTMLElement;

/**
 * ============================================================================
 * AspectRatio
 * ============================================================================
 */
describe("AspectRatio", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The AspectRatio should render with the expected data-slot attribute.
   */
  it("sets the correct data-slot attribute", () => {
    const { container } = render(
      <AspectRatio ratio={16 / 9}>
        <span>content</span>
      </AspectRatio>,
    );

    expect(
      findSlot(container),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Children should be rendered inside the ratio box.
   */
  it("renders its children", () => {
    render(
      <AspectRatio ratio={1}>
        <span>content</span>
      </AspectRatio>,
    );

    expect(
      screen.getByText("content"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Space should be reserved with a padding-bottom derived from the ratio.
   */
  it("reserves space using padding-bottom derived from the ratio", () => {
    const { container } = render(
      <AspectRatio ratio={2}>
        <span>content</span>
      </AspectRatio>,
    );

    // Radix wraps the slot in a sizing element: 1 / 2 => 50%
    const wrapper =
      container.firstElementChild as HTMLElement;

    expect(wrapper.style.paddingBottom).toBe("50%");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A wider ratio should reserve proportionally less vertical space.
   */
  it("reserves less vertical space for a wider ratio", () => {
    const { container } = render(
      <AspectRatio ratio={4}>
        <span>content</span>
      </AspectRatio>,
    );

    const wrapper =
      container.firstElementChild as HTMLElement;

    expect(wrapper.style.paddingBottom).toBe("25%");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Arbitrary props should be forwarded to the slot element.
   */
  it("forwards arbitrary props to the slot element", () => {
    const { container } = render(
      <AspectRatio ratio={1} id="hero">
        <span>content</span>
      </AspectRatio>,
    );

    expect(findSlot(container)).toHaveAttribute(
      "id",
      "hero",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The sizing style must NOT land on the aspect-ratio slot itself, or the
   * ratio box would collapse.
   */
  it("does not put the sizing style on the slot element", () => {
    const { container } = render(
      <AspectRatio ratio={2}>
        <span>content</span>
      </AspectRatio>,
    );

    const slot = findSlot(container);
    const wrapper =
      container.firstElementChild as HTMLElement;

    expect(slot).not.toBe(wrapper);
    expect(slot.style.paddingBottom).toBe("");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A different ratio must actually produce different reserved space -
   * this guards against the ratio prop being ignored.
   */
  it("does not reserve the same space for different ratios", () => {
    const { container: wide } = render(
      <AspectRatio ratio={4}>
        <span>wide</span>
      </AspectRatio>,
    );

    const { container: tall } = render(
      <AspectRatio ratio={1 / 2}>
        <span>tall</span>
      </AspectRatio>,
    );

    const widePadding = (
      wide.firstElementChild as HTMLElement
    ).style.paddingBottom;

    const tallPadding = (
      tall.firstElementChild as HTMLElement
    ).style.paddingBottom;

    expect(widePadding).not.toBe(tallPadding);
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The component must not inject content of its own.
   */
  it("does not render any content of its own", () => {
    const { container } = render(
      <AspectRatio ratio={1} />,
    );

    expect(findSlot(container)).toBeEmptyDOMElement();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The ratio box is layout only - it must never be interactive.
   */
  it("does not render as an interactive element", () => {
    const { container } = render(
      <AspectRatio ratio={1}>
        <span>content</span>
      </AspectRatio>,
    );

    const slot = findSlot(container);

    expect(slot).not.toHaveAttribute("role");
    expect(slot).not.toHaveAttribute("tabindex");

    expect(
      screen.queryByRole("button"),
    ).not.toBeInTheDocument();
  });
});
