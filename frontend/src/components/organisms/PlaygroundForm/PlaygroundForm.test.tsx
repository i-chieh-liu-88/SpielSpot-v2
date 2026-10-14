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
import { createPlayground } from "../../../services/playgrounds";

vi.mock("@clerk/clerk-react", () => ({
  useAuth: () => ({
    getToken: async () => "test-token",
  }),
})); //模擬 Clerk，避免出現缺少 ClerkProvider 的錯誤 (安排一位假的登入使用者)

vi.mock("../../../services/playgrounds", () => ({
  createPlayground: vi.fn(),
}));

vi.mock("../../molecules/LocationPickerMap/LocationPickerMap", () => ({
  LocationPickerMap: () => <div>Map preview</div>,
}));

describe("playground preview form", () => {
  afterEach(cleanup);
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
