import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { Textarea } from "./textarea";

const findTextarea = (container: HTMLElement) =>
  container.querySelector(
    "[data-slot='textarea']",
  ) as HTMLTextAreaElement;

/**
 * ============================================================================
 * Textarea
 * ============================================================================
 */
describe("Textarea", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The Textarea should render with the expected data-slot attribute.
   */
  it("sets the correct data-slot attribute", () => {
    const { container } = render(<Textarea />);

    expect(
      findTextarea(container),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The default field styling should be applied.
   */
  it("applies the default classes", () => {
    const { container } = render(<Textarea />);

    const textarea = findTextarea(container);

    expect(textarea).toHaveClass("border-input");
    expect(textarea).toHaveClass("min-h-16");
    expect(textarea).toHaveClass("w-full");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A custom className should be merged with the defaults.
   */
  it("merges a custom className with the defaults", () => {
    const { container } = render(
      <Textarea className="min-h-40" />,
    );

    expect(findTextarea(container)).toHaveClass(
      "min-h-40",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The user should be able to type multi-line text.
   */
  it("accepts typed text", async () => {
    const user = userEvent.setup();

    render(<Textarea placeholder="Notes" />);

    const textarea =
      screen.getByPlaceholderText("Notes");

    await user.type(textarea, "Line one");

    expect(textarea).toHaveValue("Line one");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Enter should insert a newline rather than submitting.
   */
  it("accepts multi-line input", async () => {
    const user = userEvent.setup();

    render(<Textarea placeholder="Notes" />);

    const textarea =
      screen.getByPlaceholderText("Notes");

    await user.type(textarea, "one{Enter}two");

    expect(textarea).toHaveValue("one\ntwo");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * onChange should fire once per keystroke.
   */
  it("calls onChange for each keystroke", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <Textarea
        placeholder="Notes"
        onChange={onChange}
      />,
    );

    await user.type(
      screen.getByPlaceholderText("Notes"),
      "abc",
    );

    expect(onChange).toHaveBeenCalledTimes(3);
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A controlled value should be rendered as the field value.
   */
  it("supports a controlled value", () => {
    render(
      <Textarea
        value="Shipment delayed"
        onChange={() => {}}
      />,
    );

    expect(
      screen.getByDisplayValue("Shipment delayed"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The invalid state should be exposed to assistive technology.
   */
  it("reflects aria-invalid", () => {
    const { container } = render(
      <Textarea aria-invalid />,
    );

    expect(findTextarea(container)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A disabled field must not accept input.
   */
  it("does not accept input while disabled", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <Textarea
        disabled
        placeholder="Notes"
        onChange={onChange}
      />,
    );

    const textarea =
      screen.getByPlaceholderText("Notes");

    await user.type(textarea, "Line one");

    expect(textarea).toHaveValue("");
    expect(onChange).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A disabled field must not take focus with the keyboard.
   */
  it("does not receive focus while disabled", async () => {
    const user = userEvent.setup();

    render(
      <Textarea disabled placeholder="Notes" />,
    );

    await user.tab();

    expect(
      screen.getByPlaceholderText("Notes"),
    ).not.toHaveFocus();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A read-only field must not change its value.
   */
  it("does not change value while read only", async () => {
    const user = userEvent.setup();

    render(
      <Textarea
        readOnly
        defaultValue="Original note"
        placeholder="Notes"
      />,
    );

    const textarea =
      screen.getByPlaceholderText("Notes");

    await user.type(textarea, " edited");

    expect(textarea).toHaveValue("Original note");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * maxLength must stop extra characters from being entered.
   */
  it("does not accept more characters than maxLength allows", async () => {
    const user = userEvent.setup();

    render(
      <Textarea maxLength={4} placeholder="Notes" />,
    );

    const textarea =
      screen.getByPlaceholderText("Notes");

    await user.type(textarea, "abcdefgh");

    expect(textarea).toHaveValue("abcd");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The field must not be user-resizable, which is what the resize-none
   * class exists to guarantee.
   */
  it("does not allow the user to resize the field", () => {
    const { container } = render(<Textarea />);

    expect(findTextarea(container)).toHaveClass(
      "resize-none",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A placeholder is a hint, not data - it must never become the value.
   */
  it("does not treat the placeholder as a value", () => {
    render(<Textarea placeholder="Notes" />);

    expect(
      screen.getByPlaceholderText("Notes"),
    ).toHaveValue("");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A valid field must not be reported as invalid.
   */
  it("does not report aria-invalid by default", () => {
    const { container } = render(<Textarea />);

    expect(
      findTextarea(container),
    ).not.toHaveAttribute("aria-invalid", "true");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The component must render a textarea, not a single-line input.
   */
  it("does not render a single-line input element", () => {
    const { container } = render(<Textarea />);

    expect(findTextarea(container).tagName).toBe(
      "TEXTAREA",
    );

    expect(
      container.querySelector("input"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A custom className must not remove the default field styling.
   */
  it("does not drop the default classes when a custom className is given", () => {
    const { container } = render(
      <Textarea className="min-h-40" />,
    );

    const textarea = findTextarea(container);

    expect(textarea).toHaveClass("min-h-40");
    expect(textarea).toHaveClass("border-input");
    expect(textarea).toHaveClass("resize-none");
  });
});
