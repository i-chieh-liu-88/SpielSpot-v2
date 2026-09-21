import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LoadingSpinner } from "./LoadingSpinner";

describe("LoadingSpinner", () => {
  it("renders a HeroUI spinner with an accessible loading label", () => {
    const { container } = render(
      <LoadingSpinner label="Loading playgrounds…" />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "Loading playgrounds…",
    );
    expect(container.querySelector('[data-slot="spinner"]')).toBeInTheDocument();
  });
});
