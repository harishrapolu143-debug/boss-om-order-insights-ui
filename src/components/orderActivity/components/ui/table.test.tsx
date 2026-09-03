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

function renderFullTable() {
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
          <TableCell>KS1300400032</TableCell>
          <TableCell>Active</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>1 order</TableCell>
        </TableRow>
      </TableFooter>
    </Table>,
  );
}

describe("Table", () => {
  it("renders with the table role", () => {
    renderFullTable();

    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("sets the correct data-slot attribute", () => {
    renderFullTable();

    expect(screen.getByRole("table")).toHaveAttribute("data-slot", "table");
  });

  it("wraps the table in a horizontally scrollable container", () => {
    const { container } = renderFullTable();

    const wrapper = container.querySelector("[data-slot='table-container']");

    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass("overflow-x-auto");
    expect(wrapper).toContainElement(screen.getByRole("table"));
  });

  it("applies the default classes", () => {
    renderFullTable();

    expect(screen.getByRole("table")).toHaveClass("w-full");
    expect(screen.getByRole("table")).toHaveClass("text-sm");
  });

  it("merges a custom className with the defaults", () => {
    render(
      <Table className="min-w-[600px]">
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    expect(screen.getByRole("table")).toHaveClass("min-w-[600px]");
    expect(screen.getByRole("table")).toHaveClass("w-full");
  });
});

describe("Table sections", () => {
  it("sets a data-slot on each section", () => {
    const { container } = renderFullTable();

    expect(
      container.querySelector("[data-slot='table-header']"),
    ).toBeInTheDocument();
    expect(
      container.querySelector("[data-slot='table-body']"),
    ).toBeInTheDocument();
    expect(
      container.querySelector("[data-slot='table-footer']"),
    ).toBeInTheDocument();
    expect(
      container.querySelector("[data-slot='table-caption']"),
    ).toBeInTheDocument();
  });

  it("renders the caption text", () => {
    renderFullTable();

    expect(screen.getByText("Recent orders")).toBeInTheDocument();
  });

  it("renders header cells as column headers", () => {
    renderFullTable();

    expect(screen.getAllByRole("columnheader")).toHaveLength(2);
    expect(
      screen.getByRole("columnheader", { name: "Order" }),
    ).toBeInTheDocument();
  });

  it("renders body cells", () => {
    renderFullTable();

    expect(screen.getByText("KS1300400032")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });
});

describe("TableRow", () => {
  it("sets the correct data-slot attribute", () => {
    const { container } = renderFullTable();

    expect(
      container.querySelectorAll("[data-slot='table-row']").length,
    ).toBeGreaterThan(0);
  });

  it("applies the default classes", () => {
    const { container } = renderFullTable();

    const row = container.querySelector("[data-slot='table-row']");

    expect(row).toHaveClass("border-b");
    expect(row).toHaveClass("transition-colors");
  });

  it("forwards a selected state", () => {
    render(
      <Table>
        <TableBody>
          <TableRow data-state="selected">
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    expect(screen.getByRole("row")).toHaveAttribute("data-state", "selected");
  });
});

describe("TableHead and TableCell", () => {
  it("set the correct data-slot attributes", () => {
    renderFullTable();

    expect(screen.getByRole("columnheader", { name: "Order" })).toHaveAttribute(
      "data-slot",
      "table-head",
    );
    expect(screen.getByText("KS1300400032")).toHaveAttribute(
      "data-slot",
      "table-cell",
    );
  });

  it("apply their default classes", () => {
    renderFullTable();

    expect(screen.getByRole("columnheader", { name: "Order" })).toHaveClass(
      "h-10",
    );
    expect(screen.getByText("KS1300400032")).toHaveClass("p-2");
  });

  it("merge a custom className with the defaults", () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell className="text-right">Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    expect(screen.getByText("Cell")).toHaveClass("text-right");
    expect(screen.getByText("Cell")).toHaveClass("p-2");
  });

  it("supports colSpan on a cell", () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell colSpan={3}>Spanning</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    expect(screen.getByText("Spanning")).toHaveAttribute("colspan", "3");
  });
});
