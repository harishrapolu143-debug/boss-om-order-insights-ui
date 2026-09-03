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
  handlers: { onAction?: () => void; onCancel?: () => void } = {},
) {
  return render(
    <AlertDialog {...props}>
      <AlertDialogTrigger>Cancel order</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will cancel order KS1300400032.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handlers.onCancel}>
            Go back
          </AlertDialogCancel>
          <AlertDialogAction onClick={handlers.onAction}>
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>,
  );
}

describe("AlertDialogTrigger", () => {
  it("renders with the correct data-slot", () => {
    renderAlertDialog();

    const trigger = screen.getByRole("button", { name: "Cancel order" });

    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("data-slot", "alert-dialog-trigger");
  });
});

describe("AlertDialogContent", () => {
  it("is not rendered while closed", () => {
    renderAlertDialog();

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("renders with the alertdialog role when open", () => {
    renderAlertDialog({ defaultOpen: true });

    const dialog = screen.getByRole("alertdialog");

    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("data-slot", "alert-dialog-content");
  });

  it("applies the default classes", () => {
    renderAlertDialog({ defaultOpen: true });

    const dialog = screen.getByRole("alertdialog");

    expect(dialog).toHaveClass("bg-background");
    expect(dialog).toHaveClass("fixed");
    expect(dialog).toHaveClass("rounded-lg");
  });

  it("merges a custom className with the defaults", () => {
    render(
      <AlertDialog defaultOpen>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>Confirm</AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialog>,
    );

    expect(screen.getByRole("alertdialog")).toHaveClass("sm:max-w-md");
    expect(screen.getByRole("alertdialog")).toHaveClass("bg-background");
  });

  it("renders an overlay behind the content", () => {
    const { baseElement } = renderAlertDialog({ defaultOpen: true });

    const overlay = baseElement.querySelector(
      "[data-slot='alert-dialog-overlay']",
    );

    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass("inset-0");
  });

  it("does not render a built-in close button, unlike Dialog", () => {
    renderAlertDialog({ defaultOpen: true });

    expect(
      screen.queryByRole("button", { name: "Close" }),
    ).not.toBeInTheDocument();
  });
});

describe("AlertDialog title and description", () => {
  it("set the correct data-slot attributes", () => {
    renderAlertDialog({ defaultOpen: true });

    expect(screen.getByText("Are you sure?")).toHaveAttribute(
      "data-slot",
      "alert-dialog-title",
    );
    expect(
      screen.getByText("This will cancel order KS1300400032."),
    ).toHaveAttribute("data-slot", "alert-dialog-description");
  });

  it("wire the title and description to the dialog", () => {
    renderAlertDialog({ defaultOpen: true });

    const dialog = screen.getByRole("alertdialog");

    expect(dialog).toHaveAttribute(
      "aria-labelledby",
      screen.getByText("Are you sure?").id,
    );
    expect(dialog).toHaveAttribute(
      "aria-describedby",
      screen.getByText("This will cancel order KS1300400032.").id,
    );
  });
});

describe("AlertDialogAction and AlertDialogCancel", () => {
  it("style the action with the default button variant", () => {
    renderAlertDialog({ defaultOpen: true });

    const action = screen.getByRole("button", { name: "Confirm" });

    expect(action).toHaveClass("bg-primary");
    expect(action).toHaveClass("text-primary-foreground");
  });

  it("style the cancel with the outline button variant", () => {
    renderAlertDialog({ defaultOpen: true });

    const cancel = screen.getByRole("button", { name: "Go back" });

    expect(cancel).toHaveClass("border");
    expect(cancel).toHaveClass("bg-background");
  });

  it("merge a custom className with the button variant classes", () => {
    render(
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>Confirm</AlertDialogDescription>
          <AlertDialogAction className="w-full">Confirm</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>,
    );

    const action = screen.getByRole("button", { name: "Confirm" });

    expect(action).toHaveClass("w-full");
    expect(action).toHaveClass("bg-primary");
  });
});

describe("AlertDialog interactions", () => {
  it("opens when the trigger is clicked", async () => {
    const user = userEvent.setup();
    renderAlertDialog();

    await user.click(screen.getByRole("button", { name: "Cancel order" }));

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  it("closes and fires the handler when the action is clicked", async () => {
    const user = userEvent.setup();
    const onAction = jest.fn();
    renderAlertDialog({ defaultOpen: true }, { onAction });

    await user.click(screen.getByRole("button", { name: "Confirm" }));

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("closes and fires the handler when cancel is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    renderAlertDialog({ defaultOpen: true }, { onCancel });

    await user.click(screen.getByRole("button", { name: "Go back" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    renderAlertDialog({ defaultOpen: true });

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("calls onOpenChange with the new state", async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    renderAlertDialog({ onOpenChange });

    await user.click(screen.getByRole("button", { name: "Cancel order" }));

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("honours a controlled open prop", async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    renderAlertDialog({ open: false, onOpenChange });

    await user.click(screen.getByRole("button", { name: "Cancel order" }));

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });
});
