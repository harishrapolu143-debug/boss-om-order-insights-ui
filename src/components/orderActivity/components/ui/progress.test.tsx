import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { Progress } from "./progress";

const indicatorOf = (container: HTMLElement) =>
  container.querySelector("[data-slot='progress-indicator']") as HTMLElement;

describe("Progress", () => {
  it("renders with the progressbar role", () => {
    render(<Progress value={40} />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("sets the correct data-slot attributes", () => {
    const { container } = render(<Progress value={40} />);

    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "data-slot",
      "progress",
    );
    expect(indicatorOf(container)).toBeInTheDocument();
  });

  // KNOWN GAP: Progress destructures `value` and uses it only for the indicator
  // transform, never forwarding it to ProgressPrimitive.Root. Radix therefore
  // emits no aria-valuenow, so the bar is visually correct but silent to screen
  // readers. This test pins the current behavior; flip it to expect "40" once
  // `value={value}` is passed through to the Root.
  it("does not currently expose the value to assistive tech", () => {
    render(<Progress value={40} />);

    expect(screen.getByRole("progressbar")).not.toHaveAttribute(
      "aria-valuenow",
    );
  });

  it("translates the indicator by the remaining percentage", () => {
    const { container } = render(<Progress value={40} />);

    expect(indicatorOf(container).style.transform).toBe("translateX(-60%)");
  });

  it("treats a missing value as zero progress", () => {
    const { container } = render(<Progress />);

    expect(indicatorOf(container).style.transform).toBe("translateX(-100%)");
  });

  it("fully reveals the indicator at 100", () => {
    const { container } = render(<Progress value={100} />);

    expect(indicatorOf(container).style.transform).toBe("translateX(-0%)");
  });

  it("merges a custom className with the defaults", () => {
    render(<Progress value={10} className="h-4" />);

    expect(screen.getByRole("progressbar")).toHaveClass("h-4");
    expect(screen.getByRole("progressbar")).toHaveClass("rounded-full");
  });
});
