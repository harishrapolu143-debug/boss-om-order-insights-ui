import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { Slider } from "./slider";

describe("Slider", () => {
  it("sets the correct data-slot attributes", () => {
    const { container } = render(<Slider defaultValue={[50]} />);

    expect(container.querySelector("[data-slot='slider']")).toBeInTheDocument();
    expect(
      container.querySelector("[data-slot='slider-track']"),
    ).toBeInTheDocument();
    expect(
      container.querySelector("[data-slot='slider-range']"),
    ).toBeInTheDocument();
  });

  it("renders one thumb per value", () => {
    const { container } = render(<Slider defaultValue={[25]} />);

    expect(
      container.querySelectorAll("[data-slot='slider-thumb']"),
    ).toHaveLength(1);
  });

  it("renders two thumbs for a range", () => {
    const { container } = render(<Slider defaultValue={[20, 80]} />);

    expect(
      container.querySelectorAll("[data-slot='slider-thumb']"),
    ).toHaveLength(2);
  });

  it("falls back to a thumb at each bound when no value is given", () => {
    const { container } = render(<Slider />);

    // _values defaults to [min, max], so two thumbs are rendered.
    expect(
      container.querySelectorAll("[data-slot='slider-thumb']"),
    ).toHaveLength(2);
  });

  it("exposes each thumb with the slider role", () => {
    render(<Slider defaultValue={[50]} />);

    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("reports the current value to assistive tech", () => {
    render(<Slider defaultValue={[35]} />);

    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "35");
  });

  it("applies the default min and max", () => {
    render(<Slider defaultValue={[50]} />);

    const slider = screen.getByRole("slider");

    expect(slider).toHaveAttribute("aria-valuemin", "0");
    expect(slider).toHaveAttribute("aria-valuemax", "100");
  });

  it("honours explicit min and max", () => {
    render(<Slider defaultValue={[5]} min={1} max={10} />);

    const slider = screen.getByRole("slider");

    expect(slider).toHaveAttribute("aria-valuemin", "1");
    expect(slider).toHaveAttribute("aria-valuemax", "10");
  });

  it("increments with the arrow keys", async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    render(<Slider defaultValue={[50]} onValueChange={onValueChange} />);

    await user.tab();
    expect(screen.getByRole("slider")).toHaveFocus();

    await user.keyboard("{ArrowRight}");

    expect(onValueChange).toHaveBeenCalledWith([51]);
  });

  it("decrements with the arrow keys", async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    render(<Slider defaultValue={[50]} onValueChange={onValueChange} />);

    await user.tab();
    await user.keyboard("{ArrowLeft}");

    expect(onValueChange).toHaveBeenCalledWith([49]);
  });

  it("does not respond to the keyboard while disabled", async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    render(
      <Slider defaultValue={[50]} onValueChange={onValueChange} disabled />,
    );

    await user.tab();
    await user.keyboard("{ArrowRight}");

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("renders vertically when asked", () => {
    const { container } = render(
      <Slider defaultValue={[50]} orientation="vertical" />,
    );

    expect(container.querySelector("[data-slot='slider']")).toHaveAttribute(
      "data-orientation",
      "vertical",
    );
  });

  it("merges a custom className with the defaults", () => {
    const { container } = render(
      <Slider defaultValue={[50]} className="max-w-sm" />,
    );

    const slider = container.querySelector("[data-slot='slider']");

    expect(slider).toHaveClass("max-w-sm");
    expect(slider).toHaveClass("relative");
  });
});
