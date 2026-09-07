import * as React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "./card";

function renderCard() {
  return render(
    <Card>
      <CardHeader>
        <CardTitle>Order SO-1024</CardTitle>
        <CardDescription>
          Placed on 12 March
        </CardDescription>
        <CardAction>
          <button type="button">Reorder</button>
        </CardAction>
      </CardHeader>

      <CardContent>Two line items</CardContent>

      <CardFooter>Total 240.00</CardFooter>
    </Card>,
  );
}

/**
 * ============================================================================
 * Card
 * ============================================================================
 */
describe("Card", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Every card part should render with its own data-slot attribute.
   */
  it("sets the correct data-slot attributes for every part", () => {
    const { container } = renderCard();

    [
      "card",
      "card-header",
      "card-title",
      "card-description",
      "card-action",
      "card-content",
      "card-footer",
    ].forEach((slot) => {
      expect(
        container.querySelector(
          `[data-slot='${slot}']`,
        ),
      ).toBeInTheDocument();
    });
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * All card content should be rendered.
   */
  it("renders the content of every part", () => {
    renderCard();

    expect(
      screen.getByText("Order SO-1024"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Placed on 12 March"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Two line items"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Total 240.00"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The card surface classes should be applied.
   */
  it("applies the default card classes", () => {
    const { container } = renderCard();

    const card = container.querySelector(
      "[data-slot='card']",
    );

    expect(card).toHaveClass("bg-card");
    expect(card).toHaveClass("rounded-xl");
    expect(card).toHaveClass("border");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The title should render as a heading element.
   */
  it("renders the title as a heading", () => {
    renderCard();

    const title = screen.getByText(
      "Order SO-1024",
    );

    expect(title.tagName).toBe("H4");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The description should render as a paragraph.
   */
  it("renders the description as a paragraph", () => {
    renderCard();

    expect(
      screen.getByText("Placed on 12 March")
        .tagName,
    ).toBe("P");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The header should nest the title, description and action.
   */
  it("nests the title, description and action inside the header", () => {
    const { container } = renderCard();

    const header = container.querySelector(
      "[data-slot='card-header']",
    ) as HTMLElement;

    expect(
      header.querySelector(
        "[data-slot='card-title']",
      ),
    ).toBeInTheDocument();

    expect(
      header.querySelector(
        "[data-slot='card-description']",
      ),
    ).toBeInTheDocument();

    expect(
      header.querySelector(
        "[data-slot='card-action']",
      ),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Interactive content inside the action slot should still work.
   */
  it("renders interactive content inside the action slot", () => {
    renderCard();

    expect(
      screen.getByRole("button", {
        name: "Reorder",
      }),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Every part should merge a custom className with its defaults.
   */
  it("merges a custom className on every part", () => {
    const { container } = render(
      <Card className="custom-card">
        <CardHeader className="custom-header">
          <CardTitle className="custom-title">
            Title
          </CardTitle>
          <CardDescription className="custom-description">
            Description
          </CardDescription>
          <CardAction className="custom-action">
            Action
          </CardAction>
        </CardHeader>
        <CardContent className="custom-content">
          Content
        </CardContent>
        <CardFooter className="custom-footer">
          Footer
        </CardFooter>
      </Card>,
    );

    expect(
      container.querySelector("[data-slot='card']"),
    ).toHaveClass("custom-card", "bg-card");

    expect(
      container.querySelector(
        "[data-slot='card-header']",
      ),
    ).toHaveClass("custom-header", "grid");

    expect(
      container.querySelector(
        "[data-slot='card-title']",
      ),
    ).toHaveClass("custom-title", "leading-none");

    expect(
      container.querySelector(
        "[data-slot='card-description']",
      ),
    ).toHaveClass(
      "custom-description",
      "text-muted-foreground",
    );

    expect(
      container.querySelector(
        "[data-slot='card-action']",
      ),
    ).toHaveClass("custom-action", "col-start-2");

    expect(
      container.querySelector(
        "[data-slot='card-content']",
      ),
    ).toHaveClass("custom-content", "px-6");

    expect(
      container.querySelector(
        "[data-slot='card-footer']",
      ),
    ).toHaveClass("custom-footer", "flex");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Arbitrary props should be forwarded to the underlying elements.
   */
  it("forwards arbitrary props to the underlying elements", () => {
    const { container } = render(
      <Card id="order-card" data-testid="card">
        <CardContent id="order-content">
          Content
        </CardContent>
      </Card>,
    );

    expect(
      container.querySelector("[data-slot='card']"),
    ).toHaveAttribute("id", "order-card");

    expect(
      container.querySelector(
        "[data-slot='card-content']",
      ),
    ).toHaveAttribute("id", "order-content");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A card is a container - it must never be interactive or focusable
   * in its own right.
   */
  it("does not render the card as an interactive element", () => {
    const { container } = renderCard();

    const card = container.querySelector(
      "[data-slot='card']",
    ) as HTMLElement;

    expect(card.tagName).toBe("DIV");
    expect(card).not.toHaveAttribute("role");
    expect(card).not.toHaveAttribute("tabindex");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Card parts are optional - omitting them must not render empty
   * placeholders.
   */
  it("does not render parts that were not supplied", () => {
    const { container } = render(
      <Card>
        <CardContent>Only content</CardContent>
      </Card>,
    );

    [
      "card-header",
      "card-title",
      "card-description",
      "card-action",
      "card-footer",
    ].forEach((slot) => {
      expect(
        container.querySelector(
          `[data-slot='${slot}']`,
        ),
      ).not.toBeInTheDocument();
    });
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The card must not add content of its own.
   */
  it("does not render any content of its own", () => {
    const { container } = render(<Card />);

    expect(
      container.querySelector("[data-slot='card']"),
    ).toBeEmptyDOMElement();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The title must not be rendered at a heading level that would break
   * the page outline (it is deliberately an h4, not an h1).
   */
  it("does not render the title as a top level heading", () => {
    renderCard();

    const title = screen.getByText(
      "Order SO-1024",
    );

    expect(title.tagName).not.toBe("H1");
    expect(title.tagName).not.toBe("H2");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The description must not be announced as a heading.
   */
  it("does not expose the description as a heading", () => {
    renderCard();

    expect(
      screen.queryByRole("heading", {
        name: "Placed on 12 March",
      }),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A custom className must not remove the card surface styling.
   */
  it("does not drop the default classes when a custom className is given", () => {
    const { container } = render(
      <Card className="shadow-lg">
        <CardContent>Content</CardContent>
      </Card>,
    );

    const card = container.querySelector(
      "[data-slot='card']",
    );

    expect(card).toHaveClass("shadow-lg");
    expect(card).toHaveClass("bg-card");
    expect(card).toHaveClass("rounded-xl");
  });
});
