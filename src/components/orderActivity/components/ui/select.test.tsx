import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";

type SelectOverrides = {
  open?: boolean;
  defaultOpen?: boolean;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
};

function renderSelect(
  props: SelectOverrides = {},
  triggerProps: { size?: "sm" | "default"; isLoading?: boolean } = {},
) {
  return render(
    <Select {...props}>
      <SelectTrigger {...triggerProps}>
        <SelectValue placeholder="Pick a status" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Statuses</SelectLabel>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectSeparator />
          <SelectItem value="closed" disabled>
            Closed
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>,
  );
}

describe("SelectTrigger", () => {
  it("renders with the combobox role and correct data-slot", () => {
    renderSelect();

    const trigger = screen.getByRole("combobox");

    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("data-slot", "select-trigger");
  });

  it("shows the placeholder while nothing is selected", () => {
    renderSelect();

    expect(screen.getByText("Pick a status")).toBeInTheDocument();
  });

  it("defaults to the default size", () => {
    renderSelect();

    expect(screen.getByRole("combobox")).toHaveAttribute("data-size", "default");
  });

  it("honours the sm size", () => {
    renderSelect({}, { size: "sm" });

    expect(screen.getByRole("combobox")).toHaveAttribute("data-size", "sm");
  });

  it("applies the default classes", () => {
    renderSelect();

    const trigger = screen.getByRole("combobox");

    expect(trigger).toHaveClass("w-full");
    expect(trigger).toHaveClass("rounded-md");
    expect(trigger).toHaveClass("border");
  });

  it("merges a custom className with the defaults", () => {
    render(
      <Select>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Pick a status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">Active</SelectItem>
        </SelectContent>
      </Select>,
    );

    expect(screen.getByRole("combobox")).toHaveClass("w-48");
    expect(screen.getByRole("combobox")).toHaveClass("rounded-md");
  });

  it("renders a chevron icon by default", () => {
    renderSelect();

    expect(screen.getByRole("combobox").querySelector("svg")).toBeInTheDocument();
  });

  it("swaps the chevron for a spinner while loading", () => {
    renderSelect({}, { isLoading: true });

    const trigger = screen.getByRole("combobox");

    expect(trigger.querySelector("svg")).not.toBeInTheDocument();
    expect(trigger.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("is disabled when the select is disabled", () => {
    renderSelect({ disabled: true });

    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("shows the selected label instead of the placeholder", () => {
    renderSelect({ defaultValue: "active" });

    expect(screen.getByRole("combobox")).toHaveTextContent("Active");
    expect(screen.queryByText("Pick a status")).not.toBeInTheDocument();
  });
});

describe("SelectContent", () => {
  it("is not rendered while closed", () => {
    renderSelect();

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("renders with the listbox role when open", () => {
    renderSelect({ defaultOpen: true });

    const listbox = screen.getByRole("listbox");

    expect(listbox).toBeInTheDocument();
    expect(listbox).toHaveAttribute("data-slot", "select-content");
  });

  it("applies the default classes", () => {
    renderSelect({ defaultOpen: true });

    const listbox = screen.getByRole("listbox");

    expect(listbox).toHaveClass("rounded-md");
    expect(listbox).toHaveClass("border");
    expect(listbox).toHaveClass("shadow-md");
  });

  it("renders into a portal, outside the trigger's container", () => {
    const { container } = renderSelect({ defaultOpen: true });

    expect(container).not.toContainElement(screen.getByRole("listbox"));
  });
});

describe("SelectItem, SelectLabel and SelectSeparator", () => {
  it("render each item as an option", () => {
    renderSelect({ defaultOpen: true });

    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("set the correct data-slot attributes", () => {
    const { baseElement } = renderSelect({ defaultOpen: true });

    expect(screen.getByRole("option", { name: "Active" })).toHaveAttribute(
      "data-slot",
      "select-item",
    );
    expect(
      baseElement.querySelector("[data-slot='select-label']"),
    ).toBeInTheDocument();
    expect(
      baseElement.querySelector("[data-slot='select-separator']"),
    ).toBeInTheDocument();
  });

  it("render the group label text", () => {
    renderSelect({ defaultOpen: true });

    expect(screen.getByText("Statuses")).toBeInTheDocument();
  });

  it("mark a disabled item", () => {
    renderSelect({ defaultOpen: true });

    expect(screen.getByRole("option", { name: "Closed" })).toHaveAttribute(
      "data-disabled",
    );
  });

  it("mark the selected item", () => {
    renderSelect({ defaultOpen: true, defaultValue: "pending" });

    expect(screen.getByRole("option", { name: "Pending" })).toHaveAttribute(
      "data-state",
      "checked",
    );
    expect(screen.getByRole("option", { name: "Active" })).toHaveAttribute(
      "data-state",
      "unchecked",
    );
  });

  it("merge a custom className with the defaults", () => {
    render(
      <Select defaultOpen>
        <SelectTrigger>
          <SelectValue placeholder="Pick a status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active" className="font-bold">
            Active
          </SelectItem>
        </SelectContent>
      </Select>,
    );

    const option = screen.getByRole("option", { name: "Active" });

    expect(option).toHaveClass("font-bold");
    expect(option).toHaveClass("rounded-sm");
  });
});

describe("Select interactions", () => {
  it("opens the listbox when the trigger is clicked", async () => {
    const user = userEvent.setup();
    renderSelect();

    await user.click(screen.getByRole("combobox"));

    expect(await screen.findByRole("listbox")).toBeInTheDocument();
  });

  it("selects an option and reports it via onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    renderSelect({ defaultOpen: true, onValueChange });

    await user.click(screen.getByRole("option", { name: "Pending" }));

    expect(onValueChange).toHaveBeenCalledWith("pending");
  });

  it("closes the listbox once an option is chosen", async () => {
    const user = userEvent.setup();
    renderSelect({ defaultOpen: true });

    await user.click(screen.getByRole("option", { name: "Pending" }));

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("shows the chosen option on the trigger", async () => {
    const user = userEvent.setup();
    renderSelect({ defaultOpen: true });

    await user.click(screen.getByRole("option", { name: "Pending" }));

    expect(screen.getByRole("combobox")).toHaveTextContent("Pending");
  });

  it("does not select a disabled option", async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    renderSelect({ defaultOpen: true, onValueChange });

    await user.click(screen.getByRole("option", { name: "Closed" }));

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    renderSelect({ defaultOpen: true });

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("honours a controlled value prop", async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    renderSelect({ defaultOpen: true, value: "active", onValueChange });

    await user.click(screen.getByRole("option", { name: "Pending" }));

    expect(onValueChange).toHaveBeenCalledWith("pending");
    expect(screen.getByRole("combobox")).toHaveTextContent("Active");
  });
});
