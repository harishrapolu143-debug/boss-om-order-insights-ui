import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
} from "./context-menu";

function renderContextMenu(handlers: { onSelect?: () => void } = {}) {
  return render(
    <ContextMenu>
      <ContextMenuTrigger>Right click the order row</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel>Order actions</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuItem onSelect={handlers.onSelect}>
            Edit
            <ContextMenuShortcut>⌘E</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
          <ContextMenuItem disabled>Archive</ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>,
  );
}

/** Radix opens a context menu on the native contextmenu event. */
async function openMenu(user: ReturnType<typeof userEvent.setup>) {
  await user.pointer({
    keys: "[MouseRight]",
    target: screen.getByText("Right click the order row"),
  });

  return screen.findByRole("menu");
}

describe("ContextMenuTrigger", () => {
  it("renders with the correct data-slot", () => {
    renderContextMenu();

    expect(screen.getByText("Right click the order row")).toHaveAttribute(
      "data-slot",
      "context-menu-trigger",
    );
  });
});

describe("ContextMenuContent", () => {
  it("is not rendered until the trigger is right-clicked", () => {
    renderContextMenu();

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("renders with the menu role once opened", async () => {
    const user = userEvent.setup();
    renderContextMenu();

    const menu = await openMenu(user);

    expect(menu).toHaveAttribute("data-slot", "context-menu-content");
  });

  it("applies the default classes", async () => {
    const user = userEvent.setup();
    renderContextMenu();

    const menu = await openMenu(user);

    expect(menu).toHaveClass("bg-popover");
    expect(menu).toHaveClass("rounded-md");
    expect(menu).toHaveClass("shadow-md");
  });

  it("merges a custom className with the defaults", async () => {
    const user = userEvent.setup();
    render(
      <ContextMenu>
        <ContextMenuTrigger>Right click the order row</ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuItem>Edit</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );

    const menu = await openMenu(user);

    expect(menu).toHaveClass("w-64");
    expect(menu).toHaveClass("bg-popover");
  });

  it("renders into a portal, outside the trigger's container", async () => {
    const user = userEvent.setup();
    const { container } = renderContextMenu();

    const menu = await openMenu(user);

    expect(container).not.toContainElement(menu);
  });
});

describe("ContextMenuItem", () => {
  it("renders each item with the menuitem role", async () => {
    const user = userEvent.setup();
    renderContextMenu();

    await openMenu(user);

    expect(screen.getAllByRole("menuitem")).toHaveLength(3);
  });

  it("sets the correct data-slot and default variant", async () => {
    const user = userEvent.setup();
    renderContextMenu();

    await openMenu(user);

    const item = screen.getByRole("menuitem", { name: /Edit/ });

    expect(item).toHaveAttribute("data-slot", "context-menu-item");
    expect(item).toHaveAttribute("data-variant", "default");
  });

  it("records the destructive variant", async () => {
    const user = userEvent.setup();
    renderContextMenu();

    await openMenu(user);

    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveAttribute(
      "data-variant",
      "destructive",
    );
  });

  it("marks a disabled item", async () => {
    const user = userEvent.setup();
    renderContextMenu();

    await openMenu(user);

    expect(screen.getByRole("menuitem", { name: "Archive" })).toHaveAttribute(
      "data-disabled",
    );
  });

  it("records the inset flag", async () => {
    const user = userEvent.setup();
    render(
      <ContextMenu>
        <ContextMenuTrigger>Right click the order row</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem inset>Edit</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );

    await openMenu(user);

    expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveAttribute(
      "data-inset",
      "true",
    );
  });
});

describe("ContextMenuLabel, Separator and Shortcut", () => {
  it("set the correct data-slot attributes", async () => {
    const user = userEvent.setup();
    const { baseElement } = renderContextMenu();

    await openMenu(user);

    expect(screen.getByText("Order actions")).toHaveAttribute(
      "data-slot",
      "context-menu-label",
    );
    expect(
      baseElement.querySelector("[data-slot='context-menu-separator']"),
    ).toBeInTheDocument();
    expect(screen.getByText("⌘E")).toHaveAttribute(
      "data-slot",
      "context-menu-shortcut",
    );
  });
});

describe("ContextMenuCheckboxItem and RadioItem", () => {
  it("render checkbox items with their checked state", async () => {
    const user = userEvent.setup();
    render(
      <ContextMenu>
        <ContextMenuTrigger>Right click the order row</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuCheckboxItem checked>Show closed</ContextMenuCheckboxItem>
        </ContextMenuContent>
      </ContextMenu>,
    );

    await openMenu(user);

    expect(screen.getByRole("menuitemcheckbox")).toHaveAttribute(
      "data-state",
      "checked",
    );
  });

  it("render radio items and mark the selected one", async () => {
    const user = userEvent.setup();
    render(
      <ContextMenu>
        <ContextMenuTrigger>Right click the order row</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuRadioGroup value="newest">
            <ContextMenuRadioItem value="newest">Newest</ContextMenuRadioItem>
            <ContextMenuRadioItem value="oldest">Oldest</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>,
    );

    await openMenu(user);

    expect(
      screen.getByRole("menuitemradio", { name: "Newest" }),
    ).toHaveAttribute("data-state", "checked");
    expect(
      screen.getByRole("menuitemradio", { name: "Oldest" }),
    ).toHaveAttribute("data-state", "unchecked");
  });
});

describe("ContextMenuSub", () => {
  it("renders a sub-trigger that opens a sub-menu", async () => {
    const user = userEvent.setup();
    render(
      <ContextMenu>
        <ContextMenuTrigger>Right click the order row</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuSub>
            <ContextMenuSubTrigger>Export</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem>As CSV</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>,
    );

    await openMenu(user);

    const subTrigger = screen.getByRole("menuitem", { name: /Export/ });

    expect(subTrigger).toHaveAttribute("data-slot", "context-menu-sub-trigger");

    await user.click(subTrigger);

    expect(
      await screen.findByRole("menuitem", { name: "As CSV" }),
    ).toBeInTheDocument();
  });
});

describe("ContextMenu interactions", () => {
  it("selects an item and closes the menu", async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    renderContextMenu({ onSelect });

    await openMenu(user);
    await user.click(screen.getByRole("menuitem", { name: /Edit/ }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    renderContextMenu();

    await openMenu(user);
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
