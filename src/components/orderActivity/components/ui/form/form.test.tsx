import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import "@testing-library/jest-dom";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "./form";
import { Input } from "../input/input";

type Values = { orderNumber: string };

function OrderForm({
  onSubmit = jest.fn(),
  required = true,
  withDescription = true,
  defaultValue = "",
}: {
  onSubmit?: (values: Values) => void;
  required?: boolean;
  withDescription?: boolean;
  defaultValue?: string;
}) {
  const form = useForm<Values>({
    defaultValues: { orderNumber: defaultValue },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
      >
        <FormField
          control={form.control}
          name="orderNumber"
          rules={
            required
              ? { required: "Order number is required" }
              : undefined
          }
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order number</FormLabel>

              <FormControl>
                <Input {...field} />
              </FormControl>

              {withDescription && (
                <FormDescription>
                  The reference printed on the invoice
                </FormDescription>
              )}

              <FormMessage />
            </FormItem>
          )}
        />

        <button type="submit">Save</button>
      </form>
    </Form>
  );
}

/**
 * ============================================================================
 * Form
 * ============================================================================
 */
describe("Form", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Every form part should render with its own data-slot attribute.
   */
  it("sets the correct data-slot attributes for every part", () => {
    const { container } = render(<OrderForm />);

    [
      "form-item",
      "form-label",
      "form-control",
      "form-description",
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
   * The label should be wired to its control.
   */
  it("associates the label with its control", () => {
    render(<OrderForm />);

    expect(
      screen.getByLabelText("Order number"),
    ).toBe(screen.getByRole("textbox"));
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The description should describe the control.
   */
  it("describes the control with its description", () => {
    render(<OrderForm />);

    const control = screen.getByRole("textbox");

    const description = screen.getByText(
      "The reference printed on the invoice",
    );

    expect(
      control
        .getAttribute("aria-describedby")
        ?.split(" "),
    ).toContain(description.id);
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A valid submission should reach the handler.
   */
  it("submits valid values", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();

    render(<OrderForm onSubmit={onSubmit} />);

    await user.type(
      screen.getByRole("textbox"),
      "SO-1024",
    );

    await user.click(
      screen.getByRole("button", { name: "Save" }),
    );

    expect(onSubmit).toHaveBeenCalledWith(
      { orderNumber: "SO-1024" },
      expect.anything(),
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * A validation error should be shown to the user.
   */
  it("shows the validation message when the field is invalid", async () => {
    const user = userEvent.setup();

    render(<OrderForm />);

    await user.click(
      screen.getByRole("button", { name: "Save" }),
    );

    expect(
      await screen.findByText(
        "Order number is required",
      ),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * An invalid control should be marked for assistive technology.
   */
  it("marks the control invalid when validation fails", async () => {
    const user = userEvent.setup();

    render(<OrderForm />);

    await user.click(
      screen.getByRole("button", { name: "Save" }),
    );

    await screen.findByText(
      "Order number is required",
    );

    expect(
      screen.getByRole("textbox"),
    ).toHaveAttribute("aria-invalid", "true");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * The error message should be linked to the control.
   */
  it("links the error message to the control", async () => {
    const user = userEvent.setup();

    render(<OrderForm />);

    await user.click(
      screen.getByRole("button", { name: "Save" }),
    );

    const message = await screen.findByText(
      "Order number is required",
    );

    expect(
      screen
        .getByRole("textbox")
        .getAttribute("aria-describedby")
        ?.split(" "),
    ).toContain(message.id);
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * Default values should reach the control.
   */
  it("renders the default value in the control", () => {
    render(<OrderForm defaultValue="SO-1024" />);

    expect(
      screen.getByRole("textbox"),
    ).toHaveValue("SO-1024");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * No error message may be shown before the user submits.
   */
  it("does not show a validation message before submission", () => {
    const { container } = render(<OrderForm />);

    expect(
      container.querySelector(
        "[data-slot='form-message']",
      ),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText(
        "Order number is required",
      ),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A valid field must NOT be marked invalid.
   */
  it("does not mark a valid control as invalid", () => {
    render(<OrderForm />);

    expect(
      screen.getByRole("textbox"),
    ).toHaveAttribute("aria-invalid", "false");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * An invalid submission must NOT reach the submit handler.
   */
  it("does not submit invalid values", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();

    render(<OrderForm onSubmit={onSubmit} />);

    await user.click(
      screen.getByRole("button", { name: "Save" }),
    );

    await screen.findByText(
      "Order number is required",
    );

    expect(onSubmit).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A field with no description must NOT render an empty description
   * element or point at one.
   */
  it("does not render a description that was not supplied", () => {
    const { container } = render(
      <OrderForm withDescription={false} />,
    );

    expect(
      container.querySelector(
        "[data-slot='form-description']",
      ),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Fixing the field must clear the error rather than leaving it on
   * screen.
   */
  it("does not keep the error after the field is corrected", async () => {
    const user = userEvent.setup();

    render(<OrderForm />);

    await user.click(
      screen.getByRole("button", { name: "Save" }),
    );

    await screen.findByText(
      "Order number is required",
    );

    await user.type(
      screen.getByRole("textbox"),
      "SO-1024",
    );

    await user.click(
      screen.getByRole("button", { name: "Save" }),
    );

    expect(
      screen.queryByText(
        "Order number is required",
      ),
    ).not.toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A field with no rules must not block submission.
   */
  it("does not block submission when the field has no rules", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();

    render(
      <OrderForm
        onSubmit={onSubmit}
        required={false}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Save" }),
    );

    expect(onSubmit).toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * FormControl must not add a wrapper element of its own - it applies
   * its wiring to the child control.
   */
  it("does not wrap the control in an extra element", () => {
    const { container } = render(<OrderForm />);

    const control = container.querySelector(
      "[data-slot='form-control']",
    ) as HTMLElement;

    expect(control.tagName).toBe("INPUT");
  });
});
