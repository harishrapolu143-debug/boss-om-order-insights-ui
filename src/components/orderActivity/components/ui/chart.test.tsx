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
  it("sets the correct data-slot attribute", () => {
    const { container } = renderContainer();

    expect(container.querySelector("[data-slot='chart']")).toBeInTheDocument();
  });

  it("applies the default classes", () => {
    const { container } = renderContainer();

    const chart = container.querySelector("[data-slot='chart']");

    expect(chart).toHaveClass("flex");
    expect(chart).toHaveClass("aspect-video");
    expect(chart).toHaveClass("justify-center");
  });

  it("merges a custom className with the defaults", () => {
    const { container } = renderContainer({ className: "h-64" });

    const chart = container.querySelector("[data-slot='chart']");

    expect(chart).toHaveClass("h-64");
    expect(chart).toHaveClass("aspect-video");
  });

  it("generates a data-chart id when none is given", () => {
    const { container } = renderContainer();

    const id = container
      .querySelector("[data-slot='chart']")
      ?.getAttribute("data-chart");

    expect(id).toMatch(/^chart-/);
  });

  it("uses an explicit id when given", () => {
    const { container } = renderContainer({ id: "orders" });

    expect(container.querySelector("[data-slot='chart']")).toHaveAttribute(
      "data-chart",
      "chart-orders",
    );
  });

  it("renders its children", () => {
    renderContainer();

    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });
});

describe("ChartStyle", () => {
  it("emits a CSS variable per configured colour", () => {
    const { container } = renderContainer({ id: "orders" });

    const css = container.querySelector("style")?.innerHTML ?? "";

    expect(css).toContain("--color-active: #2563eb");
    expect(css).toContain("--color-pending: #f59e0b");
    expect(css).toContain("[data-chart=chart-orders]");
  });

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

  it("renders nothing when no series defines a colour", () => {
    const { container } = render(
      <ChartStyle id="chart-plain" config={{ active: { label: "Active" } }} />,
    );

    expect(container.querySelector("style")).toBeNull();
  });

  it("renders nothing for an empty config", () => {
    const { container } = render(<ChartStyle id="chart-empty" config={{}} />);

    expect(container.querySelector("style")).toBeNull();
  });
});

describe("ChartTooltipContent", () => {
  it("renders nothing while inactive", () => {
    const { container } = renderInChart(
      <ChartTooltipContent payload={TOOLTIP_PAYLOAD} />,
    );

    expect(container.querySelector(".shadow-xl")).toBeNull();
  });

  it("renders nothing when the payload is empty", () => {
    const { container } = renderInChart(
      <ChartTooltipContent active payload={[]} />,
    );

    expect(container.querySelector(".shadow-xl")).toBeNull();
  });

  it("renders the series label and value when active", () => {
    renderInChart(
      <ChartTooltipContent active payload={TOOLTIP_PAYLOAD} label="Jan" />,
    );

    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("1,200")).toBeInTheDocument();
  });

  it("formats the value with locale separators", () => {
    renderInChart(
      <ChartTooltipContent active payload={TOOLTIP_PAYLOAD} label="Jan" />,
    );

    expect(screen.getByText("1,200")).toBeInTheDocument();
  });

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

  it("renders a dot indicator by default", () => {
    const { container } = renderInChart(
      <ChartTooltipContent active payload={TOOLTIP_PAYLOAD} label="Jan" />,
    );

    expect(container.querySelector(".h-2\\.5.w-2\\.5")).toBeInTheDocument();
  });

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

  it("falls back to the payload name when the config has no label", () => {
    renderInChart(
      <ChartTooltipContent active payload={TOOLTIP_PAYLOAD} label="Jan" />,
      { other: { color: "#000" } },
    );

    expect(screen.getByText("active")).toBeInTheDocument();
  });

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

  it("renders nothing without a payload", () => {
    const { container } = renderInChart(<ChartLegendContent payload={[]} />);

    // pt-3 is unique to the legend wrapper; ChartContainer itself also carries
    // justify-center, so that class cannot distinguish the two.
    expect(container.querySelector(".pt-3")).toBeNull();
    expect(container.querySelectorAll(".h-2.w-2")).toHaveLength(0);
  });

  it("renders a labelled entry per series", () => {
    renderInChart(<ChartLegendContent payload={legendPayload} />);

    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("renders a colour swatch per series", () => {
    const { container } = renderInChart(
      <ChartLegendContent payload={legendPayload} />,
    );

    expect(container.querySelectorAll(".h-2.w-2")).toHaveLength(2);
  });

  it("pads the bottom by default", () => {
    const { container } = renderInChart(
      <ChartLegendContent payload={legendPayload} />,
    );

    expect(container.querySelector(".pt-3")).toBeInTheDocument();
  });

  it("pads the top when aligned to the top", () => {
    const { container } = renderInChart(
      <ChartLegendContent payload={legendPayload} verticalAlign="top" />,
    );

    expect(container.querySelector(".pb-3")).toBeInTheDocument();
  });

  it("merges a custom className with the defaults", () => {
    const { container } = renderInChart(
      <ChartLegendContent payload={legendPayload} className="gap-8" />,
    );

    const legend = container.querySelector(".gap-8");

    expect(legend).toBeInTheDocument();
    expect(legend).toHaveClass("items-center");
  });

  it("throws when used outside a ChartContainer", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() =>
      render(<ChartLegendContent payload={legendPayload} />),
    ).toThrow("useChart must be used within a <ChartContainer />");

    spy.mockRestore();
  });
});
