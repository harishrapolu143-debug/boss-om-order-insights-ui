import { act, render, screen, waitFor } from "@testing-library/react";
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
async function renderWithToast(ui: React.ReactElement, message = "Saved") {
  const result = render(ui);

  act(() => {
    toast(message);
  });

  await waitFor(() =>
    expect(
      result.baseElement.querySelector("[data-sonner-toaster]"),
    ).not.toBeNull(),
  );

  return {
    ...result,
    toaster: result.baseElement.querySelector(
      "[data-sonner-toaster]",
    ) as HTMLElement,
  };
}

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

  it("renders the live region even with no toasts", () => {
    const { baseElement } = render(<Toaster />);

    expect(
      baseElement.querySelector("section[aria-live='polite']"),
    ).toBeInTheDocument();
  });

  it("does not mount the toast list until a toast is raised", () => {
    const { baseElement } = render(<Toaster />);

    expect(baseElement.querySelector("[data-sonner-toaster]")).toBeNull();
  });

  it("renders a raised toast", async () => {
    await renderWithToast(<Toaster />, "Order saved");

    expect(screen.getByText("Order saved")).toBeInTheDocument();
  });

  it("passes the theme from next-themes through to sonner", async () => {
    mockUseTheme.mockReturnValue({ theme: "dark" });

    const { toaster } = await renderWithToast(<Toaster />);

    expect(toaster).toHaveAttribute("data-sonner-theme", "dark");
  });

  it("falls back to the system theme when next-themes reports none", async () => {
    mockUseTheme.mockReturnValue({});

    const { toaster } = await renderWithToast(<Toaster />);

    // "system" resolves against prefers-color-scheme, which is light in jsdom.
    expect(toaster).toHaveAttribute("data-sonner-theme", "light");
  });

  it("lets an explicit theme prop override the next-themes value", async () => {
    mockUseTheme.mockReturnValue({ theme: "dark" });

    const { toaster } = await renderWithToast(<Toaster theme="light" />);

    expect(toaster).toHaveAttribute("data-sonner-theme", "light");
  });

  it("applies the toaster group className", async () => {
    const { toaster } = await renderWithToast(<Toaster />);

    expect(toaster).toHaveClass("toaster");
    expect(toaster).toHaveClass("group");
  });

  it("sets the CSS custom properties sonner reads for colours", async () => {
    const { toaster } = await renderWithToast(<Toaster />);

    expect(toaster.style.getPropertyValue("--normal-bg")).toBe(
      "var(--popover)",
    );
    expect(toaster.style.getPropertyValue("--normal-text")).toBe(
      "var(--popover-foreground)",
    );
    expect(toaster.style.getPropertyValue("--normal-border")).toBe(
      "var(--border)",
    );
  });

  it("forwards arbitrary sonner props such as position", async () => {
    const { toaster } = await renderWithToast(<Toaster position="top-center" />);

    expect(toaster).toHaveAttribute("data-y-position", "top");
    expect(toaster).toHaveAttribute("data-x-position", "center");
  });

  it("defaults to the bottom-right position", async () => {
    const { toaster } = await renderWithToast(<Toaster />);

    expect(toaster).toHaveAttribute("data-y-position", "bottom");
    expect(toaster).toHaveAttribute("data-x-position", "right");
  });
});
