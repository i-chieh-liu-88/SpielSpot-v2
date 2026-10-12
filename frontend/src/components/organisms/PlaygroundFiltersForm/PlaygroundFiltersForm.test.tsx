import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlaygroundFiltersForm } from "./PlaygroundFiltersForm";

vi.mock("../../../hooks/usePlaygrounds", () => ({
  usePlaygrounds: () => ({
    playgrounds: [{ ageRange: "3-8", tags: ["outdoor", "park"] }],
    isLoading: false,
  }),
}));

afterEach(() => {
  cleanup();
});

describe("PlaygroundFiltersForm", () => {
  it("applies the selected location, age and tags on submit", () => {
    const onApply = vi.fn();
    render(<PlaygroundFiltersForm onApply={onApply} />);

    fireEvent.change(screen.getByLabelText("Location"), {
      target: { value: "Dresden" },
    });
    fireEvent.change(screen.getByLabelText("Age range"), {
      target: { value: "3-8" },
    });
    fireEvent.click(screen.getByLabelText("outdoor"));

    expect(onApply).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Apply filters" }));

    expect(onApply).toHaveBeenCalledWith({
      location: "Dresden",
      ageRange: "3-8",
      tags: ["outdoor"],
    });
  });

  it("clears the fields and requests all playgrounds on reset", () => {
    const onApply = vi.fn();
    render(<PlaygroundFiltersForm onApply={onApply} />);

    fireEvent.change(screen.getByLabelText("Location"), {
      target: { value: "Dresden" },
    });
    fireEvent.change(screen.getByLabelText("Age range"), {
      target: { value: "3-8" },
    });
    fireEvent.click(screen.getByLabelText("outdoor"));

    fireEvent.click(screen.getByRole("button", { name: "Reset filters" }));

    expect(screen.getByLabelText("Location")).toHaveValue("");
    expect(screen.getByLabelText("Age range")).toHaveValue("");
    expect(screen.getByLabelText("outdoor")).not.toBeChecked();
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply).toHaveBeenCalledWith({});
  });
});
