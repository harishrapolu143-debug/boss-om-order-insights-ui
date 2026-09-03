import { cn } from "./utils";

describe("cn", () => {
  it("joins plain class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("ignores falsy values", () => {
    expect(cn("a", false, null, undefined, "", "b")).toBe("a b");
  });

  it("supports conditional object syntax", () => {
    expect(cn("base", { active: true, hidden: false })).toBe("base active");
  });

  it("flattens arrays", () => {
    expect(cn(["a", "b"], "c")).toBe("a b c");
  });

  it("returns an empty string when given nothing", () => {
    expect(cn()).toBe("");
  });

  it("lets a later Tailwind class win over an earlier conflicting one", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("keeps non-conflicting Tailwind classes", () => {
    expect(cn("px-2", "py-4")).toBe("px-2 py-4");
  });

  it("resolves conflicts across shorthand and longhand spacing", () => {
    expect(cn("p-4", "px-2")).toBe("p-4 px-2");
    expect(cn("px-2", "p-4")).toBe("p-4");
  });

  it("treats font-size utilities as also setting line-height", () => {
    // This is why a custom text-* class drops a component's own leading-*.
    expect(cn("leading-none", "text-lg")).toBe("text-lg");
  });

  it("merges arbitrary-value classes", () => {
    expect(cn("w-[10px]", "w-[20px]")).toBe("w-[20px]");
  });

  it("keeps variant-prefixed classes separate from their base", () => {
    expect(cn("text-sm", "md:text-lg")).toBe("text-sm md:text-lg");
  });
});
