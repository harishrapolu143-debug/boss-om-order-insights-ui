import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
} from "./popover";

type PopoverOverrides = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function renderPopover(props: PopoverOverrides = {}) {
  return render(
    <Popover {...props}>
      <PopoverTrigger>Open filters</PopoverTrigger>
      <PopoverContent>Filter options</PopoverContent>
    </Popover>,
  );
}

describe("PopoverTrigger", () => {
  it("renders the trigger with the correct data-slot", () => {
    renderPopover();

    const trigger = screen.getByRole("button", { name: "Open filters" });

    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("data-slot", "popover-trigger");
  });

  it("reports the closed state via aria-expanded", () => {
    renderPopover();

    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false");
  });
});

describe("PopoverContent", () => {
  it("is not rendered while closed", () => {
    renderPopover();

    expect(screen.queryByText("Filter options")).not.toBeInTheDocument();
  });

  it("is rendered with the correct data-slot when open", () => {
    renderPopover({ defaultOpen: true });

    const content = screen.getByText("Filter options");

    expect(content).toBeInTheDocument();
    expect(content).toHaveAttribute("data-slot", "popover-content");
  });

  it("applies the default classes", () => {
    renderPopover({ defaultOpen: true });

    const content = screen.getByText("Filter options");

    expect(content).toHaveClass("bg-popover");
    expect(content).toHaveClass("rounded-md");
    expect(content).toHaveClass("w-72");
  });

  it("merges a custom className with the defaults", () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger>Open filters</PopoverTrigger>
        <PopoverContent className="w-96">Filter options</PopoverContent>
      </Popover>,
    );

    const content = screen.getByText("Filter options");

    expect(content).toHaveClass("w-96");
    expect(content).toHaveClass("bg-popover");
  });

  it("applies the default alignment", () => {
    renderPopover({ defaultOpen: true });

    expect(screen.getByText("Filter options")).toHaveAttribute(
      "data-align",
      "center",
    );
  });

  it("honours an explicit align prop", () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger>Open filters</PopoverTrigger>
        <PopoverContent align="start">Filter options</PopoverContent>
      </Popover>,
    );

    expect(screen.getByText("Filter options")).toHaveAttribute(
      "data-align",
      "start",
    );
  });

  it("renders into a portal, outside the trigger's container", () => {
    const { container } = renderPopover({ defaultOpen: true });

    expect(container).not.toContainElement(screen.getByText("Filter options"));
  });
});

describe("PopoverAnchor", () => {
  it("renders with the correct data-slot", () => {
    const { container } = render(
      <Popover>
        <PopoverAnchor>
          <span>Anchor</span>
        </PopoverAnchor>
        <PopoverTrigger>Open filters</PopoverTrigger>
        <PopoverContent>Filter options</PopoverContent>
      </Popover>,
    );

    expect(
      container.querySelector("[data-slot='popover-anchor']"),
    ).toBeInTheDocument();
  });
});

describe("Popover interactions", () => {
  it("opens when the trigger is clicked", async () => {
    const user = userEvent.setup();
    renderPopover();

    await user.click(screen.getByRole("button", { name: "Open filters" }));

    expect(screen.getByText("Filter options")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open filters" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("closes on a second trigger click", async () => {
    const user = userEvent.setup();
    renderPopover({ defaultOpen: true });

    await user.click(screen.getByRole("button", { name: "Open filters" }));

    expect(screen.queryByText("Filter options")).not.toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    renderPopover({ defaultOpen: true });

    await user.keyboard("{Escape}");

    expect(screen.queryByText("Filter options")).not.toBeInTheDocument();
  });

  it("calls onOpenChange with the new state", async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    renderPopover({ onOpenChange });

    await user.click(screen.getByRole("button", { name: "Open filters" }));

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("honours a controlled open prop", async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    renderPopover({ open: false, onOpenChange });

    await user.click(screen.getByRole("button", { name: "Open filters" }));

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByText("Filter options")).not.toBeInTheDocument();
  });
});
