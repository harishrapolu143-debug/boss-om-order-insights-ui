import * as React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "./table";

function renderTable() {
  return render(
    <Table>
      <TableCaption>Recent orders</TableCaption>

      <TableHeader>
        <TableRow>
          <TableHead>Order</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        <TableRow>
          <TableCell>SO-1024</TableCell>
          <TableCell>Shipped</TableCell>
        </TableRow>

        <TableRow data-state="selected">
          <TableCell>SO-1025</TableCell>
          <TableCell>Pending</TableCell>
        </TableRow>
      </TableBody>

      <TableFooter>
        <TableRow>
          <TableCell>Total</TableCell>
          <TableCell>2 orders</TableCell>
        </TableRow>
      </TableFooter>
    </Table>,
  );
}

/**
 * ============================================================================
 * Table
 * ============================================================================
 */
describe("Table", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Every table part should render with its own data-slot attribute.
   */
  it("sets the correct data-slot attributes for every part", () => {
    const { container } = renderTable();

    [
      "table-container",
      "table",
      "table-caption",
      "table-header",
      "table-body",
      "table-footer",
      "table-row",
      "table-head",
      "table-cell",
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
   * The table should be exposed with the table role.
   */
  it("renders with the table role", () => {
    renderTable();

    expect(
      screen.getByRole("table"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Column headers should be exposed as column headers.
   */
  it("exposes the column headers", () => {
    renderTable();

    expect(
      screen.getByRole("columnheader", {
        name: "Order",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", {
        name: "Status",
      }),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Data cells should be exposed as cells.
   */
  it("exposes the data cells", () => {
    renderTable();

    expect(
      screen.getByRole("cell", {
        name: "SO-1024",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "Shipped",
      }),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Every row should be exposed as a row.
   */
  it("renders one row per record plus the header and footer rows", () => {
    renderTable();

    expect(screen.getAllByRole("row")).toHaveLength(
      4,
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The table should be wrapped in a horizontally scrollable container.
   */
  it("wraps the table in a scrollable container", () => {
    const { container } = renderTable();

    const wrapper = container.querySelector(
      "[data-slot='table-container']",
    ) as HTMLElement;

    expect(wrapper).toHaveClass("overflow-x-auto");
    expect(wrapper).toHaveClass("w-full");

    expect(
      wrapper.querySelector("[data-slot='table']"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A selected row should be marked so it can be styled.
   */
  it("marks a selected row", () => {
    renderTable();

    const selectedRow = screen
      .getByRole("cell", { name: "SO-1025" })
      .closest("tr");

    expect(selectedRow).toHaveAttribute(
      "data-state",
      "selected",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The caption should describe the table.
   */
  it("renders the caption", () => {
    const { container } = renderTable();

    const caption = container.querySelector(
      "[data-slot='table-caption']",
    ) as HTMLElement;

    expect(caption.tagName).toBe("CAPTION");
    expect(caption).toHaveTextContent(
      "Recent orders",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Every part should merge a custom className with its defaults.
   */
  it("merges a custom className on every part", () => {
    const { container } = render(
      <Table className="custom-table">
        <TableHeader className="custom-header">
          <TableRow className="custom-row">
            <TableHead className="custom-head">
              Order
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="custom-body">
          <TableRow>
            <TableCell className="custom-cell">
              SO-1024
            </TableCell>
          </TableRow>
        </TableBody>
        <TableFooter className="custom-footer">
          <TableRow>
            <TableCell>Total</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    );

    expect(
      container.querySelector("[data-slot='table']"),
    ).toHaveClass("custom-table", "w-full");

    expect(
      container.querySelector(
        "[data-slot='table-header']",
      ),
    ).toHaveClass("custom-header");

    expect(
      container.querySelector(
        "[data-slot='table-body']",
      ),
    ).toHaveClass("custom-body");

    expect(
      container.querySelector(
        "[data-slot='table-footer']",
      ),
    ).toHaveClass("custom-footer", "border-t");

    expect(
      container.querySelector(
        "[data-slot='table-head']",
      ),
    ).toHaveClass("custom-head", "text-left");

    expect(
      container.querySelector(
        "[data-slot='table-cell']",
      ),
    ).toHaveClass("custom-cell", "align-middle");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A header cell must NOT be reported as a plain data cell, or screen
   * readers lose the column association.
   */
  it("does not expose header cells as data cells", () => {
    renderTable();

    expect(
      screen.queryByRole("cell", { name: "Order" }),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A data cell must NOT be reported as a column header.
   */
  it("does not expose data cells as column headers", () => {
    renderTable();

    expect(
      screen.queryByRole("columnheader", {
        name: "SO-1024",
      }),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Table parts are optional - omitting them must not render empty
   * placeholders.
   */
  it("does not render parts that were not supplied", () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>SO-1024</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    [
      "table-caption",
      "table-header",
      "table-footer",
      "table-head",
    ].forEach((slot) => {
      expect(
        container.querySelector(
          `[data-slot='${slot}']`,
        ),
      ).not.toBeInTheDocument();
    });
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * An empty table body must not invent placeholder rows.
   */
  it("does not render rows for an empty body", () => {
    render(
      <Table>
        <TableBody />
      </Table>,
    );

    expect(
      screen.queryAllByRole("row"),
    ).toHaveLength(0);
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * An unselected row must not carry the selected state.
   */
  it("does not mark an unselected row as selected", () => {
    renderTable();

    const row = screen
      .getByRole("cell", { name: "SO-1024" })
      .closest("tr");

    expect(row).not.toHaveAttribute(
      "data-state",
      "selected",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Cell content must not wrap onto extra lines, which is what the
   * whitespace-nowrap class guarantees.
   */
  it("does not allow cell content to wrap", () => {
    const { container } = renderTable();

    expect(
      container.querySelector(
        "[data-slot='table-cell']",
      ),
    ).toHaveClass("whitespace-nowrap");

    expect(
      container.querySelector(
        "[data-slot='table-head']",
      ),
    ).toHaveClass("whitespace-nowrap");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The scroll container must not scroll vertically - only the horizontal
   * axis is meant to overflow.
   */
  it("does not make the container scroll vertically", () => {
    const { container } = renderTable();

    const wrapper = container.querySelector(
      "[data-slot='table-container']",
    );

    expect(wrapper).not.toHaveClass("overflow-y-auto");
    expect(wrapper).not.toHaveClass("overflow-auto");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A custom className on the table must not leak onto the scroll
   * container.
   */
  it("does not apply the table className to the scroll container", () => {
    const { container } = render(
      <Table className="custom-table">
        <TableBody>
          <TableRow>
            <TableCell>SO-1024</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    expect(
      container.querySelector(
        "[data-slot='table-container']",
      ),
    ).not.toHaveClass("custom-table");

    expect(
      container.querySelector("[data-slot='table']"),
    ).toHaveClass("custom-table");
  });
});
