import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "./collapsible";

type CollapsibleOverrides = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
};

function renderCollapsible(props: CollapsibleOverrides = {}) {
  return render(
    <Collapsible {...props}>
      <CollapsibleTrigger>Show details</CollapsibleTrigger>
      <CollapsibleContent>Hidden details</CollapsibleContent>
    </Collapsible>,
  );
}

describe("Collapsible", () => {
  it("sets the correct data-slot attribute", () => {
    const { container } = renderCollapsible();

    expect(
      container.querySelector("[data-slot='collapsible']"),
    ).toBeInTheDocument();
  });

  it("is closed by default", () => {
    const { container } = renderCollapsible();

    expect(container.querySelector("[data-slot='collapsible']")).toHaveAttribute(
      "data-state",
      "closed",
    );
  });

  it("respects defaultOpen", () => {
    const { container } = renderCollapsible({ defaultOpen: true });

    expect(container.querySelector("[data-slot='collapsible']")).toHaveAttribute(
      "data-state",
      "open",
    );
  });
});

describe("CollapsibleTrigger", () => {
  it("sets the correct data-slot attribute", () => {
    renderCollapsible();

    expect(screen.getByRole("button", { name: "Show details" })).toHaveAttribute(
      "data-slot",
      "collapsible-trigger",
    );
  });

  it("reports the collapsed state via aria-expanded", () => {
    renderCollapsible();

    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false");
  });

  it("does not open while disabled", async () => {
    const user = userEvent.setup();
    renderCollapsible({ disabled: true });

    const trigger = screen.getByRole("button");

    expect(trigger).toBeDisabled();

    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});

describe("CollapsibleContent", () => {
  it("is not rendered while collapsed", () => {
    renderCollapsible();

    expect(screen.queryByText("Hidden details")).not.toBeInTheDocument();
  });

  it("is rendered with the correct data-slot once open", () => {
    const { container } = renderCollapsible({ defaultOpen: true });

    const content = container.querySelector("[data-slot='collapsible-content']");

    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent("Hidden details");
  });
});

describe("Collapsible interactions", () => {
  it("opens when the trigger is clicked", async () => {
    const user = userEvent.setup();
    renderCollapsible();

    await user.click(screen.getByRole("button"));

    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Hidden details")).toBeInTheDocument();
  });

  it("closes again on a second click", async () => {
    const user = userEvent.setup();
    renderCollapsible({ defaultOpen: true });

    await user.click(screen.getByRole("button"));

    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Hidden details")).not.toBeInTheDocument();
  });

  it("calls onOpenChange with the new state", async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    renderCollapsible({ onOpenChange });

    await user.click(screen.getByRole("button"));

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("honours a controlled open prop", async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    renderCollapsible({ open: false, onOpenChange });

    await user.click(screen.getByRole("button"));

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByText("Hidden details")).not.toBeInTheDocument();
  });
});
