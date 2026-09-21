import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { LanguageProvider } from "../../../providers/LanguageProvider";
import { LanguageToggle } from "./LanguageToggle";

describe("LanguageToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = "en";
  });

  afterEach(cleanup);

  it("switches to German and persists the preference", () => {
    render(
      <LanguageProvider>
        <LanguageToggle />
      </LanguageProvider>,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Switch language to German" }),
    );

    expect(document.documentElement).toHaveAttribute("lang", "de");
    expect(document.documentElement).toHaveAttribute("data-language", "de");
    expect(localStorage.getItem("spielspot-language")).toBe("de");
    expect(
      screen.getByRole("button", { name: "Sprache auf Englisch umstellen" }),
    ).toBeInTheDocument();
  });
});
