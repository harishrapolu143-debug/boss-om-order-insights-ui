import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { AspectRatio } from "./aspect-ratio";

describe("AspectRatio", () => {
  it("sets the correct data-slot attribute", () => {
    const { container } = render(
      <AspectRatio ratio={16 / 9}>
        <span>content</span>
      </AspectRatio>,
    );

    expect(
      container.querySelector("[data-slot='aspect-ratio']"),
    ).toBeInTheDocument();
  });

  it("renders its children", () => {
    render(
      <AspectRatio ratio={1}>
        <span>content</span>
      </AspectRatio>,
    );

    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("reserves space using padding-bottom derived from the ratio", () => {
    const { container } = render(
      <AspectRatio ratio={2}>
        <span>content</span>
      </AspectRatio>,
    );

    // Radix wraps the slot in a sizing element: 1 / 2 => 50%
    const wrapper = container.firstElementChild as HTMLElement;

    expect(wrapper.style.paddingBottom).toBe("50%");
  });

  it("forwards arbitrary props to the slot element", () => {
    const { container } = render(
      <AspectRatio ratio={1} id="hero">
        <span>content</span>
      </AspectRatio>,
    );

    expect(container.querySelector("[data-slot='aspect-ratio']")).toHaveAttribute(
      "id",
      "hero",
    );
  });
});
