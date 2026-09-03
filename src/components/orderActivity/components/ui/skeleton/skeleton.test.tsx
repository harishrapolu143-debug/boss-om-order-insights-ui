import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("sets the correct data-slot attribute", () => {
    const { container } = render(<Skeleton />);

    expect(container.querySelector("[data-slot='skeleton']")).toBeInTheDocument();
  });

  it("applies the default classes", () => {
    const { container } = render(<Skeleton />);

    const skeleton = container.querySelector("[data-slot='skeleton']");

    expect(skeleton).toHaveClass("bg-accent");
    expect(skeleton).toHaveClass("animate-pulse");
    expect(skeleton).toHaveClass("rounded-md");
  });

  it("merges a custom className with the defaults", () => {
    const { container } = render(<Skeleton className="h-10 w-full" />);

    const skeleton = container.querySelector("[data-slot='skeleton']");

    expect(skeleton).toHaveClass("h-10");
    expect(skeleton).toHaveClass("w-full");
    expect(skeleton).toHaveClass("animate-pulse");
  });

  it("forwards arbitrary div props", () => {
    render(<Skeleton data-testid="loading" aria-label="Loading" />);

    expect(screen.getByTestId("loading")).toHaveAttribute("aria-label", "Loading");
  });

  it("renders children when given", () => {
    render(
      <Skeleton>
        <span>placeholder</span>
      </Skeleton>,
    );

    expect(screen.getByText("placeholder")).toBeInTheDocument();
  });
});
