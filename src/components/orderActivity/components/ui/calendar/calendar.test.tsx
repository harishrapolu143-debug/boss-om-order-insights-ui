import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { Calendar } from "./calendar";

const JANUARY_2026 = new Date(2026, 0, 1);

describe("Calendar", () => {
  it("renders a month grid", () => {
    render(<Calendar mode="single" month={JANUARY_2026} />);

    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("renders the caption for the given month", () => {
    render(<Calendar mode="single" month={JANUARY_2026} />);

    expect(screen.getByText("January 2026")).toBeInTheDocument();
  });

  it("renders a cell per day of the month", () => {
    render(<Calendar mode="single" month={JANUARY_2026} />);

    expect(screen.getByRole("button", { name: /January 15th, 2026/ })).
      toBeInTheDocument();
  });

  it("applies the padding class to the root", () => {
    const { container } = render(
      <Calendar mode="single" month={JANUARY_2026} />,
    );

    expect(container.firstElementChild).toHaveClass("p-3");
    expect(container.firstElementChild).toHaveClass("rdp-root");
  });

  it("merges a custom className onto the root", () => {
    const { container } = render(
      <Calendar mode="single" month={JANUARY_2026} className="rounded-lg" />,
    );

    expect(container.firstElementChild).toHaveClass("rounded-lg");
    expect(container.firstElementChild).toHaveClass("p-3");
  });

  it("renders previous and next month navigation", () => {
    render(<Calendar mode="single" month={JANUARY_2026} />);

    expect(
      screen.getByRole("button", { name: /Previous Month/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Next Month/i }),
    ).toBeInTheDocument();
  });

  it("shows outside days by default", () => {
    const { container } = render(
      <Calendar mode="single" month={JANUARY_2026} />,
    );

    expect(container.querySelector(".rdp-outside")).toBeInTheDocument();
  });

  it("hides outside days when showOutsideDays is false", () => {
    const { container } = render(
      <Calendar mode="single" month={JANUARY_2026} showOutsideDays={false} />,
    );

    // v9 keeps the padding cell but marks it hidden and renders no day button.
    const outside = container.querySelector("[data-outside='true']");

    expect(outside).toHaveAttribute("data-hidden", "true");
    expect(outside?.querySelector("button")).toBeNull();
  });

  it("renders a clickable button inside outside days when they are shown", () => {
    const { container } = render(
      <Calendar mode="single" month={JANUARY_2026} />,
    );

    const outside = container.querySelector("[data-outside='true']");

    expect(outside).not.toHaveAttribute("data-hidden");
    expect(outside?.querySelector("button")).toBeInTheDocument();
  });
});

describe("Calendar selection", () => {
  it("marks the selected day", () => {
    render(
      <Calendar
        mode="single"
        month={JANUARY_2026}
        selected={new Date(2026, 0, 15)}
      />,
    );

    const selected = screen.getByRole("button", {
      name: /January 15th, 2026/,
    });

    expect(selected.closest("[role='gridcell']")).toHaveClass("rdp-selected");
  });

  it("calls onSelect when a day is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    render(
      <Calendar mode="single" month={JANUARY_2026} onSelect={onSelect} />,
    );

    await user.click(
      screen.getByRole("button", { name: /January 15th, 2026/ }),
    );

    expect(onSelect).toHaveBeenCalled();
    expect(onSelect.mock.calls[0][0]).toEqual(new Date(2026, 0, 15));
  });

  it("does not select a disabled day", async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    render(
      <Calendar
        mode="single"
        month={JANUARY_2026}
        onSelect={onSelect}
        disabled={{ before: new Date(2026, 0, 20) }}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /January 15th, 2026/ }),
    );

    expect(onSelect).not.toHaveBeenCalled();
  });

  it("supports range mode", () => {
    render(
      <Calendar
        mode="range"
        month={JANUARY_2026}
        selected={{
          from: new Date(2026, 0, 10),
          to: new Date(2026, 0, 14),
        }}
      />,
    );

    const from = screen
      .getByRole("button", { name: /January 10th, 2026/ })
      .closest("[role='gridcell']");

    expect(from).toHaveClass("rdp-range_start");
  });
});

describe("Calendar navigation", () => {
  it("moves to the next month", async () => {
    const user = userEvent.setup();
    render(<Calendar mode="single" defaultMonth={JANUARY_2026} />);

    await user.click(screen.getByRole("button", { name: /Next Month/i }));

    expect(screen.getByText("February 2026")).toBeInTheDocument();
  });

  it("moves to the previous month", async () => {
    const user = userEvent.setup();
    render(<Calendar mode="single" defaultMonth={JANUARY_2026} />);

    await user.click(screen.getByRole("button", { name: /Previous Month/i }));

    expect(screen.getByText("December 2025")).toBeInTheDocument();
  });
});

/**
 * KNOWN GAP: this project has react-day-picker 9.x installed, but Calendar
 * passes a `classNames` map written for the v8 API. v9 renamed most of those
 * keys, so the majority of the custom styling is silently dropped - the object
 * is accepted, the classes simply never reach the DOM. These tests pin which
 * keys still work so a v9 rewrite of the map has a safety net.
 *
 * Still applied: months, month, caption_label, nav, day.
 * Ignored by v9: caption, nav_button, nav_button_previous, nav_button_next,
 * table, head_row, head_cell, row, cell, day_selected, day_today, day_outside,
 * day_disabled, day_range_start, day_range_end, day_range_middle, day_hidden.
 */
describe("Calendar classNames under react-day-picker v9", () => {
  it("still applies the months layout classes", () => {
    const { container } = render(
      <Calendar mode="single" month={JANUARY_2026} />,
    );

    const months = container.querySelector(".sm\\:flex-row");

    expect(months).toBeInTheDocument();
    expect(months).toHaveClass("flex");
    expect(months).toHaveClass("flex-col");
  });

  it("applies the day classes to the gridcell, not the day button", () => {
    const { container } = render(
      <Calendar mode="single" month={JANUARY_2026} />,
    );

    // In v9 the `day` key targets the <td>; the inner button keeps only
    // rdp-day_button. Under v8 these classes landed on the button instead.
    const cell = container.querySelector("[role='gridcell']");

    expect(cell?.tagName).toBe("TD");
    expect(cell).toHaveClass("size-8");
    expect(cell).toHaveClass("font-normal");
    expect(cell?.querySelector("button")).toHaveClass("rdp-day_button");
  });

  it("leaves the nav buttons unstyled, because nav_button is a v8 key", () => {
    render(<Calendar mode="single" month={JANUARY_2026} />);

    const previous = screen.getByRole("button", { name: /Previous Month/i });

    expect(previous).toHaveClass("rdp-button_previous");
    // buttonVariants({ variant: "outline" }) never reaches it.
    expect(previous).not.toHaveClass("border");
  });

  it("leaves the selected day without the day_selected classes", () => {
    render(
      <Calendar
        mode="single"
        month={JANUARY_2026}
        selected={new Date(2026, 0, 15)}
      />,
    );

    const cell = screen
      .getByRole("button", { name: /January 15th, 2026/ })
      .closest("[role='gridcell']");

    // v9 emits rdp-selected; the configured bg-primary never applies.
    expect(cell).toHaveClass("rdp-selected");
    expect(cell).not.toHaveClass("bg-primary");
  });

  it("accepts a caller-supplied classNames override", () => {
    const { container } = render(
      <Calendar
        mode="single"
        month={JANUARY_2026}
        classNames={{ month_grid: "custom-grid" }}
      />,
    );

    expect(container.querySelector(".custom-grid")).toBeInTheDocument();
  });
});
