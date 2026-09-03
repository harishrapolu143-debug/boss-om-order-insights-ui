import '@testing-library/jest-dom'

// jsdom implements neither of these, but the Radix primitives and Recharts used
// across the UI components call them during layout effects. Without the stubs
// the components throw on render rather than failing a meaningful assertion.

if (!('ResizeObserver' in globalThis)) {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver =
    ResizeObserverStub as unknown as typeof ResizeObserver
}

if (!('DOMRect' in globalThis)) {
  class DOMRectStub {
    constructor(
      public x = 0,
      public y = 0,
      public width = 0,
      public height = 0,
    ) {}
    get top() {
      return this.y
    }
    get left() {
      return this.x
    }
    get right() {
      return this.x + this.width
    }
    get bottom() {
      return this.y + this.height
    }
    toJSON() {
      return { ...this }
    }
    static fromRect(rect?: DOMRectInit) {
      return new DOMRectStub(rect?.x, rect?.y, rect?.width, rect?.height)
    }
  }
  globalThis.DOMRect = DOMRectStub as unknown as typeof DOMRect
}

// Radix menu/select primitives probe these Element APIs, which jsdom omits.
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {}
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {}
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}

// input-otp probes this when sniffing for a password-manager badge overlay.
if (!document.elementFromPoint) {
  document.elementFromPoint = () => null
}

// use-mobile and the Sidebar read matchMedia on mount.
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}
