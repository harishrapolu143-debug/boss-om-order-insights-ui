import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { Button, buttonVariants } from "./button";

describe("Button", () => {
  it("renders its children", () => {
    render(<Button>Save</Button>);

    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("sets the correct data-slot attribute", () => {
    render(<Button>Save</Button>);

    expect(screen.getByRole("button")).toHaveAttribute("data-slot", "button");
  });

  it("applies the default variant and size", () => {
    render(<Button>Save</Button>);

    const button = screen.getByRole("button");

    expect(button).toHaveClass("bg-primary");
    expect(button).toHaveClass("text-primary-foreground");
    expect(button).toHaveClass("h-9");
  });

  it.each([
    ["destructive", "bg-destructive"],
    ["outline", "border"],
    ["secondary", "bg-secondary"],
    ["ghost", "hover:bg-accent"],
    ["link", "text-primary"],
  ] as const)("applies the %s variant", (variant, expectedClass) => {
    render(<Button variant={variant}>Save</Button>);

    expect(screen.getByRole("button")).toHaveClass(expectedClass);
  });

  it.each([
    ["sm", "h-8"],
    ["lg", "h-10"],
    ["icon", "size-9"],
  ] as const)("applies the %s size", (size, expectedClass) => {
    render(<Button size={size}>Save</Button>);

    expect(screen.getByRole("button")).toHaveClass(expectedClass);
  });

  it("merges a custom className with the variant classes", () => {
    render(<Button className="w-full">Save</Button>);

    expect(screen.getByRole("button")).toHaveClass("w-full");
    expect(screen.getByRole("button")).toHaveClass("bg-primary");
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Save</Button>);

    await user.click(screen.getByRole("button"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick while disabled", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(
      <Button onClick={onClick} disabled>
        Save
      </Button>,
    );

    expect(screen.getByRole("button")).toBeDisabled();

    await user.click(screen.getByRole("button"));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("forwards the type prop", () => {
    render(<Button type="submit">Save</Button>);

    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("renders as the child element when asChild is set", () => {
    render(
      <Button asChild>
        <a href="/orders">Orders</a>
      </Button>,
    );

    const link = screen.getByRole("link", { name: "Orders" });

    expect(link).toHaveAttribute("href", "/orders");
    expect(link).toHaveAttribute("data-slot", "button");
    expect(link).toHaveClass("bg-primary");
  });

  describe("buttonVariants", () => {
    it("returns the default classes when called with no args", () => {
      const classes = buttonVariants();

      expect(classes).toContain("bg-primary");
      expect(classes).toContain("h-9");
    });

    it("returns the requested variant and size classes", () => {
      const classes = buttonVariants({ variant: "outline", size: "lg" });

      expect(classes).toContain("bg-background");
      expect(classes).toContain("h-10");
    });
  });
});
