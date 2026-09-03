import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";

type TabsOverrides = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

function renderTabs(props: TabsOverrides = { defaultValue: "summary" }) {
  return render(
    <Tabs {...props}>
      <TabsList>
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
      </TabsList>
      <TabsContent value="summary">Summary panel</TabsContent>
      <TabsContent value="timeline">Timeline panel</TabsContent>
    </Tabs>,
  );
}

describe("Tabs", () => {
  it("sets the correct data-slot attribute", () => {
    const { container } = renderTabs();

    expect(container.querySelector("[data-slot='tabs']")).toBeInTheDocument();
  });

  it("applies the default classes", () => {
    const { container } = renderTabs();

    const root = container.querySelector("[data-slot='tabs']");

    expect(root).toHaveClass("flex");
    expect(root).toHaveClass("flex-col");
  });

  it("merges a custom className with the defaults", () => {
    const { container } = render(
      <Tabs defaultValue="summary" className="w-full">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>
        <TabsContent value="summary">Summary panel</TabsContent>
      </Tabs>,
    );

    const root = container.querySelector("[data-slot='tabs']");

    expect(root).toHaveClass("w-full");
    expect(root).toHaveClass("flex-col");
  });
});

describe("TabsList", () => {
  it("renders with the tablist role and data-slot", () => {
    renderTabs();

    const list = screen.getByRole("tablist");

    expect(list).toBeInTheDocument();
    expect(list).toHaveAttribute("data-slot", "tabs-list");
  });

  it("applies the default classes", () => {
    renderTabs();

    expect(screen.getByRole("tablist")).toHaveClass("bg-muted");
    expect(screen.getByRole("tablist")).toHaveClass("rounded-xl");
  });
});

describe("TabsTrigger", () => {
  it("renders each trigger as a tab", () => {
    renderTabs();

    expect(screen.getAllByRole("tab")).toHaveLength(2);
  });

  it("sets the correct data-slot attribute", () => {
    renderTabs();

    expect(screen.getByRole("tab", { name: "Summary" })).toHaveAttribute(
      "data-slot",
      "tabs-trigger",
    );
  });

  it("marks the defaultValue tab as selected", () => {
    renderTabs();

    expect(screen.getByRole("tab", { name: "Summary" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: "Timeline" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it("merges a custom className with the defaults", () => {
    render(
      <Tabs defaultValue="summary">
        <TabsList>
          <TabsTrigger value="summary" className="uppercase">
            Summary
          </TabsTrigger>
        </TabsList>
        <TabsContent value="summary">Summary panel</TabsContent>
      </Tabs>,
    );

    const trigger = screen.getByRole("tab", { name: "Summary" });

    expect(trigger).toHaveClass("uppercase");
    expect(trigger).toHaveClass("rounded-xl");
  });

  it("does not activate a disabled trigger", async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="summary">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="timeline" disabled>
            Timeline
          </TabsTrigger>
        </TabsList>
        <TabsContent value="summary">Summary panel</TabsContent>
        <TabsContent value="timeline">Timeline panel</TabsContent>
      </Tabs>,
    );

    await user.click(screen.getByRole("tab", { name: "Timeline" }));

    expect(screen.getByText("Summary panel")).toBeInTheDocument();
    expect(screen.queryByText("Timeline panel")).not.toBeInTheDocument();
  });
});

describe("TabsContent", () => {
  it("renders only the active panel", () => {
    renderTabs();

    expect(screen.getByText("Summary panel")).toBeInTheDocument();
    expect(screen.queryByText("Timeline panel")).not.toBeInTheDocument();
  });

  it("sets the correct data-slot attribute", () => {
    renderTabs();

    expect(screen.getByRole("tabpanel")).toHaveAttribute(
      "data-slot",
      "tabs-content",
    );
  });

  it("links the panel back to its trigger", () => {
    renderTabs();

    const trigger = screen.getByRole("tab", { name: "Summary" });
    const panel = screen.getByRole("tabpanel");

    expect(trigger).toHaveAttribute("aria-controls", panel.id);
  });
});

describe("Tabs interactions", () => {
  it("switches panels when another tab is clicked", async () => {
    const user = userEvent.setup();
    renderTabs();

    await user.click(screen.getByRole("tab", { name: "Timeline" }));

    expect(screen.getByText("Timeline panel")).toBeInTheDocument();
    expect(screen.queryByText("Summary panel")).not.toBeInTheDocument();
  });

  it("calls onValueChange with the newly selected value", async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    renderTabs({ defaultValue: "summary", onValueChange });

    await user.click(screen.getByRole("tab", { name: "Timeline" }));

    expect(onValueChange).toHaveBeenCalledWith("timeline");
  });

  it("honours a controlled value prop", async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    renderTabs({ value: "summary", onValueChange });

    await user.click(screen.getByRole("tab", { name: "Timeline" }));

    expect(onValueChange).toHaveBeenCalledWith("timeline");
    expect(screen.getByText("Summary panel")).toBeInTheDocument();
  });

  it("moves between tabs with the arrow keys", async () => {
    const user = userEvent.setup();
    renderTabs();

    await user.tab();
    expect(screen.getByRole("tab", { name: "Summary" })).toHaveFocus();

    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("tab", { name: "Timeline" })).toHaveFocus();
    expect(screen.getByText("Timeline panel")).toBeInTheDocument();
  });
});
