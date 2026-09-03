import { act, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "./sidebar";

const mockUseIsMobile = jest.fn(() => false);

jest.mock("../use-mobile", () => ({
  useIsMobile: () => mockUseIsMobile(),
}));

function renderSidebar(
  providerProps: {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  } = {},
  sidebarProps: {
    side?: "left" | "right";
    variant?: "sidebar" | "floating" | "inset";
    collapsible?: "offcanvas" | "icon" | "none";
  } = {},
) {
  return render(
    <SidebarProvider {...providerProps}>
      <Sidebar {...sidebarProps}>
        <SidebarHeader>Header</SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Orders</SidebarGroupLabel>
            <SidebarGroupAction>Add</SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>All orders</SidebarMenuButton>
                  <SidebarMenuBadge>12</SidebarMenuBadge>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter>Footer</SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarTrigger />
      <SidebarInset>Main content</SidebarInset>
    </SidebarProvider>,
  );
}

beforeEach(() => {
  mockUseIsMobile.mockReturnValue(false);
  document.cookie = "sidebar_state=; path=/; max-age=0";
});

describe("useSidebar", () => {
  it("throws outside a SidebarProvider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => renderHook(() => useSidebar())).toThrow(
      "useSidebar must be used within a SidebarProvider.",
    );

    spy.mockRestore();
  });

  it("reports the expanded state by default", () => {
    const { result } = renderHook(() => useSidebar(), {
      wrapper: ({ children }) => <SidebarProvider>{children}</SidebarProvider>,
    });

    expect(result.current.state).toBe("expanded");
    expect(result.current.open).toBe(true);
    expect(result.current.isMobile).toBe(false);
  });

  it("honours defaultOpen={false}", () => {
    const { result } = renderHook(() => useSidebar(), {
      wrapper: ({ children }) => (
        <SidebarProvider defaultOpen={false}>{children}</SidebarProvider>
      ),
    });

    expect(result.current.state).toBe("collapsed");
    expect(result.current.open).toBe(false);
  });

  it("toggles the desktop sidebar", () => {
    const { result } = renderHook(() => useSidebar(), {
      wrapper: ({ children }) => <SidebarProvider>{children}</SidebarProvider>,
    });

    act(() => result.current.toggleSidebar());

    expect(result.current.open).toBe(false);
    expect(result.current.state).toBe("collapsed");
  });

  it("toggles the mobile sheet instead when on mobile", () => {
    mockUseIsMobile.mockReturnValue(true);

    const { result } = renderHook(() => useSidebar(), {
      wrapper: ({ children }) => <SidebarProvider>{children}</SidebarProvider>,
    });

    act(() => result.current.toggleSidebar());

    expect(result.current.openMobile).toBe(true);
    // The desktop state is untouched.
    expect(result.current.open).toBe(true);
  });

  it("persists the state to a cookie", () => {
    const { result } = renderHook(() => useSidebar(), {
      wrapper: ({ children }) => <SidebarProvider>{children}</SidebarProvider>,
    });

    act(() => result.current.setOpen(false));

    expect(document.cookie).toContain("sidebar_state=false");
  });

  it("defers to onOpenChange when controlled", () => {
    const onOpenChange = jest.fn();
    const { result } = renderHook(() => useSidebar(), {
      wrapper: ({ children }) => (
        <SidebarProvider open onOpenChange={onOpenChange}>
          {children}
        </SidebarProvider>
      ),
    });

    act(() => result.current.toggleSidebar());

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(result.current.open).toBe(true);
  });
});

describe("SidebarProvider", () => {
  it("renders a wrapper with the sidebar width custom properties", () => {
    const { container } = renderSidebar();

    const wrapper = container.querySelector(
      "[data-slot='sidebar-wrapper']",
    ) as HTMLElement;

    expect(wrapper).toBeInTheDocument();
    expect(wrapper.style.getPropertyValue("--sidebar-width")).toBe("16rem");
    expect(wrapper.style.getPropertyValue("--sidebar-width-icon")).toBe("3rem");
  });

  it("merges a custom className with the defaults", () => {
    const { container } = render(
      <SidebarProvider className="bg-red-500">
        <div>child</div>
      </SidebarProvider>,
    );

    const wrapper = container.querySelector("[data-slot='sidebar-wrapper']");

    expect(wrapper).toHaveClass("bg-red-500");
    expect(wrapper).toHaveClass("flex");
  });

  it("toggles the sidebar on Ctrl+B", async () => {
    const user = userEvent.setup();
    const { container } = renderSidebar();

    const sidebar = container.querySelector("[data-slot='sidebar']");

    expect(sidebar).toHaveAttribute("data-state", "expanded");

    await user.keyboard("{Control>}b{/Control}");

    expect(sidebar).toHaveAttribute("data-state", "collapsed");
  });
});

describe("Sidebar", () => {
  it("renders with the expanded state and default data attributes", () => {
    const { container } = renderSidebar();

    const sidebar = container.querySelector("[data-slot='sidebar']");

    expect(sidebar).toHaveAttribute("data-state", "expanded");
    expect(sidebar).toHaveAttribute("data-side", "left");
    expect(sidebar).toHaveAttribute("data-variant", "sidebar");
  });

  it("records the right side and the floating variant", () => {
    const { container } = renderSidebar(
      {},
      { side: "right", variant: "floating" },
    );

    const sidebar = container.querySelector("[data-slot='sidebar']");

    expect(sidebar).toHaveAttribute("data-side", "right");
    expect(sidebar).toHaveAttribute("data-variant", "floating");
  });

  it("records the collapsible mode only while collapsed", () => {
    const { container: expanded } = renderSidebar({}, { collapsible: "icon" });

    expect(
      expanded.querySelector("[data-slot='sidebar']"),
    ).toHaveAttribute("data-collapsible", "");

    const { container: collapsed } = renderSidebar(
      { defaultOpen: false },
      { collapsible: "icon" },
    );

    expect(
      collapsed.querySelector("[data-slot='sidebar']"),
    ).toHaveAttribute("data-collapsible", "icon");
  });

  it("renders a plain, non-collapsible panel for collapsible='none'", () => {
    const { container } = renderSidebar({}, { collapsible: "none" });

    const sidebar = container.querySelector("[data-slot='sidebar']");

    expect(sidebar).toHaveClass("bg-sidebar");
    expect(sidebar).toHaveClass("flex-col");
    expect(sidebar).not.toHaveAttribute("data-state");
  });

  it("renders its children", () => {
    renderSidebar();

    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("renders a Sheet on mobile only once opened", async () => {
    mockUseIsMobile.mockReturnValue(true);
    const user = userEvent.setup();

    renderSidebar();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Toggle Sidebar" }));

    const sheet = await screen.findByRole("dialog");

    expect(sheet).toHaveAttribute("data-mobile", "true");
    expect(sheet).toHaveAttribute("data-slot", "sidebar");
  });
});

describe("SidebarTrigger and SidebarRail", () => {
  it("render with screen-reader labels", () => {
    const { container } = renderSidebar();

    // Both the trigger and the rail expose the same "Toggle Sidebar" name.
    expect(
      screen.getAllByRole("button", { name: "Toggle Sidebar" }),
    ).toHaveLength(2);
    expect(
      container.querySelector("[data-slot='sidebar-trigger']"),
    ).toBeInTheDocument();
    expect(
      container.querySelector("[data-slot='sidebar-rail']"),
    ).toHaveAttribute("aria-label", "Toggle Sidebar");
  });

  it("toggle the sidebar when the trigger is clicked", async () => {
    const user = userEvent.setup();
    const { container } = renderSidebar();

    const sidebar = container.querySelector("[data-slot='sidebar']");

    await user.click(
      container.querySelector(
        "[data-slot='sidebar-trigger']",
      ) as HTMLElement,
    );

    expect(sidebar).toHaveAttribute("data-state", "collapsed");
  });

  it("still call a caller-supplied onClick on the trigger", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>content</SidebarContent>
        </Sidebar>
        <SidebarTrigger onClick={onClick} />
      </SidebarProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Toggle Sidebar" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("keep the rail out of the tab order", () => {
    const { container } = renderSidebar();

    expect(container.querySelector("[data-slot='sidebar-rail']")).toHaveAttribute(
      "tabindex",
      "-1",
    );
  });
});

describe("Sidebar layout parts", () => {
  it("set the correct data-slot and data-sidebar attributes", () => {
    const { container } = renderSidebar();

    const pairs: Array<[string, string]> = [
      ["sidebar-header", "header"],
      ["sidebar-content", "content"],
      ["sidebar-footer", "footer"],
      ["sidebar-separator", "separator"],
      ["sidebar-group", "group"],
      ["sidebar-group-label", "group-label"],
      ["sidebar-group-action", "group-action"],
      ["sidebar-group-content", "group-content"],
      ["sidebar-menu", "menu"],
      ["sidebar-menu-item", "menu-item"],
      ["sidebar-menu-button", "menu-button"],
      ["sidebar-menu-badge", "menu-badge"],
    ];

    pairs.forEach(([slot, sidebarAttr]) => {
      const element = container.querySelector(`[data-slot='${slot}']`);

      expect(element).toBeInTheDocument();
      expect(element).toHaveAttribute("data-sidebar", sidebarAttr);
    });
  });

  it("render SidebarInset as a main landmark", () => {
    renderSidebar();

    const inset = screen.getByRole("main");

    expect(inset).toHaveAttribute("data-slot", "sidebar-inset");
    expect(inset).toHaveClass("flex-1");
  });

  it("render SidebarMenu as a list of items", () => {
    const { container } = renderSidebar();

    expect(container.querySelector("[data-slot='sidebar-menu']")?.tagName).toBe(
      "UL",
    );
    expect(
      container.querySelector("[data-slot='sidebar-menu-item']")?.tagName,
    ).toBe("LI");
  });

  it("render SidebarInput with the sidebar input slot", () => {
    const { container } = render(
      <SidebarProvider>
        <SidebarInput placeholder="Search" />
      </SidebarProvider>,
    );

    const input = container.querySelector("[data-slot='sidebar-input']");

    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("data-sidebar", "input");
  });
});

describe("SidebarMenuButton", () => {
  function renderButton(
    props: Partial<React.ComponentProps<typeof SidebarMenuButton>> = {},
    providerProps: { defaultOpen?: boolean } = {},
  ) {
    return render(
      <SidebarProvider {...providerProps}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton {...props}>All orders</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarProvider>,
    );
  }

  it("applies the default variant and size", () => {
    renderButton();

    const button = screen.getByRole("button", { name: "All orders" });

    expect(button).toHaveAttribute("data-size", "default");
    expect(button).toHaveAttribute("data-active", "false");
    expect(button).toHaveClass("h-8");
  });

  it("records the active state", () => {
    renderButton({ isActive: true });

    expect(screen.getByRole("button", { name: "All orders" })).toHaveAttribute(
      "data-active",
      "true",
    );
  });

  it("applies the outline variant", () => {
    renderButton({ variant: "outline" });

    expect(screen.getByRole("button", { name: "All orders" })).toHaveClass(
      "bg-background",
    );
  });

  it.each([
    ["sm", "h-7"],
    ["lg", "h-12"],
  ] as const)("applies the %s size", (size, expectedClass) => {
    renderButton({ size });

    expect(screen.getByRole("button", { name: "All orders" })).toHaveClass(
      expectedClass,
    );
  });

  it("renders as the child element when asChild is set", () => {
    render(
      <SidebarProvider>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/orders">All orders</a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarProvider>,
    );

    const link = screen.getByRole("link", { name: "All orders" });

    expect(link).toHaveAttribute("data-slot", "sidebar-menu-button");
  });

  it("merges a custom className with the variant classes", () => {
    renderButton({ className: "font-bold" });

    const button = screen.getByRole("button", { name: "All orders" });

    expect(button).toHaveClass("font-bold");
    expect(button).toHaveClass("rounded-md");
  });

  it("wraps the button in a tooltip when a tooltip string is given", async () => {
    const user = userEvent.setup();
    renderButton({ tooltip: "All orders" }, { defaultOpen: false });

    await user.hover(screen.getByRole("button", { name: "All orders" }));

    expect(await screen.findByRole("tooltip")).toBeInTheDocument();
  });

  it("hides the tooltip while the sidebar is expanded", async () => {
    const user = userEvent.setup();
    const { baseElement } = renderButton({ tooltip: "All orders" });

    await user.hover(screen.getByRole("button", { name: "All orders" }));

    const content = baseElement.querySelector(
      "[data-slot='tooltip-content']",
    );

    expect(content === null || content.hasAttribute("hidden")).toBe(true);
  });
});

describe("SidebarMenuAction, SidebarMenuBadge and SidebarMenuSkeleton", () => {
  it("set their data attributes", () => {
    const { container } = render(
      <SidebarProvider>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>All orders</SidebarMenuButton>
            <SidebarMenuAction>Add</SidebarMenuAction>
            <SidebarMenuBadge>12</SidebarMenuBadge>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuSkeleton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarProvider>,
    );

    expect(
      container.querySelector("[data-slot='sidebar-menu-action']"),
    ).toHaveAttribute("data-sidebar", "menu-action");
    expect(
      container.querySelector("[data-slot='sidebar-menu-badge']"),
    ).toHaveAttribute("data-sidebar", "menu-badge");
    expect(
      container.querySelector("[data-slot='sidebar-menu-skeleton']"),
    ).toHaveAttribute("data-sidebar", "menu-skeleton");
  });

  it("renders a skeleton icon only when asked", () => {
    const { container, rerender } = render(
      <SidebarProvider>
        <SidebarMenuSkeleton />
      </SidebarProvider>,
    );

    expect(
      container.querySelector("[data-sidebar='menu-skeleton-icon']"),
    ).toBeNull();

    rerender(
      <SidebarProvider>
        <SidebarMenuSkeleton showIcon />
      </SidebarProvider>,
    );

    expect(
      container.querySelector("[data-sidebar='menu-skeleton-icon']"),
    ).toBeInTheDocument();
  });
});

describe("SidebarMenuSub", () => {
  it("sets the correct data attributes on the sub menu parts", () => {
    const { container } = render(
      <SidebarProvider>
        <SidebarMenuSub>
          <SidebarMenuSubItem>
            <SidebarMenuSubButton>Active</SidebarMenuSubButton>
          </SidebarMenuSubItem>
        </SidebarMenuSub>
      </SidebarProvider>,
    );

    expect(
      container.querySelector("[data-slot='sidebar-menu-sub']"),
    ).toHaveAttribute("data-sidebar", "menu-sub");
    expect(
      container.querySelector("[data-slot='sidebar-menu-sub-item']"),
    ).toHaveAttribute("data-sidebar", "menu-sub-item");
    expect(
      container.querySelector("[data-slot='sidebar-menu-sub-button']"),
    ).toHaveAttribute("data-sidebar", "menu-sub-button");
  });

  it("marks an active sub button", () => {
    const { container } = render(
      <SidebarProvider>
        <SidebarMenuSub>
          <SidebarMenuSubItem>
            <SidebarMenuSubButton isActive>Active</SidebarMenuSubButton>
          </SidebarMenuSubItem>
        </SidebarMenuSub>
      </SidebarProvider>,
    );

    expect(
      container.querySelector("[data-slot='sidebar-menu-sub-button']"),
    ).toHaveAttribute("data-active", "true");
  });
});
