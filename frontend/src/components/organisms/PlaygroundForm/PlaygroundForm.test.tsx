import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlaygroundForm } from "./PlaygroundForm";
import { playgrounds } from "../../../data/homeContent";

vi.mock("../../molecules/LocationPickerMap/LocationPickerMap", () => ({
  LocationPickerMap: () => <div>Map preview</div>,
}));

describe("playground preview form", () => {
  afterEach(cleanup);
  it("keeps edits local and never reports a saved playground", () => {
    const onSaved = vi.fn();
    render(<PlaygroundForm mode="edit" playground={playgrounds[0]} onSaved={onSaved} />);
    fireEvent.change(screen.getByLabelText("Playground name"), {
      target: { value: "Local edit" },
    });
    expect(screen.getByLabelText("Playground name")).toHaveValue("Local edit");
    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();
    fireEvent.submit(screen.getByRole("form", { name: "Edit playground" }));
    expect(onSaved).not.toHaveBeenCalled();
    expect(playgrounds[0].name).not.toBe("Local edit");
  });
});
