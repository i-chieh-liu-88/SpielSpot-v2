import { afterEach, describe, expect, it, vi } from "vitest";
import { searchMapLocation } from "./geocoding";

describe("searchMapLocation", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests one German OpenStreetMap result and maps its coordinates", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            display_name: "Dresden, Saxony, Germany",
            lat: "51.0504",
            lon: "13.7373",
          },
        ]),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(searchMapLocation("Dresden test query")).resolves.toEqual({
      coordinates: [51.0504, 13.7373],
      label: "Dresden, Saxony, Germany",
    });

    const requestUrl = fetchMock.mock.calls[0][0] as URL;
    expect(requestUrl.hostname).toBe("nominatim.openstreetmap.org");
    expect(requestUrl.searchParams.get("countrycodes")).toBe("de");
    expect(requestUrl.searchParams.get("limit")).toBe("1");
  });
});
