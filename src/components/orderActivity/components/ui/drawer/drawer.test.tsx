import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "./drawer";

type DrawerOverrides = {
  open?: boolean;
  defaultOpen?: boolean;
  direction?: "top" | "right" | "bottom" | "left";
  onOpenChange?: (open: boolean) => void;
};

function renderDrawer(props: DrawerOverrides = {}) {
  return render(
    <Drawer {...props}>
      <DrawerTrigger>Open filters</DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerDescription>
            Narrow the order list
          </DrawerDescription>
        </DrawerHeader>

        <div>Filter body</div>

        <DrawerFooter>
          <DrawerClose>Dismiss</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>,
  );
}

/**
 * ============================================================================
 * Drawer
 * ============================================================================
 */
describe("Drawer", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The trigger should render with the expected data-slot attribute.
   */
  it("sets the correct data-slot attribute on the trigger", () => {
    renderDrawer();

    expect(
      screen.getByRole("button", {
        name: "Open filters",
      }),
    ).toHaveAttribute("data-slot", "drawer-trigger");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Clicking the trigger should open the drawer.
   */
  it("opens when the trigger is clicked", async () => {
    const user = userEvent.setup();

    renderDrawer();

    await user.click(
      screen.getByRole("button", {
        name: "Open filters",
      }),
    );

    expect(
      await screen.findByRole("dialog"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * defaultOpen should render the drawer straight away.
   */
  it("respects defaultOpen", () => {
    renderDrawer({ defaultOpen: true });

    expect(
      screen.getByRole("dialog"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Every drawer part should render with its own data-slot attribute.
   */
  it("sets the correct data-slot attributes on the open drawer", () => {
    renderDrawer({ defaultOpen: true });

    const drawer = screen.getByRole("dialog");

    expect(drawer).toHaveAttribute(
      "data-slot",
      "drawer-content",
    );

    [
      "drawer-header",
      "drawer-title",
      "drawer-description",
      "drawer-footer",
    ].forEach((slot) => {
      expect(
        drawer.querySelector(
          `[data-slot='${slot}']`,
        ),
      ).toBeInTheDocument();
    });
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The drawer content should be rendered.
   */
  it("renders its title, description and content", () => {
    renderDrawer({ defaultOpen: true });

    expect(
      screen.getByText("Filters"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Narrow the order list"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Filter body"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The drawer should slide up from the bottom by default.
   */
  it("opens from the bottom by default", () => {
    renderDrawer({ defaultOpen: true });

    expect(
      screen.getByRole("dialog"),
    ).toHaveAttribute("data-vaul-drawer-direction", "bottom");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * An explicit direction should change where the drawer is anchored.
   */
  it("opens from the requested direction", () => {
    renderDrawer({
      defaultOpen: true,
      direction: "right",
    });

    expect(
      screen.getByRole("dialog"),
    ).toHaveAttribute("data-vaul-drawer-direction", "right");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Escape should dismiss the drawer.
   *
   * Vaul's drag handling reads real layout, which jsdom does not provide,
   * so the drawer is driven by keyboard here rather than by pointer.
   */
  it("closes when Escape is pressed", async () => {
    const user = userEvent.setup();

    renderDrawer({ defaultOpen: true });

    await user.keyboard("{Escape}");

    await waitFor(() =>
      expect(
        screen.getByRole("dialog", { hidden: true }),
      ).toHaveAttribute("data-state", "closed"),
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * onOpenChange should report the new state.
   */
  it("calls onOpenChange when the drawer opens", async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();

    renderDrawer({ onOpenChange });

    await user.click(
      screen.getByRole("button", {
        name: "Open filters",
      }),
    );

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The title and description should name and describe the drawer.
   */
  it("labels the drawer with its title and description", () => {
    renderDrawer({ defaultOpen: true });

    const drawer = screen.getByRole("dialog");

    expect(drawer).toHaveAttribute(
      "aria-labelledby",
      screen.getByText("Filters").id,
    );

    expect(drawer).toHaveAttribute(
      "aria-describedby",
      screen.getByText("Narrow the order list").id,
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The drawer must NOT be in the DOM until it is opened.
   */
  it("does not render the drawer while closed", () => {
    renderDrawer();

    expect(
      screen.queryByRole("dialog"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Filter body"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A closed drawer must NOT still present itself as open.
   *
   * Vaul keeps the node mounted while its exit animation runs, so the
   * contract here is the state flag rather than removal from the DOM.
   */
  it("does not report itself as open after closing", async () => {
    const user = userEvent.setup();

    renderDrawer({ defaultOpen: true });

    await user.keyboard("{Escape}");

    await waitFor(() =>
      expect(
        screen.getByRole("dialog", { hidden: true }),
      ).not.toHaveAttribute("data-state", "open"),
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A drawer anchored to one edge must NOT report another direction.
   */
  it("does not report another direction", () => {
    renderDrawer({
      defaultOpen: true,
      direction: "right",
    });

    expect(
      screen.getByRole("dialog"),
    ).not.toHaveAttribute(
      "data-vaul-drawer-direction",
      "bottom",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Keys that are not Escape must not dismiss the drawer.
   */
  it("does not close when a non-dismiss key is pressed", async () => {
    const user = userEvent.setup();

    renderDrawer({ defaultOpen: true });

    await user.keyboard("a");
    await user.keyboard("{ArrowDown}");

    expect(
      screen.getByRole("dialog"),
    ).toHaveAttribute("data-state", "open");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A controlled drawer must not open on its own.
   */
  it("does not open a controlled drawer without a handler", async () => {
    const user = userEvent.setup();

    renderDrawer({ open: false });

    await user.click(
      screen.getByRole("button", {
        name: "Open filters",
      }),
    );

    expect(
      screen.queryByRole("dialog"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * onOpenChange must not fire on the initial render.
   */
  it("does not call onOpenChange on initial render", () => {
    const onOpenChange = jest.fn();

    renderDrawer({
      defaultOpen: true,
      onOpenChange,
    });

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Only one drawer may be open at a time from a single root.
   */
  it("does not render more than one drawer at a time", () => {
    renderDrawer({ defaultOpen: true });

    expect(
      screen.getAllByRole("dialog"),
    ).toHaveLength(1);
  });
});
