import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { Textarea } from "./textarea";

describe("Textarea", () => {
  it("sets the correct data-slot attribute", () => {
    render(<Textarea aria-label="Notes" />);

    expect(screen.getByLabelText("Notes")).toHaveAttribute(
      "data-slot",
      "textarea",
    );
  });

  it("applies the default classes", () => {
    render(<Textarea aria-label="Notes" />);

    const textarea = screen.getByLabelText("Notes");

    expect(textarea).toHaveClass("min-h-16");
    expect(textarea).toHaveClass("w-full");
    expect(textarea).toHaveClass("rounded-md");
    expect(textarea).toHaveClass("resize-none");
  });

  it("merges a custom className with the defaults", () => {
    render(<Textarea className="min-h-32" aria-label="Notes" />);

    expect(screen.getByLabelText("Notes")).toHaveClass("min-h-32");
    expect(screen.getByLabelText("Notes")).toHaveClass("resize-none");
  });

  it("accepts typed text", async () => {
    const user = userEvent.setup();
    render(<Textarea aria-label="Notes" />);

    const textarea = screen.getByLabelText("Notes");
    await user.type(textarea, "line one");

    expect(textarea).toHaveValue("line one");
  });

  it("does not accept input while disabled", async () => {
    const user = userEvent.setup();
    render(<Textarea aria-label="Notes" disabled />);

    const textarea = screen.getByLabelText("Notes");

    expect(textarea).toBeDisabled();

    await user.type(textarea, "abc");

    expect(textarea).toHaveValue("");
  });

  it("renders a placeholder", () => {
    render(<Textarea placeholder="Add a note" />);

    expect(screen.getByPlaceholderText("Add a note")).toBeInTheDocument();
  });

  it("supports a controlled value", () => {
    render(<Textarea aria-label="Notes" value="fixed" onChange={() => {}} />);

    expect(screen.getByLabelText("Notes")).toHaveValue("fixed");
  });
});
