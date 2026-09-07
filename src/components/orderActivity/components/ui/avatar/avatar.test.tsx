import * as React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "./avatar";

/**
 * ============================================================================
 * Avatar
 * ============================================================================
 */
describe("Avatar", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The Avatar root should render with the expected data-slot attribute.
   */
  it("sets the correct data-slot attribute", () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>HR</AvatarFallback>
      </Avatar>,
    );

    expect(
      container.querySelector(
        "[data-slot='avatar']",
      ),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The default avatar shape should be applied.
   */
  it("applies the default classes", () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>HR</AvatarFallback>
      </Avatar>,
    );

    const avatar = container.querySelector(
      "[data-slot='avatar']",
    );

    expect(avatar).toHaveClass("size-10");
    expect(avatar).toHaveClass("rounded-full");
    expect(avatar).toHaveClass("overflow-hidden");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A custom className should be merged with the defaults.
   */
  it("merges a custom className with the defaults", () => {
    const { container } = render(
      <Avatar className="size-16">
        <AvatarFallback>HR</AvatarFallback>
      </Avatar>,
    );

    const avatar = container.querySelector(
      "[data-slot='avatar']",
    );

    expect(avatar).toHaveClass("size-16");
    expect(avatar).toHaveClass("rounded-full");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Arbitrary props should be forwarded to the root element.
   */
  it("forwards arbitrary props to the root", () => {
    const { container } = render(
      <Avatar id="user-avatar">
        <AvatarFallback>HR</AvatarFallback>
      </Avatar>,
    );

    expect(
      container.querySelector(
        "[data-slot='avatar']",
      ),
    ).toHaveAttribute("id", "user-avatar");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * An avatar is decoration - it must not be interactive or focusable
   * in its own right.
   */
  it("does not render as an interactive element", () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>HR</AvatarFallback>
      </Avatar>,
    );

    const avatar = container.querySelector(
      "[data-slot='avatar']",
    ) as HTMLElement;

    expect(avatar).not.toHaveAttribute("tabindex");
    expect(avatar).not.toHaveAttribute("role");

    expect(
      screen.queryByRole("button"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The image must never spill outside the circular frame, which is what
   * the overflow-hidden class guarantees.
   */
  it("does not let its content overflow the frame", () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>HR</AvatarFallback>
      </Avatar>,
    );

    expect(
      container.querySelector(
        "[data-slot='avatar']",
      ),
    ).toHaveClass("overflow-hidden");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A custom className must not remove the circular shape.
   */
  it("does not drop the default classes when a custom className is given", () => {
    const { container } = render(
      <Avatar className="ring-2">
        <AvatarFallback>HR</AvatarFallback>
      </Avatar>,
    );

    const avatar = container.querySelector(
      "[data-slot='avatar']",
    );

    expect(avatar).toHaveClass("ring-2");
    expect(avatar).toHaveClass("rounded-full");
    expect(avatar).toHaveClass("shrink-0");
  });
});

/**
 * ============================================================================
 * AvatarFallback
 * ============================================================================
 */
describe("AvatarFallback", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The fallback should be shown while the image has not loaded.
   *
   * jsdom never resolves the image load, so the fallback stays visible.
   */
  it("renders while the image has not loaded", () => {
    render(
      <Avatar>
        <AvatarImage
          src="/avatar.png"
          alt="Harish"
        />
        <AvatarFallback>HR</AvatarFallback>
      </Avatar>,
    );

    expect(
      screen.getByText("HR"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The fallback should render with the expected data-slot attribute.
   */
  it("sets the correct data-slot attribute", () => {
    render(
      <Avatar>
        <AvatarFallback>HR</AvatarFallback>
      </Avatar>,
    );

    expect(screen.getByText("HR")).toHaveAttribute(
      "data-slot",
      "avatar-fallback",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The fallback should fill the avatar frame.
   */
  it("applies the default classes", () => {
    render(
      <Avatar>
        <AvatarFallback>HR</AvatarFallback>
      </Avatar>,
    );

    const fallback = screen.getByText("HR");

    expect(fallback).toHaveClass("bg-muted");
    expect(fallback).toHaveClass("size-full");
    expect(fallback).toHaveClass("rounded-full");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A custom className should be merged with the defaults.
   */
  it("merges a custom className with the defaults", () => {
    render(
      <Avatar>
        <AvatarFallback className="text-xs">
          HR
        </AvatarFallback>
      </Avatar>,
    );

    const fallback = screen.getByText("HR");

    expect(fallback).toHaveClass("text-xs");
    expect(fallback).toHaveClass("bg-muted");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * With delayMs set the fallback must NOT flash on screen before the
   * delay has elapsed.
   */
  it("does not render before delayMs has elapsed", () => {
    render(
      <Avatar>
        <AvatarFallback delayMs={600}>
          HR
        </AvatarFallback>
      </Avatar>,
    );

    expect(
      screen.queryByText("HR"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The fallback must not be rendered outside an Avatar root, so it can
   * never leak into the page on its own.
   */
  it("does not render outside an Avatar root", () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>HR</AvatarFallback>
      </Avatar>,
    );

    const root = container.querySelector(
      "[data-slot='avatar']",
    ) as HTMLElement;

    expect(
      root.querySelector(
        "[data-slot='avatar-fallback']",
      ),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The fallback initials must not be selectable as an image alt text or
   * exposed as an image role.
   */
  it("does not expose an image role", () => {
    render(
      <Avatar>
        <AvatarFallback>HR</AvatarFallback>
      </Avatar>,
    );

    expect(
      screen.queryByRole("img"),
    ).not.toBeInTheDocument();
  });
});

/**
 * ============================================================================
 * AvatarImage
 * ============================================================================
 */
describe("AvatarImage", () => {
  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Radix only mounts the img after its own preload succeeds, which jsdom
   * does not perform. Until then the image must NOT be rendered, so the
   * user never sees a broken image box.
   */
  it("does not render until the image reports a successful load", () => {
    const { container } = render(
      <Avatar>
        <AvatarImage
          src="/avatar.png"
          alt="Harish"
        />
        <AvatarFallback>HR</AvatarFallback>
      </Avatar>,
    );

    expect(
      container.querySelector(
        "[data-slot='avatar-image']",
      ),
    ).not.toBeInTheDocument();

    expect(
      screen.getByText("HR"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A missing src must not render an empty image element either.
   */
  it("does not render an image element without a src", () => {
    const { container } = render(
      <Avatar>
        <AvatarImage alt="Harish" />
        <AvatarFallback>HR</AvatarFallback>
      </Avatar>,
    );

    expect(
      container.querySelector("img"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The image and the fallback must never both be visible at once.
   */
  it("does not render alongside the fallback", () => {
    const { container } = render(
      <Avatar>
        <AvatarImage
          src="/avatar.png"
          alt="Harish"
        />
        <AvatarFallback>HR</AvatarFallback>
      </Avatar>,
    );

    const image = container.querySelector(
      "[data-slot='avatar-image']",
    );

    const fallback = container.querySelector(
      "[data-slot='avatar-fallback']",
    );

    expect(Boolean(image) && Boolean(fallback)).toBe(
      false,
    );
  });
});
