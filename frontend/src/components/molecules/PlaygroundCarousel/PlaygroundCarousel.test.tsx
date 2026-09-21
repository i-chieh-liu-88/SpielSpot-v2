import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { playgrounds } from "../../../data/homeContent";
import { PlaygroundCarousel } from "./PlaygroundCarousel";

describe("PlaygroundCarousel", () => {
  beforeAll(() => {
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
  });

  afterEach(cleanup);
  afterAll(() => vi.unstubAllGlobals());

  it("renders accessible Blossom controls and selectable playground slides", () => {
    const onSelect = vi.fn();
    render(
      <PlaygroundCarousel
        playgrounds={playgrounds.slice(0, 3)}
        onSelect={onSelect}
      />,
    );

    expect(
      screen.getByRole("region", {
        name: "Playgrounds visible in the current map area",
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(
      screen.getByRole("button", { name: "Previous playground" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Next playground" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "View details" })[0]);
    expect(onSelect).toHaveBeenCalledWith(playgrounds[0].id);
  });

  it("explains how to find cards when the current map area is empty", () => {
    render(<PlaygroundCarousel playgrounds={[]} onSelect={vi.fn()} />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "No playgrounds are visible in this map area",
    );
  });
});
