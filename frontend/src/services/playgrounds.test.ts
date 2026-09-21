import { describe, expect, it, vi } from "vitest";
import { getPlayground, getPlaygrounds } from "./playgrounds";

describe("preview playground data", () => {
  it("supports list and detail without network requests", async () => {
    const spy = vi.spyOn(globalThis, "fetch");
    try {
      const items = await getPlaygrounds();
      expect(items.length).toBeGreaterThan(0);
      expect(await getPlayground(items[0].id)).toEqual(items[0]);
      expect(await getPlayground("missing-playground")).toBeNull();
      expect(spy).not.toHaveBeenCalled();
    } finally { spy.mockRestore(); }
  });
  it("isolates fixtures from changes to returned records", async () => {
    const items = await getPlaygrounds();
    const original = await getPlayground(items[0].id);
    items[0].name = "Changed";
    items[0].tags.push("Changed");
    items[0].reviews.length = 0;
    expect(await getPlayground(items[0].id)).toEqual(original);
  });
});
