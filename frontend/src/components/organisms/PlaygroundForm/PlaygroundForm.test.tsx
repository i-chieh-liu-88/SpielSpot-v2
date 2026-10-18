import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlaygroundForm } from "./PlaygroundForm";
import { playgrounds } from "../../../data/homeContent";
import { createPlayground, uploadPlaygroundPhotos } from "../../../services/playgrounds";

vi.mock("@clerk/clerk-react", () => ({
  useAuth: () => ({
    getToken: async () => "test-token",
  }),
})); //模擬 Clerk，避免出現缺少 ClerkProvider 的錯誤 (安排一位假的登入使用者)

vi.mock("../../../services/playgrounds", () => ({
  createPlayground: vi.fn(),
  uploadPlaygroundPhotos: vi.fn(),
}));

vi.mock("../../molecules/LocationPickerMap/LocationPickerMap", () => ({
  LocationPickerMap: ({ coordinates }: { coordinates?: [number, number] }) => (
    <div data-testid="map-preview">
      {coordinates ? coordinates.join(",") : "No selected position"}
    </div>
  ),
}));

describe("playground preview form", () => {
  it("limits selection to five photos and promotes the next photo when the cover is removed", () => {
    vi.stubGlobal("URL", Object.assign(URL, { createObjectURL: vi.fn((file: File) => `blob:${file.name}`), revokeObjectURL: vi.fn() }));
    render(<PlaygroundForm mode="create" onSaved={vi.fn()} />);
    const input = screen.getByLabelText("Upload playground photo");
    const files = Array.from({ length: 5 }, (_, i) => new File(["photo"], `${i}.png`, { type: "image/png" }));
    fireEvent.change(input, { target: { files } });
    expect(screen.getAllByAltText(/Selected photo/)).toHaveLength(5);
    fireEvent.change(input, { target: { files: [new File(["x"], "six.png", { type: "image/png" })] } });
    expect(screen.getByRole("alert")).toHaveTextContent("Choose up to 5 photos.");
    expect(screen.getAllByAltText(/Selected photo/)).toHaveLength(5);
    fireEvent.click(screen.getByRole("button", { name: "Remove photo 1" }));
    expect(screen.getByAltText("Selected photo 1")).toHaveAttribute("src", "blob:1.png");
    expect(screen.getAllByAltText(/Selected photo/)).toHaveLength(4);
    vi.unstubAllGlobals();
  });
  it("retries a failed photo without creating a duplicate playground", async () => {
    vi.mocked(createPlayground).mockReset().mockResolvedValue(playgrounds[0]);
    vi.mocked(uploadPlaygroundPhotos).mockReset().mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(["https://res.cloudinary.com/demo/park.webp"]);
    vi.stubGlobal("URL", Object.assign(URL, { createObjectURL: vi.fn(() => "blob:preview"), revokeObjectURL: vi.fn() }));
    const onSaved = vi.fn();
    render(<PlaygroundForm mode="create" onSaved={onSaved} />);
    for (const [label, value] of Object.entries({
      "Playground name": "Test park", "City or neighbourhood": "Dresden", Postcode: "01159",
      Latitude: "51.03", Longitude: "13.68", Description: "A playground description long enough for validation.",
    })) fireEvent.change(screen.getByLabelText(label), { target: { value } });
    fireEvent.click(screen.getByRole("checkbox", { name: "Climbing" }));
    const file = new File(["image"], "park.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("Upload playground photo"), { target: { files: [file] } });
    fireEvent.click(screen.getByRole("button", { name: "Add playground" }));
    await screen.findByText(/Playground details are saved, but the photos could not be saved/);
    expect(onSaved).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Retry photo uploads" }));
    await waitFor(() => expect(onSaved).toHaveBeenCalledWith(expect.objectContaining({ image: "https://res.cloudinary.com/demo/park.webp" }), true));
    expect(createPlayground).toHaveBeenCalledTimes(1);
    expect(uploadPlaygroundPhotos).toHaveBeenCalledTimes(2);
    vi.unstubAllGlobals();
  });
  afterEach(cleanup);
  it("identifies invalid fields and focuses the first one without submitting", () => {
    vi.mocked(createPlayground).mockReset();
    render(<PlaygroundForm mode="create" onSaved={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Add playground" }));

    const name = screen.getByLabelText("Playground name");
    expect(name).toHaveFocus();
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(name).toHaveAccessibleDescription(
      "Enter a playground name with at least 2 characters.",
    );
    expect(screen.getByLabelText("Latitude")).toHaveAccessibleDescription(
      "Select a location on the map or enter a latitude.",
    );
    expect(
      screen.getByRole("checkbox", { name: "Climbing" }),
    ).toHaveAccessibleDescription("Select at least one facility.");
    expect(createPlayground).not.toHaveBeenCalled();

    fireEvent.change(name, { target: { value: "Valid name" } });
    expect(name).not.toHaveAttribute("aria-invalid");
    expect(screen.getByLabelText("Latitude")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("shows a map position only for a complete valid coordinate pair, including zero", () => {
    render(<PlaygroundForm mode="create" onSaved={vi.fn()} />);
    const map = screen.getByTestId("map-preview");
    expect(map).toHaveTextContent("No selected position");
    fireEvent.change(screen.getByLabelText("Latitude"), {
      target: { value: "0" },
    });
    expect(map).toHaveTextContent("No selected position");
    fireEvent.change(screen.getByLabelText("Longitude"), {
      target: { value: "0" },
    });
    expect(map).toHaveTextContent("0,0");
    fireEvent.change(screen.getByLabelText("Latitude"), {
      target: { value: "91" },
    });
    expect(map).toHaveTextContent("No selected position");
    fireEvent.change(screen.getByLabelText("Latitude"), {
      target: { value: "51" },
    });
    fireEvent.change(screen.getByLabelText("Longitude"), {
      target: { value: "" },
    });
    expect(map).toHaveTextContent("No selected position");
  });
  it("keeps edits local and never reports a saved playground", () => {
    const onSaved = vi.fn();
    render(
      <PlaygroundForm
        mode="edit"
        playground={playgrounds[0]}
        onSaved={onSaved}
      />,
    );
    fireEvent.change(screen.getByLabelText("Playground name"), {
      target: { value: "Local edit" },
    });
    expect(screen.getByLabelText("Playground name")).toHaveValue("Local edit");
    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();
    expect(screen.getByAltText("Selected photo 1")).toHaveAttribute("src", playgrounds[0].image);
    fireEvent.submit(screen.getByRole("form", { name: "Edit playground" }));
    expect(onSaved).not.toHaveBeenCalled();
    expect(playgrounds[0].name).not.toBe("Local edit");
  });

  /* -------------------------------- 成功儲存的測試; -------------------------------- */
  it("saves valid playground details with an auth token", async () => {
    vi.mocked(createPlayground).mockReset();

    const savedPlayground = playgrounds[0];
    vi.mocked(createPlayground).mockResolvedValue(savedPlayground);
    const onSaved = vi.fn();

    render(<PlaygroundForm mode="create" onSaved={onSaved} />);

    const input = {
      name: "Test playground",
      location: "Dresden",
      postcode: "01159",
      latitude: 51.03,
      longitude: 13.68,
      ageRange: "Ages 2–12",
      safetyRating: 3,
      description: "A playground description long enough for validation.",
      tags: ["Climbing"],
    };

    fireEvent.change(screen.getByLabelText("Playground name"), {
      target: { value: input.name },
    });
    fireEvent.change(screen.getByLabelText("City or neighbourhood"), {
      target: { value: input.location },
    });
    fireEvent.change(screen.getByLabelText("Postcode"), {
      target: { value: input.postcode },
    });
    fireEvent.change(screen.getByLabelText("Latitude"), {
      target: { value: String(input.latitude) },
    });
    fireEvent.change(screen.getByLabelText("Longitude"), {
      target: { value: String(input.longitude) },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: input.description },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: "Climbing" }));
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Write a review after saving" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Add playground" }));

    await waitFor(() => {
      expect(createPlayground).toHaveBeenCalledWith(input, "test-token");
      expect(onSaved).toHaveBeenCalledWith(savedPlayground, false);
    });

    expect(createPlayground).toHaveBeenCalledTimes(1);
  });

  /* ------------------------------ 儲存失敗時保留輸入的測試 ----------------------------- */
  /* ------------------------------ 儲存失敗時保留輸入的測試 ----------------------------- */
  it("keeps input and enables retry when saving fails", async () => {
    vi.mocked(createPlayground).mockReset();
    vi.mocked(createPlayground).mockRejectedValue(new Error("Failed to fetch"));
    const onSaved = vi.fn();

    render(<PlaygroundForm mode="create" onSaved={onSaved} />);

    const fields = {
      "Playground name": "Test playground",
      "City or neighbourhood": "Dresden",
      Postcode: "01159",
      Latitude: "51.03",
      Longitude: "13.68",
      Description: "A playground description long enough for validation.",
    };

    for (const [label, value] of Object.entries(fields)) {
      fireEvent.change(screen.getByLabelText(label), {
        target: { value },
      });
    }

    fireEvent.click(screen.getByRole("checkbox", { name: "Climbing" }));
    fireEvent.click(screen.getByRole("button", { name: "Add playground" }));

    expect(
      await screen.findByText(
        "Could not save the playground. Your input is still here. Please try again.",
      ),
    ).toBeInTheDocument();

    for (const [label, value] of Object.entries(fields)) {
      const expected =
        label === "Latitude" || label === "Longitude" ? Number(value) : value;

      expect(screen.getByLabelText(label)).toHaveValue(expected);
    }

    expect(screen.getByRole("checkbox", { name: "Climbing" })).toBeChecked();
    expect(
      screen.getByRole("button", { name: "Add playground" }),
    ).toBeEnabled();
    expect(onSaved).not.toHaveBeenCalled();
  }); //確認送出的數字格式、Clerk token，以及成功後的 onSaved 呼叫

  /* --------------------- 這個測試像是讓櫃檯暫時處理第一張訂單，再確認第二次按送出不會產生另一張--------------------- */
  it("prevents duplicate submissions while saving", async () => {
    vi.mocked(createPlayground).mockReset();

    let finishSave!: (value: (typeof playgrounds)[number]) => void;
    const pendingSave = new Promise<(typeof playgrounds)[number]>((resolve) => {
      finishSave = resolve;
    });
    vi.mocked(createPlayground).mockReturnValue(pendingSave);

    const onSaved = vi.fn();
    render(<PlaygroundForm mode="create" onSaved={onSaved} />);

    const fields = {
      "Playground name": "Test playground",
      "City or neighbourhood": "Dresden",
      Postcode: "01159",
      Latitude: "51.03",
      Longitude: "13.68",
      Description: "A playground description long enough for validation.",
    };

    for (const [label, value] of Object.entries(fields)) {
      fireEvent.change(screen.getByLabelText(label), {
        target: { value },
      });
    }

    fireEvent.click(screen.getByRole("checkbox", { name: "Climbing" }));

    const form = screen.getByRole("form", { name: "Add a playground" });

    fireEvent.submit(form);
    fireEvent.submit(form);

    await waitFor(() => {
      expect(createPlayground).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();
    expect(onSaved).not.toHaveBeenCalled();

    finishSave(playgrounds[0]);

    await waitFor(() => {
      expect(onSaved).toHaveBeenCalledTimes(1);
    });

    expect(createPlayground).toHaveBeenCalledTimes(1);
  });
});
