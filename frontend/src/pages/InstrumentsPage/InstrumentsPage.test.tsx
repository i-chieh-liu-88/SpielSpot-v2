import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getInstruments } from "../../services/instruments";
import { InstrumentsPage } from "./InstrumentsPage";

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("../../services/instruments", () => ({
  getInstruments: vi.fn(),
}));

describe("InstrumentsPage", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders instruments returned by the data service", async () => {
    vi.mocked(getInstruments).mockResolvedValue([
      { id: 1, name: "Piano" },
      { id: 2, name: "Guitar" },
    ]);

    render(<InstrumentsPage />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading instruments");
    expect(
      await screen.findByRole("list", { name: "Instruments" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Piano")).toBeInTheDocument();
    expect(screen.getByText("Guitar")).toBeInTheDocument();
  });

  it("shows an accessible error when the query fails", async () => {
    vi.mocked(getInstruments).mockRejectedValue({
      message: "Database unavailable",
    });

    render(<InstrumentsPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Database unavailable",
    );
  });
});
