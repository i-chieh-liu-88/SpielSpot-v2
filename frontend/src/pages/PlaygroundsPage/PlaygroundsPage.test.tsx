import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { playgrounds } from "../../data/homeContent";
import { PlaygroundsPage } from "./PlaygroundsPage";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  loading: false,
  error: undefined as string | undefined,
}));
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mocks.navigate,
  useSearch: () => ({}),
  Link: ({
    children,
    to,
    params,
    ...rest
  }: {
    children: React.ReactNode;
    to: string;
    params?: { playgroundId: string };
  }) => (
    <a href={params ? `/playgrounds/${params.playgroundId}` : to} {...rest}>
      {children}
    </a>
  ),
}));
vi.mock("../../hooks/usePlaygrounds", () => ({
  usePlaygrounds: () => ({
    playgrounds,
    isLoading: mocks.loading,
    error: mocks.error,
  }),
}));
vi.mock("../../components/molecules/MapLocationSearch", () => ({
  MapLocationSearch: () => <div>Location search</div>,
}));
vi.mock(
  "../../components/organisms/PlaygroundFiltersForm/PlaygroundFiltersForm",
  () => ({
    PlaygroundFiltersForm: ({
      onApply,
    }: {
      onApply: (filters: object) => void;
    }) => <button onClick={() => onApply({})}>Reset filters</button>,
  }),
);
vi.mock("../../components/organisms/PlaygroundMap/PlaygroundMap", () => ({
  PlaygroundMap: ({
    onAreaChange,
    onSelect,
  }: {
    onAreaChange: (area: object) => void;
    onSelect: (id: string) => void;
  }) => (
    <div>
      <button
        onClick={() =>
          onAreaChange({ playgroundIds: [playgrounds[0].id], zoom: 14 })
        }
      >
        Move map
      </button>
      <button onClick={() => onSelect(playgrounds[0].id)}>Select pin</button>
    </div>
  ),
}));
afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
  mocks.loading = false;
  mocks.error = undefined;
});

describe("PlaygroundsPage browsing", () => {
  it("keeps the list stable until Search this area is pressed and restores all results", () => {
    render(<PlaygroundsPage />);
    const list = screen.getByRole("region", { name: "Playground results" });
    expect(within(list).getAllByRole("article")).toHaveLength(
      playgrounds.length,
    );
    expect(
      screen.getByRole("button", { name: "Search this area" }),
    ).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Map" }));
    fireEvent.click(screen.getByRole("button", { name: "Move map" }));
    expect(within(list).getAllByRole("article")).toHaveLength(
      playgrounds.length,
    );
    fireEvent.click(screen.getByRole("button", { name: "Search this area" }));
    expect(within(list).getAllByRole("article")).toHaveLength(1);
    expect(
      screen.getByRole("button", { name: "List" }),
    ).toHaveFocus();
    fireEvent.click(
      screen.getByRole("button", { name: "Show all matching results" }),
    );
    expect(within(list).getAllByRole("article")).toHaveLength(
      playgrounds.length,
    );
  });

  it("switches the mobile view and shows a pin summary without navigating", () => {
    render(<PlaygroundsPage />);
    const mapButton = screen.getByRole("button", { name: "Map" });
    fireEvent.click(mapButton);
    expect(mapButton).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Select pin" }));
    expect(mocks.navigate).not.toHaveBeenCalled();
    const map = screen.getByRole("region", { name: "Playground map" });
    expect(
      within(map).getByRole("link", { name: "View details" }),
    ).toHaveAttribute("href", `/playgrounds/${playgrounds[0].id}`);
    fireEvent.click(screen.getByRole("button", { name: "List" }));
    expect(
      screen.getByRole("button", { name: "List" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("clears the applied area when filters are reset", () => {
    render(<PlaygroundsPage />);
    fireEvent.click(screen.getByRole("button", { name: "Map" }));
    fireEvent.click(screen.getByRole("button", { name: "Move map" }));
    fireEvent.click(screen.getByRole("button", { name: "Search this area" }));
    fireEvent.click(screen.getByText("Filters: address, age and facilities"));
    fireEvent.click(screen.getByRole("button", { name: "Reset filters" }));
    expect(screen.getAllByRole("article")).toHaveLength(playgrounds.length);
    expect(
      screen.queryByRole("button", { name: "Show all matching results" }),
    ).not.toBeInTheDocument();
  });

  it("shows a request error separately from an empty search", () => {
    mocks.error = "Failed to fetch";
    render(<PlaygroundsPage />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Could not load playgrounds",
    );
    expect(
      screen.queryByText("No mapped playgrounds found"),
    ).not.toBeInTheDocument();
  });
});
