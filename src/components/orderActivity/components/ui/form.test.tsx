import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import "@testing-library/jest-dom";

import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
} from "./form";
import { Input } from "./input";

type Values = { orderId: string };

function OrderForm({
  onSubmit = jest.fn(),
  required = false,
  defaultValues = { orderId: "" },
  description = "The order reference to look up.",
}: {
  onSubmit?: (values: Values) => void;
  required?: boolean;
  defaultValues?: Values;
  description?: string | null;
}) {
  const form = useForm<Values>({ defaultValues });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="orderId"
          rules={required ? { required: "Order ID is required" } : undefined}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order ID</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              {description !== null && (
                <FormDescription>{description}</FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit">Search</button>
      </form>
    </Form>
  );
}

describe("FormItem", () => {
  it("sets the correct data-slot attribute", () => {
    const { container } = render(<OrderForm />);

    expect(container.querySelector("[data-slot='form-item']")).toBeInTheDocument();
  });

  it("applies the default classes", () => {
    const { container } = render(<OrderForm />);

    const item = container.querySelector("[data-slot='form-item']");

    expect(item).toHaveClass("grid");
    expect(item).toHaveClass("gap-2");
  });
});

describe("FormLabel", () => {
  it("renders with the correct data-slot", () => {
    render(<OrderForm />);

    expect(screen.getByText("Order ID")).toHaveAttribute(
      "data-slot",
      "form-label",
    );
  });

  it("associates the label with the control", () => {
    render(<OrderForm />);

    expect(screen.getByLabelText("Order ID")).toBe(
      screen.getByRole("textbox"),
    );
  });

  it("reports no error initially", () => {
    render(<OrderForm />);

    expect(screen.getByText("Order ID")).toHaveAttribute("data-error", "false");
  });
});

describe("FormControl", () => {
  it("gives the control the generated form item id", () => {
    const { container } = render(<OrderForm />);

    const item = container.querySelector("[data-slot='form-item']");
    const input = screen.getByRole("textbox");

    expect(input.id).toMatch(/-form-item$/);
    expect(item).toContainElement(input);
  });

  it("points aria-describedby at the description while valid", () => {
    render(<OrderForm />);

    const input = screen.getByRole("textbox");
    const description = screen.getByText("The order reference to look up.");

    expect(input).toHaveAttribute("aria-describedby", description.id);
  });

  it("is not marked invalid initially", () => {
    render(<OrderForm />);

    expect(screen.getByRole("textbox")).toHaveAttribute(
      "aria-invalid",
      "false",
    );
  });
});

describe("FormDescription", () => {
  it("renders with the correct data-slot and classes", () => {
    render(<OrderForm />);

    const description = screen.getByText("The order reference to look up.");

    expect(description).toHaveAttribute("data-slot", "form-description");
    expect(description).toHaveClass("text-muted-foreground");
    expect(description.id).toMatch(/-form-item-description$/);
  });
});

describe("FormMessage", () => {
  it("renders nothing while there is no error and no children", () => {
    const { container } = render(<OrderForm />);

    expect(container.querySelector("[data-slot='form-message']")).toBeNull();
  });

  it("renders its children when given and there is no error", () => {
    function WithChildren() {
      const form = useForm<Values>({ defaultValues: { orderId: "" } });

      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name="orderId"
            render={() => (
              <FormItem>
                <FormMessage>Static hint</FormMessage>
              </FormItem>
            )}
          />
        </Form>
      );
    }

    render(<WithChildren />);

    expect(screen.getByText("Static hint")).toBeInTheDocument();
  });

  it("shows the validation message after a failed submit", async () => {
    const user = userEvent.setup();
    render(<OrderForm required />);

    await user.click(screen.getByRole("button", { name: "Search" }));

    const message = await screen.findByText("Order ID is required");

    expect(message).toHaveAttribute("data-slot", "form-message");
    expect(message).toHaveClass("text-destructive");
    expect(message.id).toMatch(/-form-item-message$/);
  });
});

describe("Form validation wiring", () => {
  it("marks the control invalid and links the message on error", async () => {
    const user = userEvent.setup();
    render(<OrderForm required />);

    await user.click(screen.getByRole("button", { name: "Search" }));

    await screen.findByText("Order ID is required");

    const input = screen.getByRole("textbox");
    const description = screen.getByText("The order reference to look up.");
    const message = screen.getByText("Order ID is required");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute(
      "aria-describedby",
      `${description.id} ${message.id}`,
    );
  });

  it("marks the label as errored", async () => {
    const user = userEvent.setup();
    render(<OrderForm required />);

    await user.click(screen.getByRole("button", { name: "Search" }));

    await waitFor(() =>
      expect(screen.getByText("Order ID")).toHaveAttribute(
        "data-error",
        "true",
      ),
    );
  });

  it("does not call onSubmit when validation fails", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(<OrderForm required onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Search" }));

    await screen.findByText("Order ID is required");

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits the field value when validation passes", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(<OrderForm required onSubmit={onSubmit} />);

    await user.type(screen.getByRole("textbox"), "KS1300400032");
    await user.click(screen.getByRole("button", { name: "Search" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ orderId: "KS1300400032" }),
        expect.anything(),
      ),
    );
  });

  it("clears the error once the field becomes valid", async () => {
    const user = userEvent.setup();
    render(<OrderForm required />);

    await user.click(screen.getByRole("button", { name: "Search" }));
    await screen.findByText("Order ID is required");

    await user.type(screen.getByRole("textbox"), "KS1300400032");

    await waitFor(() =>
      expect(screen.queryByText("Order ID is required")).not.toBeInTheDocument(),
    );
  });

  it("renders the field's default value", () => {
    render(<OrderForm defaultValues={{ orderId: "KS999" }} />);

    expect(screen.getByRole("textbox")).toHaveValue("KS999");
  });
});
