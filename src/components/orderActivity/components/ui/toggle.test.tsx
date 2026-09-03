import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { Toggle, toggleVariants } from "./toggle";

describe("Toggle", () => {
  it("renders its children", () => {
    render(<Toggle>Bold</Toggle>);

    expect(screen.getByRole("button", { name: "Bold" })).toBeInTheDocument();
  });

  it("sets the correct data-slot attribute", () => {
    render(<Toggle>Bold</Toggle>);

    expect(screen.getByRole("button")).toHaveAttribute("data-slot", "toggle");
  });

  it("is off by default", () => {
    render(<Toggle>Bold</Toggle>);

    const toggle = screen.getByRole("button");

    expect(toggle).toHaveAttribute("data-state", "off");
    expect(toggle).toHaveAttribute("aria-pressed", "false");
  });

  it("respects defaultPressed", () => {
    render(<Toggle defaultPressed>Bold</Toggle>);

    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("toggles when clicked", async () => {
    const user = userEvent.setup();
    render(<Toggle>Bold</Toggle>);

    const toggle = screen.getByRole("button");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("data-state", "on");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("data-state", "off");
  });

  it("calls onPressedChange with the new state", async () => {
    const user = userEvent.setup();
    const onPressedChange = jest.fn();
    render(<Toggle onPressedChange={onPressedChange}>Bold</Toggle>);

    await user.click(screen.getByRole("button"));

    expect(onPressedChange).toHaveBeenCalledWith(true);
  });

  it("does not toggle while disabled", async () => {
    const user = userEvent.setup();
    render(<Toggle disabled>Bold</Toggle>);

    const toggle = screen.getByRole("button");

    expect(toggle).toBeDisabled();

    await user.click(toggle);

    expect(toggle).toHaveAttribute("data-state", "off");
  });

  it("honours a controlled pressed prop", async () => {
    const user = userEvent.setup();
    const onPressedChange = jest.fn();
    render(
      <Toggle pressed={false} onPressedChange={onPressedChange}>
        Bold
      </Toggle>,
    );

    await user.click(screen.getByRole("button"));

    expect(onPressedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
  });

  it("applies the default variant and size", () => {
    render(<Toggle>Bold</Toggle>);

    expect(screen.getByRole("button")).toHaveClass("bg-transparent");
    expect(screen.getByRole("button")).toHaveClass("h-9");
  });

  it("applies the outline variant", () => {
    render(<Toggle variant="outline">Bold</Toggle>);

    expect(screen.getByRole("button")).toHaveClass("border");
  });

  it.each([
    ["sm", "h-8"],
    ["lg", "h-10"],
  ] as const)("applies the %s size", (size, expectedClass) => {
    render(<Toggle size={size}>Bold</Toggle>);

    expect(screen.getByRole("button")).toHaveClass(expectedClass);
  });

  it("merges a custom className with the variant classes", () => {
    render(<Toggle className="w-20">Bold</Toggle>);

    expect(screen.getByRole("button")).toHaveClass("w-20");
    expect(screen.getByRole("button")).toHaveClass("rounded-md");
  });

  describe("toggleVariants", () => {
    it("returns the default classes when called with no args", () => {
      const classes = toggleVariants();

      expect(classes).toContain("bg-transparent");
      expect(classes).toContain("h-9");
    });

    it("returns the requested variant and size classes", () => {
      const classes = toggleVariants({ variant: "outline", size: "lg" });

      expect(classes).toContain("border-input");
      expect(classes).toContain("h-10");
    });
  });
});
