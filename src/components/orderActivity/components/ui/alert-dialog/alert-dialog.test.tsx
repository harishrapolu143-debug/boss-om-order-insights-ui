import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "./alert-dialog";

type AlertDialogOverrides = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function renderAlertDialog(
  props: AlertDialogOverrides = {},
  handlers: {
    onConfirm?: () => void;
    onCancel?: () => void;
  } = {},
) {
  return render(
    <AlertDialog {...props}>
      <AlertDialogTrigger>
        Cancel order
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Cancel this order?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={handlers.onCancel}
          >
            Keep order
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handlers.onConfirm}
          >
            Cancel order now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>,
  );
}

/**
 * ============================================================================
 * AlertDialog
 * ============================================================================
 */
describe("AlertDialog", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The trigger should render with the expected data-slot attribute.
   */
  it("sets the correct data-slot attribute on the trigger", () => {
    renderAlertDialog();

    expect(
      screen.getByRole("button", {
        name: "Cancel order",
      }),
    ).toHaveAttribute(
      "data-slot",
      "alert-dialog-trigger",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Clicking the trigger should open the alert dialog.
   */
  it("opens when the trigger is clicked", async () => {
    const user = userEvent.setup();

    renderAlertDialog();

    await user.click(
      screen.getByRole("button", {
        name: "Cancel order",
      }),
    );

    expect(
      screen.getByRole("alertdialog"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * defaultOpen should render the alert dialog straight away.
   */
  it("respects defaultOpen", () => {
    renderAlertDialog({ defaultOpen: true });

    expect(
      screen.getByRole("alertdialog"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Every alert dialog part should render with its own data-slot
   * attribute.
   */
  it("sets the correct data-slot attributes on the open dialog", () => {
    renderAlertDialog({ defaultOpen: true });

    const dialog = screen.getByRole("alertdialog");

    expect(dialog).toHaveAttribute(
      "data-slot",
      "alert-dialog-content",
    );

    [
      "alert-dialog-header",
      "alert-dialog-title",
      "alert-dialog-description",
      "alert-dialog-footer",
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
   * The title and description should name and describe the dialog.
   */
  it("labels the dialog with its title and description", () => {
    renderAlertDialog({ defaultOpen: true });

    const dialog = screen.getByRole("alertdialog");

    expect(dialog).toHaveAttribute(
      "aria-labelledby",
      screen.getByText("Cancel this order?").id,
    );

    expect(dialog).toHaveAttribute(
      "aria-describedby",
      screen.getByText("This cannot be undone.").id,
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The action should run the confirm handler and close the dialog.
   */
  it("runs the action and closes", async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn();

    renderAlertDialog(
      { defaultOpen: true },
      { onConfirm },
    );

    await user.click(
      screen.getByRole("button", {
        name: "Cancel order now",
      }),
    );

    expect(onConfirm).toHaveBeenCalledTimes(1);

    expect(
      screen.queryByRole("alertdialog"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The cancel control should dismiss the dialog.
   */
  it("closes when the cancel control is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();

    renderAlertDialog(
      { defaultOpen: true },
      { onCancel },
    );

    await user.click(
      screen.getByRole("button", {
        name: "Keep order",
      }),
    );

    expect(onCancel).toHaveBeenCalledTimes(1);

    expect(
      screen.queryByRole("alertdialog"),
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

    renderAlertDialog({ defaultOpen: true });

    await user.keyboard("{Escape}");

    expect(
      screen.queryByRole("alertdialog"),
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

    renderAlertDialog({ onOpenChange });

    await user.click(
      screen.getByRole("button", {
        name: "Cancel order",
      }),
    );

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A custom className should be merged with the defaults.
   */
  it("merges a custom className with the defaults", () => {
    render(
      <AlertDialog defaultOpen>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogTitle>
            Cancel this order?
          </AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>,
    );

    const dialog = screen.getByRole("alertdialog");

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
    renderAlertDialog();

    expect(
      screen.queryByRole("alertdialog"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Cancel this order?"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * An alert dialog is a confirmation, not a plain dialog - it must NOT
   * be announced with the generic dialog role.
   */
  it("does not expose the generic dialog role", () => {
    renderAlertDialog({ defaultOpen: true });

    expect(
      screen.queryByRole("dialog"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * An alert dialog must NOT offer a stray close icon - the only ways out
   * are the explicit action and cancel controls.
   */
  it("does not render an extra close control", () => {
    renderAlertDialog({ defaultOpen: true });

    expect(
      screen.queryByRole("button", {
        name: "Close",
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.getAllByRole("button"),
    ).toHaveLength(2);
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Clicking inside the dialog must not dismiss it.
   */
  it("does not close when the content is clicked", async () => {
    const user = userEvent.setup();

    renderAlertDialog({ defaultOpen: true });

    await user.click(
      screen.getByText("This cannot be undone."),
    );

    expect(
      screen.getByRole("alertdialog"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Cancelling must NOT run the destructive action.
   */
  it("does not run the action when cancelled", async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn();

    renderAlertDialog(
      { defaultOpen: true },
      { onConfirm },
    );

    await user.click(
      screen.getByRole("button", {
        name: "Keep order",
      }),
    );

    expect(onConfirm).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Dismissing with Escape must NOT run the destructive action either.
   */
  it("does not run the action when dismissed with Escape", async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn();

    renderAlertDialog(
      { defaultOpen: true },
      { onConfirm },
    );

    await user.keyboard("{Escape}");

    expect(onConfirm).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A controlled alert dialog must not open on its own.
   */
  it("does not open a controlled dialog without a handler", async () => {
    const user = userEvent.setup();

    renderAlertDialog({ open: false });

    await user.click(
      screen.getByRole("button", {
        name: "Cancel order",
      }),
    );

    expect(
      screen.queryByRole("alertdialog"),
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

    renderAlertDialog({
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
    renderAlertDialog({ defaultOpen: true });

    expect(
      screen.queryByRole("button", {
        name: "Cancel order",
      }),
    ).not.toBeInTheDocument();
  });
});
