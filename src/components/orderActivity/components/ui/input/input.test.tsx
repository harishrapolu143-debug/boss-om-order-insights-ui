import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { Input } from "./input";

const findInput = (container: HTMLElement) =>
  container.querySelector(
    "[data-slot='input']",
  ) as HTMLInputElement;

/**
 * ============================================================================
 * Input
 * ============================================================================
 */
describe("Input", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The Input should render with the expected data-slot attribute.
   */
  it("sets the correct data-slot attribute", () => {
    const { container } = render(<Input />);

    expect(findInput(container)).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The type prop should reach the underlying input element.
   */
  it("forwards the type prop", () => {
    const { container } = render(
      <Input type="email" />,
    );

    expect(findInput(container)).toHaveAttribute(
      "type",
      "email",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The default field styling should be applied.
   */
  it("applies the default classes", () => {
    const { container } = render(<Input />);

    const input = findInput(container);

    expect(input).toHaveClass("border-input");
    expect(input).toHaveClass("rounded-md");
    expect(input).toHaveClass("w-full");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A custom className should be merged with the defaults.
   */
  it("merges a custom className with the defaults", () => {
    const { container } = render(
      <Input className="max-w-xs" />,
    );

    expect(findInput(container)).toHaveClass(
      "max-w-xs",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The user should be able to type into the field.
   */
  it("accepts typed text", async () => {
    const user = userEvent.setup();

    render(<Input placeholder="Order number" />);

    const input = screen.getByPlaceholderText(
      "Order number",
    );

    await user.type(input, "SO-1024");

    expect(input).toHaveValue("SO-1024");
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
      <Input
        placeholder="Order number"
        onChange={onChange}
      />,
    );

    await user.type(
      screen.getByPlaceholderText("Order number"),
      "abc",
    );

    expect(onChange).toHaveBeenCalledTimes(3);
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A placeholder should be rendered.
   */
  it("renders a placeholder", () => {
    render(<Input placeholder="Order number" />);

    expect(
      screen.getByPlaceholderText("Order number"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A controlled value should be rendered as the field value.
   */
  it("supports a controlled value", () => {
    render(
      <Input value="SO-1024" onChange={() => {}} />,
    );

    expect(
      screen.getByDisplayValue("SO-1024"),
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
      <Input aria-invalid />,
    );

    expect(findInput(container)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Form attributes should be forwarded so the field works inside a form.
   */
  it("forwards form attributes", () => {
    const { container } = render(
      <Input name="orderNumber" required />,
    );

    const input = findInput(container);

    expect(input).toHaveAttribute(
      "name",
      "orderNumber",
    );

    expect(input).toBeRequired();
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
      <Input
        disabled
        placeholder="Order number"
        onChange={onChange}
      />,
    );

    const input = screen.getByPlaceholderText(
      "Order number",
    );

    await user.type(input, "SO-1024");

    expect(input).toHaveValue("");
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
      <Input disabled placeholder="Order number" />,
    );

    const input = screen.getByPlaceholderText(
      "Order number",
    );

    await user.tab();

    expect(input).not.toHaveFocus();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A read-only field must not change its value, even though it can
   * still be focused.
   */
  it("does not change value while read only", async () => {
    const user = userEvent.setup();

    render(
      <Input
        readOnly
        defaultValue="SO-1024"
        placeholder="Order number"
      />,
    );

    const input = screen.getByPlaceholderText(
      "Order number",
    );

    await user.type(input, "XYZ");

    expect(input).toHaveValue("SO-1024");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A controlled field with no change handler must not update itself.
   */
  it("does not update a controlled value without a change handler", async () => {
    const user = userEvent.setup();

    render(
      <Input
        value="SO-1024"
        readOnly
        placeholder="Order number"
      />,
    );

    const input = screen.getByPlaceholderText(
      "Order number",
    );

    await user.type(input, "XYZ");

    expect(input).toHaveValue("SO-1024");
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
      <Input
        maxLength={5}
        placeholder="Order number"
      />,
    );

    const input = screen.getByPlaceholderText(
      "Order number",
    );

    await user.type(input, "1234567890");

    expect(input).toHaveValue("12345");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A placeholder is a hint, not data - it must never become the value.
   */
  it("does not treat the placeholder as a value", () => {
    render(<Input placeholder="Order number" />);

    expect(
      screen.getByPlaceholderText("Order number"),
    ).toHaveValue("");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A valid field must not be reported as invalid.
   */
  it("does not report aria-invalid by default", () => {
    const { container } = render(<Input />);

    expect(findInput(container)).not.toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A custom className must not remove the default field styling.
   */
  it("does not drop the default classes when a custom className is given", () => {
    const { container } = render(
      <Input className="max-w-xs" />,
    );

    const input = findInput(container);

    expect(input).toHaveClass("max-w-xs");
    expect(input).toHaveClass("border-input");
    expect(input).toHaveClass("rounded-md");
  });
});
