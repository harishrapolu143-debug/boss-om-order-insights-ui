import { act, renderHook } from "@testing-library/react";

import { useIsMobile } from "./use-mobile";

const MOBILE_BREAKPOINT = 768;

type ChangeHandler = () => void;

/**
 * Replaces window.matchMedia with a stub that records its change listeners, so
 * a test can simulate a viewport crossing the breakpoint.
 */
function stubMatchMedia() {
  const listeners = new Set<ChangeHandler>();

  const addEventListener = jest.fn(
    (_event: string, handler: ChangeHandler) => void listeners.add(handler),
  );
  const removeEventListener = jest.fn(
    (_event: string, handler: ChangeHandler) => void listeners.delete(handler),
  );

  const matchMedia = jest.fn((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener,
    removeEventListener,
    dispatchEvent: jest.fn(),
  }));

  window.matchMedia = matchMedia as unknown as typeof window.matchMedia;

  return {
    matchMedia,
    addEventListener,
    removeEventListener,
    fireChange: () => listeners.forEach((handler) => handler()),
  };
}

function setWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    value: width,
    configurable: true,
    writable: true,
  });
}

describe("useIsMobile", () => {
  const originalMatchMedia = window.matchMedia;
  const originalWidth = window.innerWidth;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    setWidth(originalWidth);
    jest.restoreAllMocks();
  });

  it("reports false for a desktop width", () => {
    stubMatchMedia();
    setWidth(1280);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it("reports true below the breakpoint", () => {
    stubMatchMedia();
    setWidth(375);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it("treats the breakpoint itself as desktop", () => {
    stubMatchMedia();
    setWidth(MOBILE_BREAKPOINT);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it("treats one pixel below the breakpoint as mobile", () => {
    stubMatchMedia();
    setWidth(MOBILE_BREAKPOINT - 1);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it("queries matchMedia with the breakpoint", () => {
    const { matchMedia } = stubMatchMedia();
    setWidth(1280);

    renderHook(() => useIsMobile());

    expect(matchMedia).toHaveBeenCalledWith(
      `(max-width: ${MOBILE_BREAKPOINT - 1}px)`,
    );
  });

  it("updates when the viewport crosses the breakpoint", () => {
    const { fireChange } = stubMatchMedia();
    setWidth(1280);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);

    act(() => {
      setWidth(400);
      fireChange();
    });

    expect(result.current).toBe(true);
  });

  it("subscribes on mount and unsubscribes on unmount", () => {
    const { addEventListener, removeEventListener } = stubMatchMedia();
    setWidth(1280);

    const { unmount } = renderHook(() => useIsMobile());

    expect(addEventListener).toHaveBeenCalledWith("change", expect.any(Function));
    expect(removeEventListener).not.toHaveBeenCalled();

    unmount();

    expect(removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });

  it("always returns a boolean, never the initial undefined state", () => {
    stubMatchMedia();
    setWidth(1280);

    const { result } = renderHook(() => useIsMobile());

    expect(typeof result.current).toBe("boolean");
  });
});
