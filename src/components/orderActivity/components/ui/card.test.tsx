import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from "./card";

describe("Card", () => {
  it("renders its children", () => {
    render(<Card>Body</Card>);

    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("sets the correct data-slot attribute", () => {
    render(<Card>Body</Card>);

    expect(screen.getByText("Body")).toHaveAttribute("data-slot", "card");
  });

  it("applies the default classes", () => {
    render(<Card>Body</Card>);

    const card = screen.getByText("Body");

    expect(card).toHaveClass("bg-card");
    expect(card).toHaveClass("rounded-xl");
    expect(card).toHaveClass("border");
  });

  it("merges a custom className with the defaults", () => {
    render(<Card className="w-96">Body</Card>);

    expect(screen.getByText("Body")).toHaveClass("w-96");
    expect(screen.getByText("Body")).toHaveClass("bg-card");
  });
});

describe("CardHeader", () => {
  it("sets the correct data-slot attribute", () => {
    render(<CardHeader>Header</CardHeader>);

    expect(screen.getByText("Header")).toHaveAttribute(
      "data-slot",
      "card-header",
    );
  });

  it("applies the default classes", () => {
    render(<CardHeader>Header</CardHeader>);

    expect(screen.getByText("Header")).toHaveClass("grid");
    expect(screen.getByText("Header")).toHaveClass("px-6");
  });
});

describe("CardTitle", () => {
  it("renders as an h4", () => {
    render(<CardTitle>Order Information</CardTitle>);

    expect(screen.getByText("Order Information").tagName).toBe("H4");
  });

  it("sets the correct data-slot attribute", () => {
    render(<CardTitle>Order Information</CardTitle>);

    expect(screen.getByText("Order Information")).toHaveAttribute(
      "data-slot",
      "card-title",
    );
  });

  it("merges a custom className with the defaults", () => {
    render(<CardTitle className="truncate">Order Information</CardTitle>);

    expect(screen.getByText("Order Information")).toHaveClass("truncate");
    expect(screen.getByText("Order Information")).toHaveClass("leading-none");
  });

  it("lets a conflicting custom class win, per tailwind-merge", () => {
    // text-{size} also sets line-height in Tailwind, so twMerge drops the
    // component's own leading-none rather than emitting both.
    render(<CardTitle className="text-lg">Order Information</CardTitle>);

    expect(screen.getByText("Order Information")).toHaveClass("text-lg");
    expect(screen.getByText("Order Information")).not.toHaveClass(
      "leading-none",
    );
  });
});

describe("CardDescription", () => {
  it("renders as a paragraph", () => {
    render(<CardDescription>Details</CardDescription>);

    expect(screen.getByText("Details").tagName).toBe("P");
  });

  it("sets the correct data-slot attribute", () => {
    render(<CardDescription>Details</CardDescription>);

    expect(screen.getByText("Details")).toHaveAttribute(
      "data-slot",
      "card-description",
    );
  });

  it("applies the muted foreground class", () => {
    render(<CardDescription>Details</CardDescription>);

    expect(screen.getByText("Details")).toHaveClass("text-muted-foreground");
  });
});

describe("CardAction", () => {
  it("sets the correct data-slot attribute", () => {
    render(<CardAction>Action</CardAction>);

    expect(screen.getByText("Action")).toHaveAttribute(
      "data-slot",
      "card-action",
    );
  });

  it("applies the grid placement classes", () => {
    render(<CardAction>Action</CardAction>);

    expect(screen.getByText("Action")).toHaveClass("col-start-2");
    expect(screen.getByText("Action")).toHaveClass("justify-self-end");
  });
});

describe("CardContent", () => {
  it("sets the correct data-slot attribute", () => {
    render(<CardContent>Content</CardContent>);

    expect(screen.getByText("Content")).toHaveAttribute(
      "data-slot",
      "card-content",
    );
  });

  it("applies the default padding", () => {
    render(<CardContent>Content</CardContent>);

    expect(screen.getByText("Content")).toHaveClass("px-6");
  });
});

describe("CardFooter", () => {
  it("sets the correct data-slot attribute", () => {
    render(<CardFooter>Footer</CardFooter>);

    expect(screen.getByText("Footer")).toHaveAttribute(
      "data-slot",
      "card-footer",
    );
  });

  it("applies the default classes", () => {
    render(<CardFooter>Footer</CardFooter>);

    expect(screen.getByText("Footer")).toHaveClass("flex");
    expect(screen.getByText("Footer")).toHaveClass("items-center");
  });
});

describe("Card composition", () => {
  it("renders a full card with every slot", () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Order Information</CardTitle>
          <CardDescription>Order KS1300400032</CardDescription>
          <CardAction>Edit</CardAction>
        </CardHeader>
        <CardContent>Line items</CardContent>
        <CardFooter>Updated today</CardFooter>
      </Card>,
    );

    expect(screen.getByText("Order Information")).toBeInTheDocument();
    expect(screen.getByText("Order KS1300400032")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Line items")).toBeInTheDocument();
    expect(screen.getByText("Updated today")).toBeInTheDocument();

    expect(container.querySelectorAll("[data-slot^='card']")).toHaveLength(7);
  });
});
