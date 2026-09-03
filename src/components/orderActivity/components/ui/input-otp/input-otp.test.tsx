import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "./input-otp";

function renderOtp(
  props: {
    value?: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
  } = {},
) {
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

const slots = (container: HTMLElement) =>
  container.querySelectorAll("[data-slot='input-otp-slot']");

describe("InputOTP", () => {
  it("renders a text input for the whole code", () => {
    renderOtp();

    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("applies the container classes", () => {
    const { container } = renderOtp();

    // input-otp renders the container as the input's parent wrapper.
    const wrapper = container.querySelector(".has-disabled\\:opacity-50");

    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass("flex");
    expect(wrapper).toHaveClass("items-center");
  });

  it("merges a custom containerClassName", () => {
    const { container } = render(
      <InputOTP maxLength={2} containerClassName="justify-center">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
        </InputOTPGroup>
      </InputOTP>,
    );

    expect(container.querySelector(".justify-center")).toBeInTheDocument();
  });

  it("enforces maxLength on the underlying input", () => {
    renderOtp();

    expect(screen.getByRole("textbox")).toHaveAttribute("maxlength", "4");
  });

  it("is disabled when asked", () => {
    renderOtp({ disabled: true });

    expect(screen.getByRole("textbox")).toBeDisabled();
  });
});

describe("InputOTPGroup", () => {
  it("sets the correct data-slot attribute", () => {
    const { container } = renderOtp();

    expect(
      container.querySelectorAll("[data-slot='input-otp-group']"),
    ).toHaveLength(2);
  });

  it("applies the default classes", () => {
    const { container } = renderOtp();

    const group = container.querySelector("[data-slot='input-otp-group']");

    expect(group).toHaveClass("flex");
    expect(group).toHaveClass("items-center");
  });

  it("merges a custom className with the defaults", () => {
    const { container } = render(
      <InputOTP maxLength={1}>
        <InputOTPGroup className="gap-4">
          <InputOTPSlot index={0} />
        </InputOTPGroup>
      </InputOTP>,
    );

    const group = container.querySelector("[data-slot='input-otp-group']");

    expect(group).toHaveClass("gap-4");
    expect(group).toHaveClass("flex");
  });
});

describe("InputOTPSlot", () => {
  it("renders one slot per index", () => {
    const { container } = renderOtp();

    expect(slots(container)).toHaveLength(4);
  });

  it("applies the default classes", () => {
    const { container } = renderOtp();

    const slot = slots(container)[0];

    expect(slot).toHaveClass("h-9");
    expect(slot).toHaveClass("w-9");
    expect(slot).toHaveClass("border-y");
  });

  it("merges a custom className with the defaults", () => {
    const { container } = render(
      <InputOTP maxLength={1}>
        <InputOTPGroup>
          <InputOTPSlot index={0} className="h-12" />
        </InputOTPGroup>
      </InputOTP>,
    );

    const slot = slots(container)[0];

    expect(slot).toHaveClass("h-12");
    expect(slot).toHaveClass("border-y");
  });

  it("is empty before anything is typed", () => {
    const { container } = renderOtp();

    slots(container).forEach((slot) => {
      expect(slot).toHaveTextContent("");
    });
  });

  it("shows each typed character in its own slot", async () => {
    const user = userEvent.setup();
    const { container } = renderOtp();

    await user.type(screen.getByRole("textbox"), "1234");

    expect(slots(container)[0]).toHaveTextContent("1");
    expect(slots(container)[1]).toHaveTextContent("2");
    expect(slots(container)[2]).toHaveTextContent("3");
    expect(slots(container)[3]).toHaveTextContent("4");
  });

  it("renders a controlled value across the slots", () => {
    const { container } = renderOtp({ value: "98", onChange: () => {} });

    expect(slots(container)[0]).toHaveTextContent("9");
    expect(slots(container)[1]).toHaveTextContent("8");
    expect(slots(container)[2]).toHaveTextContent("");
  });

  it("calls onChange as the code is typed", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    renderOtp({ onChange });

    await user.type(screen.getByRole("textbox"), "12");

    expect(onChange).toHaveBeenCalledWith("1");
    expect(onChange).toHaveBeenCalledWith("12");
  });

  it("does not accept more characters than maxLength", async () => {
    const user = userEvent.setup();
    renderOtp();

    await user.type(screen.getByRole("textbox"), "123456");

    expect(screen.getByRole("textbox")).toHaveValue("1234");
  });
});

describe("InputOTPSeparator", () => {
  it("renders with the separator role and correct data-slot", () => {
    const { container } = renderOtp();

    const separator = container.querySelector(
      "[data-slot='input-otp-separator']",
    );

    expect(separator).toBeInTheDocument();
    expect(separator).toHaveAttribute("role", "separator");
  });

  it("renders a minus icon", () => {
    const { container } = renderOtp();

    const separator = container.querySelector(
      "[data-slot='input-otp-separator']",
    );

    expect(separator?.querySelector("svg")).toBeInTheDocument();
  });
});
