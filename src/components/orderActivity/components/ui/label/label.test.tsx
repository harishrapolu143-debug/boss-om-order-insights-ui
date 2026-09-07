import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { Label } from "./label";

/**
 * ============================================================================
 * Label
 * ============================================================================
 */
describe("Label", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The label should render whatever it is given.
   */
  it("renders its children", () => {
    render(<Label>Email address</Label>);

    expect(
      screen.getByText("Email address"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The label should render with the expected data-slot attribute.
   */
  it("sets the correct data-slot attribute", () => {
    render(<Label>Email address</Label>);

    expect(
      screen.getByText("Email address"),
    ).toHaveAttribute("data-slot", "label");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The default typography and layout classes should be applied.
   */
  it("applies the default classes", () => {
    render(<Label>Email address</Label>);

    const label = screen.getByText("Email address");

    expect(label).toHaveClass("flex");
    expect(label).toHaveClass("text-sm");
    expect(label).toHaveClass("font-medium");
    expect(label).toHaveClass("select-none");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A custom className should be merged with the defaults.
   */
  it("merges a custom className with the defaults", () => {
    render(
      <Label className="text-red-500">
        Email address
      </Label>,
    );

    const label = screen.getByText("Email address");

    expect(label).toHaveClass("text-red-500");
    expect(label).toHaveClass("font-medium");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * htmlFor should associate the label with its control.
   */
  it("associates with a control via htmlFor", () => {
    render(
      <>
        <Label htmlFor="email">Email address</Label>
        <input id="email" />
      </>,
    );

    expect(
      screen.getByLabelText("Email address"),
    ).toBe(document.getElementById("email"));
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Clicking an associated label should focus its control.
   */
  it("focuses the associated control when clicked", async () => {
    const user = userEvent.setup();

    render(
      <>
        <Label htmlFor="email">Email address</Label>
        <input id="email" />
      </>,
    );

    await user.click(
      screen.getByText("Email address"),
    );

    expect(
      document.getElementById("email"),
    ).toHaveFocus();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Arbitrary props should be forwarded to the underlying element.
   */
  it("forwards arbitrary props to the underlying element", () => {
    render(
      <Label id="email-label">Email address</Label>,
    );

    expect(
      screen.getByText("Email address"),
    ).toHaveAttribute("id", "email-label");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Without htmlFor the label must NOT be treated as the accessible name
   * of an unrelated control.
   */
  it("does not label a control when htmlFor is missing", () => {
    render(
      <>
        <Label>Email address</Label>
        <input id="email" />
      </>,
    );

    expect(
      screen.queryByLabelText("Email address"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * An htmlFor that points at nothing must not focus some other field.
   */
  it("does not focus another control when htmlFor does not match", async () => {
    const user = userEvent.setup();

    render(
      <>
        <Label htmlFor="does-not-exist">
          Email address
        </Label>
        <input id="email" />
      </>,
    );

    await user.click(
      screen.getByText("Email address"),
    );

    expect(
      document.getElementById("email"),
    ).not.toHaveFocus();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A label is not a control - it must never be focusable in its own right.
   */
  it("does not render as a focusable control", () => {
    render(<Label>Email address</Label>);

    const label = screen.getByText("Email address");

    expect(label.tagName).toBe("LABEL");
    expect(label).not.toHaveAttribute("tabindex");
    expect(label).not.toHaveAttribute("role");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The label text must not become selectable, so a double click on it
   * does not highlight text instead of activating the control.
   */
  it("does not allow its text to be selected", () => {
    render(<Label>Email address</Label>);

    expect(
      screen.getByText("Email address"),
    ).toHaveClass("select-none");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A custom className must not remove the default typography.
   */
  it("does not drop the default typography when a custom className is given", () => {
    render(
      <Label className="gap-4">Email address</Label>,
    );

    const label = screen.getByText("Email address");

    expect(label).toHaveClass("gap-4");
    expect(label).toHaveClass("text-sm");
    expect(label).toHaveClass("font-medium");
  });
});
