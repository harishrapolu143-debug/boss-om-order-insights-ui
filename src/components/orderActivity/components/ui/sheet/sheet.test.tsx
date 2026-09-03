import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
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
      <SheetTrigger>Open panel</SheetTrigger>
      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle>Order filters</SheetTitle>
          <SheetDescription>Narrow the order list.</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose>Dismiss</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>,
  );
}

describe("SheetTrigger", () => {
  it("renders with the correct data-slot", () => {
    renderSheet();

    const trigger = screen.getByRole("button", { name: "Open panel" });

    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("data-slot", "sheet-trigger");
  });
});

describe("SheetContent", () => {
  it("is not rendered while closed", () => {
    renderSheet();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders with the dialog role when open", () => {
    renderSheet({ defaultOpen: true });

    const sheet = screen.getByRole("dialog");

    expect(sheet).toBeInTheDocument();
    expect(sheet).toHaveAttribute("data-slot", "sheet-content");
  });

  it("applies the shared classes", () => {
    renderSheet({ defaultOpen: true });

    const sheet = screen.getByRole("dialog");

    expect(sheet).toHaveClass("bg-background");
    expect(sheet).toHaveClass("fixed");
    expect(sheet).toHaveClass("flex-col");
  });

  it("defaults to the right side", () => {
    renderSheet({ defaultOpen: true });

    const sheet = screen.getByRole("dialog");

    expect(sheet).toHaveClass("right-0");
    expect(sheet).toHaveClass("border-l");
  });

  it("applies the left side classes", () => {
    renderSheet({ defaultOpen: true }, "left");

    const sheet = screen.getByRole("dialog");

    expect(sheet).toHaveClass("left-0");
    expect(sheet).toHaveClass("border-r");
  });

  it("applies the top side classes", () => {
    renderSheet({ defaultOpen: true }, "top");

    const sheet = screen.getByRole("dialog");

    expect(sheet).toHaveClass("top-0");
    expect(sheet).toHaveClass("border-b");
  });

  it("applies the bottom side classes", () => {
    renderSheet({ defaultOpen: true }, "bottom");

    const sheet = screen.getByRole("dialog");

    expect(sheet).toHaveClass("bottom-0");
    expect(sheet).toHaveClass("border-t");
  });

  it("merges a custom className with the defaults", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent className="w-[420px]">
          <SheetTitle>Order filters</SheetTitle>
          <SheetDescription>Narrow the order list.</SheetDescription>
        </SheetContent>
      </Sheet>,
    );

    expect(screen.getByRole("dialog")).toHaveClass("w-[420px]");
    expect(screen.getByRole("dialog")).toHaveClass("bg-background");
  });

  it("renders an overlay behind the content", () => {
    const { baseElement } = renderSheet({ defaultOpen: true });

    expect(
      baseElement.querySelector("[data-slot='sheet-overlay']"),
    ).toBeInTheDocument();
  });

  it("renders a built-in close button with screen-reader text", () => {
    renderSheet({ defaultOpen: true });

    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });
});

describe("Sheet header, footer, title and description", () => {
  it("set the correct data-slot attributes", () => {
    const { baseElement } = renderSheet({ defaultOpen: true });

    expect(
      baseElement.querySelector("[data-slot='sheet-header']"),
    ).toBeInTheDocument();
    expect(
      baseElement.querySelector("[data-slot='sheet-footer']"),
    ).toBeInTheDocument();
    expect(screen.getByText("Order filters")).toHaveAttribute(
      "data-slot",
      "sheet-title",
    );
    expect(screen.getByText("Narrow the order list.")).toHaveAttribute(
      "data-slot",
      "sheet-description",
    );
  });

  it("wire the title and description to the dialog", () => {
    renderSheet({ defaultOpen: true });

    const sheet = screen.getByRole("dialog");

    expect(sheet).toHaveAttribute(
      "aria-labelledby",
      screen.getByText("Order filters").id,
    );
    expect(sheet).toHaveAttribute(
      "aria-describedby",
      screen.getByText("Narrow the order list.").id,
    );
  });

  it("apply their default classes", () => {
    const { baseElement } = renderSheet({ defaultOpen: true });

    expect(baseElement.querySelector("[data-slot='sheet-footer']")).toHaveClass(
      "mt-auto",
    );
    expect(screen.getByText("Order filters")).toHaveClass("font-semibold");
    expect(screen.getByText("Narrow the order list.")).toHaveClass(
      "text-muted-foreground",
    );
  });
});

describe("Sheet interactions", () => {
  it("opens when the trigger is clicked", async () => {
    const user = userEvent.setup();
    renderSheet();

    await user.click(screen.getByRole("button", { name: "Open panel" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes via the built-in close button", async () => {
    const user = userEvent.setup();
    renderSheet({ defaultOpen: true });

    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes via SheetClose", async () => {
    const user = userEvent.setup();
    renderSheet({ defaultOpen: true });

    await user.click(screen.getByRole("button", { name: "Dismiss" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    renderSheet({ defaultOpen: true });

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls onOpenChange with the new state", async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    renderSheet({ onOpenChange });

    await user.click(screen.getByRole("button", { name: "Open panel" }));

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("honours a controlled open prop", async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    renderSheet({ open: false, onOpenChange });

    await user.click(screen.getByRole("button", { name: "Open panel" }));

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
