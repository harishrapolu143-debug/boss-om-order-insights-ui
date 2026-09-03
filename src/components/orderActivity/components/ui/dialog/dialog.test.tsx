import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

type DialogOverrides = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function renderDialog(props: DialogOverrides = {}) {
  return render(
    <Dialog {...props}>
      <DialogTrigger>Open dialog</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel order</DialogTitle>
          <DialogDescription>This cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>Dismiss</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>,
  );
}

describe("DialogTrigger", () => {
  it("renders with the correct data-slot", () => {
    renderDialog();

    const trigger = screen.getByRole("button", { name: "Open dialog" });

    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("data-slot", "dialog-trigger");
  });

  it("reports the closed state via aria-expanded", () => {
    renderDialog();

    expect(screen.getByRole("button", { name: "Open dialog" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });
});

describe("DialogContent", () => {
  it("is not rendered while closed", () => {
    renderDialog();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders with the dialog role when open", () => {
    renderDialog({ defaultOpen: true });

    const dialog = screen.getByRole("dialog");

    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("data-slot", "dialog-content");
  });

  it("applies the default classes", () => {
    renderDialog({ defaultOpen: true });

    const dialog = screen.getByRole("dialog");

    expect(dialog).toHaveClass("bg-background");
    expect(dialog).toHaveClass("fixed");
    expect(dialog).toHaveClass("rounded-lg");
  });

  it("merges a custom className with the defaults", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent className="sm:max-w-2xl">
          <DialogTitle>Cancel order</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByRole("dialog")).toHaveClass("sm:max-w-2xl");
    expect(screen.getByRole("dialog")).toHaveClass("bg-background");
  });

  it("renders an overlay behind the content", () => {
    const { baseElement } = renderDialog({ defaultOpen: true });

    const overlay = baseElement.querySelector("[data-slot='dialog-overlay']");

    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass("fixed");
    expect(overlay).toHaveClass("inset-0");
  });

  it("renders a built-in close button with screen-reader text", () => {
    renderDialog({ defaultOpen: true });

    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("renders into a portal, outside the trigger's container", () => {
    const { container } = renderDialog({ defaultOpen: true });

    expect(container).not.toContainElement(screen.getByRole("dialog"));
  });
});

describe("Dialog header, footer, title and description", () => {
  it("set the correct data-slot attributes", () => {
    const { baseElement } = renderDialog({ defaultOpen: true });

    expect(
      baseElement.querySelector("[data-slot='dialog-header']"),
    ).toBeInTheDocument();
    expect(
      baseElement.querySelector("[data-slot='dialog-footer']"),
    ).toBeInTheDocument();
    expect(screen.getByText("Cancel order")).toHaveAttribute(
      "data-slot",
      "dialog-title",
    );
    expect(screen.getByText("This cannot be undone.")).toHaveAttribute(
      "data-slot",
      "dialog-description",
    );
  });

  it("wire the title and description to the dialog", () => {
    renderDialog({ defaultOpen: true });

    const dialog = screen.getByRole("dialog");

    expect(dialog).toHaveAttribute(
      "aria-labelledby",
      screen.getByText("Cancel order").id,
    );
    expect(dialog).toHaveAttribute(
      "aria-describedby",
      screen.getByText("This cannot be undone.").id,
    );
  });

  it("apply their default classes", () => {
    const { baseElement } = renderDialog({ defaultOpen: true });

    expect(baseElement.querySelector("[data-slot='dialog-header']")).toHaveClass(
      "flex-col",
    );
    expect(baseElement.querySelector("[data-slot='dialog-footer']")).toHaveClass(
      "flex-col-reverse",
    );
    expect(screen.getByText("Cancel order")).toHaveClass("font-semibold");
    expect(screen.getByText("This cannot be undone.")).toHaveClass(
      "text-muted-foreground",
    );
  });
});

describe("Dialog interactions", () => {
  it("opens when the trigger is clicked", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Open dialog" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes via the built-in close button", async () => {
    const user = userEvent.setup();
    renderDialog({ defaultOpen: true });

    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes via DialogClose", async () => {
    const user = userEvent.setup();
    renderDialog({ defaultOpen: true });

    await user.click(screen.getByRole("button", { name: "Dismiss" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    renderDialog({ defaultOpen: true });

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls onOpenChange with the new state", async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    renderDialog({ onOpenChange });

    await user.click(screen.getByRole("button", { name: "Open dialog" }));

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("honours a controlled open prop", async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    renderDialog({ open: false, onOpenChange });

    await user.click(screen.getByRole("button", { name: "Open dialog" }));

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("marks the trigger expanded while open", () => {
    const { container } = renderDialog({ defaultOpen: true });

    // While open, Radix aria-hides everything outside the dialog, so the
    // trigger is no longer reachable by role - query it directly instead.
    expect(container.querySelector("[data-slot='dialog-trigger']")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("hides the rest of the page from assistive tech while open", () => {
    const { container } = renderDialog({ defaultOpen: true });

    expect(container.querySelector("[data-slot='dialog-trigger']")).not.toBeNull();
    expect(
      screen.queryByRole("button", { name: "Open dialog" }),
    ).not.toBeInTheDocument();
  });
});
