import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { HoverCard, HoverCardTrigger, HoverCardContent } from "./hover-card";

type HoverCardOverrides = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  openDelay?: number;
  closeDelay?: number;
};

function renderHoverCard(props: HoverCardOverrides = {}) {
  return render(
    <HoverCard openDelay={0} closeDelay={0} {...props}>
      <HoverCardTrigger href="/orders">KS1300400032</HoverCardTrigger>
      <HoverCardContent>Order preview</HoverCardContent>
    </HoverCard>,
  );
}

describe("HoverCardTrigger", () => {
  it("renders with the correct data-slot", () => {
    renderHoverCard();

    const trigger = screen.getByText("KS1300400032");

    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("data-slot", "hover-card-trigger");
  });

  it("reports the closed state", () => {
    renderHoverCard();

    expect(screen.getByText("KS1300400032")).toHaveAttribute(
      "data-state",
      "closed",
    );
  });
});

describe("HoverCardContent", () => {
  it("is not rendered while closed", () => {
    renderHoverCard();

    expect(screen.queryByText("Order preview")).not.toBeInTheDocument();
  });

  it("is rendered with the correct data-slot when open", () => {
    renderHoverCard({ defaultOpen: true });

    const content = screen.getByText("Order preview");

    expect(content).toBeInTheDocument();
    expect(content).toHaveAttribute("data-slot", "hover-card-content");
  });

  it("applies the default classes", () => {
    renderHoverCard({ defaultOpen: true });

    const content = screen.getByText("Order preview");

    expect(content).toHaveClass("bg-popover");
    expect(content).toHaveClass("w-64");
    expect(content).toHaveClass("rounded-md");
  });

  it("merges a custom className with the defaults", () => {
    render(
      <HoverCard defaultOpen>
        <HoverCardTrigger href="/orders">KS1300400032</HoverCardTrigger>
        <HoverCardContent className="w-80">Order preview</HoverCardContent>
      </HoverCard>,
    );

    const content = screen.getByText("Order preview");

    expect(content).toHaveClass("w-80");
    expect(content).toHaveClass("bg-popover");
  });

  it("applies the default alignment", () => {
    renderHoverCard({ defaultOpen: true });

    expect(screen.getByText("Order preview")).toHaveAttribute(
      "data-align",
      "center",
    );
  });

  it("honours an explicit align prop", () => {
    render(
      <HoverCard defaultOpen>
        <HoverCardTrigger href="/orders">KS1300400032</HoverCardTrigger>
        <HoverCardContent align="end">Order preview</HoverCardContent>
      </HoverCard>,
    );

    expect(screen.getByText("Order preview")).toHaveAttribute(
      "data-align",
      "end",
    );
  });

  it("renders into a portal, outside the trigger's container", () => {
    const { container } = renderHoverCard({ defaultOpen: true });

    expect(container).not.toContainElement(screen.getByText("Order preview"));
  });
});

describe("HoverCard interactions", () => {
  it("opens when the trigger is hovered", async () => {
    const user = userEvent.setup();
    renderHoverCard();

    await user.hover(screen.getByText("KS1300400032"));

    expect(await screen.findByText("Order preview")).toBeInTheDocument();
  });

  it("opens when the trigger receives focus", async () => {
    const user = userEvent.setup();
    renderHoverCard();

    await user.tab();

    expect(await screen.findByText("Order preview")).toBeInTheDocument();
  });

  it("calls onOpenChange when opened", async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    renderHoverCard({ onOpenChange });

    await user.hover(screen.getByText("KS1300400032"));

    await screen.findByText("Order preview");

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("honours a controlled open prop", async () => {
    const user = userEvent.setup();
    renderHoverCard({ open: false });

    await user.hover(screen.getByText("KS1300400032"));

    expect(screen.queryByText("Order preview")).not.toBeInTheDocument();
  });
});
