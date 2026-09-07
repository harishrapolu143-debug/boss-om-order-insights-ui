import * as React from "react";
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

function renderBreadcrumb() {
  return render(
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/orders">
            Orders
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator />

        <BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbItem>

        <BreadcrumbSeparator />

        <BreadcrumbItem>
          <BreadcrumbPage>SO-1024</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>,
  );
}

/**
 * ============================================================================
 * Breadcrumb
 * ============================================================================
 */
describe("Breadcrumb", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Every breadcrumb part should render with its own data-slot attribute.
   */
  it("sets the correct data-slot attributes for every part", () => {
    const { container } = renderBreadcrumb();

    [
      "breadcrumb",
      "breadcrumb-list",
      "breadcrumb-item",
      "breadcrumb-link",
      "breadcrumb-page",
      "breadcrumb-separator",
      "breadcrumb-ellipsis",
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
   * The breadcrumb should be exposed as a labelled navigation landmark.
   */
  it("renders as a labelled navigation landmark", () => {
    renderBreadcrumb();

    expect(
      screen.getByRole("navigation", {
        name: "breadcrumb",
      }),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The trail should be an ordered list of items.
   */
  it("renders the trail as an ordered list", () => {
    const { container } = renderBreadcrumb();

    const list = container.querySelector(
      "[data-slot='breadcrumb-list']",
    ) as HTMLElement;

    expect(list.tagName).toBe("OL");

    expect(
      screen.getAllByRole("listitem").length,
    ).toBeGreaterThan(0);
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Ancestor entries should be real links.
   */
  it("renders an ancestor entry as a link", () => {
    renderBreadcrumb();

    expect(
      screen.getByRole("link", { name: "Orders" }),
    ).toHaveAttribute("href", "/orders");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The current page should be marked with aria-current.
   */
  it("marks the current page", () => {
    const { container } = renderBreadcrumb();

    const page = container.querySelector(
      "[data-slot='breadcrumb-page']",
    ) as HTMLElement;

    expect(page).toHaveAttribute(
      "aria-current",
      "page",
    );

    expect(page).toHaveTextContent("SO-1024");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The ellipsis should carry a screen reader label.
   */
  it("gives the ellipsis a screen reader label", () => {
    const { container } = renderBreadcrumb();

    const ellipsis = container.querySelector(
      "[data-slot='breadcrumb-ellipsis']",
    ) as HTMLElement;

    expect(ellipsis).toHaveTextContent("More");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The separator should default to a chevron icon.
   */
  it("renders a default separator icon", () => {
    const { container } = renderBreadcrumb();

    const separator = container.querySelector(
      "[data-slot='breadcrumb-separator']",
    ) as HTMLElement;

    expect(
      separator.querySelector("svg"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A custom separator should replace the default icon.
   */
  it("renders a custom separator when one is supplied", () => {
    const { container } = render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    const separator = container.querySelector(
      "[data-slot='breadcrumb-separator']",
    ) as HTMLElement;

    expect(separator).toHaveTextContent("/");

    expect(
      separator.querySelector("svg"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * asChild should let the link render a routing component.
   */
  it("renders as its child element when asChild is set", () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <button type="button">Orders</button>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    expect(
      screen.getByRole("button", {
        name: "Orders",
      }),
    ).toHaveAttribute(
      "data-slot",
      "breadcrumb-link",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The current page must NOT be navigable.
   *
   * It deliberately keeps role="link" so it reads as part of the trail,
   * but it is a span with no href and is marked aria-disabled, so there
   * is nowhere for a click to go.
   */
  it("does not give the current page a destination", () => {
    const { container } = renderBreadcrumb();

    const page = container.querySelector(
      "[data-slot='breadcrumb-page']",
    ) as HTMLElement;

    expect(page.tagName).toBe("SPAN");
    expect(page).not.toHaveAttribute("href");

    expect(page).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The current page must be marked as disabled so assistive technology
   * does not offer it as a destination.
   */
  it("does not present the current page as enabled", () => {
    const { container } = renderBreadcrumb();

    expect(
      container.querySelector(
        "[data-slot='breadcrumb-page']",
      ),
    ).toHaveAttribute("aria-disabled", "true");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Separators are decoration - they must NOT be announced to assistive
   * technology.
   */
  it("does not expose separators to assistive technology", () => {
    const { container } = renderBreadcrumb();

    container
      .querySelectorAll(
        "[data-slot='breadcrumb-separator']",
      )
      .forEach((separator) => {
        expect(separator).toHaveAttribute(
          "aria-hidden",
          "true",
        );

        expect(separator).toHaveAttribute(
          "role",
          "presentation",
        );
      });
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The ellipsis is decoration too - it must not be announced as its own
   * element.
   */
  it("does not expose the ellipsis to assistive technology", () => {
    const { container } = renderBreadcrumb();

    expect(
      container.querySelector(
        "[data-slot='breadcrumb-ellipsis']",
      ),
    ).toHaveAttribute("aria-hidden", "true");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Only the ancestor entries may actually navigate - the trail must not
   * render more anchors than it has navigable steps.
   */
  it("does not render an anchor for every trail entry", () => {
    const { container } = renderBreadcrumb();

    expect(
      container.querySelectorAll("a[href]"),
    ).toHaveLength(1);
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A breadcrumb with no items must not render invented entries.
   */
  it("does not render entries that were not supplied", () => {
    const { container } = render(
      <Breadcrumb>
        <BreadcrumbList />
      </Breadcrumb>,
    );

    expect(
      container.querySelector(
        "[data-slot='breadcrumb-item']",
      ),
    ).not.toBeInTheDocument();

    expect(
      screen.queryAllByRole("listitem"),
    ).toHaveLength(0);
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A custom className must not remove the trail layout.
   */
  it("does not drop the default classes when a custom className is given", () => {
    const { container } = render(
      <Breadcrumb>
        <BreadcrumbList className="gap-8">
          <BreadcrumbItem className="font-bold">
            <BreadcrumbLink href="/orders">
              Orders
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    expect(
      container.querySelector(
        "[data-slot='breadcrumb-list']",
      ),
    ).toHaveClass("gap-8", "flex", "flex-wrap");

    expect(
      container.querySelector(
        "[data-slot='breadcrumb-item']",
      ),
    ).toHaveClass("font-bold", "inline-flex");
  });
});
