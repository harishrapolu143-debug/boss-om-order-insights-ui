import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { Button } from "./button";

/**
 * ============================================================================
 * Button
 * ============================================================================
 */
describe("Button", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The Button should render with the expected data-slot attribute.
   */
  it("sets the correct data-slot attribute", () => {
    render(<Button>Save</Button>);

    expect(
      screen.getByRole("button", { name: "Save" }),
    ).toHaveAttribute("data-slot", "button");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The button should render its children as the accessible name.
   */
  it("renders its children", () => {
    render(<Button>Save</Button>);

    expect(
      screen.getByRole("button", { name: "Save" }),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The default variant and size classes should be applied.
   */
  it("applies the default variant and size classes", () => {
    render(<Button>Save</Button>);

    const button = screen.getByRole("button", {
      name: "Save",
    });

    expect(button).toHaveClass("bg-primary");
    expect(button).toHaveClass("h-9");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * An explicit variant should replace the default variant classes.
   */
  it("applies an explicit variant", () => {
    render(
      <Button variant="destructive">Delete</Button>,
    );

    expect(
      screen.getByRole("button", { name: "Delete" }),
    ).toHaveClass("bg-destructive");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * An explicit size should replace the default size classes.
   */
  it("applies an explicit size", () => {
    render(<Button size="lg">Save</Button>);

    expect(
      screen.getByRole("button", { name: "Save" }),
    ).toHaveClass("h-10");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A custom className should be merged with the variant classes.
   */
  it("merges a custom className with the variant classes", () => {
    render(
      <Button className="w-full">Save</Button>,
    );

    const button = screen.getByRole("button", {
      name: "Save",
    });

    expect(button).toHaveClass("w-full");
    expect(button).toHaveClass("bg-primary");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Clicking the button should call its handler.
   */
  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(
      <Button onClick={onClick}>Save</Button>,
    );

    await user.click(
      screen.getByRole("button", { name: "Save" }),
    );

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The button should be activatable from the keyboard.
   */
  it("activates with the keyboard", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(
      <Button onClick={onClick}>Save</Button>,
    );

    await user.tab();
    await user.keyboard("{Enter}");

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * asChild should render the child element while keeping button styling.
   */
  it("renders as its child element when asChild is set", () => {
    render(
      <Button asChild>
        <a href="/orders">Orders</a>
      </Button>,
    );

    const link = screen.getByRole("link", {
      name: "Orders",
    });

    expect(link).toHaveAttribute("href", "/orders");
    expect(link).toHaveClass("bg-primary");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The submit type should be forwarded so the button can submit a form.
   */
  it("forwards the type attribute", () => {
    render(<Button type="submit">Save</Button>);

    expect(
      screen.getByRole("button", { name: "Save" }),
    ).toHaveAttribute("type", "submit");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A disabled button must not invoke its click handler.
   */
  it("does not call onClick while disabled", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    );

    await user.click(
      screen.getByRole("button", { name: "Save" }),
    );

    expect(onClick).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A disabled button must not be reachable with the keyboard.
   */
  it("does not receive focus while disabled", async () => {
    const user = userEvent.setup();

    render(<Button disabled>Save</Button>);

    await user.tab();

    expect(
      screen.getByRole("button", { name: "Save" }),
    ).not.toHaveFocus();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A disabled button must not submit the form it belongs to.
   */
  it("does not submit a form while disabled", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn((event: React.FormEvent) =>
      event.preventDefault(),
    );

    render(
      <form onSubmit={onSubmit}>
        <Button type="submit" disabled>
          Save
        </Button>
      </form>,
    );

    await user.click(
      screen.getByRole("button", { name: "Save" }),
    );

    expect(onSubmit).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Choosing one variant must NOT leave the classes of another variant
   * behind.
   */
  it("does not keep the default variant classes when another variant is used", () => {
    render(
      <Button variant="outline">Save</Button>,
    );

    const button = screen.getByRole("button", {
      name: "Save",
    });

    expect(button).not.toHaveClass("bg-primary");
    expect(button).not.toHaveClass("bg-destructive");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Choosing one size must NOT leave the classes of another size behind.
   */
  it("does not keep the default size classes when another size is used", () => {
    render(<Button size="sm">Save</Button>);

    const button = screen.getByRole("button", {
      name: "Save",
    });

    expect(button).toHaveClass("h-8");
    expect(button).not.toHaveClass("h-9");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * With asChild set, the component must NOT render a nested button
   * element around the child.
   */
  it("does not render a button element when asChild is set", () => {
    render(
      <Button asChild>
        <a href="/orders">Orders</a>
      </Button>,
    );

    expect(
      screen.queryByRole("button"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A button must not default to type="submit", which would make it
   * submit any surrounding form by accident.
   */
  it("does not default to a submit type", () => {
    render(<Button>Save</Button>);

    expect(
      screen.getByRole("button", { name: "Save" }),
    ).not.toHaveAttribute("type", "submit");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * An icon inside the button must not swallow the button's own click.
   */
  it("does not make an inner icon a separate click target", () => {
    render(
      <Button>
        <svg data-testid="icon" />
        Save
      </Button>,
    );

    const button = screen.getByRole("button", {
      name: "Save",
    });

    expect(button.className).toContain(
      "[&_svg]:pointer-events-none",
    );
  });
});
