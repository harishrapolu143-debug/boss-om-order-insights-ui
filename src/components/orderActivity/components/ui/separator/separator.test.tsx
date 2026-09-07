import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { Separator } from "./separator";

const findSeparator = (container: HTMLElement) =>
  container.querySelector(
    "[data-slot='separator-root']",
  ) as HTMLElement;

/**
 * ============================================================================
 * Separator
 * ============================================================================
 */
describe("Separator", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The Separator should render with the expected data-slot attribute.
   */
  it("sets the correct data-slot attribute", () => {
    const { container } = render(<Separator />);

    expect(
      findSeparator(container),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The separator defaults to a horizontal orientation.
   */
  it("is horizontal by default", () => {
    const { container } = render(<Separator />);

    expect(
      findSeparator(container),
    ).toHaveAttribute(
      "data-orientation",
      "horizontal",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * An explicit vertical orientation should be reflected in the DOM.
   */
  it("supports a vertical orientation", () => {
    const { container } = render(
      <Separator orientation="vertical" />,
    );

    expect(
      findSeparator(container),
    ).toHaveAttribute(
      "data-orientation",
      "vertical",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The default styling should be applied.
   */
  it("applies the default classes", () => {
    const { container } = render(<Separator />);

    const separator = findSeparator(container);

    expect(separator).toHaveClass("bg-border");
    expect(separator).toHaveClass("shrink-0");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A custom className should be merged with the defaults.
   */
  it("merges a custom className with the defaults", () => {
    const { container } = render(
      <Separator className="my-4" />,
    );

    const separator = findSeparator(container);

    expect(separator).toHaveClass("my-4");
    expect(separator).toHaveClass("bg-border");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A non-decorative separator is a semantic separator for assistive
   * technology.
   */
  it("exposes a separator role when it is not decorative", () => {
    render(<Separator decorative={false} />);

    expect(
      screen.getByRole("separator"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A non-decorative vertical separator must announce its orientation.
   */
  it("announces the orientation of a non-decorative vertical separator", () => {
    render(
      <Separator
        decorative={false}
        orientation="vertical"
      />,
    );

    expect(
      screen.getByRole("separator"),
    ).toHaveAttribute(
      "aria-orientation",
      "vertical",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Arbitrary props should be forwarded to the underlying element.
   */
  it("forwards arbitrary props to the underlying element", () => {
    const { container } = render(
      <Separator id="toolbar-divider" />,
    );

    expect(
      findSeparator(container),
    ).toHaveAttribute(
      "id",
      "toolbar-divider",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The separator is decorative by default, so it must NOT be announced
   * as a separator to assistive technology.
   */
  it("does not expose a separator role by default", () => {
    render(<Separator />);

    expect(
      screen.queryByRole("separator"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A decorative separator must not carry aria-orientation, because it has
   * no semantic role to orient.
   */
  it("does not set aria-orientation while decorative", () => {
    const { container } = render(
      <Separator orientation="vertical" />,
    );

    expect(
      findSeparator(container),
    ).not.toHaveAttribute("aria-orientation");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A horizontal separator must NOT be marked as vertical, otherwise the
   * orientation-driven sizing classes resolve to the wrong axis.
   */
  it("does not report a vertical orientation when horizontal", () => {
    const { container } = render(<Separator />);

    expect(
      findSeparator(container),
    ).not.toHaveAttribute(
      "data-orientation",
      "vertical",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A separator is a visual divider - it must never be focusable or
   * interactive.
   */
  it("does not render as a focusable element", () => {
    const { container } = render(<Separator />);

    const separator = findSeparator(container);

    expect(separator).not.toHaveAttribute("tabindex");
    expect(separator).not.toHaveAttribute("href");
    expect(separator.tagName).not.toBe("BUTTON");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A custom className must not remove the divider colour.
   */
  it("does not drop the divider colour when a custom className is given", () => {
    const { container } = render(
      <Separator className="shrink" />,
    );

    expect(
      findSeparator(container),
    ).toHaveClass("bg-border");
  });
});
