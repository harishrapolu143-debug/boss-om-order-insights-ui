import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { Avatar, AvatarImage, AvatarFallback } from "./avatar";

describe("Avatar", () => {
  it("sets the correct data-slot attribute", () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>HR</AvatarFallback>
      </Avatar>,
    );

    expect(container.querySelector("[data-slot='avatar']")).toBeInTheDocument();
  });

  it("applies the default classes", () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>HR</AvatarFallback>
      </Avatar>,
    );

    const avatar = container.querySelector("[data-slot='avatar']");

    expect(avatar).toHaveClass("size-10");
    expect(avatar).toHaveClass("rounded-full");
    expect(avatar).toHaveClass("overflow-hidden");
  });

  it("merges a custom className with the defaults", () => {
    const { container } = render(
      <Avatar className="size-16">
        <AvatarFallback>HR</AvatarFallback>
      </Avatar>,
    );

    const avatar = container.querySelector("[data-slot='avatar']");

    expect(avatar).toHaveClass("size-16");
    expect(avatar).toHaveClass("rounded-full");
  });
});

describe("AvatarFallback", () => {
  it("renders while the image has not loaded", () => {
    render(
      <Avatar>
        <AvatarImage src="/avatar.png" alt="Harish" />
        <AvatarFallback>HR</AvatarFallback>
      </Avatar>,
    );

    // jsdom never resolves the image load, so the fallback stays visible.
    expect(screen.getByText("HR")).toBeInTheDocument();
  });

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

  it("merges a custom className with the defaults", () => {
    render(
      <Avatar>
        <AvatarFallback className="text-xs">HR</AvatarFallback>
      </Avatar>,
    );

    expect(screen.getByText("HR")).toHaveClass("text-xs");
    expect(screen.getByText("HR")).toHaveClass("bg-muted");
  });

  it("can be delayed with delayMs", () => {
    render(
      <Avatar>
        <AvatarFallback delayMs={600}>HR</AvatarFallback>
      </Avatar>,
    );

    // Nothing renders until the delay elapses.
    expect(screen.queryByText("HR")).not.toBeInTheDocument();
  });
});

describe("AvatarImage", () => {
  it("is not rendered until the image reports a successful load", () => {
    const { container } = render(
      <Avatar>
        <AvatarImage src="/avatar.png" alt="Harish" />
        <AvatarFallback>HR</AvatarFallback>
      </Avatar>,
    );

    // Radix only mounts the img after its own preload succeeds, which jsdom
    // does not perform. The fallback is what a user sees here.
    expect(
      container.querySelector("[data-slot='avatar-image']"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("HR")).toBeInTheDocument();
  });
});
