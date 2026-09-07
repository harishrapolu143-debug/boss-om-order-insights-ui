import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "./sheet";

type SheetOverrides = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function renderSheet(
  props: SheetOverrides = {},
  side?: "top" | "right" | "bottom" | "left",
) {
  return render(
    <Sheet {...props}>
      <SheetTrigger>Open filters</SheetTrigger>

      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>
            Narrow the order list
          </SheetDescription>
        </SheetHeader>

        <div>Filter body</div>

        <SheetFooter>
          <SheetClose>Dismiss</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>,
  );
}

/**
 * ============================================================================
 * Sheet
 * ============================================================================
 */
describe("Sheet", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The trigger should render with the expected data-slot attribute.
   */
  it("sets the correct data-slot attribute on the trigger", () => {
    renderSheet();

    expect(
      screen.getByRole("button", {
        name: "Open filters",
      }),
    ).toHaveAttribute("data-slot", "sheet-trigger");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Clicking the trigger should open the sheet.
   */
  it("opens when the trigger is clicked", async () => {
    const user = userEvent.setup();

    renderSheet();

    await user.click(
      screen.getByRole("button", {
        name: "Open filters",
      }),
    );

    expect(
      screen.getByRole("dialog"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * defaultOpen should render the sheet straight away.
   */
  it("respects defaultOpen", () => {
    renderSheet({ defaultOpen: true });

    expect(
      screen.getByRole("dialog"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Every sheet part should render with its own data-slot attribute.
   */
  it("sets the correct data-slot attributes on the open sheet", () => {
    renderSheet({ defaultOpen: true });

    const sheet = screen.getByRole("dialog");

    expect(sheet).toHaveAttribute(
      "data-slot",
      "sheet-content",
    );

    [
      "sheet-header",
      "sheet-title",
      "sheet-description",
      "sheet-footer",
    ].forEach((slot) => {
      expect(
        sheet.querySelector(
          `[data-slot='${slot}']`,
        ),
      ).toBeInTheDocument();
    });
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The sheet should slide in from the right by default.
   */
  it("opens from the right by default", () => {
    renderSheet({ defaultOpen: true });

    expect(
      screen.getByRole("dialog"),
    ).toHaveClass("right-0");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * An explicit side should change where the sheet is anchored.
   */
  it("opens from the requested side", () => {
    renderSheet({ defaultOpen: true }, "left");

    expect(
      screen.getByRole("dialog"),
    ).toHaveClass("left-0");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The title and description should name and describe the sheet.
   */
  it("labels the sheet with its title and description", () => {
    renderSheet({ defaultOpen: true });

    const sheet = screen.getByRole("dialog");

    expect(sheet).toHaveAttribute(
      "aria-labelledby",
      screen.getByText("Filters").id,
    );

    expect(sheet).toHaveAttribute(
      "aria-describedby",
      screen.getByText("Narrow the order list").id,
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The close control should dismiss the sheet.
   */
  it("closes when the close control is clicked", async () => {
    const user = userEvent.setup();

    renderSheet({ defaultOpen: true });

    await user.click(
      screen.getByRole("button", {
        name: "Dismiss",
      }),
    );

    expect(
      screen.queryByRole("dialog"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Escape should dismiss the sheet.
   */
  it("closes when Escape is pressed", async () => {
    const user = userEvent.setup();

    renderSheet({ defaultOpen: true });

    await user.keyboard("{Escape}");

    expect(
      screen.queryByRole("dialog"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * onOpenChange should report the new state.
   */
  it("calls onOpenChange when the sheet opens", async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();

    renderSheet({ onOpenChange });

    await user.click(
      screen.getByRole("button", {
        name: "Open filters",
      }),
    );

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The sheet must NOT be in the DOM until it is opened.
   */
  it("does not render the sheet while closed", () => {
    renderSheet();

    expect(
      screen.queryByRole("dialog"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Filter body"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Closing must remove the sheet content, not merely hide it.
   */
  it("does not leave the content in the DOM after closing", async () => {
    const user = userEvent.setup();

    renderSheet({ defaultOpen: true });

    await user.keyboard("{Escape}");

    expect(
      screen.queryByText("Filter body"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A sheet anchored to one side must NOT carry the positioning of
   * another side.
   */
  it("does not apply the classes of another side", () => {
    renderSheet({ defaultOpen: true }, "left");

    const sheet = screen.getByRole("dialog");

    expect(sheet).not.toHaveClass("right-0");
    expect(sheet).not.toHaveClass("top-0 bottom-0 h-auto");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Clicking inside the sheet must not dismiss it.
   */
  it("does not close when the content is clicked", async () => {
    const user = userEvent.setup();

    renderSheet({ defaultOpen: true });

    await user.click(
      screen.getByText("Filter body"),
    );

    expect(
      screen.getByRole("dialog"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A controlled sheet must not open on its own.
   */
  it("does not open a controlled sheet without a handler", async () => {
    const user = userEvent.setup();

    renderSheet({ open: false });

    await user.click(
      screen.getByRole("button", {
        name: "Open filters",
      }),
    );

    expect(
      screen.queryByRole("dialog"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * onOpenChange must not fire on the initial render.
   */
  it("does not call onOpenChange on initial render", () => {
    const onOpenChange = jest.fn();

    renderSheet({
      defaultOpen: true,
      onOpenChange,
    });

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * An open modal sheet must hide the rest of the page from assistive
   * technology, so the trigger behind it is no longer reachable.
   */
  it("does not leave the page behind the sheet reachable", () => {
    renderSheet({ defaultOpen: true });

    expect(
      screen.queryByRole("button", {
        name: "Open filters",
      }),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Only one sheet may be open at a time from a single root.
   */
  it("does not render more than one sheet at a time", () => {
    renderSheet({ defaultOpen: true });

    expect(
      screen.getAllByRole("dialog"),
    ).toHaveLength(1);
  });
});
