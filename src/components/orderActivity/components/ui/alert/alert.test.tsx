import * as React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "./alert";

function renderAlert(
  props: React.ComponentProps<typeof Alert> = {},
) {
  return render(
    <Alert {...props}>
      <AlertTitle>Shipment delayed</AlertTitle>
      <AlertDescription>
        The carrier reported a delay of two days.
      </AlertDescription>
    </Alert>,
  );
}

/**
 * ============================================================================
 * Alert
 * ============================================================================
 */
describe("Alert", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Every alert part should render with its own data-slot attribute.
   */
  it("sets the correct data-slot attributes for every part", () => {
    const { container } = renderAlert();

    [
      "alert",
      "alert-title",
      "alert-description",
    ].forEach((slot) => {
      expect(
        container.querySelector(
          `[data-slot='${slot}']`,
        ),
      ).toBeInTheDocument();
    });
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The alert should be announced with the alert role.
   */
  it("renders with the alert role", () => {
    renderAlert();

    expect(
      screen.getByRole("alert"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The title and description should be rendered.
   */
  it("renders the title and description", () => {
    renderAlert();

    expect(
      screen.getByText("Shipment delayed"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "The carrier reported a delay of two days.",
      ),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The default variant classes should be applied.
   */
  it("applies the default variant classes", () => {
    renderAlert();

    const alert = screen.getByRole("alert");

    expect(alert).toHaveClass("bg-card");
    expect(alert).toHaveClass("rounded-lg");
    expect(alert).toHaveClass("border");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The destructive variant should be applied when requested.
   */
  it("applies the destructive variant", () => {
    renderAlert({ variant: "destructive" });

    expect(
      screen.getByRole("alert"),
    ).toHaveClass("text-destructive");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * An icon should be rendered alongside the text.
   */
  it("renders an icon when one is supplied", () => {
    render(
      <Alert>
        <svg data-testid="alert-icon" />
        <AlertTitle>Shipment delayed</AlertTitle>
      </Alert>,
    );

    expect(
      screen.getByTestId("alert-icon"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A custom className should be merged with the variant classes.
   */
  it("merges a custom className with the variant classes", () => {
    renderAlert({ className: "mb-4" });

    const alert = screen.getByRole("alert");

    expect(alert).toHaveClass("mb-4");
    expect(alert).toHaveClass("rounded-lg");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Arbitrary props should be forwarded to the underlying element.
   */
  it("forwards arbitrary props to the underlying element", () => {
    renderAlert({ id: "delay-alert" });

    expect(
      screen.getByRole("alert"),
    ).toHaveAttribute("id", "delay-alert");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The title and description are optional - omitting them must not
   * render empty placeholders.
   */
  it("does not render parts that were not supplied", () => {
    const { container } = render(
      <Alert>
        <AlertTitle>Shipment delayed</AlertTitle>
      </Alert>,
    );

    expect(
      container.querySelector(
        "[data-slot='alert-description']",
      ),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Choosing the destructive variant must NOT leave the default text
   * colour behind.
   */
  it("does not keep the default variant classes when destructive is used", () => {
    renderAlert({ variant: "destructive" });

    expect(
      screen.getByRole("alert"),
    ).not.toHaveClass("text-card-foreground");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * An alert is a status message - it must never be interactive or
   * focusable in its own right.
   */
  it("does not render as an interactive element", () => {
    renderAlert();

    const alert = screen.getByRole("alert");

    expect(alert.tagName).toBe("DIV");
    expect(alert).not.toHaveAttribute("tabindex");

    expect(
      screen.queryByRole("button"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * The title must not be exposed as a heading, because the alert role
   * already carries the semantics.
   */
  it("does not expose the title as a heading", () => {
    renderAlert();

    expect(
      screen.queryByRole("heading"),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A long title must not wrap past one line, which is what the
   * line-clamp-1 class guarantees.
   */
  it("does not let the title grow past a single line", () => {
    const { container } = renderAlert();

    expect(
      container.querySelector(
        "[data-slot='alert-title']",
      ),
    ).toHaveClass("line-clamp-1");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Nesting an alert must not produce a second alert role announcement
   * for the same message.
   */
  it("does not announce the description as its own alert", () => {
    renderAlert();

    expect(
      screen.getAllByRole("alert"),
    ).toHaveLength(1);
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A custom className must not remove the alert surface styling.
   */
  it("does not drop the default classes when a custom className is given", () => {
    renderAlert({ className: "mb-4" });

    const alert = screen.getByRole("alert");

    expect(alert).toHaveClass("mb-4");
    expect(alert).toHaveClass("w-full");
    expect(alert).toHaveClass("relative");
  });
});
