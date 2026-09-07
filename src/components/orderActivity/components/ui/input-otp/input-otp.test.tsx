import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "./input-otp";

type OTPOverrides = {
  value?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
};

function renderOTP(props: OTPOverrides = {}) {
  return render(
    <InputOTP maxLength={4} {...props}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
      </InputOTPGroup>

      <InputOTPSeparator />

      <InputOTPGroup>
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
      </InputOTPGroup>
    </InputOTP>,
  );
}

const getInput = () =>
  document.querySelector(
    "[data-slot='input-otp']",
  ) as HTMLInputElement;

const getSlots = (container: HTMLElement) =>
  container.querySelectorAll(
    "[data-slot='input-otp-slot']",
  );

/**
 * ============================================================================
 * InputOTP
 * ============================================================================
 */
describe("InputOTP", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Every OTP part should render with its own data-slot attribute.
   */
  it("sets the correct data-slot attributes for every part", () => {
    const { container } = renderOTP();

    [
      "input-otp",
      "input-otp-group",
      "input-otp-slot",
      "input-otp-separator",
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
   * One slot should be rendered per declared index.
   */
  it("renders one slot per index", () => {
    const { container } = renderOTP();

    expect(getSlots(container)).toHaveLength(4);
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Typed characters should be distributed across the slots.
   */
  it("shows typed characters in the slots", async () => {
    const user = userEvent.setup();

    const { container } = renderOTP();

    await user.type(getInput(), "12");

    const slots = getSlots(container);

    expect(slots[0]).toHaveTextContent("1");
    expect(slots[1]).toHaveTextContent("2");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * onChange should report the value as it is typed.
   */
  it("calls onChange as the user types", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    renderOTP({ onChange });

    await user.type(getInput(), "12");

    expect(onChange).toHaveBeenLastCalledWith("12");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * onComplete should fire once every slot is filled.
   */
  it("calls onComplete when every slot is filled", async () => {
    const user = userEvent.setup();
    const onComplete = jest.fn();

    renderOTP({ onComplete });

    await user.type(getInput(), "1234");

    expect(onComplete).toHaveBeenCalledWith("1234");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A controlled value should be shown across the slots.
   */
  it("shows a controlled value", () => {
    const { container } = renderOTP({
      value: "1234",
      onChange: () => {},
    });

    const slots = getSlots(container);

    expect(slots[0]).toHaveTextContent("1");
    expect(slots[3]).toHaveTextContent("4");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The active slot should be marked so it can be highlighted.
   */
  it("marks the active slot", async () => {
    const user = userEvent.setup();

    const { container } = renderOTP();

    await user.click(getInput());

    expect(getSlots(container)[0]).toHaveAttribute(
      "data-active",
      "true",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A separator should be rendered between the groups.
   */
  it("renders a separator between the groups", () => {
    const { container } = renderOTP();

    const separator = container.querySelector(
      "[data-slot='input-otp-separator']",
    ) as HTMLElement;

    expect(
      separator.querySelector("svg"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The slots must be empty until something is typed.
   */
  it("does not show any characters before input", () => {
    const { container } = renderOTP();

    getSlots(container).forEach((slot) => {
      expect(slot).toHaveTextContent("");
    });
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * More characters than maxLength must NOT be accepted.
   */
  it("does not accept more characters than maxLength", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    renderOTP({ onChange });

    await user.type(getInput(), "1234567");

    expect(onChange).toHaveBeenLastCalledWith(
      "1234",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * onComplete must NOT fire while the code is still incomplete.
   */
  it("does not call onComplete before every slot is filled", async () => {
    const user = userEvent.setup();
    const onComplete = jest.fn();

    renderOTP({ onComplete });

    await user.type(getInput(), "12");

    expect(onComplete).not.toHaveBeenCalled();
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

    renderOTP({ disabled: true, onChange });

    await user.type(getInput(), "12");

    expect(onChange).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Only one slot may be active at a time.
   */
  it("does not mark more than one slot as active", async () => {
    const user = userEvent.setup();

    const { container } = renderOTP();

    await user.click(getInput());

    expect(
      Array.from(getSlots(container)).filter(
        (slot) =>
          slot.getAttribute("data-active") === "true",
      ),
    ).toHaveLength(1);
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Untouched slots must not be marked active.
   */
  it("does not mark any slot as active before focus", () => {
    const { container } = renderOTP();

    Array.from(getSlots(container)).forEach(
      (slot) => {
        expect(slot).not.toHaveAttribute(
          "data-active",
          "true",
        );
      },
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The separator is decoration - it must NOT be a slot or hold a
   * character.
   */
  it("does not treat the separator as a slot", () => {
    const { container } = renderOTP();

    const separator = container.querySelector(
      "[data-slot='input-otp-separator']",
    ) as HTMLElement;

    expect(separator).not.toHaveAttribute(
      "data-slot",
      "input-otp-slot",
    );

    expect(separator).toHaveAttribute(
      "role",
      "separator",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A controlled field must not change on its own.
   */
  it("does not change a controlled value without a handler", async () => {
    const user = userEvent.setup();

    const { container } = renderOTP({
      value: "12",
      onChange: () => {},
    });

    await user.type(getInput(), "34");

    const slots = getSlots(container);

    expect(slots[2]).toHaveTextContent("");
    expect(slots[3]).toHaveTextContent("");
  });
});
