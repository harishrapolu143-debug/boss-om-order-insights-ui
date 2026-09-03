import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "./command";

function renderCommand(handlers: { onSelect?: (value: string) => void } = {}) {
  return render(
    <Command>
      <CommandInput placeholder="Search orders" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Orders">
          <CommandItem value="active" onSelect={handlers.onSelect}>
            Active orders
            <CommandShortcut>⌘A</CommandShortcut>
          </CommandItem>
          <CommandItem value="pending">Pending orders</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem value="profile">Profile</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>,
  );
}

describe("Command", () => {
  it("sets the correct data-slot attribute", () => {
    const { container } = renderCommand();

    expect(container.querySelector("[data-slot='command']")).toBeInTheDocument();
  });

  it("applies the default classes", () => {
    const { container } = renderCommand();

    const command = container.querySelector("[data-slot='command']");

    expect(command).toHaveClass("bg-popover");
    expect(command).toHaveClass("rounded-md");
    expect(command).toHaveClass("flex-col");
  });

  it("merges a custom className with the defaults", () => {
    const { container } = render(
      <Command className="max-w-lg">
        <CommandList />
      </Command>,
    );

    const command = container.querySelector("[data-slot='command']");

    expect(command).toHaveClass("max-w-lg");
    expect(command).toHaveClass("bg-popover");
  });
});

describe("CommandInput", () => {
  it("renders a search box inside a wrapper with an icon", () => {
    const { container } = renderCommand();

    const wrapper = container.querySelector(
      "[data-slot='command-input-wrapper']",
    );

    expect(wrapper).toBeInTheDocument();
    expect(wrapper?.querySelector("svg")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search orders")).toHaveAttribute(
      "data-slot",
      "command-input",
    );
  });

  it("accepts typed text", async () => {
    const user = userEvent.setup();
    renderCommand();

    const input = screen.getByPlaceholderText("Search orders");
    await user.type(input, "act");

    expect(input).toHaveValue("act");
  });

  it("merges a custom className with the defaults", () => {
    render(
      <Command>
        <CommandInput placeholder="Search" className="text-base" />
        <CommandList />
      </Command>,
    );

    const input = screen.getByPlaceholderText("Search");

    expect(input).toHaveClass("text-base");
    expect(input).toHaveClass("w-full");
  });
});

describe("CommandList, CommandGroup, CommandItem", () => {
  it("set the correct data-slot attributes", () => {
    const { container } = renderCommand();

    expect(
      container.querySelector("[data-slot='command-list']"),
    ).toBeInTheDocument();
    expect(
      container.querySelector("[data-slot='command-group']"),
    ).toBeInTheDocument();
    expect(
      container.querySelector("[data-slot='command-separator']"),
    ).toBeInTheDocument();
    expect(screen.getByText("Active orders")).toHaveAttribute(
      "data-slot",
      "command-item",
    );
  });

  it("renders the group headings", () => {
    renderCommand();

    expect(screen.getByText("Orders")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("renders every item initially", () => {
    renderCommand();

    expect(screen.getByText("Active orders")).toBeInTheDocument();
    expect(screen.getByText("Pending orders")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  it("applies the default item classes", () => {
    renderCommand();

    expect(screen.getByText("Active orders")).toHaveClass("rounded-sm");
    expect(screen.getByText("Active orders")).toHaveClass("cursor-default");
  });

  it("renders a shortcut with the correct data-slot", () => {
    renderCommand();

    expect(screen.getByText("⌘A")).toHaveAttribute(
      "data-slot",
      "command-shortcut",
    );
    expect(screen.getByText("⌘A")).toHaveClass("ml-auto");
  });
});

describe("Command filtering", () => {
  it("narrows the list as the user types", async () => {
    const user = userEvent.setup();
    renderCommand();

    await user.type(screen.getByPlaceholderText("Search orders"), "pending");

    expect(screen.getByText("Pending orders")).toBeInTheDocument();
    expect(screen.queryByText("Profile")).not.toBeInTheDocument();
  });

  it("hides a group whose items all filter out", async () => {
    const user = userEvent.setup();
    renderCommand();

    await user.type(screen.getByPlaceholderText("Search orders"), "profile");

    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.queryByText("Active orders")).not.toBeInTheDocument();
  });

  it("shows the empty state when nothing matches", async () => {
    const user = userEvent.setup();
    renderCommand();

    await user.type(screen.getByPlaceholderText("Search orders"), "zzzzz");

    expect(await screen.findByText("No results found.")).toBeInTheDocument();
  });

  it("hides the empty state while results exist", () => {
    renderCommand();

    expect(screen.queryByText("No results found.")).not.toBeInTheDocument();
  });
});

describe("Command selection", () => {
  it("calls onSelect with the item value when clicked", async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    renderCommand({ onSelect });

    await user.click(screen.getByText("Active orders"));

    expect(onSelect).toHaveBeenCalledWith("active");
  });

  it("marks the first item as selected by default", () => {
    renderCommand();

    expect(screen.getByText("Active orders")).toHaveAttribute(
      "data-selected",
      "true",
    );
  });

  it("moves the selection with the arrow keys", async () => {
    const user = userEvent.setup();
    renderCommand();

    await user.click(screen.getByPlaceholderText("Search orders"));
    await user.keyboard("{ArrowDown}");

    expect(screen.getByText("Pending orders")).toHaveAttribute(
      "data-selected",
      "true",
    );
  });

  it("does not select a disabled item", async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    render(
      <Command>
        <CommandList>
          <CommandItem value="archived" disabled onSelect={onSelect}>
            Archived
          </CommandItem>
        </CommandList>
      </Command>,
    );

    await user.click(screen.getByText("Archived"));

    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe("CommandDialog", () => {
  it("is not rendered while closed", () => {
    render(
      <CommandDialog>
        <CommandList>
          <CommandItem value="active">Active orders</CommandItem>
        </CommandList>
      </CommandDialog>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders a dialog wrapping the command palette when open", () => {
    render(
      <CommandDialog open>
        <CommandInput placeholder="Search orders" />
        <CommandList>
          <CommandItem value="active">Active orders</CommandItem>
        </CommandList>
      </CommandDialog>,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search orders")).toBeInTheDocument();
    expect(screen.getByText("Active orders")).toBeInTheDocument();
  });

  it("uses the default screen-reader title and description", () => {
    render(
      <CommandDialog open>
        <CommandList />
      </CommandDialog>,
    );

    expect(screen.getByText("Command Palette")).toBeInTheDocument();
    expect(
      screen.getByText("Search for a command to run..."),
    ).toBeInTheDocument();
  });

  it("accepts a custom title and description", () => {
    render(
      <CommandDialog open title="Find order" description="Type an order id">
        <CommandList />
      </CommandDialog>,
    );

    expect(screen.getByText("Find order")).toBeInTheDocument();
    expect(screen.getByText("Type an order id")).toBeInTheDocument();
  });
});
