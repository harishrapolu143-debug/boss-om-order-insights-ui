import { render, screen } from "@testing-library/react";
import { Bar, BarChart } from "recharts";
import "@testing-library/jest-dom";

import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
  ChartStyle,
  type ChartConfig,
} from "./chart";

// Recharts' ResponsiveContainer measures its parent and renders nothing at
// 0x0, which is all jsdom ever reports. Passing children straight through lets
// the tooltip and legend mount inside the real ChartContainer context.
jest.mock("recharts", () => {
  const actual = jest.requireActual("recharts");

  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
  };
});

const CONFIG: ChartConfig = {
  active: { label: "Active", color: "#2563eb" },
  pending: { label: "Pending", color: "#f59e0b" },
};

const DATA = [
  { month: "Jan", active: 12, pending: 4 },
  { month: "Feb", active: 18, pending: 6 },
];

const TOOLTIP_PAYLOAD = [
  {
    dataKey: "active",
    name: "active",
    value: 1200,
    color: "#2563eb",
    payload: { month: "Jan", active: 1200, fill: "#2563eb" },
  },
];

function renderContainer(
  props: { id?: string; className?: string; config?: ChartConfig } = {},
) {
  const { config = CONFIG, ...rest } = props;

  return render(
    <ChartContainer config={config} {...rest}>
      <BarChart data={DATA}>
        <Bar dataKey="active" fill="var(--color-active)" />
      </BarChart>
    </ChartContainer>,
  );
}

/** Mounts arbitrary nodes inside a real ChartContainer, so useChart resolves. */
function renderInChart(node: React.ReactNode, config: ChartConfig = CONFIG) {
  return render(
    <ChartContainer config={config}>
      <div>{node}</div>
    </ChartContainer>,
  );
}

describe("ChartContainer", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * sets the correct data-slot attribute.
   */
  it("sets the correct data-slot attribute", () => {
    const { container } = renderContainer();

    expect(container.querySelector("[data-slot='chart']")).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * applies the default classes.
   */
  it("applies the default classes", () => {
    const { container } = renderContainer();

    const chart = container.querySelector("[data-slot='chart']");

    expect(chart).toHaveClass("flex");
    expect(chart).toHaveClass("aspect-video");
    expect(chart).toHaveClass("justify-center");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * merges a custom className with the defaults.
   */
  it("merges a custom className with the defaults", () => {
    const { container } = renderContainer({ className: "h-64" });

    const chart = container.querySelector("[data-slot='chart']");

    expect(chart).toHaveClass("h-64");
    expect(chart).toHaveClass("aspect-video");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * generates a data-chart id when none is given.
   */
  it("generates a data-chart id when none is given", () => {
    const { container } = renderContainer();

    const id = container
      .querySelector("[data-slot='chart']")
      ?.getAttribute("data-chart");

    expect(id).toMatch(/^chart-/);
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * uses an explicit id when given.
   */
  it("uses an explicit id when given", () => {
    const { container } = renderContainer({ id: "orders" });

    expect(container.querySelector("[data-slot='chart']")).toHaveAttribute(
      "data-chart",
      "chart-orders",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * renders its children.
   */
  it("renders its children", () => {
    renderContainer();

    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });
});

describe("ChartStyle", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * emits a CSS variable per configured colour.
   */
  it("emits a CSS variable per configured colour", () => {
    const { container } = renderContainer({ id: "orders" });

    const css = container.querySelector("style")?.innerHTML ?? "";

    expect(css).toContain("--color-active: #2563eb");
    expect(css).toContain("--color-pending: #f59e0b");
    expect(css).toContain("[data-chart=chart-orders]");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * emits both light and dark selectors for themed colours.
   */
  it("emits both light and dark selectors for themed colours", () => {
    const { container } = render(
      <ChartStyle
        id="chart-themed"
        config={{
          active: { label: "Active", theme: { light: "#111", dark: "#eee" } },
        }}
      />,
    );

    const css = container.querySelector("style")?.innerHTML ?? "";

    expect(css).toContain("--color-active: #111");
    expect(css).toContain("--color-active: #eee");
    expect(css).toContain(".dark [data-chart=chart-themed]");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * renders nothing when no series defines a colour.
   */
  it("renders nothing when no series defines a colour", () => {
    const { container } = render(
      <ChartStyle id="chart-plain" config={{ active: { label: "Active" } }} />,
    );

    expect(container.querySelector("style")).toBeNull();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * renders nothing for an empty config.
   */
  it("renders nothing for an empty config", () => {
    const { container } = render(<ChartStyle id="chart-empty" config={{}} />);

    expect(container.querySelector("style")).toBeNull();
  });
});

describe("ChartTooltipContent", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * renders nothing while inactive.
   */
  it("renders nothing while inactive", () => {
    const { container } = renderInChart(
      <ChartTooltipContent payload={TOOLTIP_PAYLOAD} />,
    );

    expect(container.querySelector(".shadow-xl")).toBeNull();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * renders nothing when the payload is empty.
   */
  it("renders nothing when the payload is empty", () => {
    const { container } = renderInChart(
      <ChartTooltipContent active payload={[]} />,
    );

    expect(container.querySelector(".shadow-xl")).toBeNull();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * renders the series label and value when active.
   */
  it("renders the series label and value when active", () => {
    renderInChart(
      <ChartTooltipContent active payload={TOOLTIP_PAYLOAD} label="Jan" />,
    );

    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("1,200")).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * formats the value with locale separators.
   */
  it("formats the value with locale separators", () => {
    renderInChart(
      <ChartTooltipContent active payload={TOOLTIP_PAYLOAD} label="Jan" />,
    );

    expect(screen.getByText("1,200")).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * hides the label when hideLabel is set.
   */
  it("hides the label when hideLabel is set", () => {
    renderInChart(
      <ChartTooltipContent
        active
        payload={TOOLTIP_PAYLOAD}
        label="Jan"
        hideLabel
      />,
    );

    expect(screen.queryByText("Jan")).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * renders a dot indicator by default.
   */
  it("renders a dot indicator by default", () => {
    const { container } = renderInChart(
      <ChartTooltipContent active payload={TOOLTIP_PAYLOAD} label="Jan" />,
    );

    expect(container.querySelector(".h-2\\.5.w-2\\.5")).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * omits the indicator when hideIndicator is set.
   */
  it("omits the indicator when hideIndicator is set", () => {
    const { container } = renderInChart(
      <ChartTooltipContent
        active
        payload={TOOLTIP_PAYLOAD}
        label="Jan"
        hideIndicator
      />,
    );

    expect(container.querySelector(".h-2\\.5.w-2\\.5")).toBeNull();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * renders a dashed indicator when asked.
   */
  it("renders a dashed indicator when asked", () => {
    const { container } = renderInChart(
      <ChartTooltipContent
        active
        payload={TOOLTIP_PAYLOAD}
        label="Jan"
        indicator="dashed"
      />,
    );

    expect(container.querySelector(".border-dashed")).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * uses a custom labelFormatter.
   */
  it("uses a custom labelFormatter", () => {
    renderInChart(
      <ChartTooltipContent
        active
        payload={TOOLTIP_PAYLOAD}
        label="active"
        labelFormatter={(value) => `Month: ${String(value)}`}
      />,
    );

    expect(screen.getByText("Month: Active")).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * uses a custom formatter for each row.
   */
  it("uses a custom formatter for each row", () => {
    renderInChart(
      <ChartTooltipContent
        active
        payload={TOOLTIP_PAYLOAD}
        label="Jan"
        formatter={(value, name) => `${name}=${String(value)}`}
      />,
    );

    expect(screen.getByText("active=1200")).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * merges a custom className with the defaults.
   */
  it("merges a custom className with the defaults", () => {
    const { container } = renderInChart(
      <ChartTooltipContent
        active
        payload={TOOLTIP_PAYLOAD}
        label="Jan"
        className="w-40"
      />,
    );

    const tooltip = container.querySelector(".shadow-xl");

    expect(tooltip).toHaveClass("w-40");
    expect(tooltip).toHaveClass("rounded-lg");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * falls back to the payload name when the config has no label.
   */
  it("falls back to the payload name when the config has no label", () => {
    renderInChart(
      <ChartTooltipContent active payload={TOOLTIP_PAYLOAD} label="Jan" />,
      { other: { color: "#000" } },
    );

    expect(screen.getByText("active")).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * throws when used outside a ChartContainer.
   */
  it("throws when used outside a ChartContainer", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() =>
      render(<ChartTooltipContent active payload={TOOLTIP_PAYLOAD} />),
    ).toThrow("useChart must be used within a <ChartContainer />");

    spy.mockRestore();
  });
});

describe("ChartLegendContent", () => {
  const legendPayload = [
    { value: "active", dataKey: "active", color: "#2563eb" },
    { value: "pending", dataKey: "pending", color: "#f59e0b" },
  ];

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * renders nothing without a payload.
   */
  it("renders nothing without a payload", () => {
    const { container } = renderInChart(<ChartLegendContent payload={[]} />);

    // pt-3 is unique to the legend wrapper; ChartContainer itself also carries
    // justify-center, so that class cannot distinguish the two.
    expect(container.querySelector(".pt-3")).toBeNull();
    expect(container.querySelectorAll(".h-2.w-2")).toHaveLength(0);
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * renders a labelled entry per series.
   */
  it("renders a labelled entry per series", () => {
    renderInChart(<ChartLegendContent payload={legendPayload} />);

    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * renders a colour swatch per series.
   */
  it("renders a colour swatch per series", () => {
    const { container } = renderInChart(
      <ChartLegendContent payload={legendPayload} />,
    );

    expect(container.querySelectorAll(".h-2.w-2")).toHaveLength(2);
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * pads the bottom by default.
   */
  it("pads the bottom by default", () => {
    const { container } = renderInChart(
      <ChartLegendContent payload={legendPayload} />,
    );

    expect(container.querySelector(".pt-3")).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * pads the top when aligned to the top.
   */
  it("pads the top when aligned to the top", () => {
    const { container } = renderInChart(
      <ChartLegendContent payload={legendPayload} verticalAlign="top" />,
    );

    expect(container.querySelector(".pb-3")).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * merges a custom className with the defaults.
   */
  it("merges a custom className with the defaults", () => {
    const { container } = renderInChart(
      <ChartLegendContent payload={legendPayload} className="gap-8" />,
    );

    const legend = container.querySelector(".gap-8");

    expect(legend).toBeInTheDocument();
    expect(legend).toHaveClass("items-center");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * throws when used outside a ChartContainer.
   */
  it("throws when used outside a ChartContainer", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() =>
      render(<ChartLegendContent payload={legendPayload} />),
    ).toThrow("useChart must be used within a <ChartContainer />");

    spy.mockRestore();
  });
});

/**
 * ============================================================================
 * Chart - additional negative scenarios
 * ============================================================================
 */
describe("Chart negative scenarios", () => {
  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Two charts on the same page must NOT share a generated id, or their
   * colour variables would collide.
   */
  it("does not reuse the same generated id across charts", () => {
    const first = renderContainer();
    const second = renderContainer();

    const firstId = first.container
      .querySelector("[data-chart]")
      ?.getAttribute("data-chart");

    const secondId = second.container
      .querySelector("[data-chart]")
      ?.getAttribute("data-chart");

    expect(firstId).toBeTruthy();
    expect(firstId).not.toBe(secondId);
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A series that is not in the config must NOT invent a colour variable.
   */
  it("does not emit a variable for an unconfigured series", () => {
    const { container } = renderContainer();

    const style = container.querySelector("style");

    expect(style?.innerHTML).not.toContain(
      "--color-cancelled",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The tooltip must NOT be rendered before the user hovers a point.
   */
  it("does not render tooltip content while inactive", () => {
    renderInChart(
      <ChartTooltipContent
        active={false}
        payload={TOOLTIP_PAYLOAD}
      />,
    );

    expect(
      screen.queryByText("Active"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The legend must not render a swatch for a series it was not given.
   */
  it("does not render a swatch for a series that is not in the payload", () => {
    const { container } = renderInChart(
      <ChartLegendContent
        payload={[
          {
            value: "active",
            dataKey: "active",
            color: "#2563eb",
          },
        ]}
      />,
    );

    expect(
      container.querySelectorAll(".h-2.w-2"),
    ).toHaveLength(1);

    expect(
      screen.queryByText("Pending"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The chart container is a layout wrapper - it must not be interactive
   * or announced with a role of its own.
   */
  it("does not render the container as an interactive element", () => {
    const { container } = renderContainer();

    const chart = container.querySelector(
      "[data-slot='chart']",
    ) as HTMLElement;

    expect(chart).not.toHaveAttribute("role");
    expect(chart).not.toHaveAttribute("tabindex");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * An explicit id must NOT be replaced by a generated one.
   */
  it("does not override an explicit id with a generated one", () => {
    const { container } = renderContainer({
      id: "orders-chart",
    });

    expect(
      container
        .querySelector("[data-chart]")
        ?.getAttribute("data-chart"),
    ).toBe("chart-orders-chart");
  });
});
