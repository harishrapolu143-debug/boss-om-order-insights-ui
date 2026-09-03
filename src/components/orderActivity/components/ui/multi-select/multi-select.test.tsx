import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { MultiSelect } from "./multi-select";

const OPTIONS = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "closed", label: "Closed" },
];

function renderMultiSelect(
  props: Partial<React.ComponentProps<typeof MultiSelect>> = {},
) {
  const onChange = props.onChange ?? jest.fn();

  const utils = render(
    <MultiSelect
      options={OPTIONS}
      selected={[]}
      onChange={onChange}
      {...props}
    />,
  );

  return { ...utils, onChange };
}

describe("MultiSelect trigger", () => {
  it("renders a combobox button", () => {
    renderMultiSelect();

    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("shows the default placeholder when nothing is selected", () => {
    renderMultiSelect();

    expect(screen.getByText("Select items")).toBeInTheDocument();
  });

  it("shows a custom placeholder", () => {
    renderMultiSelect({ placeholder: "Pick statuses" });

    expect(screen.getByText("Pick statuses")).toBeInTheDocument();
  });

  it("lists the selected labels instead of the placeholder", () => {
    renderMultiSelect({ selected: ["active", "pending"] });

    expect(screen.queryByText("Select items")).not.toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveTextContent("Active");
    expect(screen.getByRole("combobox")).toHaveTextContent("Pending");
  });

  it("separates multiple selected labels with a comma", () => {
    renderMultiSelect({ selected: ["active", "pending"] });

    // The last label has no trailing comma.
    expect(screen.getByRole("combobox")).toHaveTextContent("Active,Pending");
  });

  it("reports the collapsed state via aria-expanded", () => {
    renderMultiSelect();

    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("merges a custom className onto the trigger", () => {
    renderMultiSelect({ className: "w-64" });

    expect(screen.getByRole("combobox")).toHaveClass("w-64");
  });

  it("renders a chevron icon", () => {
    renderMultiSelect();

    expect(screen.getByRole("combobox").querySelector("svg")).toBeInTheDocument();
  });

  it("is disabled when asked", () => {
    renderMultiSelect({ disabled: true });

    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("renders an option icon when one is supplied", () => {
    renderMultiSelect({
      options: [
        { value: "active", label: "Active", icon: <span>ICON</span> },
      ],
      selected: ["active"],
    });

    expect(screen.getByText("ICON")).toBeInTheDocument();
  });
});

describe("MultiSelect popover", () => {
  it("is closed initially", () => {
    renderMultiSelect();

    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("opens when the trigger is clicked", async () => {
    const user = userEvent.setup();
    renderMultiSelect();

    await user.click(screen.getByRole("combobox"));

    expect(await screen.findAllByRole("checkbox")).toHaveLength(3);
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("renders a labelled row per option", async () => {
    const user = userEvent.setup();
    renderMultiSelect();

    await user.click(screen.getByRole("combobox"));

    for (const option of OPTIONS) {
      expect(
        await screen.findByLabelText(option.label),
      ).toBeInTheDocument();
    }
  });

  it("checks the boxes for already-selected values", async () => {
    const user = userEvent.setup();
    renderMultiSelect({ selected: ["pending"] });

    await user.click(screen.getByRole("combobox"));

    expect(await screen.findByLabelText("Pending")).toBeChecked();
    expect(screen.getByLabelText("Active")).not.toBeChecked();
  });

  it("does not open while disabled", async () => {
    const user = userEvent.setup();
    renderMultiSelect({ disabled: true });

    await user.click(screen.getByRole("combobox"));

    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });
});

describe("MultiSelect selection", () => {
  it("calls onChange with the value when a checkbox is clicked", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    renderMultiSelect({ onChange });

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByLabelText("Pending"));

    expect(onChange).toHaveBeenCalledWith("pending");
  });

  it("calls onChange when an already-selected value is clicked again", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    renderMultiSelect({ selected: ["pending"], onChange });

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByLabelText("Pending"));

    // Toggling off is the parent's job - the component always reports the value.
    expect(onChange).toHaveBeenCalledWith("pending");
  });

  it("is fully controlled - selection does not change without the parent", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    renderMultiSelect({ onChange });

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByLabelText("Pending"));

    expect(screen.getByLabelText("Pending")).not.toBeChecked();
  });

  it("reflects a selection pushed in by the parent", async () => {
    const user = userEvent.setup();
    const { rerender } = renderMultiSelect();

    await user.click(screen.getByRole("combobox"));
    await screen.findByLabelText("Pending");

    rerender(
      <MultiSelect
        options={OPTIONS}
        selected={["pending"]}
        onChange={jest.fn()}
      />,
    );

    expect(screen.getByLabelText("Pending")).toBeChecked();
  });

  it("renders nothing to pick when the option list is empty", async () => {
    const user = userEvent.setup();
    renderMultiSelect({ options: [] });

    await user.click(screen.getByRole("combobox"));

    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });
});
