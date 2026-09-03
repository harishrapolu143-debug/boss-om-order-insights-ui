import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from "./drawer";

// Vaul's open/close animation reads getComputedStyle(el).transform and calls
// .match() on it. jsdom leaves that property undefined, so the drawer throws
// mid-close. Returning a real value keeps vaul on its normal code path.
const realGetComputedStyle = window.getComputedStyle;

beforeAll(() => {
  window.getComputedStyle = ((element: Element, pseudoElt?: string | null) => {
    const style = realGetComputedStyle(element, pseudoElt);

    if (!style.transform) {
      Object.defineProperty(style, "transform", {
        value: "none",
        configurable: true,
      });
    }

    return style;
  }) as typeof window.getComputedStyle;
});

afterAll(() => {
  window.getComputedStyle = realGetComputedStyle;
});

type DrawerOverrides = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  direction?: "top" | "bottom" | "left" | "right";
};

function renderDrawer(props: DrawerOverrides = {}) {
  return render(
    <Drawer {...props}>
      <DrawerTrigger>Open drawer</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Order filters</DrawerTitle>
          <DrawerDescription>Narrow the order list.</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose>Dismiss</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>,
  );
}

describe("DrawerTrigger", () => {
  it("renders with the correct data-slot", () => {
    renderDrawer();

    const trigger = screen.getByRole("button", { name: "Open drawer" });

    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("data-slot", "drawer-trigger");
  });
});

describe("DrawerContent", () => {
  it("is not rendered while closed", () => {
    renderDrawer();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders with the dialog role when open", () => {
    renderDrawer({ defaultOpen: true });

    const drawer = screen.getByRole("dialog");

    expect(drawer).toBeInTheDocument();
    expect(drawer).toHaveAttribute("data-slot", "drawer-content");
  });

  it("applies the shared classes", () => {
    renderDrawer({ defaultOpen: true });

    const drawer = screen.getByRole("dialog");

    expect(drawer).toHaveClass("bg-background");
    expect(drawer).toHaveClass("fixed");
    expect(drawer).toHaveClass("flex-col");
  });

  it("defaults to the bottom direction", () => {
    renderDrawer({ defaultOpen: true });

    expect(screen.getByRole("dialog")).toHaveAttribute(
      "data-vaul-drawer-direction",
      "bottom",
    );
  });

  it("honours an explicit direction", () => {
    renderDrawer({ defaultOpen: true, direction: "right" });

    expect(screen.getByRole("dialog")).toHaveAttribute(
      "data-vaul-drawer-direction",
      "right",
    );
  });

  it("merges a custom className with the defaults", () => {
    render(
      <Drawer defaultOpen>
        <DrawerContent className="max-h-[60vh]">
          <DrawerTitle>Order filters</DrawerTitle>
          <DrawerDescription>Narrow the order list.</DrawerDescription>
        </DrawerContent>
      </Drawer>,
    );

    expect(screen.getByRole("dialog")).toHaveClass("max-h-[60vh]");
    expect(screen.getByRole("dialog")).toHaveClass("bg-background");
  });

  it("renders an overlay behind the content", () => {
    const { baseElement } = renderDrawer({ defaultOpen: true });

    expect(
      baseElement.querySelector("[data-slot='drawer-overlay']"),
    ).toBeInTheDocument();
  });

  it("renders the drag handle element", () => {
    renderDrawer({ defaultOpen: true });

    // The grab handle is the first child div of the content.
    const handle = screen.getByRole("dialog").firstElementChild;

    expect(handle).toHaveClass("rounded-full");
    expect(handle).toHaveClass("bg-muted");
  });
});

describe("Drawer header, footer, title and description", () => {
  it("set the correct data-slot attributes", () => {
    const { baseElement } = renderDrawer({ defaultOpen: true });

    expect(
      baseElement.querySelector("[data-slot='drawer-header']"),
    ).toBeInTheDocument();
    expect(
      baseElement.querySelector("[data-slot='drawer-footer']"),
    ).toBeInTheDocument();
    expect(screen.getByText("Order filters")).toHaveAttribute(
      "data-slot",
      "drawer-title",
    );
    expect(screen.getByText("Narrow the order list.")).toHaveAttribute(
      "data-slot",
      "drawer-description",
    );
  });

  it("wire the title and description to the dialog", () => {
    renderDrawer({ defaultOpen: true });

    const drawer = screen.getByRole("dialog");

    expect(drawer).toHaveAttribute(
      "aria-labelledby",
      screen.getByText("Order filters").id,
    );
    expect(drawer).toHaveAttribute(
      "aria-describedby",
      screen.getByText("Narrow the order list.").id,
    );
  });

  it("apply their default classes", () => {
    const { baseElement } = renderDrawer({ defaultOpen: true });

    expect(baseElement.querySelector("[data-slot='drawer-footer']")).toHaveClass(
      "mt-auto",
    );
    expect(screen.getByText("Order filters")).toHaveClass("font-semibold");
    expect(screen.getByText("Narrow the order list.")).toHaveClass(
      "text-muted-foreground",
    );
  });
});

describe("Drawer interactions", () => {
  it("opens when the trigger is clicked", async () => {
    const user = userEvent.setup();
    renderDrawer();

    await user.click(screen.getByRole("button", { name: "Open drawer" }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("closes via DrawerClose", async () => {
    const user = userEvent.setup();
    renderDrawer({ defaultOpen: true });

    await user.click(screen.getByRole("button", { name: "Dismiss" }));

    // vaul only unmounts the content after its slide-out transition ends, and
    // jsdom never fires transitionend - so the state flip is what to assert.
    await waitFor(() =>
      expect(screen.getByRole("dialog")).toHaveAttribute("data-state", "closed"),
    );
  });

  it("reports the closed state to the consumer when dismissed", async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    renderDrawer({ defaultOpen: true, onOpenChange });

    await user.click(screen.getByRole("button", { name: "Dismiss" }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it("calls onOpenChange with the new state", async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    renderDrawer({ onOpenChange });

    await user.click(screen.getByRole("button", { name: "Open drawer" }));

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("honours a controlled open prop", async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    renderDrawer({ open: false, onOpenChange });

    await user.click(screen.getByRole("button", { name: "Open drawer" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
