import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
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

/**
 * ============================================================================
 * Pagination
 * ============================================================================
 */
describe("Pagination", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Every pagination part should render with its own data-slot attribute.
   */
  it("sets the correct data-slot attributes for every part", () => {
    const { container } = renderPagination();

    [
      "pagination",
      "pagination-content",
      "pagination-item",
      "pagination-link",
      "pagination-ellipsis",
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
   * The pagination should be a labelled navigation landmark.
   */
  it("renders as a labelled navigation landmark", () => {
    renderPagination();

    expect(
      screen.getByRole("navigation", {
        name: "pagination",
      }),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The pages should be rendered as a list of links.
   */
  it("renders the pages as a list of links", () => {
    const { container } = renderPagination();

    expect(
      (
        container.querySelector(
          "[data-slot='pagination-content']",
        ) as HTMLElement
      ).tagName,
    ).toBe("UL");

    expect(
      screen.getByRole("link", { name: "1" }),
    ).toHaveAttribute("href", "#1");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The active page should be marked with aria-current.
   */
  it("marks the active page", () => {
    renderPagination();

    const active = screen.getByRole("link", {
      name: "2",
    });

    expect(active).toHaveAttribute(
      "aria-current",
      "page",
    );

    expect(active).toHaveAttribute(
      "data-active",
      "true",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The active page should use the outline styling so it stands out.
   */
  it("styles the active page differently", () => {
    renderPagination();

    const active = screen.getByRole("link", {
      name: "2",
    });

    const inactive = screen.getByRole("link", {
      name: "1",
    });

    expect(active).toHaveClass("border");
    expect(active.className).not.toBe(
      inactive.className,
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The previous and next controls should be labelled for screen readers.
   */
  it("labels the previous and next controls", () => {
    renderPagination();

    expect(
      screen.getByRole("link", {
        name: "Go to previous page",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Go to next page",
      }),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The ellipsis should carry a screen reader label.
   */
  it("gives the ellipsis a screen reader label", () => {
    const { container } = renderPagination();

    expect(
      container.querySelector(
        "[data-slot='pagination-ellipsis']",
      ),
    ).toHaveTextContent("More pages");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A page link should be clickable.
   */
  it("calls the handler when a page is clicked", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn((event: React.MouseEvent) =>
      event.preventDefault(),
    );

    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#3" onClick={onClick}>
              3
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    await user.click(
      screen.getByRole("link", { name: "3" }),
    );

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A custom className should be merged with the defaults.
   */
  it("merges a custom className with the defaults", () => {
    const { container } = render(
      <Pagination className="mt-8">
        <PaginationContent className="gap-4">
          <PaginationItem>
            <PaginationLink
              href="#1"
              className="font-bold"
            >
              1
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    expect(
      container.querySelector(
        "[data-slot='pagination']",
      ),
    ).toHaveClass("mt-8", "mx-auto");

    expect(
      container.querySelector(
        "[data-slot='pagination-content']",
      ),
    ).toHaveClass("gap-4", "flex");

    expect(
      screen.getByRole("link", { name: "1" }),
    ).toHaveClass("font-bold");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Inactive pages must NOT be marked as the current page.
   */
  it("does not mark inactive pages as current", () => {
    renderPagination();

    const inactive = screen.getByRole("link", {
      name: "1",
    });

    expect(inactive).not.toHaveAttribute(
      "aria-current",
    );

    expect(inactive).not.toHaveAttribute(
      "data-active",
      "true",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Only one page may be current at a time.
   */
  it("does not mark more than one page as current", () => {
    const { container } = renderPagination();

    expect(
      container.querySelectorAll(
        "[aria-current='page']",
      ),
    ).toHaveLength(1);
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The ellipsis is decoration - it must NOT be announced as its own
   * element or be reachable.
   */
  it("does not expose the ellipsis to assistive technology", () => {
    const { container } = renderPagination();

    const ellipsis = container.querySelector(
      "[data-slot='pagination-ellipsis']",
    ) as HTMLElement;

    expect(ellipsis).toHaveAttribute("aria-hidden");
    expect(ellipsis.tagName).toBe("SPAN");
    expect(ellipsis).not.toHaveAttribute("href");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The previous and next controls must not expose their visible text
   * twice - the visible label is hidden on small screens and the
   * accessible name comes from aria-label.
   */
  it("does not duplicate the accessible name of the next control", () => {
    renderPagination();

    expect(
      screen.queryByRole("link", { name: "Next" }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Go to next page",
      }),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A pagination link is an anchor - it must not render as a button
   * element, which would break middle-click and open-in-new-tab.
   */
  it("does not render page links as buttons", () => {
    renderPagination();

    expect(
      screen.queryAllByRole("button"),
    ).toHaveLength(0);
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * An empty pagination must not invent page entries.
   */
  it("does not render entries that were not supplied", () => {
    const { container } = render(
      <Pagination>
        <PaginationContent />
      </Pagination>,
    );

    expect(
      container.querySelector(
        "[data-slot='pagination-item']",
      ),
    ).not.toBeInTheDocument();

    expect(
      screen.queryAllByRole("link"),
    ).toHaveLength(0);
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A custom className must not remove the pagination layout.
   */
  it("does not drop the default classes when a custom className is given", () => {
    const { container } = render(
      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#1">1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    const nav = container.querySelector(
      "[data-slot='pagination']",
    );

    expect(nav).toHaveClass("mt-8");
    expect(nav).toHaveClass("flex");
    expect(nav).toHaveClass("justify-center");
  });
});
