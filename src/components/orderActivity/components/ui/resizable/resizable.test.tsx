import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "./resizable";

function renderGroup(
  props: { direction?: "horizontal" | "vertical"; withHandle?: boolean } = {},
) {
  const { direction = "horizontal", withHandle } = props;

  return render(
    <ResizablePanelGroup direction={direction}>
      <ResizablePanel defaultSize={50}>Left panel</ResizablePanel>
      <ResizableHandle withHandle={withHandle} />
      <ResizablePanel defaultSize={50}>Right panel</ResizablePanel>
    </ResizablePanelGroup>,
  );
}

describe("ResizablePanelGroup", () => {
  it("sets the correct data-slot attribute", () => {
    const { container } = renderGroup();

    expect(
      container.querySelector("[data-slot='resizable-panel-group']"),
    ).toBeInTheDocument();
  });

  it("applies the default classes", () => {
    const { container } = renderGroup();

    const group = container.querySelector(
      "[data-slot='resizable-panel-group']",
    );

    expect(group).toHaveClass("flex");
    expect(group).toHaveClass("h-full");
    expect(group).toHaveClass("w-full");
  });

  it("records the horizontal direction", () => {
    const { container } = renderGroup();

    expect(
      container.querySelector("[data-slot='resizable-panel-group']"),
    ).toHaveAttribute("data-panel-group-direction", "horizontal");
  });

  it("records the vertical direction", () => {
    const { container } = renderGroup({ direction: "vertical" });

    expect(
      container.querySelector("[data-slot='resizable-panel-group']"),
    ).toHaveAttribute("data-panel-group-direction", "vertical");
  });

  it("merges a custom className with the defaults", () => {
    const { container } = render(
      <ResizablePanelGroup direction="horizontal" className="rounded-lg">
        <ResizablePanel>Only panel</ResizablePanel>
      </ResizablePanelGroup>,
    );

    const group = container.querySelector(
      "[data-slot='resizable-panel-group']",
    );

    expect(group).toHaveClass("rounded-lg");
    expect(group).toHaveClass("flex");
  });
});

describe("ResizablePanel", () => {
  it("renders each panel with the correct data-slot", () => {
    const { container } = renderGroup();

    expect(
      container.querySelectorAll("[data-slot='resizable-panel']"),
    ).toHaveLength(2);
  });

  it("renders panel content", () => {
    renderGroup();

    expect(screen.getByText("Left panel")).toBeInTheDocument();
    expect(screen.getByText("Right panel")).toBeInTheDocument();
  });

  it("reflects the requested default size", () => {
    const { container } = renderGroup();

    const panel = container.querySelector("[data-slot='resizable-panel']");

    expect(panel).toHaveAttribute("data-panel-size", "50.0");
  });
});

describe("ResizableHandle", () => {
  it("renders with the separator role and correct data-slot", () => {
    renderGroup();

    const handle = screen.getByRole("separator");

    expect(handle).toBeInTheDocument();
    expect(handle).toHaveAttribute("data-slot", "resizable-handle");
  });

  it("applies the default classes", () => {
    renderGroup();

    const handle = screen.getByRole("separator");

    expect(handle).toHaveClass("bg-border");
    expect(handle).toHaveClass("relative");
    expect(handle).toHaveClass("items-center");
  });

  it("renders no grip by default", () => {
    renderGroup();

    expect(screen.getByRole("separator").querySelector("svg")).toBeNull();
  });

  it("renders a grip icon when withHandle is set", () => {
    renderGroup({ withHandle: true });

    expect(
      screen.getByRole("separator").querySelector("svg"),
    ).toBeInTheDocument();
  });

  it("does not leak withHandle onto the DOM element", () => {
    renderGroup({ withHandle: true });

    expect(screen.getByRole("separator")).not.toHaveAttribute("withhandle");
  });

  it("merges a custom className with the defaults", () => {
    render(
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel>Left panel</ResizablePanel>
        <ResizableHandle className="bg-red-500" />
        <ResizablePanel>Right panel</ResizablePanel>
      </ResizablePanelGroup>,
    );

    const handle = screen.getByRole("separator");

    expect(handle).toHaveClass("bg-red-500");
    expect(handle).toHaveClass("relative");
  });

  it("is focusable for keyboard resizing", () => {
    renderGroup();

    expect(screen.getByRole("separator")).toHaveAttribute("tabindex", "0");
  });
});
