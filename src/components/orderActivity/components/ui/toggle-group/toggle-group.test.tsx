import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

describe("ToggleGroup", () => {
  it("sets the correct data-slot attribute", () => {
    const { container } = render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    );

    expect(
      container.querySelector("[data-slot='toggle-group']"),
    ).toBeInTheDocument();
  });

  it("applies the default classes", () => {
    const { container } = render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    );

    const group = container.querySelector("[data-slot='toggle-group']");

    expect(group).toHaveClass("flex");
    expect(group).toHaveClass("w-fit");
    expect(group).toHaveClass("rounded-md");
  });

  it("records variant and size as data attributes", () => {
    const { container } = render(
      <ToggleGroup type="single" variant="outline" size="sm">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    );

    const group = container.querySelector("[data-slot='toggle-group']");

    expect(group).toHaveAttribute("data-variant", "outline");
    expect(group).toHaveAttribute("data-size", "sm");
  });

  it("merges a custom className with the defaults", () => {
    const { container } = render(
      <ToggleGroup type="single" className="gap-2">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    );

    const group = container.querySelector("[data-slot='toggle-group']");

    expect(group).toHaveClass("gap-2");
    expect(group).toHaveClass("w-fit");
  });
});

describe("ToggleGroupItem", () => {
  it("renders its children", () => {
    render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
      </ToggleGroup>,
    );

    expect(screen.getByRole("radio", { name: "Bold" })).toBeInTheDocument();
  });

  it("sets the correct data-slot attribute", () => {
    render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
      </ToggleGroup>,
    );

    expect(screen.getByRole("radio", { name: "Bold" })).toHaveAttribute(
      "data-slot",
      "toggle-group-item",
    );
  });

  it("inherits variant and size from the group context", () => {
    render(
      <ToggleGroup type="single" variant="outline" size="lg">
        <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
      </ToggleGroup>,
    );

    const item = screen.getByRole("radio", { name: "Bold" });

    expect(item).toHaveAttribute("data-variant", "outline");
    expect(item).toHaveAttribute("data-size", "lg");
    // The size class comes from toggleVariants via the context.
    expect(item).toHaveClass("h-10");
  });

  it("falls back to its own variant when the group sets none", () => {
    render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="bold" variant="outline" size="sm">
          Bold
        </ToggleGroupItem>
      </ToggleGroup>,
    );

    const item = screen.getByRole("radio", { name: "Bold" });

    expect(item).toHaveAttribute("data-variant", "outline");
    expect(item).toHaveAttribute("data-size", "sm");
  });

  it("merges a custom className with the variant classes", () => {
    render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="bold" className="uppercase">
          Bold
        </ToggleGroupItem>
      </ToggleGroup>,
    );

    const item = screen.getByRole("radio", { name: "Bold" });

    expect(item).toHaveClass("uppercase");
    expect(item).toHaveClass("rounded-none");
  });
});

describe("ToggleGroup interactions", () => {
  it("selects an item on click for type='single'", async () => {
    const user = userEvent.setup();
    render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
        <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
      </ToggleGroup>,
    );

    await user.click(screen.getByRole("radio", { name: "Bold" }));

    expect(screen.getByRole("radio", { name: "Bold" })).toHaveAttribute(
      "data-state",
      "on",
    );
  });

  it("keeps only one item on for type='single'", async () => {
    const user = userEvent.setup();
    render(
      <ToggleGroup type="single" defaultValue="bold">
        <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
        <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
      </ToggleGroup>,
    );

    await user.click(screen.getByRole("radio", { name: "Italic" }));

    expect(screen.getByRole("radio", { name: "Italic" })).toHaveAttribute(
      "data-state",
      "on",
    );
    expect(screen.getByRole("radio", { name: "Bold" })).toHaveAttribute(
      "data-state",
      "off",
    );
  });

  it("allows several items on for type='multiple'", async () => {
    const user = userEvent.setup();
    render(
      <ToggleGroup type="multiple" defaultValue={["bold"]}>
        <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
        <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
      </ToggleGroup>,
    );

    await user.click(screen.getByRole("button", { name: "Italic" }));

    expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute(
      "data-state",
      "on",
    );
    expect(screen.getByRole("button", { name: "Italic" })).toHaveAttribute(
      "data-state",
      "on",
    );
  });

  it("calls onValueChange with the selected value", async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    render(
      <ToggleGroup type="single" onValueChange={onValueChange}>
        <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
      </ToggleGroup>,
    );

    await user.click(screen.getByRole("radio", { name: "Bold" }));

    expect(onValueChange).toHaveBeenCalledWith("bold");
  });

  it("does not toggle a disabled item", async () => {
    const user = userEvent.setup();
    render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="bold" disabled>
          Bold
        </ToggleGroupItem>
      </ToggleGroup>,
    );

    const item = screen.getByRole("radio", { name: "Bold" });

    expect(item).toBeDisabled();

    await user.click(item);

    expect(item).toHaveAttribute("data-state", "off");
  });
});
