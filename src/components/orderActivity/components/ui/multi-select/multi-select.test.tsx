import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { MultiSelect } from "./multi-select";

const OPTIONS = [
  { value: "open", label: "Open" },
  { value: "shipped", label: "Shipped" },
  { value: "cancelled", label: "Cancelled" },
];

function renderMultiSelect(
  props: Partial<
    React.ComponentProps<typeof MultiSelect>
  > = {},
) {
  const onChange = props.onChange ?? jest.fn();

  const utils = render(
    <MultiSelect
      options={OPTIONS}
      selected={props.selected ?? []}
      onChange={onChange}
      {...props}
    />,
  );

  return { ...utils, onChange };
}

const getTrigger = () =>
  screen.getByRole("combobox");

/**
 * ============================================================================
 * MultiSelect
 * ============================================================================
 */
describe("MultiSelect", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The trigger should be exposed as a combobox.
   */
  it("renders the trigger as a combobox", () => {
    renderMultiSelect();

    expect(getTrigger()).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The placeholder should be shown while nothing is selected.
   */
  it("shows the placeholder while nothing is selected", () => {
    renderMultiSelect({
      placeholder: "Select statuses",
    });

    expect(
      screen.getByText("Select statuses"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Selected labels should be listed on the trigger.
   */
  it("lists the selected labels on the trigger", () => {
    renderMultiSelect({
      selected: ["open", "shipped"],
    });

    expect(getTrigger()).toHaveTextContent("Open");
    expect(getTrigger()).toHaveTextContent(
      "Shipped",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Clicking the trigger should open the option list.
   */
  it("opens the option list when clicked", async () => {
    const user = userEvent.setup();

    renderMultiSelect();

    await user.click(getTrigger());

    expect(
      screen.getAllByRole("checkbox"),
    ).toHaveLength(3);
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The trigger should report the open state.
   */
  it("reports the open state on the trigger", async () => {
    const user = userEvent.setup();

    renderMultiSelect();

    expect(getTrigger()).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    await user.click(getTrigger());

    expect(getTrigger()).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Selected options should be shown ticked in the list.
   */
  it("ticks the selected options in the list", async () => {
    const user = userEvent.setup();

    renderMultiSelect({ selected: ["shipped"] });

    await user.click(getTrigger());

    expect(
      screen.getByRole("checkbox", {
        name: "Shipped",
      }),
    ).toBeChecked();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Choosing an option should report its value.
   */
  it("reports the chosen value", async () => {
    const user = userEvent.setup();

    const { onChange } = renderMultiSelect();

    await user.click(getTrigger());

    await user.click(
      screen.getByRole("checkbox", {
        name: "Shipped",
      }),
    );

    expect(onChange).toHaveBeenCalledWith(
      "shipped",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Clicking the label should also report the value.
   */
  it("reports the value when the label is clicked", async () => {
    const user = userEvent.setup();

    const { onChange } = renderMultiSelect();

    await user.click(getTrigger());

    await user.click(screen.getByText("Open"));

    expect(onChange).toHaveBeenCalledWith("open");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * An option icon should be rendered alongside its label.
   */
  it("renders an option icon when one is supplied", async () => {
    const user = userEvent.setup();

    renderMultiSelect({
      options: [
        {
          value: "open",
          label: "Open",
          icon: <svg data-testid="open-icon" />,
        },
      ],
    });

    await user.click(getTrigger());

    expect(
      screen.getAllByTestId("open-icon").length,
    ).toBeGreaterThan(0);
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A custom className should reach the trigger.
   */
  it("applies a custom className to the trigger", () => {
    renderMultiSelect({ className: "w-64" });

    expect(getTrigger()).toHaveClass("w-64");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The option list must NOT be in the DOM until it is opened.
   */
  it("does not render the option list while closed", () => {
    renderMultiSelect();

    expect(
      screen.queryByRole("checkbox"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The placeholder must NOT be shown once something is selected.
   */
  it("does not show the placeholder once something is selected", () => {
    renderMultiSelect({
      selected: ["open"],
      placeholder: "Select statuses",
    });

    expect(
      screen.queryByText("Select statuses"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Unselected options must NOT be ticked.
   */
  it("does not tick unselected options", async () => {
    const user = userEvent.setup();

    renderMultiSelect({ selected: ["shipped"] });

    await user.click(getTrigger());

    expect(
      screen.getByRole("checkbox", { name: "Open" }),
    ).not.toBeChecked();

    expect(
      screen.getByRole("checkbox", {
        name: "Cancelled",
      }),
    ).not.toBeChecked();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A disabled control must not open.
   */
  it("does not open while disabled", async () => {
    const user = userEvent.setup();

    renderMultiSelect({ disabled: true });

    await user.click(getTrigger());

    expect(
      screen.queryByRole("checkbox"),
    ).not.toBeInTheDocument();

    expect(getTrigger()).toBeDisabled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The component is controlled - it must NOT change the selection by
   * itself, only report the toggled value to its owner.
   */
  it("does not change its own selection", async () => {
    const user = userEvent.setup();

    renderMultiSelect({ selected: [] });

    await user.click(getTrigger());

    await user.click(
      screen.getByRole("checkbox", {
        name: "Shipped",
      }),
    );

    expect(
      screen.getByRole("checkbox", {
        name: "Shipped",
      }),
    ).not.toBeChecked();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Clicking one option must NOT report any other value.
   */
  it("does not report more than the clicked value", async () => {
    const user = userEvent.setup();

    const { onChange } = renderMultiSelect();

    await user.click(getTrigger());

    await user.click(
      screen.getByRole("checkbox", {
        name: "Shipped",
      }),
    );

    expect(onChange).toHaveBeenCalledTimes(1);

    expect(onChange).not.toHaveBeenCalledWith(
      "open",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A selected value with no matching option must not put a blank entry
   * on the trigger.
   */
  it("does not render an entry for an unknown selected value", () => {
    renderMultiSelect({ selected: ["returned"] });

    expect(getTrigger()).not.toHaveTextContent(
      "returned",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * An empty option list must not invent entries.
   */
  it("does not render entries for an empty option list", async () => {
    const user = userEvent.setup();

    renderMultiSelect({ options: [] });

    await user.click(getTrigger());

    expect(
      screen.queryByRole("checkbox"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * onChange must not fire on the initial render.
   */
  it("does not call onChange on initial render", () => {
    const { onChange } = renderMultiSelect({
      selected: ["open"],
    });

    expect(onChange).not.toHaveBeenCalled();
  });
});
