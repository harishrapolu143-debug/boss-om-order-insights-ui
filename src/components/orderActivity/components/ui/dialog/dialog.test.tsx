import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "./dialog";

type DialogOverrides = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function renderDialog(props: DialogOverrides = {}) {
  return render(
    <Dialog {...props}>
      <DialogTrigger>Open order</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Order SO-1024</DialogTitle>
          <DialogDescription>
            Placed on 12 March
          </DialogDescription>
        </DialogHeader>

        <div>Two line items</div>

        <DialogFooter>
          <DialogClose>Dismiss</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>,
  );
}

/**
 * ============================================================================
 * Dialog
 * ============================================================================
 */
describe("Dialog", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The trigger should render with the expected data-slot attribute.
   */
  it("sets the correct data-slot attribute on the trigger", () => {
    renderDialog();

    expect(
      screen.getByRole("button", {
        name: "Open order",
      }),
    ).toHaveAttribute("data-slot", "dialog-trigger");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Clicking the trigger should open the dialog.
   */
  it("opens when the trigger is clicked", async () => {
    const user = userEvent.setup();

    renderDialog();

    await user.click(
      screen.getByRole("button", {
        name: "Open order",
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
   * defaultOpen should render the dialog straight away.
   */
  it("respects defaultOpen", () => {
    renderDialog({ defaultOpen: true });

    expect(
      screen.getByRole("dialog"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Every dialog part should render with its own data-slot attribute.
   */
  it("sets the correct data-slot attributes on the open dialog", () => {
    renderDialog({ defaultOpen: true });

    const dialog = screen.getByRole("dialog");

    expect(dialog).toHaveAttribute(
      "data-slot",
      "dialog-content",
    );

    [
      "dialog-header",
      "dialog-title",
      "dialog-description",
      "dialog-footer",
    ].forEach((slot) => {
      expect(
        dialog.querySelector(
          `[data-slot='${slot}']`,
        ),
      ).toBeInTheDocument();
    });
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The dialog content should be rendered.
   */
  it("renders its title, description and content", () => {
    renderDialog({ defaultOpen: true });

    expect(
      screen.getByText("Order SO-1024"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Placed on 12 March"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Two line items"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The title and description should name and describe the dialog.
   */
  it("labels the dialog with its title and description", () => {
    renderDialog({ defaultOpen: true });

    const dialog = screen.getByRole("dialog");

    const title = screen.getByText(
      "Order SO-1024",
    );

    const description = screen.getByText(
      "Placed on 12 March",
    );

    expect(dialog).toHaveAttribute(
      "aria-labelledby",
      title.id,
    );

    expect(dialog).toHaveAttribute(
      "aria-describedby",
      description.id,
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The close button should dismiss the dialog.
   */
  it("closes when the close control is clicked", async () => {
    const user = userEvent.setup();

    renderDialog({ defaultOpen: true });

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
   * Escape should dismiss the dialog.
   */
  it("closes when Escape is pressed", async () => {
    const user = userEvent.setup();

    renderDialog({ defaultOpen: true });

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
  it("calls onOpenChange when the dialog opens", async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();

    renderDialog({ onOpenChange });

    await user.click(
      screen.getByRole("button", {
        name: "Open order",
      }),
    );

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * An always-rendered close affordance should be provided.
   */
  it("renders a built in close control", () => {
    renderDialog({ defaultOpen: true });

    expect(
      screen.getByRole("button", { name: "Close" }),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A custom className should be merged with the defaults.
   */
  it("merges a custom className with the defaults", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent className="max-w-2xl">
          <DialogTitle>Order SO-1024</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    const dialog = screen.getByRole("dialog");

    expect(dialog).toHaveClass("max-w-2xl");
    expect(dialog).toHaveClass("fixed");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The dialog must NOT be in the DOM until it is opened.
   */
  it("does not render the dialog while closed", () => {
    renderDialog();

    expect(
      screen.queryByRole("dialog"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Two line items"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Closing the dialog must remove its content, not merely hide it.
   */
  it("does not leave the content in the DOM after closing", async () => {
    const user = userEvent.setup();

    renderDialog({ defaultOpen: true });

    await user.keyboard("{Escape}");

    expect(
      screen.queryByText("Two line items"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Order SO-1024"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Clicking inside the dialog must not dismiss it.
   */
  it("does not close when the content is clicked", async () => {
    const user = userEvent.setup();

    renderDialog({ defaultOpen: true });

    await user.click(
      screen.getByText("Two line items"),
    );

    expect(
      screen.getByRole("dialog"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A controlled dialog must not open on its own.
   */
  it("does not open a controlled dialog without a handler", async () => {
    const user = userEvent.setup();

    renderDialog({ open: false });

    await user.click(
      screen.getByRole("button", {
        name: "Open order",
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

    renderDialog({
      defaultOpen: true,
      onOpenChange,
    });

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * An open modal dialog must hide the rest of the page from assistive
   * technology, so the trigger behind it is no longer reachable.
   */
  it("does not leave the page behind the dialog reachable", () => {
    renderDialog({ defaultOpen: true });

    expect(
      screen.queryByRole("button", {
        name: "Open order",
      }),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Keys that are not Escape must not dismiss the dialog.
   *
   * Enter is deliberately excluded here: focus lands on the built in
   * close button when the dialog opens, so Enter legitimately activates
   * it and closes the dialog.
   */
  it("does not close when a non-dismiss key is pressed", async () => {
    const user = userEvent.setup();

    renderDialog({ defaultOpen: true });

    await user.keyboard("a");
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Tab}");

    expect(
      screen.getByRole("dialog"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Only one dialog may be open at a time from a single root.
   */
  it("does not render more than one dialog at a time", () => {
    renderDialog({ defaultOpen: true });

    expect(
      screen.getAllByRole("dialog"),
    ).toHaveLength(1);
  });
});
