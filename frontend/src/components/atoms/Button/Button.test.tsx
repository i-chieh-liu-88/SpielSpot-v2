import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import Button from "./Button";

afterEach(cleanup);

describe("Button", () => {
  it("renders button text", () => {
    render(<Button>Save</Button>);

    expect(
      screen.getByRole("button", {
        name: /save/i,
      }),
    ).toBeInTheDocument();
  });

  it("uses the beUI primary and large-size styling", () => {
    render(<Button size="lg">Search</Button>);

    const button = screen.getByRole("button", { name: /search/i });

    expect(button).toHaveClass(
      "beui-button",
      "beui-button-primary",
      "h-12",
      "rounded-full",
    );
    expect(button).not.toHaveClass("glass-button");
  });

  it("marks loading buttons as busy and disabled", () => {
    render(<Button loading>Save</Button>);

    const button = screen.getByRole("button", { name: /save/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(screen.getByTestId("button-loading-icon")).toBeInTheDocument();
  });
});
