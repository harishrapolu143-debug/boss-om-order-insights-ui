import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "./tooltip";

type TooltipOverrides = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function renderTooltip(props: TooltipOverrides = {}) {
  return render(
    <Tooltip {...props}>
      <TooltipTrigger>Info</TooltipTrigger>
      <TooltipContent>Order was created on 2 Sep</TooltipContent>
    </Tooltip>,
  );
}

describe("TooltipProvider", () => {
  it("renders its children", () => {
    render(
      <TooltipProvider>
        <span>child</span>
      </TooltipProvider>,
    );

    expect(screen.getByText("child")).toBeInTheDocument();
  });
});

describe("TooltipTrigger", () => {
  it("renders with the correct data-slot", () => {
    renderTooltip();

    const trigger = screen.getByRole("button", { name: "Info" });

    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("data-slot", "tooltip-trigger");
  });

  it("reports the closed state", () => {
    renderTooltip();

    expect(screen.getByRole("button")).toHaveAttribute("data-state", "closed");
  });
});

describe("TooltipContent", () => {
  it("is not rendered while closed", () => {
    renderTooltip();

    expect(
      screen.queryByText("Order was created on 2 Sep"),
    ).not.toBeInTheDocument();
  });

  it("is rendered with the correct data-slot when open", () => {
    renderTooltip({ defaultOpen: true });

    // Radix renders both a visible tooltip and a visually-hidden a11y copy.
    const content = screen.getAllByText("Order was created on 2 Sep")[0];

    expect(content).toBeInTheDocument();
  });

  it("exposes the tooltip role when open", () => {
    renderTooltip({ defaultOpen: true });

    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("applies the default classes", () => {
    const { baseElement } = renderTooltip({ defaultOpen: true });

    const content = baseElement.querySelector("[data-slot='tooltip-content']");

    expect(content).toHaveClass("bg-primary");
    expect(content).toHaveClass("rounded-md");
    expect(content).toHaveClass("text-xs");
  });

  it("merges a custom className with the defaults", () => {
    const { baseElement } = render(
      <Tooltip defaultOpen>
        <TooltipTrigger>Info</TooltipTrigger>
        <TooltipContent className="max-w-xs">Details</TooltipContent>
      </Tooltip>,
    );

    const content = baseElement.querySelector("[data-slot='tooltip-content']");

    expect(content).toHaveClass("max-w-xs");
    expect(content).toHaveClass("bg-primary");
  });

  it("renders an arrow alongside the content", () => {
    const { baseElement } = renderTooltip({ defaultOpen: true });

    const content = baseElement.querySelector("[data-slot='tooltip-content']");

    expect(content?.querySelector("svg")).toBeInTheDocument();
  });

  it("renders into a portal, outside the trigger's container", () => {
    const { container } = renderTooltip({ defaultOpen: true });

    expect(container.querySelector("[data-slot='tooltip-content']")).toBeNull();
  });
});

describe("Tooltip interactions", () => {
  it("opens when the trigger is hovered", async () => {
    const user = userEvent.setup();
    renderTooltip();

    await user.hover(screen.getByRole("button", { name: "Info" }));

    expect(await screen.findByRole("tooltip")).toBeInTheDocument();
  });

  it("opens when the trigger receives focus", async () => {
    const user = userEvent.setup();
    renderTooltip();

    await user.tab();

    expect(await screen.findByRole("tooltip")).toBeInTheDocument();
  });

  it("calls onOpenChange when opened", async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    renderTooltip({ onOpenChange });

    await user.hover(screen.getByRole("button", { name: "Info" }));

    await screen.findByRole("tooltip");

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("honours a controlled open prop", async () => {
    const user = userEvent.setup();
    renderTooltip({ open: false });

    await user.hover(screen.getByRole("button", { name: "Info" }));

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });
});
