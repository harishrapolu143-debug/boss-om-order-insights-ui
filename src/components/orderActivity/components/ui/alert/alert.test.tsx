import * as React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { Alert, AlertTitle, AlertDescription } from "./alert";

describe("Alert", () => {
  it("renders the alert with role='alert'", () => {
    render(<Alert>Alert message</Alert>);

    const alert = screen.getByRole("alert");

    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent("Alert message");
  });

  it("renders with the default variant", () => {
    render(<Alert>Default alert</Alert>);

    const alert = screen.getByRole("alert");

    expect(alert).toHaveClass("bg-card");
    expect(alert).toHaveClass("text-card-foreground");
  });

  it("renders with the destructive variant", () => {
    render(<Alert variant="destructive">Something went wrong</Alert>);

    const alert = screen.getByRole("alert");

    expect(alert).toHaveClass("text-destructive");
    expect(alert).toHaveClass("bg-card");
  });

  it("applies a custom className", () => {
    render(<Alert className="custom-alert">Custom alert</Alert>);

    const alert = screen.getByRole("alert");

    expect(alert).toHaveClass("custom-alert");
  });

  it("renders children correctly", () => {
    render(
      <Alert>
        <span>Alert content</span>
      </Alert>,
    );

    expect(screen.getByText("Alert content")).toBeInTheDocument();
  });

  it("sets the correct data-slot attribute", () => {
    render(<Alert>Alert message</Alert>);

    const alert = screen.getByRole("alert");

    expect(alert).toHaveAttribute("data-slot", "alert");
  });
});

describe("AlertTitle", () => {
  it("renders the title correctly", () => {
    render(<AlertTitle>Alert Title</AlertTitle>);

    const title = screen.getByText("Alert Title");

    expect(title).toBeInTheDocument();
  });

  it("sets the correct data-slot attribute", () => {
    render(<AlertTitle>Alert Title</AlertTitle>);

    const title = screen.getByText("Alert Title");

    expect(title).toHaveAttribute("data-slot", "alert-title");
  });

  it("applies the default title classes", () => {
    render(<AlertTitle>Alert Title</AlertTitle>);

    const title = screen.getByText("Alert Title");

    expect(title).toHaveClass("col-start-2");
    expect(title).toHaveClass("font-medium");
    expect(title).toHaveClass("tracking-tight");
  });

  it("applies a custom className", () => {
    render(<AlertTitle className="custom-title">Alert Title</AlertTitle>);

    const title = screen.getByText("Alert Title");

    expect(title).toHaveClass("custom-title");
  });
});

describe("AlertDescription", () => {
  it("renders the description correctly", () => {
    render(<AlertDescription>This is an alert description.</AlertDescription>);

    expect(
      screen.getByText("This is an alert description."),
    ).toBeInTheDocument();
  });

  it("sets the correct data-slot attribute", () => {
    render(<AlertDescription>Alert description</AlertDescription>);

    const description = screen.getByText("Alert description");

    expect(description).toHaveAttribute("data-slot", "alert-description");
  });

  it("applies the default description classes", () => {
    render(<AlertDescription>Alert description</AlertDescription>);

    const description = screen.getByText("Alert description");

    expect(description).toHaveClass("text-muted-foreground");
    expect(description).toHaveClass("col-start-2");
    expect(description).toHaveClass("text-sm");
  });

  it("applies a custom className", () => {
    render(
      <AlertDescription className="custom-description">
        Alert description
      </AlertDescription>,
    );

    const description = screen.getByText("Alert description");

    expect(description).toHaveClass("custom-description");
  });
});

describe("Alert composition", () => {
  it("renders title and description together", () => {
    render(
      <Alert>
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>Please check your input.</AlertDescription>
      </Alert>,
    );

    const alert = screen.getByRole("alert");

    expect(alert).toBeInTheDocument();
    expect(screen.getByText("Warning")).toBeInTheDocument();
    expect(screen.getByText("Please check your input.")).toBeInTheDocument();
  });

  it("renders a destructive alert with title and description", () => {
    render(
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Something went wrong.</AlertDescription>
      </Alert>,
    );

    const alert = screen.getByRole("alert");

    expect(alert).toHaveClass("text-destructive");
    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong.")).toBeInTheDocument();
  });
});
