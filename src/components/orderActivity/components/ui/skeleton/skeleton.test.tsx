import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { Skeleton } from "./skeleton";

const findSkeleton = (container: HTMLElement) =>
  container.querySelector(
    "[data-slot='skeleton']",
  ) as HTMLElement;

/**
 * ============================================================================
 * Skeleton
 * ============================================================================
 */
describe("Skeleton", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The Skeleton should render with the expected data-slot attribute.
   */
  it("sets the correct data-slot attribute", () => {
    const { container } = render(<Skeleton />);

    expect(
      findSkeleton(container),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The default placeholder styling should be applied.
   */
  it("applies the default classes", () => {
    const { container } = render(<Skeleton />);

    const skeleton = findSkeleton(container);

    expect(skeleton).toHaveClass("bg-accent");
    expect(skeleton).toHaveClass("animate-pulse");
    expect(skeleton).toHaveClass("rounded-md");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A custom className should be merged with the defaults.
   */
  it("merges a custom className with the defaults", () => {
    const { container } = render(
      <Skeleton className="h-4 w-32" />,
    );

    const skeleton = findSkeleton(container);

    expect(skeleton).toHaveClass("h-4");
    expect(skeleton).toHaveClass("w-32");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Arbitrary props should be forwarded to the underlying element.
   */
  it("forwards arbitrary props to the underlying element", () => {
    const { container } = render(
      <Skeleton id="row-placeholder" aria-hidden="true" />,
    );

    const skeleton = findSkeleton(container);

    expect(skeleton).toHaveAttribute(
      "id",
      "row-placeholder",
    );

    expect(skeleton).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Children should still render when supplied, so a skeleton can be used
   * to reserve the exact space of real content.
   */
  it("renders its children when provided", () => {
    render(
      <Skeleton>
        <span>reserved</span>
      </Skeleton>,
    );

    expect(
      screen.getByText("reserved"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A custom className must NOT remove the pulse animation, otherwise the
   * skeleton stops reading as a loading placeholder.
   */
  it("does not drop the animation class when a custom className is given", () => {
    const { container } = render(
      <Skeleton className="rounded-full" />,
    );

    const skeleton = findSkeleton(container);

    expect(skeleton).toHaveClass("rounded-full");
    expect(skeleton).toHaveClass("animate-pulse");
    expect(skeleton).toHaveClass("bg-accent");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A skeleton is decoration only - it must never become an interactive
   * or focusable element.
   */
  it("does not render as an interactive element", () => {
    const { container } = render(<Skeleton />);

    const skeleton = findSkeleton(container);

    expect(skeleton.tagName).toBe("DIV");
    expect(skeleton).not.toHaveAttribute("role");
    expect(skeleton).not.toHaveAttribute("tabindex");

    expect(
      screen.queryByRole("button"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * With no children the skeleton must not contribute any text of its own.
   */
  it("does not render any text content of its own", () => {
    const { container } = render(<Skeleton />);

    expect(
      findSkeleton(container),
    ).toBeEmptyDOMElement();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The component must NOT silently hide itself from assistive technology.
   *
   * aria-hidden is deliberately left to the caller, so this test locks in
   * that the component does not set it behind the caller's back.
   */
  it("does not set aria-hidden on its own", () => {
    const { container } = render(<Skeleton />);

    expect(
      findSkeleton(container),
    ).not.toHaveAttribute("aria-hidden");
  });
});
