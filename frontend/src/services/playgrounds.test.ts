import { afterEach, describe, expect, it, vi } from "vitest";
import { getPlayground, getPlaygrounds } from "./playgrounds";

// Service tests use HTTP-shaped fixtures, never a running API or its rate limit.
const raw = { _id: "sample", name: "Berlin playground", location: "Berlin", latitude: 52.49, longitude: 13.37, tags: ["Climbing"], safetyRating: 4 };
afterEach(() => vi.unstubAllGlobals());
function mockApi() {
  const fetchMock = vi.fn(async (url: string) => {
    const path = new URL(url).pathname;
    const missing = path.includes("missing-playground");
    return { ok: !missing, json: async () => missing ? { error: "Not found" } : { data: path.endsWith("/reviews") ? [{ _id: "review", overallRating: "4", review: "A useful review", createdAt: "2026-10-01T12:00:00Z" }] : path.endsWith("/sample") ? structuredClone(raw) : [structuredClone(raw)] } };
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}
describe("playground API mapping", () => {
  it("shares simultaneous reads but allows a fresh retry after a rate limit", async () => {
    const fetchMock = mockApi();
    fetchMock.mockImplementationOnce(async () => ({ ok: false, json: async () => ({ error: "Too many requests, please try again later." }) }));
    const results = await Promise.allSettled([getPlaygrounds(), getPlaygrounds()]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(results.every(result => result.status === "rejected")).toBe(true);
    const [first, second] = await Promise.all([getPlaygrounds(), getPlaygrounds()]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    first[0].tags.push("Changed");
    expect(second[0].tags).not.toContain("Changed");
  });

  it("loads playground details with reviews", async () => {
    const fetchMock = mockApi();
    const items = await getPlaygrounds();
    expect(await getPlayground(items[0].id)).toMatchObject({ id: "sample", reviews: [{ id: "review", rating: 4 }] });
    expect(await getPlayground("missing-playground")).toBeNull();
    expect(fetchMock).toHaveBeenCalled();
  });
  it("isolates returned records", async () => {
    mockApi();
    const items = await getPlaygrounds();
    const original = await getPlayground(items[0].id);
    items[0].name = "Changed";
    items[0].tags.push("Changed");
    expect(await getPlayground(items[0].id)).toEqual(original);
  });
  it("sends encoded address, age and facility filters", async () => {
    const fetchMock = mockApi();
    await getPlaygrounds({ location: " berlin ", ageRange: "3-8", tags: ["Climbing"] });
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.searchParams.get("location")).toBe("berlin");
    expect(url.searchParams.get("ageRange")).toBe("3-8");
    expect(url.searchParams.get("tags")).toBe("Climbing");
  });
});
