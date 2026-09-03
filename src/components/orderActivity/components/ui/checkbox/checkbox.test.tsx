import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
  it("renders with the checkbox role", () => {
    render(<Checkbox aria-label="Accept" />);

    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("sets the correct data-slot attribute", () => {
    render(<Checkbox aria-label="Accept" />);

    expect(screen.getByRole("checkbox")).toHaveAttribute(
      "data-slot",
      "checkbox",
    );
  });

  it("is unchecked by default", () => {
    render(<Checkbox aria-label="Accept" />);

    const checkbox = screen.getByRole("checkbox");

    expect(checkbox).not.toBeChecked();
    expect(checkbox).toHaveAttribute("data-state", "unchecked");
  });

  it("hides the indicator while unchecked", () => {
    const { container } = render(<Checkbox aria-label="Accept" />);

    expect(
      container.querySelector("[data-slot='checkbox-indicator']"),
    ).not.toBeInTheDocument();
  });

  it("shows the indicator once checked", () => {
    const { container } = render(
      <Checkbox aria-label="Accept" defaultChecked />,
    );

    expect(
      container.querySelector("[data-slot='checkbox-indicator']"),
    ).toBeInTheDocument();
  });

  it("respects defaultChecked", () => {
    render(<Checkbox aria-label="Accept" defaultChecked />);

    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("toggles when clicked", async () => {
    const user = userEvent.setup();
    render(<Checkbox aria-label="Accept" />);

    const checkbox = screen.getByRole("checkbox");

    await user.click(checkbox);
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it("calls onCheckedChange with the new state", async () => {
    const user = userEvent.setup();
    const onCheckedChange = jest.fn();
    render(<Checkbox aria-label="Accept" onCheckedChange={onCheckedChange} />);

    await user.click(screen.getByRole("checkbox"));

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("does not toggle while disabled", async () => {
    const user = userEvent.setup();
    render(<Checkbox aria-label="Accept" disabled />);

    const checkbox = screen.getByRole("checkbox");

    expect(checkbox).toBeDisabled();

    await user.click(checkbox);

    expect(checkbox).not.toBeChecked();
  });

  it("honours a controlled checked prop", async () => {
    const user = userEvent.setup();
    const onCheckedChange = jest.fn();
    render(
      <Checkbox
        aria-label="Accept"
        checked={false}
        onCheckedChange={onCheckedChange}
      />,
    );

    await user.click(screen.getByRole("checkbox"));

    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("supports the indeterminate state", () => {
    render(<Checkbox aria-label="Accept" checked="indeterminate" />);

    expect(screen.getByRole("checkbox")).toHaveAttribute(
      "data-state",
      "indeterminate",
    );
  });

  it("merges a custom className with the defaults", () => {
    render(<Checkbox aria-label="Accept" className="size-6" />);

    expect(screen.getByRole("checkbox")).toHaveClass("size-6");
    expect(screen.getByRole("checkbox")).toHaveClass("shrink-0");
  });
});
