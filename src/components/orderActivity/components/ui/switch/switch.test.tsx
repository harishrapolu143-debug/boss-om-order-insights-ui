import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { Switch } from "./switch";

describe("Switch", () => {
  it("renders with the switch role", () => {
    render(<Switch aria-label="Notifications" />);

    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("sets the correct data-slot attributes", () => {
    const { container } = render(<Switch aria-label="Notifications" />);

    expect(screen.getByRole("switch")).toHaveAttribute("data-slot", "switch");
    expect(
      container.querySelector("[data-slot='switch-thumb']"),
    ).toBeInTheDocument();
  });

  it("is unchecked by default", () => {
    render(<Switch aria-label="Notifications" />);

    const toggle = screen.getByRole("switch");

    expect(toggle).not.toBeChecked();
    expect(toggle).toHaveAttribute("data-state", "unchecked");
  });

  it("respects defaultChecked", () => {
    render(<Switch aria-label="Notifications" defaultChecked />);

    expect(screen.getByRole("switch")).toBeChecked();
  });

  it("toggles when clicked", async () => {
    const user = userEvent.setup();
    render(<Switch aria-label="Notifications" />);

    const toggle = screen.getByRole("switch");

    await user.click(toggle);
    expect(toggle).toBeChecked();

    await user.click(toggle);
    expect(toggle).not.toBeChecked();
  });

  it("moves the thumb state along with the switch", async () => {
    const user = userEvent.setup();
    const { container } = render(<Switch aria-label="Notifications" />);

    const thumb = container.querySelector("[data-slot='switch-thumb']");

    expect(thumb).toHaveAttribute("data-state", "unchecked");

    await user.click(screen.getByRole("switch"));

    expect(thumb).toHaveAttribute("data-state", "checked");
  });

  it("calls onCheckedChange with the new state", async () => {
    const user = userEvent.setup();
    const onCheckedChange = jest.fn();
    render(
      <Switch aria-label="Notifications" onCheckedChange={onCheckedChange} />,
    );

    await user.click(screen.getByRole("switch"));

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("does not toggle while disabled", async () => {
    const user = userEvent.setup();
    render(<Switch aria-label="Notifications" disabled />);

    const toggle = screen.getByRole("switch");

    expect(toggle).toBeDisabled();

    await user.click(toggle);

    expect(toggle).not.toBeChecked();
  });

  it("honours a controlled checked prop", async () => {
    const user = userEvent.setup();
    const onCheckedChange = jest.fn();
    render(
      <Switch
        aria-label="Notifications"
        checked={false}
        onCheckedChange={onCheckedChange}
      />,
    );

    await user.click(screen.getByRole("switch"));

    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("switch")).not.toBeChecked();
  });

  it("merges a custom className with the defaults", () => {
    render(<Switch aria-label="Notifications" className="w-12" />);

    expect(screen.getByRole("switch")).toHaveClass("w-12");
    expect(screen.getByRole("switch")).toHaveClass("rounded-full");
  });
});
