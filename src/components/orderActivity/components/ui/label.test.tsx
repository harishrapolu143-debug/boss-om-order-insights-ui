import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { Label } from "./label";

describe("Label", () => {
  it("renders its children", () => {
    render(<Label>Email address</Label>);

    expect(screen.getByText("Email address")).toBeInTheDocument();
  });

  it("sets the correct data-slot attribute", () => {
    render(<Label>Email address</Label>);

    expect(screen.getByText("Email address")).toHaveAttribute(
      "data-slot",
      "label",
    );
  });

  it("applies the default classes", () => {
    render(<Label>Email address</Label>);

    const label = screen.getByText("Email address");

    expect(label).toHaveClass("flex");
    expect(label).toHaveClass("text-sm");
    expect(label).toHaveClass("font-medium");
    expect(label).toHaveClass("select-none");
  });

  it("merges a custom className with the defaults", () => {
    render(<Label className="text-red-500">Email address</Label>);

    expect(screen.getByText("Email address")).toHaveClass("text-red-500");
    expect(screen.getByText("Email address")).toHaveClass("font-medium");
  });

  it("associates with a control via htmlFor", () => {
    render(
      <>
        <Label htmlFor="email">Email address</Label>
        <input id="email" />
      </>,
    );

    expect(screen.getByLabelText("Email address")).toBe(
      document.getElementById("email"),
    );
  });
});
