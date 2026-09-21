import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MapLocationSearch } from "./MapLocationSearch";

const geocodingMocks = vi.hoisted(() => ({
  searchMapLocation: vi.fn(),
}));

vi.mock("../../../services/geocoding", () => ({
  searchMapLocation: geocodingMocks.searchMapLocation,
}));

describe("MapLocationSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  it("searches an entered place and sends its coordinates to the map", async () => {
    geocodingMocks.searchMapLocation.mockResolvedValue({
      coordinates: [51.0504, 13.7373],
      label: "Dresden, Saxony, Germany",
    });
    const onLocationFound = vi.fn();
    render(<MapLocationSearch onLocationFound={onLocationFound} />);

    fireEvent.change(
      screen.getByRole("searchbox", { name: "Address, postcode, or place" }),
      { target: { value: "Dresden" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Search map" }));

    await waitFor(() =>
      expect(onLocationFound).toHaveBeenCalledWith({
        coordinates: [51.0504, 13.7373],
        label: "Dresden, Saxony, Germany",
      }),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Map moved to Dresden, Saxony, Germany.",
    );
  });

  it("uses the browser's current location", async () => {
    const getCurrentPosition = vi.fn((success: PositionCallback) =>
      success({
        coords: { latitude: 51.0493, longitude: 13.7381 },
      } as GeolocationPosition),
    );
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: { getCurrentPosition },
    });
    const onLocationFound = vi.fn();
    render(<MapLocationSearch onLocationFound={onLocationFound} />);

    fireEvent.click(screen.getByRole("button", { name: "Use my location" }));

    await waitFor(() =>
      expect(onLocationFound).toHaveBeenCalledWith({
        coordinates: [51.0493, 13.7381],
        label: "Your current location",
      }),
    );
    expect(getCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  });
});
