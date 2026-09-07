import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./accordion";

/**
 * Overrides for the single-type accordion below. Spelled out rather than
 * derived from the component, because Radix types Accordion as a
 * `single | multiple` union that `Partial<>` widens into an unassignable shape.
 */
type SingleAccordionOverrides = {
  id?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

function renderAccordion(props: SingleAccordionOverrides = {}) {
  return render(
    <Accordion type="single" collapsible {...props}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Order details</AccordionTrigger>
        <AccordionContent>Order details panel</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Shipment details</AccordionTrigger>
        <AccordionContent>Shipment details panel</AccordionContent>
      </AccordionItem>
    </Accordion>,
  );
}

describe("Accordion", () => {
  it("sets the correct data-slot attribute", () => {
    const { container } = renderAccordion();

    expect(container.querySelector("[data-slot='accordion']")).toBeInTheDocument();
  });

  it("renders every item's trigger", () => {
    renderAccordion();

    expect(
      screen.getByRole("button", { name: /order details/i }),
    ).toBeInTheDocument();
  
    expect(
      screen.getByRole("button", { name: /shipment details/i }),
    ).toBeInTheDocument();
  });

  it("forwards props to the underlying Radix root", () => {
    const { container } = renderAccordion({ id: "order-accordion" });

    expect(container.querySelector("[data-slot='accordion']")).toHaveAttribute(
      "id",
      "order-accordion",
    );
  });
});

describe("AccordionItem", () => {
  it("sets the correct data-slot attribute", () => {
    const { container } = renderAccordion();

    expect(container.querySelectorAll("[data-slot='accordion-item']")).toHaveLength(
      2,
    );
  });

  it("applies the default item classes", () => {
    const { container } = renderAccordion();

    const item = container.querySelector("[data-slot='accordion-item']");

    expect(item).toHaveClass("border-b");
    expect(item).toHaveClass("last:border-b-0");
  });

  it("merges a custom className with the default classes", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" className="custom-item">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const item = screen
      .getByRole("button", { name: "Trigger" })
      .closest("[data-slot='accordion-item']");

    expect(item).toHaveClass("custom-item");
    expect(item).toHaveClass("border-b");
  });
});

describe("AccordionTrigger", () => {
  it("sets the correct data-slot attribute", () => {
    renderAccordion();

    expect(screen.getByRole("button", { name: /order details/i })).toHaveAttribute(
      "data-slot",
      "accordion-trigger",
    );
  });

  it("renders its children and the chevron icon", () => {
    renderAccordion();

    const trigger = screen.getByRole("button", { name: /order details/i });

    expect(trigger).toHaveTextContent("Order details");
    expect(trigger.querySelector("svg")).toBeInTheDocument();
  });

  it("is collapsed by default", () => {
    renderAccordion();

    const trigger = screen.getByRole("button", { name: /order details/i });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("data-state", "closed");
  });

  it("merges a custom className with the default classes", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger className="custom-trigger">Trigger</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const trigger = screen.getByRole("button", { name: "Trigger" });

    expect(trigger).toHaveClass("custom-trigger");
    expect(trigger).toHaveClass("flex-1");
  });

  it("respects the disabled prop", async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" disabled>
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const trigger = screen.getByRole("button", { name: "Trigger" });

    expect(trigger).toBeDisabled();

    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
  });
});

describe("AccordionContent", () => {
  it("is not rendered while the item is collapsed", () => {
    renderAccordion();

    expect(screen.queryByText("Order details panel")).not.toBeInTheDocument();
  });

  it("sets the correct data-slot attribute when open", () => {
    const { container } = renderAccordion({ defaultValue: "item-1" });

    const content = container.querySelector("[data-slot='accordion-content']");

    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent("Order details panel");
  });

  it("applies a custom className to the inner wrapper, not the content root", () => {
    const { container } = render(
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent className="custom-content">Content</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const content = container.querySelector("[data-slot='accordion-content']");
    const inner = screen.getByText("Content");

    expect(content).not.toHaveClass("custom-content");
    expect(inner).toHaveClass("custom-content");
    expect(inner).toHaveClass("pt-0");
    expect(inner).toHaveClass("pb-4");
  });

  it("links the trigger to the content via aria-controls", () => {
    renderAccordion({ defaultValue: "item-1" });

    const trigger = screen.getByRole("button", { name: /order details/i });
    const region = screen.getByRole("region");

    expect(trigger).toHaveAttribute("aria-controls", region.id);
  });
});

describe("Accordion interactions", () => {
  it("opens an item when its trigger is clicked", async () => {
    const user = userEvent.setup();
    renderAccordion();

    const trigger = screen.getByRole("button", { name: /order details/i });

    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAttribute("data-state", "open");
    expect(screen.getByText("Order details panel")).toBeInTheDocument();
  });

  it("does not show a different item's content when one item is opened", async () => {
    const user = userEvent.setup();
    renderAccordion();

    await user.click(screen.getByRole("button", { name: /order details/i }));

    expect(screen.getByText("Order details panel")).toBeInTheDocument();
    expect(screen.queryByText("Shipment details panel")).not.toBeInTheDocument();
  });

  it("collapses an open item when collapsible is enabled", async () => {
    const user = userEvent.setup();
    renderAccordion({ defaultValue: "item-1" });

    const trigger = screen.getByRole("button", { name: /order details/i });

    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Order details panel")).not.toBeInTheDocument();
  });

  it("keeps only one item open at a time for type='single'", async () => {
    const user = userEvent.setup();
    renderAccordion({ defaultValue: "item-1" });

    await user.click(screen.getByRole("button", { name: /shipment details/i }));

    expect(screen.getByText("Shipment details panel")).toBeInTheDocument();
    expect(screen.queryByText("Order details panel")).not.toBeInTheDocument();
  });

  it("does not change the value when a disabled item is clicked", async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    render(
      <Accordion type="single" collapsible onValueChange={onValueChange}>
        <AccordionItem value="item-1" disabled>
          <AccordionTrigger>Order details</AccordionTrigger>
          <AccordionContent>Order details panel</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Shipment details</AccordionTrigger>
          <AccordionContent>Shipment details panel</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    await user.click(screen.getByRole("button", { name: /order details/i }));

    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.queryByText("Order details panel")).not.toBeInTheDocument();
  });

  it("allows multiple open items for type='multiple'", async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="multiple" defaultValue={["item-1"]}>
        <AccordionItem value="item-1">
          <AccordionTrigger>Order details</AccordionTrigger>
          <AccordionContent>Order details panel</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Shipment details</AccordionTrigger>
          <AccordionContent>Shipment details panel</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    await user.click(screen.getByRole("button", { name: /shipment details/i }));

    expect(screen.getByText("Order details panel")).toBeInTheDocument();
    expect(screen.getByText("Shipment details panel")).toBeInTheDocument();
  });

  it("calls onValueChange with the newly opened value", async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    renderAccordion({ onValueChange });

    await user.click(screen.getByRole("button", { name: /shipment details/i }));

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith("item-2");
  });

  it("honours the controlled value prop", async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    renderAccordion({ value: "item-1", onValueChange });

    expect(screen.getByText("Order details panel")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /shipment details/i }));

    expect(onValueChange).toHaveBeenCalledWith("item-2");
    expect(screen.getByText("Order details panel")).toBeInTheDocument();
    expect(screen.queryByText("Shipment details panel")).not.toBeInTheDocument();
  });

  it("does not render content for an unknown controlled value", () => {
    renderAccordion({ value: "unknown-item" });

    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    expect(screen.queryByText("Order details panel")).not.toBeInTheDocument();
    expect(screen.queryByText("Shipment details panel")).not.toBeInTheDocument();
  });

  it("toggles with the keyboard", async () => {
    const user = userEvent.setup();
    renderAccordion();

    const trigger = screen.getByRole("button", { name: /order details/i });

    await user.tab();
    expect(trigger).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await user.keyboard(" ");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("moves focus to the next trigger with ArrowDown", async () => {
    const user = userEvent.setup();
    renderAccordion();

    await user.tab();
    await user.keyboard("{ArrowDown}");

    expect(screen.getByRole("button", { name: /shipment details/i })).toHaveFocus();
  });
});
