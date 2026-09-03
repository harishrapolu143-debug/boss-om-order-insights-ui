import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "./dropdown-menu";

type MenuOverrides = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function renderMenu(
  props: MenuOverrides = {},
  handlers: { onSelect?: () => void } = {},
) {
  return render(
    <DropdownMenu {...props}>
      <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Order actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={handlers.onSelect}>
            Edit
            <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
          <DropdownMenuItem disabled>Archive</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>,
  );
}

describe("DropdownMenuTrigger", () => {
  it("renders with the correct data-slot", () => {
    renderMenu();

    const trigger = screen.getByRole("button", { name: "Actions" });

    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("data-slot", "dropdown-menu-trigger");
  });

  it("reports the closed state via aria-expanded", () => {
    renderMenu();

    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false");
  });
});

describe("DropdownMenuContent", () => {
  it("is not rendered while closed", () => {
    renderMenu();

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("renders with the menu role when open", () => {
    renderMenu({ defaultOpen: true });

    const menu = screen.getByRole("menu");

    expect(menu).toBeInTheDocument();
    expect(menu).toHaveAttribute("data-slot", "dropdown-menu-content");
  });

  it("applies the default classes", () => {
    renderMenu({ defaultOpen: true });

    const menu = screen.getByRole("menu");

    expect(menu).toHaveClass("bg-popover");
    expect(menu).toHaveClass("rounded-md");
    expect(menu).toHaveClass("shadow-md");
  });

  it("merges a custom className with the defaults", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuItem>Edit</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    expect(screen.getByRole("menu")).toHaveClass("w-56");
    expect(screen.getByRole("menu")).toHaveClass("bg-popover");
  });

  it("renders into a portal, outside the trigger's container", () => {
    const { container } = renderMenu({ defaultOpen: true });

    expect(container).not.toContainElement(screen.getByRole("menu"));
  });
});

describe("DropdownMenuItem", () => {
  it("renders each item with the menuitem role", () => {
    renderMenu({ defaultOpen: true });

    expect(screen.getAllByRole("menuitem")).toHaveLength(3);
  });

  it("sets the correct data-slot attribute", () => {
    renderMenu({ defaultOpen: true });

    expect(screen.getByRole("menuitem", { name: /Edit/ })).toHaveAttribute(
      "data-slot",
      "dropdown-menu-item",
    );
  });

  it("defaults to the default variant", () => {
    renderMenu({ defaultOpen: true });

    expect(screen.getByRole("menuitem", { name: /Edit/ })).toHaveAttribute(
      "data-variant",
      "default",
    );
  });

  it("records the destructive variant", () => {
    renderMenu({ defaultOpen: true });

    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveAttribute(
      "data-variant",
      "destructive",
    );
  });

  it("records the inset flag", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem inset>Edit</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveAttribute(
      "data-inset",
      "true",
    );
  });

  it("marks a disabled item", () => {
    renderMenu({ defaultOpen: true });

    expect(screen.getByRole("menuitem", { name: "Archive" })).toHaveAttribute(
      "data-disabled",
    );
  });

  it("merges a custom className with the defaults", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem className="font-bold">Edit</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const item = screen.getByRole("menuitem", { name: "Edit" });

    expect(item).toHaveClass("font-bold");
    expect(item).toHaveClass("rounded-sm");
  });
});

describe("DropdownMenuLabel, Separator and Shortcut", () => {
  it("set the correct data-slot attributes", () => {
    const { baseElement } = renderMenu({ defaultOpen: true });

    expect(screen.getByText("Order actions")).toHaveAttribute(
      "data-slot",
      "dropdown-menu-label",
    );
    expect(
      baseElement.querySelector("[data-slot='dropdown-menu-separator']"),
    ).toBeInTheDocument();
    expect(screen.getByText("⌘E")).toHaveAttribute(
      "data-slot",
      "dropdown-menu-shortcut",
    );
  });

  it("apply their default classes", () => {
    const { baseElement } = renderMenu({ defaultOpen: true });

    expect(screen.getByText("Order actions")).toHaveClass("font-medium");
    expect(
      baseElement.querySelector("[data-slot='dropdown-menu-separator']"),
    ).toHaveClass("bg-border");
    expect(screen.getByText("⌘E")).toHaveClass("ml-auto");
  });
});

describe("DropdownMenuCheckboxItem", () => {
  it("renders with the menuitemcheckbox role and reflects checked state", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked>
            Show closed
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={false}>
            Show drafts
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const checked = screen.getByRole("menuitemcheckbox", {
      name: "Show closed",
    });

    expect(checked).toHaveAttribute(
      "data-slot",
      "dropdown-menu-checkbox-item",
    );
    expect(checked).toHaveAttribute("data-state", "checked");
    expect(
      screen.getByRole("menuitemcheckbox", { name: "Show drafts" }),
    ).toHaveAttribute("data-state", "unchecked");
  });

  it("calls onCheckedChange when toggled", async () => {
    const user = userEvent.setup();
    const onCheckedChange = jest.fn();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem
            checked={false}
            onCheckedChange={onCheckedChange}
          >
            Show closed
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await user.click(screen.getByRole("menuitemcheckbox"));

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });
});

describe("DropdownMenuRadioGroup and RadioItem", () => {
  it("render radio items and mark the selected one", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value="newest">
            <DropdownMenuRadioItem value="newest">Newest</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="oldest">Oldest</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    expect(screen.getAllByRole("menuitemradio")).toHaveLength(2);
    expect(
      screen.getByRole("menuitemradio", { name: "Newest" }),
    ).toHaveAttribute("data-state", "checked");
    expect(
      screen.getByRole("menuitemradio", { name: "Oldest" }),
    ).toHaveAttribute("data-state", "unchecked");
  });

  it("calls onValueChange when another option is chosen", async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value="newest" onValueChange={onValueChange}>
            <DropdownMenuRadioItem value="newest">Newest</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="oldest">Oldest</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await user.click(screen.getByRole("menuitemradio", { name: "Oldest" }));

    expect(onValueChange).toHaveBeenCalledWith("oldest");
  });
});

describe("DropdownMenuSub", () => {
  it("renders a sub-trigger that opens a sub-menu", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Export</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>As CSV</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const subTrigger = screen.getByRole("menuitem", { name: /Export/ });

    expect(subTrigger).toHaveAttribute(
      "data-slot",
      "dropdown-menu-sub-trigger",
    );
    expect(screen.queryByRole("menuitem", { name: "As CSV" })).toBeNull();

    await user.click(subTrigger);

    expect(
      await screen.findByRole("menuitem", { name: "As CSV" }),
    ).toBeInTheDocument();
  });
});

describe("DropdownMenu interactions", () => {
  it("opens when the trigger is clicked", async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole("button", { name: "Actions" }));

    expect(await screen.findByRole("menu")).toBeInTheDocument();
  });

  it("selects an item and closes the menu", async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    renderMenu({ defaultOpen: true }, { onSelect });

    await user.click(screen.getByRole("menuitem", { name: /Edit/ }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("does not select a disabled item", async () => {
    const user = userEvent.setup();
    renderMenu({ defaultOpen: true });

    await user.click(screen.getByRole("menuitem", { name: "Archive" }));

    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    renderMenu({ defaultOpen: true });

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("calls onOpenChange with the new state", async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    renderMenu({ onOpenChange });

    await user.click(screen.getByRole("button", { name: "Actions" }));

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});
