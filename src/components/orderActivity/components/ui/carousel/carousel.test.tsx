import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "./carousel";

// Embla measures real layout, which jsdom never provides, so it reports no
// scrollable slides. A controllable fake keeps the wiring assertable.
const scrollPrev = jest.fn();
const scrollNext = jest.fn();
const on = jest.fn();
const off = jest.fn();
let canScrollPrev = false;
let canScrollNext = true;

jest.mock("embla-carousel-react", () => ({
  __esModule: true,
  default: () => [
    jest.fn(),
    {
      scrollPrev,
      scrollNext,
      canScrollPrev: () => canScrollPrev,
      canScrollNext: () => canScrollNext,
      on,
      off,
    },
  ],
}));

function renderCarousel(
  props: {
    orientation?: "horizontal" | "vertical";
    className?: string;
    setApi?: (api: CarouselApi) => void;
  } = {},
) {
  return render(
    <Carousel {...props}>
      <CarouselContent>
        <CarouselItem>Slide one</CarouselItem>
        <CarouselItem>Slide two</CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  canScrollPrev = false;
  canScrollNext = true;
});

describe("Carousel", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * renders a region with the carousel roledescription.
   */
  it("renders a region with the carousel roledescription", () => {
    renderCarousel();

    const region = screen.getByRole("region");

    expect(region).toHaveAttribute("aria-roledescription", "carousel");
    expect(region).toHaveAttribute("data-slot", "carousel");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * applies the default classes.
   */
  it("applies the default classes", () => {
    renderCarousel();

    expect(screen.getByRole("region")).toHaveClass("relative");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * merges a custom className with the defaults.
   */
  it("merges a custom className with the defaults", () => {
    renderCarousel({ className: "w-full" });

    expect(screen.getByRole("region")).toHaveClass("w-full");
    expect(screen.getByRole("region")).toHaveClass("relative");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * hands the embla api to setApi.
   */
  it("hands the embla api to setApi", () => {
    const setApi = jest.fn();
    renderCarousel({ setApi });

    expect(setApi).toHaveBeenCalledWith(
      expect.objectContaining({ scrollNext: expect.any(Function) }),
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * subscribes to embla select and reInit events.
   */
  it("subscribes to embla select and reInit events", () => {
    renderCarousel();

    expect(on).toHaveBeenCalledWith("reInit", expect.any(Function));
    expect(on).toHaveBeenCalledWith("select", expect.any(Function));
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * unsubscribes from select on unmount.
   */
  it("unsubscribes from select on unmount", () => {
    const { unmount } = renderCarousel();

    unmount();

    expect(off).toHaveBeenCalledWith("select", expect.any(Function));
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * throws when its parts are used outside a Carousel.
   */
  it("throws when its parts are used outside a Carousel", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<CarouselItem>Slide</CarouselItem>)).toThrow(
      "useCarousel must be used within a <Carousel />",
    );

    spy.mockRestore();
  });
});

describe("CarouselContent", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * sets the correct data-slot attribute.
   */
  it("sets the correct data-slot attribute", () => {
    const { container } = renderCarousel();

    expect(
      container.querySelector("[data-slot='carousel-content']"),
    ).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * clips the viewport and lays the track out horizontally by default.
   */
  it("clips the viewport and lays the track out horizontally by default", () => {
    const { container } = renderCarousel();

    const viewport = container.querySelector(
      "[data-slot='carousel-content']",
    ) as HTMLElement;
    const track = viewport.firstElementChild;

    expect(viewport).toHaveClass("overflow-hidden");
    expect(track).toHaveClass("flex");
    expect(track).toHaveClass("-ml-4");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * lays the track out vertically when asked.
   */
  it("lays the track out vertically when asked", () => {
    const { container } = renderCarousel({ orientation: "vertical" });

    const track = container.querySelector("[data-slot='carousel-content']")
      ?.firstElementChild;

    expect(track).toHaveClass("-mt-4");
    expect(track).toHaveClass("flex-col");
  });
});

describe("CarouselItem", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * renders each slide as a group with the slide roledescription.
   */
  it("renders each slide as a group with the slide roledescription", () => {
    renderCarousel();

    const slides = screen.getAllByRole("group");

    expect(slides).toHaveLength(2);
    slides.forEach((slide) => {
      expect(slide).toHaveAttribute("aria-roledescription", "slide");
      expect(slide).toHaveAttribute("data-slot", "carousel-item");
    });
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * renders slide content.
   */
  it("renders slide content", () => {
    renderCarousel();

    expect(screen.getByText("Slide one")).toBeInTheDocument();
    expect(screen.getByText("Slide two")).toBeInTheDocument();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * applies the horizontal padding by default.
   */
  it("applies the horizontal padding by default", () => {
    renderCarousel();

    expect(screen.getByText("Slide one")).toHaveClass("pl-4");
    expect(screen.getByText("Slide one")).toHaveClass("basis-full");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * applies the vertical padding when the carousel is vertical.
   */
  it("applies the vertical padding when the carousel is vertical", () => {
    renderCarousel({ orientation: "vertical" });

    expect(screen.getByText("Slide one")).toHaveClass("pt-4");
  });
});

describe("CarouselPrevious and CarouselNext", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * render with screen-reader labels and correct data-slots.
   */
  it("render with screen-reader labels and correct data-slots", () => {
    renderCarousel();

    const previous = screen.getByRole("button", { name: "Previous slide" });
    const next = screen.getByRole("button", { name: "Next slide" });

    expect(previous).toHaveAttribute("data-slot", "carousel-previous");
    expect(next).toHaveAttribute("data-slot", "carousel-next");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * use the outline icon button styling.
   */
  it("use the outline icon button styling", () => {
    renderCarousel();

    const next = screen.getByRole("button", { name: "Next slide" });

    expect(next).toHaveClass("rounded-full");
    expect(next).toHaveClass("size-8");
    expect(next).toHaveClass("border");
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * position themselves for a horizontal carousel.
   */
  it("position themselves for a horizontal carousel", () => {
    renderCarousel();

    expect(screen.getByRole("button", { name: "Previous slide" })).toHaveClass(
      "-left-12",
    );
    expect(screen.getByRole("button", { name: "Next slide" })).toHaveClass(
      "-right-12",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * position themselves for a vertical carousel.
   */
  it("position themselves for a vertical carousel", () => {
    renderCarousel({ orientation: "vertical" });

    expect(screen.getByRole("button", { name: "Previous slide" })).toHaveClass(
      "-top-12",
    );
    expect(screen.getByRole("button", { name: "Next slide" })).toHaveClass(
      "-bottom-12",
    );
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * disable themselves according to the embla api.
   */
  it("disable themselves according to the embla api", () => {
    renderCarousel();

    expect(screen.getByRole("button", { name: "Previous slide" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Next slide" }),
    ).not.toBeDisabled();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * enable previous once embla reports it can scroll back.
   */
  it("enable previous once embla reports it can scroll back", () => {
    canScrollPrev = true;
    renderCarousel();

    expect(
      screen.getByRole("button", { name: "Previous slide" }),
    ).not.toBeDisabled();
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * call scrollNext when next is clicked.
   */
  it("call scrollNext when next is clicked", async () => {
    const user = userEvent.setup();
    renderCarousel();

    await user.click(screen.getByRole("button", { name: "Next slide" }));

    expect(scrollNext).toHaveBeenCalledTimes(1);
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * call scrollPrev when previous is clicked.
   */
  it("call scrollPrev when previous is clicked", async () => {
    const user = userEvent.setup();
    canScrollPrev = true;
    renderCarousel();

    await user.click(screen.getByRole("button", { name: "Previous slide" }));

    expect(scrollPrev).toHaveBeenCalledTimes(1);
  });
});

// The region carries onKeyDownCapture but no tabIndex, so it cannot take focus.
// Dispatching straight at it is what actually exercises the handler.
describe("Carousel keyboard navigation", () => {
  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * scrolls forward on ArrowRight.
   */
  it("scrolls forward on ArrowRight", () => {
    renderCarousel();

    fireEvent.keyDown(screen.getByRole("region"), { key: "ArrowRight" });

    expect(scrollNext).toHaveBeenCalledTimes(1);
  });

  /**
   * --------------------------------------------------------------------------
   * Positive Scenario
   * --------------------------------------------------------------------------
   * scrolls back on ArrowLeft.
   */
  it("scrolls back on ArrowLeft", () => {
    canScrollPrev = true;
    renderCarousel();

    fireEvent.keyDown(screen.getByRole("region"), { key: "ArrowLeft" });

    expect(scrollPrev).toHaveBeenCalledTimes(1);
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * ignores unrelated keys.
   */
  it("ignores unrelated keys", () => {
    renderCarousel();

    fireEvent.keyDown(screen.getByRole("region"), { key: "ArrowDown" });

    expect(scrollNext).not.toHaveBeenCalled();
    expect(scrollPrev).not.toHaveBeenCalled();
  });
});

/**
 * ============================================================================
 * Carousel - additional negative scenarios
 * ============================================================================
 */
describe("Carousel negative scenarios", () => {
  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A disabled previous control must not ask embla to scroll.
   */
  it("does not scroll back while previous is disabled", async () => {
    const user = userEvent.setup();

    canScrollPrev = false;

    renderCarousel();

    await user.click(
      screen.getByRole("button", {
        name: /previous slide/i,
      }),
    );

    expect(scrollPrev).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A disabled next control must not ask embla to scroll.
   */
  it("does not scroll forward while next is disabled", async () => {
    const user = userEvent.setup();

    canScrollNext = false;

    renderCarousel();

    await user.click(
      screen.getByRole("button", {
        name: /next slide/i,
      }),
    );

    expect(scrollNext).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A horizontal carousel must NOT carry the vertical track classes.
   */
  it("does not apply the vertical track classes when horizontal", () => {
    const { container } = renderCarousel();

    const track = container.querySelector(
      "[data-slot='carousel-content']",
    )?.firstElementChild;

    expect(track).toHaveClass("-ml-4");
    expect(track).not.toHaveClass("-mt-4");
    expect(track).not.toHaveClass("flex-col");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A vertical carousel must NOT carry the horizontal track classes.
   */
  it("does not apply the horizontal track classes when vertical", () => {
    const { container } = renderCarousel({
      orientation: "vertical",
    });

    const track = container.querySelector(
      "[data-slot='carousel-content']",
    )?.firstElementChild;

    expect(track).toHaveClass("-mt-4");
    expect(track).not.toHaveClass("-ml-4");
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * Arrow keys along the unused axis must not move the carousel.
   */
  it("does not scroll on the arrow keys of the other axis", () => {
    const { container } = renderCarousel();

    const region = container.querySelector(
      "[data-slot='carousel']",
    ) as HTMLElement;

    fireEvent.keyDown(region, { key: "ArrowUp" });
    fireEvent.keyDown(region, { key: "ArrowDown" });

    expect(scrollPrev).not.toHaveBeenCalled();
    expect(scrollNext).not.toHaveBeenCalled();
  });

  /**
   * --------------------------------------------------------------------------
   * Negative Scenario
   * --------------------------------------------------------------------------
   * A carousel with no slides must not invent any.
   */
  it("does not render slides that were not supplied", () => {
    const { container } = render(
      <Carousel>
        <CarouselContent />
      </Carousel>,
    );

    expect(
      container.querySelector(
        "[data-slot='carousel-item']",
      ),
    ).not.toBeInTheDocument();
  });
});
