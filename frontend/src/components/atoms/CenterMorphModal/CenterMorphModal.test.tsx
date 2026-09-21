import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  CenterMorphModal,
  CenterMorphModalClose,
  CenterMorphModalContent,
  CenterMorphModalTrigger,
} from "./CenterMorphModal";

afterEach(cleanup);

function TestModal() {
  return (
    <CenterMorphModal>
      <CenterMorphModalTrigger>
        <button type="button">Open menu</button>
      </CenterMorphModalTrigger>
      <CenterMorphModalContent ariaLabel="Test navigation">
        <CenterMorphModalClose>
          <button type="button">Go somewhere</button>
        </CenterMorphModalClose>
      </CenterMorphModalContent>
    </CenterMorphModal>
  );
}

describe("CenterMorphModal", () => {
  it("opens as an accessible dialog and closes from its content", async () => {
    render(<TestModal />);

    const trigger = screen.getByRole("button", { name: "Open menu" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(trigger);

    const dialog = await screen.findByRole("dialog", {
      name: "Test navigation",
    });
    expect(dialog).toBeInTheDocument();
    expect(dialog.closest(".fixed")).toHaveClass("xl:hidden");
    expect(dialog.closest(".fixed")).not.toHaveClass("md:hidden");
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(screen.getByRole("button", { name: "Go somewhere" }));

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Test navigation" }),
      ).not.toBeInTheDocument();
    });
  });

  it("closes when Escape is pressed", async () => {
    render(<TestModal />);

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(
      await screen.findByRole("dialog", { name: "Test navigation" }),
    ).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Test navigation" }),
      ).not.toBeInTheDocument();
    });
  });
});
