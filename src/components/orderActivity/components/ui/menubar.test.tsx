import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
} from "./menubar";

function renderMenubar(handlers: { onSelect?: () => void } = {}) {
  return render(
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarLabel>File actions</MenubarLabel>
          <MenubarSeparator />
          <MenubarGroup>
            <MenubarItem onSelect={handlers.onSelect}>
              New
              <MenubarShortcut>⌘N</MenubarShortcut>
            </MenubarItem>
            <MenubarItem variant="destructive">Delete</MenubarItem>
            <MenubarItem disabled>Archive</MenubarItem>
          </MenubarGroup>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Undo</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>,
  );
}

describe("Menubar", () => {
  it("renders with the menubar role and correct data-slot", () => {
    renderMenubar();

    const menubar = screen.getByRole("menubar");

    expect(menubar).toBeInTheDocument();
    expect(menubar).toHaveAttribute("data-slot", "menubar");
  });

  it("applies the default classes", () => {
    renderMenubar();

    const menubar = screen.getByRole("menubar");

    expect(menubar).toHaveClass("bg-background");
    expect(menubar).toHaveClass("rounded-md");
    expect(menubar).toHaveClass("border");
  });

  it("merges a custom className with the defaults", () => {
    render(
      <Menubar className="w-full">
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );

    expect(screen.getByRole("menubar")).toHaveClass("w-full");
    expect(screen.getByRole("menubar")).toHaveClass("bg-background");
  });
});

describe("MenubarTrigger", () => {
  it("renders one trigger per menu", () => {
    renderMenubar();

    expect(screen.getAllByRole("menuitem")).toHaveLength(2);
  });

  it("sets the correct data-slot attribute", () => {
    renderMenubar();

    expect(screen.getByRole("menuitem", { name: "File" })).toHaveAttribute(
      "data-slot",
      "menubar-trigger",
    );
  });

  it("reports the closed state", () => {
    renderMenubar();

    expect(screen.getByRole("menuitem", { name: "File" })).toHaveAttribute(
      "data-state",
      "closed",
    );
  });
});

describe("MenubarContent", () => {
  it("is not rendered until a trigger is activated", () => {
    renderMenubar();

    expect(screen.queryByText("File actions")).not.toBeInTheDocument();
  });

  it("renders with the correct data-slot once opened", async () => {
    const user = userEvent.setup();
    const { baseElement } = renderMenubar();

    await user.click(screen.getByRole("menuitem", { name: "File" }));

    const content = await screen.findByText("File actions");

    expect(content).toBeInTheDocument();
    expect(
      baseElement.querySelector("[data-slot='menubar-content']"),
    ).toBeInTheDocument();
  });

  it("applies the default classes", async () => {
    const user = userEvent.setup();
    const { baseElement } = renderMenubar();

    await user.click(screen.getByRole("menuitem", { name: "File" }));
    await screen.findByText("File actions");

    const content = baseElement.querySelector("[data-slot='menubar-content']");

    expect(content).toHaveClass("bg-popover");
    expect(content).toHaveClass("rounded-md");
  });
});

describe("MenubarItem", () => {
  it("sets the correct data-slot and default variant", async () => {
    const user = userEvent.setup();
    renderMenubar();

    await user.click(screen.getByRole("menuitem", { name: "File" }));

    const item = await screen.findByRole("menuitem", { name: /New/ });

    expect(item).toHaveAttribute("data-slot", "menubar-item");
    expect(item).toHaveAttribute("data-variant", "default");
  });

  it("records the destructive variant", async () => {
    const user = userEvent.setup();
    renderMenubar();

    await user.click(screen.getByRole("menuitem", { name: "File" }));

    expect(
      await screen.findByRole("menuitem", { name: "Delete" }),
    ).toHaveAttribute("data-variant", "destructive");
  });

  it("marks a disabled item", async () => {
    const user = userEvent.setup();
    renderMenubar();

    await user.click(screen.getByRole("menuitem", { name: "File" }));

    expect(
      await screen.findByRole("menuitem", { name: "Archive" }),
    ).toHaveAttribute("data-disabled");
  });
});

describe("MenubarLabel, Separator and Shortcut", () => {
  it("set the correct data-slot attributes", async () => {
    const user = userEvent.setup();
    const { baseElement } = renderMenubar();

    await user.click(screen.getByRole("menuitem", { name: "File" }));
    await screen.findByText("File actions");

    expect(screen.getByText("File actions")).toHaveAttribute(
      "data-slot",
      "menubar-label",
    );
    expect(
      baseElement.querySelector("[data-slot='menubar-separator']"),
    ).toBeInTheDocument();
    expect(screen.getByText("⌘N")).toHaveAttribute(
      "data-slot",
      "menubar-shortcut",
    );
  });
});

describe("MenubarCheckboxItem and RadioItem", () => {
  it("render checkbox items with their checked state", async () => {
    const user = userEvent.setup();
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem checked>Show sidebar</MenubarCheckboxItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );

    await user.click(screen.getByRole("menuitem", { name: "View" }));

    expect(await screen.findByRole("menuitemcheckbox")).toHaveAttribute(
      "data-state",
      "checked",
    );
  });

  it("render radio items and mark the selected one", async () => {
    const user = userEvent.setup();
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Sort</MenubarTrigger>
          <MenubarContent>
            <MenubarRadioGroup value="newest">
              <MenubarRadioItem value="newest">Newest</MenubarRadioItem>
              <MenubarRadioItem value="oldest">Oldest</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );

    await user.click(screen.getByRole("menuitem", { name: "Sort" }));

    expect(
      await screen.findByRole("menuitemradio", { name: "Newest" }),
    ).toHaveAttribute("data-state", "checked");
    expect(
      screen.getByRole("menuitemradio", { name: "Oldest" }),
    ).toHaveAttribute("data-state", "unchecked");
  });
});

describe("MenubarSub", () => {
  it("renders a sub-trigger that opens a sub-menu", async () => {
    const user = userEvent.setup();
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarSub>
              <MenubarSubTrigger>Export</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>As CSV</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );

    await user.click(screen.getByRole("menuitem", { name: "File" }));

    const subTrigger = await screen.findByRole("menuitem", { name: /Export/ });

    expect(subTrigger).toHaveAttribute("data-slot", "menubar-sub-trigger");

    await user.click(subTrigger);

    expect(
      await screen.findByRole("menuitem", { name: "As CSV" }),
    ).toBeInTheDocument();
  });
});

describe("Menubar interactions", () => {
  it("opens a menu when its trigger is clicked", async () => {
    const user = userEvent.setup();
    renderMenubar();

    await user.click(screen.getByRole("menuitem", { name: "File" }));

    expect(await screen.findByText("File actions")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "File" })).toHaveAttribute(
      "data-state",
      "open",
    );
  });

  it("selects an item and closes the menu", async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    renderMenubar({ onSelect });

    await user.click(screen.getByRole("menuitem", { name: "File" }));
    await user.click(await screen.findByRole("menuitem", { name: /New/ }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("File actions")).not.toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    renderMenubar();

    await user.click(screen.getByRole("menuitem", { name: "File" }));
    await screen.findByText("File actions");

    await user.keyboard("{Escape}");

    expect(screen.queryByText("File actions")).not.toBeInTheDocument();
  });
});
