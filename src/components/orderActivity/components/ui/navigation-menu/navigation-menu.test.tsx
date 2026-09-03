import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from "./navigation-menu";

function renderNavigationMenu(props: { viewport?: boolean } = {}) {
  return render(
    <NavigationMenu {...props}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Orders</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="/orders/active">
              Active orders
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="/reports">Reports</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>,
  );
}

describe("NavigationMenu", () => {
  it("renders with the navigation role and correct data-slot", () => {
    renderNavigationMenu();

    const nav = screen.getByRole("navigation");

    expect(nav).toBeInTheDocument();
    expect(nav).toHaveAttribute("data-slot", "navigation-menu");
  });

  it("applies the default classes", () => {
    renderNavigationMenu();

    const nav = screen.getByRole("navigation");

    expect(nav).toHaveClass("relative");
    expect(nav).toHaveClass("flex");
    expect(nav).toHaveClass("max-w-max");
  });

  it("records the viewport flag, on by default", () => {
    renderNavigationMenu();

    expect(screen.getByRole("navigation")).toHaveAttribute(
      "data-viewport",
      "true",
    );
  });

  it("mounts the viewport once a menu opens", async () => {
    const user = userEvent.setup();
    const { container } = renderNavigationMenu();

    // Radix only mounts the viewport while a menu is open.
    expect(
      container.querySelector("[data-slot='navigation-menu-viewport']"),
    ).toBeNull();

    await user.click(screen.getByRole("button", { name: /Orders/ }));
    await screen.findByText("Active orders");

    expect(
      container.querySelector("[data-slot='navigation-menu-viewport']"),
    ).toBeInTheDocument();
  });

  it("never mounts a viewport when disabled", async () => {
    const user = userEvent.setup();
    const { container } = renderNavigationMenu({ viewport: false });

    expect(screen.getByRole("navigation")).toHaveAttribute(
      "data-viewport",
      "false",
    );

    await user.click(screen.getByRole("button", { name: /Orders/ }));
    await screen.findByText("Active orders");

    expect(
      container.querySelector("[data-slot='navigation-menu-viewport']"),
    ).toBeNull();
  });

  it("merges a custom className with the defaults", () => {
    render(
      <NavigationMenu className="w-full">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="/reports">Reports</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    expect(screen.getByRole("navigation")).toHaveClass("w-full");
    expect(screen.getByRole("navigation")).toHaveClass("relative");
  });
});

describe("NavigationMenuList and NavigationMenuItem", () => {
  it("render a list of items", () => {
    renderNavigationMenu();

    expect(screen.getByRole("list")).toHaveAttribute(
      "data-slot",
      "navigation-menu-list",
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("apply their default classes", () => {
    renderNavigationMenu();

    expect(screen.getByRole("list")).toHaveClass("flex");
    expect(screen.getByRole("list")).toHaveClass("list-none");
    expect(screen.getAllByRole("listitem")[0]).toHaveClass("relative");
  });

  it("set the correct data-slot on each item", () => {
    renderNavigationMenu();

    screen.getAllByRole("listitem").forEach((item) => {
      expect(item).toHaveAttribute("data-slot", "navigation-menu-item");
    });
  });
});

describe("NavigationMenuTrigger", () => {
  it("renders with the correct data-slot", () => {
    renderNavigationMenu();

    const trigger = screen.getByRole("button", { name: /Orders/ });

    expect(trigger).toHaveAttribute("data-slot", "navigation-menu-trigger");
  });

  it("applies the shared trigger style", () => {
    renderNavigationMenu();

    const trigger = screen.getByRole("button", { name: /Orders/ });

    expect(trigger).toHaveClass("h-9");
    expect(trigger).toHaveClass("rounded-md");
    expect(trigger).toHaveClass("font-medium");
  });

  it("renders a decorative chevron", () => {
    renderNavigationMenu();

    const chevron = screen
      .getByRole("button", { name: /Orders/ })
      .querySelector("svg");

    expect(chevron).toBeInTheDocument();
    expect(chevron).toHaveAttribute("aria-hidden", "true");
  });

  it("reports the closed state", () => {
    renderNavigationMenu();

    expect(screen.getByRole("button", { name: /Orders/ })).toHaveAttribute(
      "data-state",
      "closed",
    );
  });
});

describe("NavigationMenuLink", () => {
  it("renders an anchor with the correct data-slot", () => {
    renderNavigationMenu();

    const link = screen.getByRole("link", { name: "Reports" });

    expect(link).toHaveAttribute("href", "/reports");
    expect(link).toHaveAttribute("data-slot", "navigation-menu-link");
  });

  it("marks the active link", () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="/reports" active>
              Reports
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    const link = screen.getByRole("link", { name: "Reports" });

    // Radix emits data-active as a bare presence attribute, not "true".
    expect(link).toHaveAttribute("data-active", "");
    expect(link).toHaveAttribute("aria-current", "page");
  });

  it("merges a custom className with the defaults", () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="/reports" className="font-bold">
              Reports
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    expect(screen.getByRole("link", { name: "Reports" })).toHaveClass(
      "font-bold",
    );
  });
});

describe("NavigationMenuViewport", () => {
  it("sets the correct data-slot and classes once mounted", async () => {
    const user = userEvent.setup();
    const { container } = renderNavigationMenu();

    await user.click(screen.getByRole("button", { name: /Orders/ }));
    await screen.findByText("Active orders");

    const viewport = container.querySelector(
      "[data-slot='navigation-menu-viewport']",
    );

    expect(viewport).toBeInTheDocument();
    expect(viewport).toHaveClass("bg-popover");
    expect(viewport).toHaveClass("rounded-md");
  });

  it("can be composed standalone alongside viewport={false}", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <NavigationMenu viewport={false}>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Orders</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="/orders/active">
                Active orders
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuViewport />
      </NavigationMenu>,
    );

    await user.click(screen.getByRole("button", { name: /Orders/ }));
    await screen.findByText("Active orders");

    expect(
      container.querySelector("[data-slot='navigation-menu-viewport']"),
    ).toBeInTheDocument();
  });
});

describe("NavigationMenu interactions", () => {
  it("is closed initially", () => {
    renderNavigationMenu();

    expect(screen.queryByText("Active orders")).not.toBeInTheDocument();
  });

  it("opens the content when the trigger is clicked", async () => {
    const user = userEvent.setup();
    renderNavigationMenu();

    await user.click(screen.getByRole("button", { name: /Orders/ }));

    expect(await screen.findByText("Active orders")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Orders/ })).toHaveAttribute(
      "data-state",
      "open",
    );
  });

  it("sets the correct data-slot on the opened content", async () => {
    const user = userEvent.setup();
    const { container } = renderNavigationMenu();

    await user.click(screen.getByRole("button", { name: /Orders/ }));
    await screen.findByText("Active orders");

    expect(
      container.querySelector("[data-slot='navigation-menu-content']"),
    ).toBeInTheDocument();
  });

  it("calls onValueChange when a menu opens", async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    render(
      <NavigationMenu onValueChange={onValueChange}>
        <NavigationMenuList>
          <NavigationMenuItem value="orders">
            <NavigationMenuTrigger>Orders</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="/orders/active">
                Active orders
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    await user.click(screen.getByRole("button", { name: /Orders/ }));

    expect(onValueChange).toHaveBeenCalledWith("orders");
  });
});

describe("navigationMenuTriggerStyle", () => {
  it("returns the shared trigger classes", () => {
    const classes = navigationMenuTriggerStyle();

    expect(classes).toContain("h-9");
    expect(classes).toContain("rounded-md");
    expect(classes).toContain("bg-background");
  });
});
