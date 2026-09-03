import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "./pagination";

function renderPagination() {
  return render(
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#prev" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#1">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#2" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#next" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>,
  );
}

describe("Pagination", () => {
  it("renders a labelled navigation landmark", () => {
    renderPagination();

    const nav = screen.getByRole("navigation");

    expect(nav).toHaveAttribute("aria-label", "pagination");
    expect(nav).toHaveAttribute("data-slot", "pagination");
  });

  it("applies the default classes", () => {
    renderPagination();

    expect(screen.getByRole("navigation")).toHaveClass("mx-auto");
    expect(screen.getByRole("navigation")).toHaveClass("justify-center");
  });

  it("merges a custom className with the defaults", () => {
    render(
      <Pagination className="mt-8">
        <PaginationContent />
      </Pagination>,
    );

    expect(screen.getByRole("navigation")).toHaveClass("mt-8");
    expect(screen.getByRole("navigation")).toHaveClass("mx-auto");
  });
});

describe("PaginationContent and PaginationItem", () => {
  it("render a list of items", () => {
    renderPagination();

    expect(screen.getByRole("list")).toHaveAttribute(
      "data-slot",
      "pagination-content",
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
  });

  it("applies the default content classes", () => {
    renderPagination();

    expect(screen.getByRole("list")).toHaveClass("flex");
    expect(screen.getByRole("list")).toHaveClass("items-center");
  });

  it("sets the correct data-slot on each item", () => {
    renderPagination();

    screen.getAllByRole("listitem").forEach((item) => {
      expect(item).toHaveAttribute("data-slot", "pagination-item");
    });
  });
});

describe("PaginationLink", () => {
  it("renders an anchor with the correct data-slot", () => {
    render(<PaginationLink href="#1">1</PaginationLink>);

    const link = screen.getByRole("link", { name: "1" });

    expect(link).toHaveAttribute("href", "#1");
    expect(link).toHaveAttribute("data-slot", "pagination-link");
  });

  it("uses the ghost button variant when inactive", () => {
    render(<PaginationLink href="#1">1</PaginationLink>);

    const link = screen.getByRole("link", { name: "1" });

    // isActive is undefined here, so React omits data-active entirely.
    expect(link).not.toHaveAttribute("data-active");
    expect(link).not.toHaveAttribute("aria-current");
    expect(link).toHaveClass("hover:bg-accent");
  });

  it("uses the outline button variant and marks the current page when active", () => {
    render(
      <PaginationLink href="#2" isActive>
        2
      </PaginationLink>,
    );

    const link = screen.getByRole("link", { name: "2" });

    expect(link).toHaveAttribute("aria-current", "page");
    expect(link).toHaveAttribute("data-active", "true");
    expect(link).toHaveClass("border");
  });

  it("defaults to the icon size", () => {
    render(<PaginationLink href="#1">1</PaginationLink>);

    expect(screen.getByRole("link", { name: "1" })).toHaveClass("size-9");
  });

  it("honours an explicit size", () => {
    render(
      <PaginationLink href="#1" size="lg">
        1
      </PaginationLink>,
    );

    expect(screen.getByRole("link", { name: "1" })).toHaveClass("h-10");
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(
      <PaginationLink href="#1" onClick={onClick}>
        1
      </PaginationLink>,
    );

    await user.click(screen.getByRole("link", { name: "1" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("PaginationPrevious and PaginationNext", () => {
  it("carry descriptive aria-labels", () => {
    renderPagination();

    expect(
      screen.getByRole("link", { name: "Go to previous page" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Go to next page" }),
    ).toBeInTheDocument();
  });

  it("render their label text and a chevron", () => {
    renderPagination();

    const previous = screen.getByRole("link", { name: "Go to previous page" });

    expect(previous).toHaveTextContent("Previous");
    expect(previous.querySelector("svg")).toBeInTheDocument();
  });

  it("use the default button size rather than icon", () => {
    renderPagination();

    expect(
      screen.getByRole("link", { name: "Go to previous page" }),
    ).toHaveClass("h-9");
  });

  it("merge a custom className with the defaults", () => {
    render(<PaginationNext href="#next" className="ml-4" />);

    const next = screen.getByRole("link", { name: "Go to next page" });

    expect(next).toHaveClass("ml-4");
    expect(next).toHaveClass("gap-1");
  });
});

describe("PaginationEllipsis", () => {
  it("is hidden from assistive tech but carries screen-reader text", () => {
    const { container } = render(<PaginationEllipsis />);

    const ellipsis = container.querySelector(
      "[data-slot='pagination-ellipsis']",
    );

    expect(ellipsis).toHaveAttribute("aria-hidden");
    expect(ellipsis).toHaveTextContent("More pages");
    expect(ellipsis?.querySelector("svg")).toBeInTheDocument();
  });

  it("merges a custom className with the defaults", () => {
    const { container } = render(<PaginationEllipsis className="size-12" />);

    const ellipsis = container.querySelector(
      "[data-slot='pagination-ellipsis']",
    );

    expect(ellipsis).toHaveClass("size-12");
    expect(ellipsis).toHaveClass("items-center");
  });
});
