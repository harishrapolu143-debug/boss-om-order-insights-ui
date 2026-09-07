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
 * Overrides for the multiple-type accordion.
 *
 * Radix Accordion uses different value types depending on the
 * accordion type:
 *
 * type="single"
 *   value?: string
 *   defaultValue?: string
 *   onValueChange?: (value: string) => void
 *
 * type="multiple"
 *   value?: string[]
 *   defaultValue?: string[]
 *   onValueChange?: (value: string[]) => void
 *
 * Therefore, we explicitly define the multiple overrides here
 * instead of using a generic Partial<> type.
 */
type MultipleAccordionOverrides = {
  id?: string;
  value?: string[];
  defaultValue?: string[];
  disabled?: boolean;
  onValueChange?: (value: string[]) => void;
};

type SingleAccordionOverrides = {
  id?: string;
  value?: string;
  defaultValue?: string;
  collapsible?: boolean;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
};

function renderAccordion(
  props: MultipleAccordionOverrides = {},
) {
  return render(
    <Accordion type="multiple" {...props}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Order details</AccordionTrigger>
        <AccordionContent>
          Order details panel
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-2">
        <AccordionTrigger>Shipment details</AccordionTrigger>
        <AccordionContent>
          Shipment details panel
        </AccordionContent>
      </AccordionItem>
    </Accordion>,
  );
}

/**
 * ============================================================================
 * Accordion Root
 * ============================================================================
 */
describe("Accordion", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The Accordion root should render with the expected data-slot attribute.
   */
  it("sets the correct data-slot attribute", () => {
    const { container } = renderAccordion();

    expect(
      container.querySelector("[data-slot='accordion']"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * All accordion item triggers should be available to the user.
   */
  it("renders every item's trigger", () => {
    renderAccordion();

    expect(
      screen.getByRole("button", {
        name: /order details/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /shipment details/i,
      }),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Props supplied to the Accordion helper should be forwarded
   * to the underlying Radix Accordion root.
   */
  it("forwards props to the underlying Radix root", () => {
    const { container } = renderAccordion({
      id: "order-accordion",
    });

    expect(
      container.querySelector("[data-slot='accordion']"),
    ).toHaveAttribute(
      "id",
      "order-accordion",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Multiple accordions should support more than one item being open
   * at the same time.
   */
  it("supports multiple items being open at the same time", async () => {
    const user = userEvent.setup();

    renderAccordion({
      defaultValue: ["item-1"],
    });

    const orderTrigger = screen.getByRole("button", {
      name: /order details/i,
    });

    const shipmentTrigger = screen.getByRole("button", {
      name: /shipment details/i,
    });

    expect(orderTrigger).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    expect(shipmentTrigger).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    await user.click(shipmentTrigger);

    expect(
      screen.getByText("Order details panel"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Shipment details panel"),
    ).toBeInTheDocument();

    expect(orderTrigger).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    expect(shipmentTrigger).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });
});

/**
 * ============================================================================
 * AccordionItem
 * ============================================================================
 */
describe("AccordionItem", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Every AccordionItem should have the expected data-slot attribute.
   */
  it("sets the correct data-slot attribute", () => {
    const { container } = renderAccordion();

    expect(
      container.querySelectorAll(
        "[data-slot='accordion-item']",
      ),
    ).toHaveLength(2);
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * AccordionItem should have its default border classes.
   */
  it("applies the default item classes", () => {
    const { container } = renderAccordion();

    const item = container.querySelector(
      "[data-slot='accordion-item']",
    );

    expect(item).toHaveClass("border-b");
    expect(item).toHaveClass("last:border-b-0");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A custom className should be merged with the default classes.
   */
  it("merges a custom className with the default classes", () => {
    render(
      <Accordion type="multiple">
        <AccordionItem
          value="item-1"
          className="custom-item"
        >
          <AccordionTrigger>
            Trigger
          </AccordionTrigger>

          <AccordionContent>
            Content
          </AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const item = screen
      .getByRole("button", {
        name: "Trigger",
      })
      .closest(
        "[data-slot='accordion-item']",
      );

    expect(item).toHaveClass("custom-item");
    expect(item).toHaveClass("border-b");
  });
});

/**
 * ============================================================================
 * AccordionTrigger
 * ============================================================================
 */
describe("AccordionTrigger", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   */
  it("sets the correct data-slot attribute", () => {
    renderAccordion();

    expect(
      screen.getByRole("button", {
        name: /order details/i,
      }),
    ).toHaveAttribute(
      "data-slot",
      "accordion-trigger",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Trigger should render its children and the chevron icon.
   */
  it("renders its children and the chevron icon", () => {
    renderAccordion();

    const trigger = screen.getByRole(
      "button",
      {
        name: /order details/i,
      },
    );

    expect(trigger).toHaveTextContent(
      "Order details",
    );

    expect(
      trigger.querySelector("svg"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Items should initially be collapsed when no defaultValue is provided.
   */
  it("is collapsed by default", () => {
    renderAccordion();

    const trigger = screen.getByRole(
      "button",
      {
        name: /order details/i,
      },
    );

    expect(trigger).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    expect(trigger).toHaveAttribute(
      "data-state",
      "closed",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   */
  it("merges a custom className with the default classes", () => {
    render(
      <Accordion type="multiple">
        <AccordionItem value="item-1">
          <AccordionTrigger className="custom-trigger">
            Trigger
          </AccordionTrigger>

          <AccordionContent>
            Content
          </AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const trigger = screen.getByRole(
      "button",
      {
        name: "Trigger",
      },
    );

    expect(trigger).toHaveClass(
      "custom-trigger",
    );

    expect(trigger).toHaveClass("flex-1");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A disabled AccordionItem must not be expandable.
   */
  it("does not open a disabled item when clicked", async () => {
    const user = userEvent.setup();

    render(
      <Accordion type="multiple">
        <AccordionItem
          value="item-1"
          disabled
        >
          <AccordionTrigger>
            Trigger
          </AccordionTrigger>

          <AccordionContent>
            Content
          </AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const trigger = screen.getByRole(
      "button",
      {
        name: "Trigger",
      },
    );

    expect(trigger).toBeDisabled();

    await user.click(trigger);

    expect(trigger).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    expect(
      screen.queryByText("Content"),
    ).not.toBeInTheDocument();
  });
});

/**
 * ============================================================================
 * AccordionContent
 * ============================================================================
 */
describe("AccordionContent", () => {
  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Content should not be visible when the item is closed.
   */
  it("is not rendered while the item is collapsed", () => {
    renderAccordion();

    expect(
      screen.queryByText(
        "Order details panel",
      ),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText(
        "Shipment details panel",
      ),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Content should be rendered when its item is open.
   */
  it("renders content when an item is open", () => {
    renderAccordion({
      defaultValue: ["item-1"],
    });

    const content = screen.getByText(
      "Order details panel",
    );

    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent(
      "Order details panel",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   */
  it("sets the correct data-slot attribute when open", () => {
    const { container } = renderAccordion({
      defaultValue: ["item-1"],
    });

    const content = container.querySelector(
      "[data-slot='accordion-content']",
    );

    expect(content).toBeInTheDocument();

    expect(content).toHaveTextContent(
      "Order details panel",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The custom className should be applied to the inner wrapper.
   */
  it("applies a custom className to the inner wrapper, not the content root", () => {
    const { container } = render(
      <Accordion
        type="multiple"
        defaultValue={["item-1"]}
      >
        <AccordionItem value="item-1">
          <AccordionTrigger>
            Trigger
          </AccordionTrigger>

          <AccordionContent className="custom-content">
            Content
          </AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const content = container.querySelector(
      "[data-slot='accordion-content']",
    );

    const inner = screen.getByText(
      "Content",
    );

    expect(content).not.toHaveClass(
      "custom-content",
    );

    expect(inner).toHaveClass(
      "custom-content",
    );

    expect(inner).toHaveClass("pt-0");
    expect(inner).toHaveClass("pb-4");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   */
  it("links the trigger to the content via aria-controls", () => {
    renderAccordion({
      defaultValue: ["item-1"],
    });

    const trigger = screen.getByRole(
      "button",
      {
        name: /order details/i,
      },
    );

    const region = screen.getByRole(
      "region",
    );

    expect(trigger).toHaveAttribute(
      "aria-controls",
      region.id,
    );
  });
});

/**
 * ============================================================================
 * Accordion Interactions
 * ============================================================================
 */
describe("Accordion interactions - Multiple", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Clicking a closed item should open it.
   */
  it("opens an item when its trigger is clicked", async () => {
    const user = userEvent.setup();

    renderAccordion();

    const trigger = screen.getByRole(
      "button",
      {
        name: /order details/i,
      },
    );

    expect(trigger).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    await user.click(trigger);

    expect(trigger).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    expect(trigger).toHaveAttribute(
      "data-state",
      "open",
    );

    expect(
      screen.getByText(
        "Order details panel",
      ),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Opening item-2 should not close item-1.
   */
  it("keeps the first item open when a second item is opened", async () => {
    const user = userEvent.setup();

    renderAccordion({
      defaultValue: ["item-1"],
    });

    const orderTrigger = screen.getByRole(
      "button",
      {
        name: /order details/i,
      },
    );

    const shipmentTrigger = screen.getByRole(
      "button",
      {
        name: /shipment details/i,
      },
    );

    expect(orderTrigger).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    expect(shipmentTrigger).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    await user.click(shipmentTrigger);

    /**
     * Both items must now remain open.
     */
    expect(orderTrigger).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    expect(shipmentTrigger).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    expect(
      screen.getByText(
        "Order details panel",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Shipment details panel",
      ),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Both items can be opened sequentially.
   */
  it("allows all accordion items to be opened", async () => {
    const user = userEvent.setup();

    renderAccordion();

    const orderTrigger = screen.getByRole(
      "button",
      {
        name: /order details/i,
      },
    );

    const shipmentTrigger = screen.getByRole(
      "button",
      {
        name: /shipment details/i,
      },
    );

    await user.click(orderTrigger);
    await user.click(shipmentTrigger);

    expect(
      screen.getByText(
        "Order details panel",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Shipment details panel",
      ),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Clicking an already-open item should close only that item.
   */
  it("closes only the clicked item when multiple items are open", async () => {
    const user = userEvent.setup();

    renderAccordion({
      defaultValue: [
        "item-1",
        "item-2",
      ],
    });

    const orderTrigger = screen.getByRole(
      "button",
      {
        name: /order details/i,
      },
    );

    const shipmentTrigger = screen.getByRole(
      "button",
      {
        name: /shipment details/i,
      },
    );

    expect(orderTrigger).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    expect(shipmentTrigger).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    await user.click(orderTrigger);

    /**
     * item-1 should close.
     */
    expect(orderTrigger).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    expect(
      screen.queryByText(
        "Order details panel",
      ),
    ).not.toBeInTheDocument();

    /**
     * item-2 should remain open.
     */
    expect(shipmentTrigger).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    expect(
      screen.getByText(
        "Shipment details panel",
      ),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Opening one item must NOT close another item.
   *
   * This test is especially important because this behavior would be
   * expected for type="single", but is incorrect for type="multiple".
   */
  it("does not close another item when opening a new item", async () => {
    const user = userEvent.setup();

    renderAccordion({
      defaultValue: ["item-1"],
    });

    await user.click(
      screen.getByRole("button", {
        name: /shipment details/i,
      }),
    );

    /**
     * Negative assertion:
     *
     * Order details must still be visible.
     */
    expect(
      screen.getByText(
        "Order details panel",
      ),
    ).toBeInTheDocument();

    /**
     * Shipment details must also be visible.
     */
    expect(
      screen.getByText(
        "Shipment details panel",
      ),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * onValueChange should receive an array containing the newly opened item.
   */
  it("calls onValueChange with an array when an item is opened", async () => {
    const user = userEvent.setup();

    const onValueChange = jest.fn();

    renderAccordion({
      onValueChange,
    });

    await user.click(
      screen.getByRole("button", {
        name: /order details/i,
      }),
    );

    expect(
      onValueChange,
    ).toHaveBeenCalledTimes(1);

    expect(
      onValueChange,
    ).toHaveBeenCalledWith([
      "item-1",
    ]);
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * When a second item is opened, onValueChange should contain
   * both open item values.
   */
  it("returns all open item values from onValueChange", async () => {
    const user = userEvent.setup();

    const onValueChange = jest.fn();

    renderAccordion({
      onValueChange,
    });

    await user.click(
      screen.getByRole("button", {
        name: /order details/i,
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: /shipment details/i,
      }),
    );

    expect(
      onValueChange,
    ).toHaveBeenLastCalledWith([
      "item-1",
      "item-2",
    ]);
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * When one of multiple open items is closed,
   * onValueChange should contain only the remaining open items.
   */
  it("returns the remaining open items when one item is closed", async () => {
    const user = userEvent.setup();

    const onValueChange = jest.fn();

    renderAccordion({
      defaultValue: [
        "item-1",
        "item-2",
      ],
      onValueChange,
    });

    await user.click(
      screen.getByRole("button", {
        name: /order details/i,
      }),
    );

    expect(
      onValueChange,
    ).toHaveBeenLastCalledWith([
      "item-2",
    ]);
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A disabled item must not modify the current accordion value.
   */
  it("does not change the value when a disabled item is clicked", async () => {
    const user = userEvent.setup();

    const onValueChange = jest.fn();

    render(
      <Accordion
        type="multiple"
        defaultValue={["item-1"]}
        onValueChange={onValueChange}
      >
        <AccordionItem
          value="item-1"
        >
          <AccordionTrigger>
            Order details
          </AccordionTrigger>

          <AccordionContent>
            Order details panel
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="item-2"
          disabled
        >
          <AccordionTrigger>
            Shipment details
          </AccordionTrigger>

          <AccordionContent>
            Shipment details panel
          </AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const disabledTrigger =
      screen.getByRole("button", {
        name: /shipment details/i,
      });

    expect(
      disabledTrigger,
    ).toBeDisabled();

    await user.click(
      disabledTrigger,
    );

    /**
     * onValueChange should not be triggered.
     */
    expect(
      onValueChange,
    ).not.toHaveBeenCalled();

    /**
     * The disabled item's content must remain closed.
     */
    expect(
      screen.queryByText(
        "Shipment details panel",
      ),
    ).not.toBeInTheDocument();

    /**
     * The already-open item must remain open.
     */
    expect(
      screen.getByText(
        "Order details panel",
      ),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * An unknown controlled value should not render any accordion content.
   */
  it("does not render content for unknown controlled values", () => {
    renderAccordion({
      value: ["unknown-item"],
    });

    expect(
      screen.queryByRole("region"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText(
        "Order details panel",
      ),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText(
        "Shipment details panel",
      ),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Controlled multiple value should determine which items are open.
   */
  it("honours the controlled value prop", async () => {
    const user = userEvent.setup();

    const onValueChange = jest.fn();

    renderAccordion({
      value: ["item-1"],
      onValueChange,
    });

    /**
     * item-1 is controlled as open.
     */
    expect(
      screen.getByText(
        "Order details panel",
      ),
    ).toBeInTheDocument();

    /**
     * item-2 is controlled as closed.
     */
    expect(
      screen.queryByText(
        "Shipment details panel",
      ),
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: /shipment details/i,
      }),
    );

    /**
     * Because this is a controlled component,
     * the callback is invoked but the displayed state
     * does not automatically change unless the parent
     * updates the value prop.
     */
    expect(
      onValueChange,
    ).toHaveBeenCalledWith([
      "item-1",
      "item-2",
    ]);

    expect(
      screen.getByText(
        "Order details panel",
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByText(
        "Shipment details panel",
      ),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Multiple items can be initially opened through defaultValue.
   */
  it("opens multiple items using defaultValue", () => {
    renderAccordion({
      defaultValue: [
        "item-1",
        "item-2",
      ],
    });

    expect(
      screen.getByText(
        "Order details panel",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Shipment details panel",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /order details/i,
      }),
    ).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    expect(
      screen.getByRole("button", {
        name: /shipment details/i,
      }),
    ).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * An empty defaultValue means that no item should initially be open.
   */
  it("keeps all items closed when defaultValue is an empty array", () => {
    renderAccordion({
      defaultValue: [],
    });

    expect(
      screen.queryByText(
        "Order details panel",
      ),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText(
        "Shipment details panel",
      ),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /order details/i,
      }),
    ).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    expect(
      screen.getByRole("button", {
        name: /shipment details/i,
      }),
    ).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Keyboard interaction should work for multiple accordions.
   */
  it("toggles an item with the keyboard", async () => {
    const user = userEvent.setup();

    renderAccordion();

    const trigger = screen.getByRole(
      "button",
      {
        name: /order details/i,
      },
    );

    await user.tab();

    expect(trigger).toHaveFocus();

    await user.keyboard("{Enter}");

    expect(trigger).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    expect(
      screen.getByText(
        "Order details panel",
      ),
    ).toBeInTheDocument();

    await user.keyboard(" ");

    expect(trigger).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    expect(
      screen.queryByText(
        "Order details panel",
      ),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * ArrowDown should move focus to the next trigger.
   */
  it("moves focus to the next trigger with ArrowDown", async () => {
    const user = userEvent.setup();

    renderAccordion();

    const orderTrigger =
      screen.getByRole("button", {
        name: /order details/i,
      });

    const shipmentTrigger =
      screen.getByRole("button", {
        name: /shipment details/i,
      });

    await user.tab();

    expect(orderTrigger).toHaveFocus();

    await user.keyboard(
      "{ArrowDown}",
    );

    expect(
      shipmentTrigger,
    ).toHaveFocus();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Opening item-2 should not make item-1 closed.
   *
   * This explicitly protects the multiple-accordion behavior
   * from accidentally being changed back to single behavior.
   */
  it("does not behave like a single accordion", async () => {
    const user = userEvent.setup();

    renderAccordion();

    const orderTrigger =
      screen.getByRole("button", {
        name: /order details/i,
      });

    const shipmentTrigger =
      screen.getByRole("button", {
        name: /shipment details/i,
      });

    await user.click(orderTrigger);

    await user.click(shipmentTrigger);

    /**
     * Both must be open.
     */
    expect(orderTrigger).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    expect(shipmentTrigger).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    /**
     * Both panels must exist.
     */
    expect(
      screen.getByText(
        "Order details panel",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Shipment details panel",
      ),
    ).toBeInTheDocument();
  });
});
/**
 * Renders a single-type accordion.
 *
 * type="single" only allows one open item at a time, and it uses
 * string (not string[]) values.
 */
function renderSingleAccordion(
  props: SingleAccordionOverrides = {},
) {
  return render(
    <Accordion type="single" {...props}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Order details</AccordionTrigger>
        <AccordionContent>
          Order details panel
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-2">
        <AccordionTrigger>Shipment details</AccordionTrigger>
        <AccordionContent>
          Shipment details panel
        </AccordionContent>
      </AccordionItem>
    </Accordion>,
  );
}

/**
 * ============================================================================
 * Accordion interactions - Single
 * ============================================================================
 */
describe("Accordion interactions - Single", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A single accordion should open the clicked item.
   */
  it("opens the clicked item", async () => {
    const user = userEvent.setup();

    renderSingleAccordion();

    await user.click(
      screen.getByRole("button", {
        name: /order details/i,
      }),
    );

    expect(
      screen.getByText(
        "Order details panel",
      ),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A single accordion must NOT keep the previous item open when a new
   * item is opened.
   */
  it("does not keep the previous item open when another item is opened", async () => {
    const user = userEvent.setup();

    renderSingleAccordion({
      defaultValue: "item-1",
    });

    await user.click(
      screen.getByRole("button", {
        name: /shipment details/i,
      }),
    );

    expect(
      screen.queryByText(
        "Order details panel",
      ),
    ).not.toBeInTheDocument();

    expect(
      screen.getByText(
        "Shipment details panel",
      ),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Without the collapsible prop, clicking an already open trigger must
   * NOT close it.
   */
  it("does not close the open item when collapsible is not enabled", async () => {
    const user = userEvent.setup();

    renderSingleAccordion({
      defaultValue: "item-1",
    });

    const orderTrigger =
      screen.getByRole("button", {
        name: /order details/i,
      });

    await user.click(orderTrigger);

    expect(orderTrigger).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    expect(
      screen.getByText(
        "Order details panel",
      ),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * With collapsible enabled, clicking the open trigger closes it.
   */
  it("closes the open item when collapsible is enabled", async () => {
    const user = userEvent.setup();

    renderSingleAccordion({
      defaultValue: "item-1",
      collapsible: true,
    });

    const orderTrigger =
      screen.getByRole("button", {
        name: /order details/i,
      });

    await user.click(orderTrigger);

    expect(orderTrigger).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    expect(
      screen.queryByText(
        "Order details panel",
      ),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * onValueChange for a single accordion must emit a plain string,
   * never an array.
   */
  it("does not emit an array from onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();

    renderSingleAccordion({ onValueChange });

    await user.click(
      screen.getByRole("button", {
        name: /order details/i,
      }),
    );

    expect(onValueChange).toHaveBeenCalledWith(
      "item-1",
    );

    expect(
      Array.isArray(
        onValueChange.mock.calls[0][0],
      ),
    ).toBe(false);
  });
});

/**
 * ============================================================================
 * Accordion - additional negative scenarios
 * ============================================================================
 */
describe("Accordion negative scenarios", () => {
  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * No panel content should exist before the user interacts.
   */
  it("does not render any panel content before interaction", () => {
    renderAccordion();

    expect(
      screen.queryByText(
        "Order details panel",
      ),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText(
        "Shipment details panel",
      ),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Content must be removed from the DOM again once the item is closed,
   * not simply hidden with CSS.
   */
  it("removes the content from the DOM after the item is closed", async () => {
    const user = userEvent.setup();

    renderAccordion();

    const orderTrigger =
      screen.getByRole("button", {
        name: /order details/i,
      });

    await user.click(orderTrigger);

    expect(
      screen.getByText(
        "Order details panel",
      ),
    ).toBeInTheDocument();

    await user.click(orderTrigger);

    expect(
      screen.queryByText(
        "Order details panel",
      ),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A collapsed accordion must not expose a content region to
   * assistive technology.
   *
   * Radix keeps the content root mounted so it can animate, but it must
   * stay hidden and must not render its children.
   */
  it("does not expose a content region while every item is collapsed", () => {
    const { container } = renderAccordion();

    expect(
      screen.queryByRole("region"),
    ).not.toBeInTheDocument();

    const contents = Array.from(
      container.querySelectorAll(
        "[data-slot='accordion-content']",
      ),
    );

    expect(contents).toHaveLength(2);

    contents.forEach((content) => {
      expect(content).toHaveAttribute("hidden");

      expect(content).toHaveAttribute(
        "data-state",
        "closed",
      );

      expect(content).toBeEmptyDOMElement();
    });
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * onValueChange must not fire during the initial render - only in
   * response to a real user interaction.
   */
  it("does not call onValueChange on initial render", () => {
    const onValueChange = jest.fn();

    renderAccordion({
      defaultValue: ["item-1"],
      onValueChange,
    });

    expect(onValueChange).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Keys that are not activation keys must not toggle the item.
   */
  it("does not toggle the item when a non-activation key is pressed", async () => {
    const user = userEvent.setup();

    renderAccordion();

    const orderTrigger =
      screen.getByRole("button", {
        name: /order details/i,
      });

    orderTrigger.focus();

    await user.keyboard("{ArrowRight}");
    await user.keyboard("a");
    await user.keyboard("{Escape}");

    expect(orderTrigger).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    expect(
      screen.queryByText(
        "Order details panel",
      ),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Disabling the accordion root must disable every item, so no item
   * can be opened.
   */
  it("does not open any item when the accordion root is disabled", async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();

    renderAccordion({
      disabled: true,
      onValueChange,
    });

    const orderTrigger =
      screen.getByRole("button", {
        name: /order details/i,
      });

    expect(orderTrigger).toBeDisabled();

    await user.click(orderTrigger);

    expect(orderTrigger).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    expect(onValueChange).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Keyboard navigation must skip a disabled trigger instead of
   * parking focus on it.
   */
  it("does not move focus onto a disabled trigger with ArrowDown", async () => {
    const user = userEvent.setup();

    render(
      <Accordion type="multiple">
        <AccordionItem value="item-1">
          <AccordionTrigger>Order details</AccordionTrigger>
          <AccordionContent>
            Order details panel
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2" disabled>
          <AccordionTrigger>Shipment details</AccordionTrigger>
          <AccordionContent>
            Shipment details panel
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger>Invoice details</AccordionTrigger>
          <AccordionContent>
            Invoice details panel
          </AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const orderTrigger =
      screen.getByRole("button", {
        name: /order details/i,
      });

    const shipmentTrigger =
      screen.getByRole("button", {
        name: /shipment details/i,
      });

    const invoiceTrigger =
      screen.getByRole("button", {
        name: /invoice details/i,
      });

    orderTrigger.focus();

    await user.keyboard("{ArrowDown}");

    expect(shipmentTrigger).not.toHaveFocus();
    expect(invoiceTrigger).toHaveFocus();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Clicking inside the open panel must not collapse the item.
   */
  it("does not close the item when its content is clicked", async () => {
    const user = userEvent.setup();

    renderAccordion({
      defaultValue: ["item-1"],
    });

    await user.click(
      screen.getByText(
        "Order details panel",
      ),
    );

    expect(
      screen.getByRole("button", {
        name: /order details/i,
      }),
    ).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    expect(
      screen.getByText(
        "Order details panel",
      ),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A controlled accordion without an onValueChange handler must not
   * change state by itself.
   */
  it("does not open a controlled accordion that has no change handler", async () => {
    const user = userEvent.setup();

    renderAccordion({ value: [] });

    const orderTrigger =
      screen.getByRole("button", {
        name: /order details/i,
      });

    await user.click(orderTrigger);

    expect(orderTrigger).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    expect(
      screen.queryByText(
        "Order details panel",
      ),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Only the values listed in a controlled value array may render
   * their content.
   */
  it("does not render content for items outside the controlled value", () => {
    renderAccordion({ value: ["item-1"] });

    expect(
      screen.getByText(
        "Order details panel",
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByText(
        "Shipment details panel",
      ),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The accordion root is only a container - it must not be an
   * interactive, expandable element itself.
   */
  it("does not turn the accordion root into an interactive element", () => {
    const { container } = renderAccordion();

    const root = container.querySelector(
      "[data-slot='accordion']",
    ) as HTMLElement;

    expect(root.tagName).not.toBe("BUTTON");
    expect(root).not.toHaveAttribute("aria-expanded");
    expect(root).not.toHaveAttribute("disabled");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The chevron icon must never be a click target of its own, otherwise
   * it would swallow the trigger's click.
   */
  it("does not make the chevron icon clickable", () => {
    const { container } = renderAccordion();

    const chevron = container.querySelector(
      "[data-slot='accordion-trigger'] svg",
    ) as SVGElement;

    expect(chevron).toBeInTheDocument();

    expect(chevron.getAttribute("class")).toContain(
      "pointer-events-none",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * An item that has a trigger but no content must not crash and must
   * not render a content wrapper.
   */
  it("does not break when an item has no content", async () => {
    const user = userEvent.setup();

    const { container } = render(
      <Accordion type="multiple">
        <AccordionItem value="item-1">
          <AccordionTrigger>Order details</AccordionTrigger>
        </AccordionItem>
      </Accordion>,
    );

    const orderTrigger =
      screen.getByRole("button", {
        name: /order details/i,
      });

    await user.click(orderTrigger);

    expect(orderTrigger).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    expect(
      container.querySelector(
        "[data-slot='accordion-content']",
      ),
    ).not.toBeInTheDocument();
  });
});
