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
  it("renders a region with the carousel roledescription", () => {
    renderCarousel();

    const region = screen.getByRole("region");

    expect(region).toHaveAttribute("aria-roledescription", "carousel");
    expect(region).toHaveAttribute("data-slot", "carousel");
  });

  it("applies the default classes", () => {
    renderCarousel();

    expect(screen.getByRole("region")).toHaveClass("relative");
  });

  it("merges a custom className with the defaults", () => {
    renderCarousel({ className: "w-full" });

    expect(screen.getByRole("region")).toHaveClass("w-full");
    expect(screen.getByRole("region")).toHaveClass("relative");
  });

  it("hands the embla api to setApi", () => {
    const setApi = jest.fn();
    renderCarousel({ setApi });

    expect(setApi).toHaveBeenCalledWith(
      expect.objectContaining({ scrollNext: expect.any(Function) }),
    );
  });

  it("subscribes to embla select and reInit events", () => {
    renderCarousel();

    expect(on).toHaveBeenCalledWith("reInit", expect.any(Function));
    expect(on).toHaveBeenCalledWith("select", expect.any(Function));
  });

  it("unsubscribes from select on unmount", () => {
    const { unmount } = renderCarousel();

    unmount();

    expect(off).toHaveBeenCalledWith("select", expect.any(Function));
  });

  it("throws when its parts are used outside a Carousel", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<CarouselItem>Slide</CarouselItem>)).toThrow(
      "useCarousel must be used within a <Carousel />",
    );

    spy.mockRestore();
  });
});

describe("CarouselContent", () => {
  it("sets the correct data-slot attribute", () => {
    const { container } = renderCarousel();

    expect(
      container.querySelector("[data-slot='carousel-content']"),
    ).toBeInTheDocument();
  });

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

  it("lays the track out vertically when asked", () => {
    const { container } = renderCarousel({ orientation: "vertical" });

    const track = container.querySelector("[data-slot='carousel-content']")
      ?.firstElementChild;

    expect(track).toHaveClass("-mt-4");
    expect(track).toHaveClass("flex-col");
  });
});

describe("CarouselItem", () => {
  it("renders each slide as a group with the slide roledescription", () => {
    renderCarousel();

    const slides = screen.getAllByRole("group");

    expect(slides).toHaveLength(2);
    slides.forEach((slide) => {
      expect(slide).toHaveAttribute("aria-roledescription", "slide");
      expect(slide).toHaveAttribute("data-slot", "carousel-item");
    });
  });

  it("renders slide content", () => {
    renderCarousel();

    expect(screen.getByText("Slide one")).toBeInTheDocument();
    expect(screen.getByText("Slide two")).toBeInTheDocument();
  });

  it("applies the horizontal padding by default", () => {
    renderCarousel();

    expect(screen.getByText("Slide one")).toHaveClass("pl-4");
    expect(screen.getByText("Slide one")).toHaveClass("basis-full");
  });

  it("applies the vertical padding when the carousel is vertical", () => {
    renderCarousel({ orientation: "vertical" });

    expect(screen.getByText("Slide one")).toHaveClass("pt-4");
  });
});

describe("CarouselPrevious and CarouselNext", () => {
  it("render with screen-reader labels and correct data-slots", () => {
    renderCarousel();

    const previous = screen.getByRole("button", { name: "Previous slide" });
    const next = screen.getByRole("button", { name: "Next slide" });

    expect(previous).toHaveAttribute("data-slot", "carousel-previous");
    expect(next).toHaveAttribute("data-slot", "carousel-next");
  });

  it("use the outline icon button styling", () => {
    renderCarousel();

    const next = screen.getByRole("button", { name: "Next slide" });

    expect(next).toHaveClass("rounded-full");
    expect(next).toHaveClass("size-8");
    expect(next).toHaveClass("border");
  });

  it("position themselves for a horizontal carousel", () => {
    renderCarousel();

    expect(screen.getByRole("button", { name: "Previous slide" })).toHaveClass(
      "-left-12",
    );
    expect(screen.getByRole("button", { name: "Next slide" })).toHaveClass(
      "-right-12",
    );
  });

  it("position themselves for a vertical carousel", () => {
    renderCarousel({ orientation: "vertical" });

    expect(screen.getByRole("button", { name: "Previous slide" })).toHaveClass(
      "-top-12",
    );
    expect(screen.getByRole("button", { name: "Next slide" })).toHaveClass(
      "-bottom-12",
    );
  });

  it("disable themselves according to the embla api", () => {
    renderCarousel();

    expect(screen.getByRole("button", { name: "Previous slide" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Next slide" }),
    ).not.toBeDisabled();
  });

  it("enable previous once embla reports it can scroll back", () => {
    canScrollPrev = true;
    renderCarousel();

    expect(
      screen.getByRole("button", { name: "Previous slide" }),
    ).not.toBeDisabled();
  });

  it("call scrollNext when next is clicked", async () => {
    const user = userEvent.setup();
    renderCarousel();

    await user.click(screen.getByRole("button", { name: "Next slide" }));

    expect(scrollNext).toHaveBeenCalledTimes(1);
  });

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
  it("scrolls forward on ArrowRight", () => {
    renderCarousel();

    fireEvent.keyDown(screen.getByRole("region"), { key: "ArrowRight" });

    expect(scrollNext).toHaveBeenCalledTimes(1);
  });

  it("scrolls back on ArrowLeft", () => {
    canScrollPrev = true;
    renderCarousel();

    fireEvent.keyDown(screen.getByRole("region"), { key: "ArrowLeft" });

    expect(scrollPrev).toHaveBeenCalledTimes(1);
  });

  it("ignores unrelated keys", () => {
    renderCarousel();

    fireEvent.keyDown(screen.getByRole("region"), { key: "ArrowDown" });

    expect(scrollNext).not.toHaveBeenCalled();
    expect(scrollPrev).not.toHaveBeenCalled();
  });
});
