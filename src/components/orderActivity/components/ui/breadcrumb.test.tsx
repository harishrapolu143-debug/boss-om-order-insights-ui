import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "./breadcrumb";

describe("Breadcrumb", () => {
  it("renders a labelled navigation landmark", () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Orders</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    const nav = screen.getByRole("navigation");

    expect(nav).toHaveAttribute("aria-label", "breadcrumb");
    expect(nav).toHaveAttribute("data-slot", "breadcrumb");
  });
});

describe("BreadcrumbList", () => {
  it("renders an ordered list with the correct data-slot", () => {
    const { container } = render(
      <BreadcrumbList>
        <BreadcrumbItem>Orders</BreadcrumbItem>
      </BreadcrumbList>,
    );

    const list = container.querySelector("[data-slot='breadcrumb-list']");

    expect(list?.tagName).toBe("OL");
    expect(list).toHaveClass("flex");
    expect(list).toHaveClass("flex-wrap");
  });

  it("merges a custom className with the defaults", () => {
    const { container } = render(
      <BreadcrumbList className="gap-4">
        <BreadcrumbItem>Orders</BreadcrumbItem>
      </BreadcrumbList>,
    );

    const list = container.querySelector("[data-slot='breadcrumb-list']");

    expect(list).toHaveClass("gap-4");
    expect(list).toHaveClass("flex");
  });
});

describe("BreadcrumbItem", () => {
  it("renders a list item with the correct data-slot", () => {
    render(<BreadcrumbItem>Orders</BreadcrumbItem>);

    const item = screen.getByText("Orders");

    expect(item.tagName).toBe("LI");
    expect(item).toHaveAttribute("data-slot", "breadcrumb-item");
    expect(item).toHaveClass("inline-flex");
  });
});

describe("BreadcrumbLink", () => {
  it("renders an anchor by default", () => {
    render(<BreadcrumbLink href="/orders">Orders</BreadcrumbLink>);

    const link = screen.getByRole("link", { name: "Orders" });

    expect(link).toHaveAttribute("href", "/orders");
    expect(link).toHaveAttribute("data-slot", "breadcrumb-link");
  });

  it("applies the default classes", () => {
    render(<BreadcrumbLink href="/orders">Orders</BreadcrumbLink>);

    expect(screen.getByRole("link")).toHaveClass("transition-colors");
  });

  it("renders as the child element when asChild is set", () => {
    render(
      <BreadcrumbLink asChild>
        <button type="button">Orders</button>
      </BreadcrumbLink>,
    );

    const button = screen.getByRole("button", { name: "Orders" });

    expect(button).toHaveAttribute("data-slot", "breadcrumb-link");
  });
});

describe("BreadcrumbPage", () => {
  it("marks the current page", () => {
    render(<BreadcrumbPage>Order details</BreadcrumbPage>);

    const page = screen.getByText("Order details");

    expect(page).toHaveAttribute("aria-current", "page");
    expect(page).toHaveAttribute("aria-disabled", "true");
    expect(page).toHaveAttribute("role", "link");
    expect(page).toHaveAttribute("data-slot", "breadcrumb-page");
  });

  it("applies the default classes", () => {
    render(<BreadcrumbPage>Order details</BreadcrumbPage>);

    expect(screen.getByText("Order details")).toHaveClass("text-foreground");
  });
});

describe("BreadcrumbSeparator", () => {
  it("is hidden from assistive tech", () => {
    const { container } = render(<BreadcrumbSeparator />);

    const separator = container.querySelector(
      "[data-slot='breadcrumb-separator']",
    );

    expect(separator).toHaveAttribute("aria-hidden", "true");
    expect(separator).toHaveAttribute("role", "presentation");
  });

  it("renders a chevron by default", () => {
    const { container } = render(<BreadcrumbSeparator />);

    const separator = container.querySelector(
      "[data-slot='breadcrumb-separator']",
    );

    expect(separator?.querySelector("svg")).toBeInTheDocument();
  });

  it("renders custom children instead of the chevron", () => {
    render(<BreadcrumbSeparator>/</BreadcrumbSeparator>);

    expect(screen.getByText("/")).toBeInTheDocument();
  });
});

describe("BreadcrumbEllipsis", () => {
  it("is hidden from assistive tech but carries screen-reader text", () => {
    const { container } = render(<BreadcrumbEllipsis />);

    const ellipsis = container.querySelector(
      "[data-slot='breadcrumb-ellipsis']",
    );

    expect(ellipsis).toHaveAttribute("aria-hidden", "true");
    expect(ellipsis).toHaveAttribute("role", "presentation");
    expect(ellipsis).toHaveTextContent("More");
    expect(ellipsis?.querySelector("svg")).toBeInTheDocument();
  });
});

describe("Breadcrumb composition", () => {
  it("renders a full trail", () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/orders">Orders</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>KS1300400032</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    expect(screen.getAllByRole("link")).toHaveLength(3); // 2 anchors + current page
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();
    expect(screen.getByText("KS1300400032")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
