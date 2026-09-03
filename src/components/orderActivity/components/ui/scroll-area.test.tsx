import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { ScrollArea, ScrollBar } from "./scroll-area";

describe("ScrollArea", () => {
  it("sets the correct data-slot attribute", () => {
    const { container } = render(
      <ScrollArea>
        <div>Scrollable content</div>
      </ScrollArea>,
    );

    expect(
      container.querySelector("[data-slot='scroll-area']"),
    ).toBeInTheDocument();
  });

  it("renders its children inside the viewport", () => {
    const { container } = render(
      <ScrollArea>
        <div>Scrollable content</div>
      </ScrollArea>,
    );

    const viewport = container.querySelector(
      "[data-slot='scroll-area-viewport']",
    );

    expect(viewport).toBeInTheDocument();
    expect(viewport).toContainElement(screen.getByText("Scrollable content"));
  });

  it("applies the default classes", () => {
    const { container } = render(
      <ScrollArea>
        <div>Scrollable content</div>
      </ScrollArea>,
    );

    expect(container.querySelector("[data-slot='scroll-area']")).toHaveClass(
      "relative",
    );
  });

  it("merges a custom className with the defaults", () => {
    const { container } = render(
      <ScrollArea className="h-64">
        <div>Scrollable content</div>
      </ScrollArea>,
    );

    const root = container.querySelector("[data-slot='scroll-area']");

    expect(root).toHaveClass("h-64");
    expect(root).toHaveClass("relative");
  });

  it("forwards arbitrary props to the root", () => {
    const { container } = render(
      <ScrollArea id="timeline-scroll">
        <div>Scrollable content</div>
      </ScrollArea>,
    );

    expect(container.querySelector("[data-slot='scroll-area']")).toHaveAttribute(
      "id",
      "timeline-scroll",
    );
  });
});

// Radix only mounts a scrollbar once it decides one is needed. jsdom reports no
// overflow, so these use type="always" to force the scrollbar to render.
describe("ScrollBar", () => {
  const barIn = (container: HTMLElement) =>
    container.querySelector("[data-slot='scroll-area-scrollbar']");

  it("is not mounted by default in jsdom, where nothing overflows", () => {
    const { container } = render(
      <ScrollArea>
        <div>Scrollable content</div>
      </ScrollArea>,
    );

    expect(barIn(container)).toBeNull();
  });

  it("defaults to a vertical orientation", () => {
    const { container } = render(
      <ScrollArea type="always">
        <div>Scrollable content</div>
      </ScrollArea>,
    );

    expect(barIn(container)).toHaveAttribute("data-orientation", "vertical");
  });

  it("applies the vertical-only classes by default", () => {
    const { container } = render(
      <ScrollArea type="always">
        <div>Scrollable content</div>
      </ScrollArea>,
    );

    const scrollbar = barIn(container);

    expect(scrollbar).toHaveClass("h-full");
    expect(scrollbar).toHaveClass("w-2.5");
    expect(scrollbar).toHaveClass("touch-none");
  });

  it("applies the horizontal-only classes when asked", () => {
    const { container } = render(
      <ScrollArea type="always">
        <div>Scrollable content</div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>,
    );

    const horizontal = container.querySelector(
      "[data-slot='scroll-area-scrollbar'][data-orientation='horizontal']",
    );

    expect(horizontal).toBeInTheDocument();
    expect(horizontal).toHaveClass("h-2.5");
    expect(horizontal).toHaveClass("flex-col");
  });

  it("merges a custom className with the defaults", () => {
    const { container } = render(
      <ScrollArea type="always">
        <div>Scrollable content</div>
        <ScrollBar orientation="horizontal" className="opacity-50" />
      </ScrollArea>,
    );

    const horizontal = container.querySelector(
      "[data-slot='scroll-area-scrollbar'][data-orientation='horizontal']",
    );

    expect(horizontal).toHaveClass("opacity-50");
    expect(horizontal).toHaveClass("h-2.5");
  });
});
