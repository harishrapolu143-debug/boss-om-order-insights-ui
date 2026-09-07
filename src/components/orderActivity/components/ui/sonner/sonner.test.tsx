import * as React from "react";
import {
  act,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { toast } from "sonner";
import "@testing-library/jest-dom";

import { Toaster } from "./sonner";

const mockUseTheme = jest.fn();

jest.mock("next-themes", () => ({
  useTheme: () => mockUseTheme(),
}));

/**
 * Sonner renders only an empty <section> live region until a toast exists; the
 * <ol data-sonner-toaster> that carries the theme, position and CSS custom
 * properties is mounted with the first toast. So anything asserting on those
 * has to raise a toast first.
 */
async function renderWithToast(
  ui: React.ReactElement,
  message = "Saved",
) {
  const result = render(ui);

  act(() => {
    toast(message);
  });

  await waitFor(() =>
    expect(
      result.baseElement.querySelector(
        "[data-sonner-toaster]",
      ),
    ).not.toBeNull(),
  );

  return {
    ...result,
    toaster: result.baseElement.querySelector(
      "[data-sonner-toaster]",
    ) as HTMLElement,
  };
}

/**
 * ============================================================================
 * Toaster
 * ============================================================================
 */
describe("Toaster", () => {
  beforeEach(() => {
    mockUseTheme.mockReturnValue({ theme: "light" });
  });

  afterEach(() => {
    act(() => {
      toast.dismiss();
    });
    jest.clearAllMocks();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The live region should exist up front so a later toast is announced.
   */
  it("renders the live region even with no toasts", () => {
    const { baseElement } = render(<Toaster />);

    expect(
      baseElement.querySelector(
        "section[aria-live='polite']",
      ),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A raised toast should be shown.
   */
  it("renders a raised toast", async () => {
    await renderWithToast(
      <Toaster />,
      "Order saved",
    );

    expect(
      screen.getByText("Order saved"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The theme from next-themes should reach sonner.
   */
  it("passes the theme from next-themes through to sonner", async () => {
    mockUseTheme.mockReturnValue({ theme: "dark" });

    const { toaster } = await renderWithToast(
      <Toaster />,
    );

    expect(toaster).toHaveAttribute(
      "data-sonner-theme",
      "dark",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * With no theme reported the component should fall back to the system
   * theme rather than failing.
   */
  it("falls back to the system theme when next-themes reports none", async () => {
    mockUseTheme.mockReturnValue({});

    const { toaster } = await renderWithToast(
      <Toaster />,
    );

    // "system" resolves against prefers-color-scheme, which is light in jsdom.
    expect(toaster).toHaveAttribute(
      "data-sonner-theme",
      "light",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * An explicit theme prop should win over the next-themes value.
   */
  it("lets an explicit theme prop override the next-themes value", async () => {
    mockUseTheme.mockReturnValue({ theme: "dark" });

    const { toaster } = await renderWithToast(
      <Toaster theme="light" />,
    );

    expect(toaster).toHaveAttribute(
      "data-sonner-theme",
      "light",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The group className should be applied so the toast styles resolve.
   */
  it("applies the toaster group className", async () => {
    const { toaster } = await renderWithToast(
      <Toaster />,
    );

    expect(toaster).toHaveClass("toaster");
    expect(toaster).toHaveClass("group");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The colour custom properties sonner reads should be set.
   */
  it("sets the CSS custom properties sonner reads for colours", async () => {
    const { toaster } = await renderWithToast(
      <Toaster />,
    );

    expect(
      toaster.style.getPropertyValue("--normal-bg"),
    ).toBe("var(--popover)");

    expect(
      toaster.style.getPropertyValue("--normal-text"),
    ).toBe("var(--popover-foreground)");

    expect(
      toaster.style.getPropertyValue(
        "--normal-border",
      ),
    ).toBe("var(--border)");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Arbitrary sonner props should be forwarded.
   */
  it("forwards arbitrary sonner props such as position", async () => {
    const { toaster } = await renderWithToast(
      <Toaster position="top-center" />,
    );

    expect(toaster).toHaveAttribute(
      "data-y-position",
      "top",
    );

    expect(toaster).toHaveAttribute(
      "data-x-position",
      "center",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The default position should be bottom right.
   */
  it("defaults to the bottom-right position", async () => {
    const { toaster } = await renderWithToast(
      <Toaster />,
    );

    expect(toaster).toHaveAttribute(
      "data-y-position",
      "bottom",
    );

    expect(toaster).toHaveAttribute(
      "data-x-position",
      "right",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The toast list must NOT be mounted until there is something to show,
   * so an idle page carries no toast markup.
   */
  it("does not mount the toast list until a toast is raised", () => {
    const { baseElement } = render(<Toaster />);

    expect(
      baseElement.querySelector(
        "[data-sonner-toaster]",
      ),
    ).toBeNull();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * An idle toaster must not display any message text.
   */
  it("does not render any toast text while idle", () => {
    render(<Toaster />);

    expect(
      screen.queryByText("Order saved"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Dismissing a toast must remove its text from the page.
   */
  it("does not keep a dismissed toast on screen", async () => {
    await renderWithToast(
      <Toaster />,
      "Order saved",
    );

    act(() => {
      toast.dismiss();
    });

    await waitFor(() =>
      expect(
        screen.queryByText("Order saved"),
      ).not.toBeInTheDocument(),
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * An explicit position must NOT leave the default position behind.
   */
  it("does not keep the default position when one is given", async () => {
    const { toaster } = await renderWithToast(
      <Toaster position="top-center" />,
    );

    expect(toaster).not.toHaveAttribute(
      "data-y-position",
      "bottom",
    );

    expect(toaster).not.toHaveAttribute(
      "data-x-position",
      "right",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The live region must not be an assertive interruption - toasts are
   * polite announcements.
   */
  it("does not announce toasts assertively", () => {
    const { baseElement } = render(<Toaster />);

    expect(
      baseElement.querySelector(
        "section[aria-live='assertive']",
      ),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The toaster must not force its own theme over the one the app
   * reports.
   */
  it("does not override the reported theme with a hard coded one", async () => {
    mockUseTheme.mockReturnValue({ theme: "dark" });

    const { toaster } = await renderWithToast(
      <Toaster />,
    );

    expect(toaster).not.toHaveAttribute(
      "data-sonner-theme",
      "light",
    );
  });
});
