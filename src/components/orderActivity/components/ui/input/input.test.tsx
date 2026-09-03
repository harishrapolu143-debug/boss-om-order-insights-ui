import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { Input } from "./input";

describe("Input", () => {
  it("sets the correct data-slot attribute", () => {
    render(<Input aria-label="Name" />);

    expect(screen.getByLabelText("Name")).toHaveAttribute("data-slot", "input");
  });

  it("forwards the type prop", () => {
    render(<Input type="password" aria-label="Password" />);

    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "type",
      "password",
    );
  });

  it("applies the default classes", () => {
    render(<Input aria-label="Name" />);

    const input = screen.getByLabelText("Name");

    expect(input).toHaveClass("h-9");
    expect(input).toHaveClass("w-full");
    expect(input).toHaveClass("rounded-md");
    expect(input).toHaveClass("border");
  });

  it("merges a custom className with the defaults", () => {
    render(<Input className="max-w-xs" aria-label="Name" />);

    expect(screen.getByLabelText("Name")).toHaveClass("max-w-xs");
    expect(screen.getByLabelText("Name")).toHaveClass("rounded-md");
  });

  it("accepts typed text", async () => {
    const user = userEvent.setup();
    render(<Input aria-label="Name" />);

    const input = screen.getByLabelText("Name");
    await user.type(input, "KS1300400032");

    expect(input).toHaveValue("KS1300400032");
  });

  it("calls onChange for each keystroke", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Input aria-label="Name" onChange={onChange} />);

    await user.type(screen.getByLabelText("Name"), "abc");

    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it("does not accept input while disabled", async () => {
    const user = userEvent.setup();
    render(<Input aria-label="Name" disabled />);

    const input = screen.getByLabelText("Name");

    expect(input).toBeDisabled();

    await user.type(input, "abc");

    expect(input).toHaveValue("");
  });

  it("renders a placeholder", () => {
    render(<Input placeholder="Search orders" />);

    expect(screen.getByPlaceholderText("Search orders")).toBeInTheDocument();
  });

  it("supports a controlled value", () => {
    render(<Input aria-label="Name" value="fixed" onChange={() => {}} />);

    expect(screen.getByLabelText("Name")).toHaveValue("fixed");
  });

  it("reflects aria-invalid", () => {
    render(<Input aria-label="Name" aria-invalid />);

    expect(screen.getByLabelText("Name")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });
});
