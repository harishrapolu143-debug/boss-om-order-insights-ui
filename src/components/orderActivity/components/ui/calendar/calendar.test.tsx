import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { Calendar } from "./calendar";

const JANUARY_2026 = new Date(2026, 0, 1);

/**
 * ============================================================================
 * Calendar
 * ============================================================================
 */
describe("Calendar", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The calendar should render a month grid.
   */
  it("renders a month grid", () => {
    render(
      <Calendar mode="single" month={JANUARY_2026} />,
    );

    expect(
      screen.getByRole("grid"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The caption should name the month on display.
   */
  it("renders the caption for the given month", () => {
    render(
      <Calendar mode="single" month={JANUARY_2026} />,
    );

    expect(
      screen.getByText("January 2026"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Every day of the month should be reachable.
   */
  it("renders a cell per day of the month", () => {
    render(
      <Calendar mode="single" month={JANUARY_2026} />,
    );

    expect(
      screen.getByRole("button", {
        name: /January 15th, 2026/,
      }),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The root padding should be applied.
   */
  it("applies the padding class to the root", () => {
    const { container } = render(
      <Calendar mode="single" month={JANUARY_2026} />,
    );

    expect(
      container.firstElementChild,
    ).toHaveClass("p-3");

    expect(
      container.firstElementChild,
    ).toHaveClass("rdp-root");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A custom className should be merged with the defaults.
   */
  it("merges a custom className onto the root", () => {
    const { container } = render(
      <Calendar
        mode="single"
        month={JANUARY_2026}
        className="rounded-lg"
      />,
    );

    expect(
      container.firstElementChild,
    ).toHaveClass("rounded-lg");

    expect(
      container.firstElementChild,
    ).toHaveClass("p-3");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Month navigation should be provided.
   */
  it("renders previous and next month navigation", () => {
    render(
      <Calendar mode="single" month={JANUARY_2026} />,
    );

    expect(
      screen.getByRole("button", {
        name: /Previous Month/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /Next Month/i,
      }),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Outside days should be shown by default.
   */
  it("shows outside days by default", () => {
    const { container } = render(
      <Calendar mode="single" month={JANUARY_2026} />,
    );

    expect(
      container.querySelector(".rdp-outside"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Visible outside days should still be clickable.
   */
  it("renders a clickable button inside outside days when they are shown", () => {
    const { container } = render(
      <Calendar mode="single" month={JANUARY_2026} />,
    );

    const outside = container.querySelector(
      "[data-outside='true']",
    );

    expect(outside).not.toHaveAttribute(
      "data-hidden",
    );

    expect(
      outside?.querySelector("button"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * With showOutsideDays off, the padding day must NOT be clickable.
   *
   * v9 keeps the padding cell but marks it hidden and renders no day
   * button, so the user cannot land on a day from another month.
   */
  it("does not render a day button for hidden outside days", () => {
    const { container } = render(
      <Calendar
        mode="single"
        month={JANUARY_2026}
        showOutsideDays={false}
      />,
    );

    const outside = container.querySelector(
      "[data-outside='true']",
    );

    expect(outside).toHaveAttribute(
      "data-hidden",
      "true",
    );

    expect(
      outside?.querySelector("button"),
    ).toBeNull();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Only the requested month may be captioned - the calendar must not
   * render a neighbouring month's caption as well.
   */
  it("does not render another month's caption", () => {
    render(
      <Calendar mode="single" month={JANUARY_2026} />,
    );

    expect(
      screen.queryByText("February 2026"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("December 2025"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The month grid must not contain days that do not exist.
   */
  it("does not render a day that is not in the month", () => {
    render(
      <Calendar
        mode="single"
        month={JANUARY_2026}
        showOutsideDays={false}
      />,
    );

    expect(
      screen.queryByRole("button", {
        name: /January 32nd, 2026/,
      }),
    ).not.toBeInTheDocument();
  });
});

/**
 * ============================================================================
 * Calendar selection
 * ============================================================================
 */
describe("Calendar selection", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The selected day should be marked.
   */
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

    expect(
      selected.closest("[role='gridcell']"),
    ).toHaveClass("rdp-selected");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Clicking a day should report it.
   */
  it("calls onSelect when a day is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    render(
      <Calendar
        mode="single"
        month={JANUARY_2026}
        onSelect={onSelect}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: /January 15th, 2026/,
      }),
    );

    expect(onSelect).toHaveBeenCalled();

    expect(onSelect.mock.calls[0][0]).toEqual(
      new Date(2026, 0, 15),
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Range mode should mark the start of the range.
   */
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
      .getByRole("button", {
        name: /January 10th, 2026/,
      })
      .closest("[role='gridcell']");

    expect(from).toHaveClass("rdp-range_start");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A disabled day must not be selectable.
   */
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
      screen.getByRole("button", {
        name: /January 15th, 2026/,
      }),
    );

    expect(onSelect).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * In single mode only one day may be marked selected.
   */
  it("does not mark more than one day as selected", () => {
    const { container } = render(
      <Calendar
        mode="single"
        month={JANUARY_2026}
        selected={new Date(2026, 0, 15)}
      />,
    );

    expect(
      container.querySelectorAll(".rdp-selected"),
    ).toHaveLength(1);
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Nothing may be selected until the caller says so.
   */
  it("does not mark any day as selected by default", () => {
    const { container } = render(
      <Calendar mode="single" month={JANUARY_2026} />,
    );

    expect(
      container.querySelector(".rdp-selected"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A day outside the range must not be marked as part of it.
   */
  it("does not mark a day outside the range", () => {
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

    const outsideRange = screen
      .getByRole("button", {
        name: /January 20th, 2026/,
      })
      .closest("[role='gridcell']");

    expect(outsideRange).not.toHaveClass(
      "rdp-selected",
    );
  });
});

/**
 * ============================================================================
 * Calendar navigation
 * ============================================================================
 */
describe("Calendar navigation", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The next control should advance a month.
   */
  it("moves to the next month", async () => {
    const user = userEvent.setup();

    render(
      <Calendar
        mode="single"
        defaultMonth={JANUARY_2026}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: /Next Month/i,
      }),
    );

    expect(
      screen.getByText("February 2026"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The previous control should step back a month.
   */
  it("moves to the previous month", async () => {
    const user = userEvent.setup();

    render(
      <Calendar
        mode="single"
        defaultMonth={JANUARY_2026}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: /Previous Month/i,
      }),
    );

    expect(
      screen.getByText("December 2025"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Navigating must NOT leave the previous month's caption on screen.
   */
  it("does not keep the previous caption after navigating", async () => {
    const user = userEvent.setup();

    render(
      <Calendar
        mode="single"
        defaultMonth={JANUARY_2026}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: /Next Month/i,
      }),
    );

    expect(
      screen.queryByText("January 2026"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A fixed month prop must not be moved by the navigation controls -
   * the caller owns the displayed month.
   */
  it("does not move a controlled month", async () => {
    const user = userEvent.setup();

    render(
      <Calendar mode="single" month={JANUARY_2026} />,
    );

    await user.click(
      screen.getByRole("button", {
        name: /Next Month/i,
      }),
    );

    expect(
      screen.getByText("January 2026"),
    ).toBeInTheDocument();
  });
});

/**
 * ============================================================================
 * Calendar classNames under react-day-picker v9
 * ============================================================================
 *
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
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The months layout keys still reach the DOM under v9.
   */
  it("still applies the months layout classes", () => {
    const { container } = render(
      <Calendar mode="single" month={JANUARY_2026} />,
    );

    const months = container.querySelector(
      ".sm\\:flex-row",
    );

    expect(months).toBeInTheDocument();
    expect(months).toHaveClass("flex");
    expect(months).toHaveClass("flex-col");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A caller-supplied v9 key should be honoured.
   */
  it("accepts a caller-supplied classNames override", () => {
    const { container } = render(
      <Calendar
        mode="single"
        month={JANUARY_2026}
        classNames={{ month_grid: "custom-grid" }}
      />,
    );

    expect(
      container.querySelector(".custom-grid"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Under v9 the `day` key targets the <td>, NOT the inner day button, so
   * the button must not carry those classes.
   */
  it("does not apply the day classes to the day button", () => {
    const { container } = render(
      <Calendar mode="single" month={JANUARY_2026} />,
    );

    const cell = container.querySelector(
      "[role='gridcell']",
    );

    expect(cell?.tagName).toBe("TD");
    expect(cell).toHaveClass("size-8");
    expect(cell).toHaveClass("font-normal");

    expect(
      cell?.querySelector("button"),
    ).toHaveClass("rdp-day_button");

    expect(
      cell?.querySelector("button"),
    ).not.toHaveClass("size-8");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * nav_button is a v8 key, so the outline button styling must NOT reach
   * the navigation controls.
   */
  it("does not style the nav buttons, because nav_button is a v8 key", () => {
    render(
      <Calendar mode="single" month={JANUARY_2026} />,
    );

    const previous = screen.getByRole("button", {
      name: /Previous Month/i,
    });

    expect(previous).toHaveClass(
      "rdp-button_previous",
    );

    // buttonVariants({ variant: "outline" }) never reaches it.
    expect(previous).not.toHaveClass("border");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * day_selected is a v8 key, so the configured selected colours must NOT
   * reach the selected cell.
   */
  it("does not apply the day_selected classes to the selected day", () => {
    render(
      <Calendar
        mode="single"
        month={JANUARY_2026}
        selected={new Date(2026, 0, 15)}
      />,
    );

    const cell = screen
      .getByRole("button", {
        name: /January 15th, 2026/,
      })
      .closest("[role='gridcell']");

    // v9 emits rdp-selected; the configured bg-primary never applies.
    expect(cell).toHaveClass("rdp-selected");
    expect(cell).not.toHaveClass("bg-primary");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * head_cell is a v8 key, so the weekday headers must NOT carry the
   * configured muted styling either.
   */
  it("does not apply the head_cell classes to the weekday headers", () => {
    const { container } = render(
      <Calendar mode="single" month={JANUARY_2026} />,
    );

    const weekday = container.querySelector(
      ".rdp-weekday",
    );

    expect(weekday).toBeInTheDocument();
    expect(weekday).not.toHaveClass(
      "text-muted-foreground",
    );
  });
});
