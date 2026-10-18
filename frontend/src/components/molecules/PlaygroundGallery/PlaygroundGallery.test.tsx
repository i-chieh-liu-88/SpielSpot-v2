import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { PlaygroundGallery } from "./PlaygroundGallery";

afterEach(cleanup);
it("uses the first photo as cover and lets keyboard-accessible buttons switch images", () => {
  render(<PlaygroundGallery name="Park" images={["/one.webp", "/two.webp"]} />);
  expect(screen.getByAltText("Park, photo 1")).toHaveAttribute("src", "/one.webp");
  fireEvent.click(screen.getByRole("button", { name: "Show photo 2" }));
  expect(screen.getByAltText("Park, photo 2")).toHaveAttribute("src", "/two.webp");
  expect(screen.getByRole("button", { name: "Show photo 2" })).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByText("Photo 2 of 2")).toBeInTheDocument();
});
it("preserves single photo display and reports broken images", () => {
  render(<PlaygroundGallery name="Old park" images={["/old.webp"]} />);
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
  fireEvent.error(screen.getByAltText("Old park, photo 1"));
  expect(screen.getByText("Photo unavailable")).toBeInTheDocument();
});
