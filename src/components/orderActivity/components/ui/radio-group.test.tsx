import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { RadioGroup, RadioGroupItem } from "./radio-group";

function renderGroup(
  props: {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    disabled?: boolean;
  } = {},
) {
  return render(
    <RadioGroup aria-label="Delivery speed" {...props}>
      <RadioGroupItem value="standard" aria-label="Standard" />
      <RadioGroupItem value="express" aria-label="Express" />
    </RadioGroup>,
  );
}

describe("RadioGroup", () => {
  it("renders with the radiogroup role", () => {
    renderGroup();

    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });

  it("sets the correct data-slot attribute", () => {
    renderGroup();

    expect(screen.getByRole("radiogroup")).toHaveAttribute(
      "data-slot",
      "radio-group",
    );
  });

  it("renders each item as a radio", () => {
    renderGroup();

    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });

  it("applies the default classes", () => {
    renderGroup();

    expect(screen.getByRole("radiogroup")).toHaveClass("grid");
    expect(screen.getByRole("radiogroup")).toHaveClass("gap-3");
  });

  it("merges a custom className with the defaults", () => {
    render(
      <RadioGroup aria-label="Delivery speed" className="gap-8">
        <RadioGroupItem value="standard" aria-label="Standard" />
      </RadioGroup>,
    );

    expect(screen.getByRole("radiogroup")).toHaveClass("gap-8");
    expect(screen.getByRole("radiogroup")).toHaveClass("grid");
  });
});

describe("RadioGroupItem", () => {
  it("sets the correct data-slot attribute", () => {
    renderGroup();

    expect(screen.getByRole("radio", { name: "Standard" })).toHaveAttribute(
      "data-slot",
      "radio-group-item",
    );
  });

  it("starts unchecked when no value is given", () => {
    renderGroup();

    screen.getAllByRole("radio").forEach((radio) => {
      expect(radio).not.toBeChecked();
    });
  });

  it("respects defaultValue", () => {
    renderGroup({ defaultValue: "express" });

    expect(screen.getByRole("radio", { name: "Express" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Standard" })).not.toBeChecked();
  });

  it("renders the indicator only for the selected item", () => {
    const { container } = renderGroup({ defaultValue: "express" });

    expect(
      container.querySelectorAll("[data-slot='radio-group-indicator']"),
    ).toHaveLength(1);
  });

  it("selects an item when clicked", async () => {
    const user = userEvent.setup();
    renderGroup();

    await user.click(screen.getByRole("radio", { name: "Express" }));

    expect(screen.getByRole("radio", { name: "Express" })).toBeChecked();
  });

  it("calls onValueChange with the selected value", async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    renderGroup({ onValueChange });

    await user.click(screen.getByRole("radio", { name: "Express" }));

    expect(onValueChange).toHaveBeenCalledWith("express");
  });

  it("allows only one selection at a time", async () => {
    const user = userEvent.setup();
    renderGroup({ defaultValue: "standard" });

    await user.click(screen.getByRole("radio", { name: "Express" }));

    expect(screen.getByRole("radio", { name: "Express" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Standard" })).not.toBeChecked();
  });

  it("does not select while the group is disabled", async () => {
    const user = userEvent.setup();
    renderGroup({ disabled: true });

    const radio = screen.getByRole("radio", { name: "Express" });

    expect(radio).toBeDisabled();

    await user.click(radio);

    expect(radio).not.toBeChecked();
  });

  it("merges a custom className with the defaults", () => {
    render(
      <RadioGroup aria-label="Delivery speed">
        <RadioGroupItem
          value="standard"
          aria-label="Standard"
          className="size-6"
        />
      </RadioGroup>,
    );

    const radio = screen.getByRole("radio", { name: "Standard" });

    expect(radio).toHaveClass("size-6");
    expect(radio).toHaveClass("rounded-full");
  });
});
